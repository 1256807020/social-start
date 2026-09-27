/**
 * JSON 存储引擎（移植自 BasicApi core/db.js）
 * 集合 = data/<name>.json（内容必须是数组），零数据库。
 * - 读带 mtime 缓存
 * - 写采用「临时文件 + rename」原子替换，避免写一半损坏
 * - transaction 用 per-集合 写队列，保证同一集合的 读-改-写 串行执行
 */
import { promises as fsp } from 'fs'
import path from 'path'
import { badRequest, internalError } from './response'

/** 集合名规则：字母开头，仅字母数字 _ -，1~64 位（杜绝路径穿越） */
export const NAME_RE = /^[A-Za-z][A-Za-z0-9_-]{0,63}$/

export function assertName(name: string): string {
  if (!name || !NAME_RE.test(name)) {
    throw badRequest(`非法集合名「${name}」：需字母开头，仅含字母/数字/_/-，长度 1-64`)
  }
  return name
}

export const dataDir = path.join(process.cwd(), process.env.DATA_DIR || 'data')

export function fileOf(name: string): string {
  return path.join(dataDir, `${name}.json`)
}

/** name -> { mtimeMs, data } */
const cache = new Map<string, { mtimeMs: number; data: any[] }>()
/** name -> Promise 写队列，保证同一集合的读改写串行执行 */
const queues = new Map<string, Promise<unknown>>()

export async function read(name: string): Promise<any[]> {
  assertName(name)
  const file = fileOf(name)
  let stat
  try {
    stat = await fsp.stat(file)
  } catch (e: any) {
    if (e.code === 'ENOENT') return []
    throw internalError(`读取集合 ${name} 失败：${e.message}`)
  }
  const hit = cache.get(name)
  if (hit && hit.mtimeMs === stat.mtimeMs) return hit.data

  let data: any
  try {
    const text = await fsp.readFile(file, 'utf8')
    data = text.trim() ? JSON.parse(text) : []
  } catch (e: any) {
    throw internalError(`集合 ${name} 不是合法 JSON：${e.message}`)
  }
  if (!Array.isArray(data)) {
    throw internalError(`集合 ${name} 文件内容必须是数组（当前：${typeof data}）`)
  }
  cache.set(name, { mtimeMs: stat.mtimeMs, data })
  return data
}

export const readFresh = async (name: string): Promise<any[]> => {
  cache.delete(name)
  return read(name)
}

/** 原子写入：临时文件 + rename，避免写一半进程退出导致数据损坏 */
async function write(name: string, list: any[]): Promise<void> {
  assertName(name)
  const file = fileOf(name)
  const tmp = path.join(dataDir, `.${name}.${process.pid}.${Date.now()}.tmp`)
  await fsp.mkdir(path.dirname(file), { recursive: true })
  await fsp.writeFile(tmp, JSON.stringify(list, null, 2), 'utf8')
  try {
    await fsp.rename(tmp, file)
  } catch (e: any) {
    await fsp.unlink(tmp).catch(() => {})
    throw internalError(`写入集合 ${name} 失败：${e.message}`)
  }
  cache.delete(name)
}

function enqueue<T>(name: string, task: () => Promise<T>): Promise<T> {
  const prev = (queues.get(name) || Promise.resolve()) as Promise<unknown>
  const next = prev.then(task, task) as Promise<T>
  queues.set(
    name,
    next.then(
      () => {},
      () => {},
    ),
  )
  return next
}

/**
 * 事务：在写队列内完成 读 -> 改 -> 写，天然避免并发覆盖
 * @param name 集合名
 * @param mutator 直接原地修改 list，返回值作为事务结果
 */
export function transaction<T>(name: string, mutator: (list: any[]) => T | Promise<T>): Promise<T> {
  assertName(name)
  return enqueue(name, async () => {
    const list = await readFresh(name)
    const result = await mutator(list)
    await write(name, list)
    return result
  })
}

let lastId = 0
/** 生成递增数字 ID（同毫秒不冲突），existSet 用于避免与已有数据撞号 */
export function genId(existSet?: Set<string>): number {
  const t = Date.now()
  let id = t > lastId ? t : lastId + 1
  lastId = id
  if (existSet) {
    let guard = 0
    while (existSet.has(String(id)) && guard++ < 100000) {
      id = lastId + 1
      lastId = id
    }
  }
  return id
}

const sameId = (a: any, b: any): boolean =>
  a !== undefined && a !== null && b !== undefined && b !== null && String(a) === String(b)

export const indexOfId = (list: any[], id: any): number =>
  list.findIndex((item) => sameId(item && item.id, id))

export const findById = (list: any[], id: any): any => {
  const i = indexOfId(list, id)
  return i === -1 ? null : list[i]
}

function dateFormatSafe(d: Date): string {
  try {
    const p = (n: number) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(
      d.getMinutes(),
    )}:${p(d.getSeconds())}`
  } catch {
    return ''
  }
}

/** 列出所有集合（含记录数、体积、更新时间） */
export async function collections(): Promise<any[]> {
  const files = (await fsp.readdir(dataDir).catch(() => [])).filter((f) => f.endsWith('.json'))
  const list = await Promise.all(
    files.map(async (f) => {
      const name = path.basename(f, '.json')
      if (!NAME_RE.test(name)) return null
      const file = path.join(dataDir, f)
      const stat = await fsp.stat(file)
      let count: number | null = null
      try {
        count = (await read(name)).length
      } catch {
        count = -1
      }
      return {
        name,
        count,
        size: stat.size,
        sizeText: `${(stat.size / 1024).toFixed(1)} KB`,
        updatedAt: dateFormatSafe(stat.mtime),
      }
    }),
  )
  return list.filter(Boolean).sort((a, b) => a!.name.localeCompare(b!.name))
}

/** 删除集合文件 */
export async function dropCollection(name: string): Promise<boolean> {
  assertName(name)
  cache.delete(name)
  try {
    await fsp.unlink(fileOf(name))
    return true
  } catch (e: any) {
    if (e.code === 'ENOENT') return false
    throw internalError(`删除集合 ${name} 失败：${e.message}`)
  }
}
