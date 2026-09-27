/**
 * 通用文件（附件）服务（进阶能力，独立于核心 CRUD）。
 * 与 lib/media.ts 对称，但放宽格式限制，支持任意文件（非仅图片）。
 * 存储落点：public/uploads/（Next.js 公开目录，文件直接以 /uploads/<name> 访问，无需自建静态路由）。
 * 不修改 lib/crud.ts / lib/json-db.ts，纯独立模块。
 */
import { promises as fsp } from 'fs'
import path from 'path'
import { badRequest, notFound, forbidden, internalError } from './response'

export const fileDir = path.join(process.cwd(), 'public', 'uploads')
export const filePrefix = '/uploads'

function safeName(name: string): string {
  return String(name).replace(/[^\w.\-]/g, '_')
}
export function resolveFile(rel: string): string {
  const decoded = decodeURIComponent(String(rel || ''))
  if (!decoded || decoded.includes('\0')) throw badRequest('非法文件名')
  const base = path.resolve(fileDir)
  const abs = path.resolve(base, decoded)
  if (abs !== base && !abs.startsWith(base + path.sep)) throw forbidden('非法文件路径')
  return abs
}
export function mimeOf(file: string): string {
  const ext = path.extname(file).toLowerCase()
  const MAP: Record<string, string> = {
    '.txt': 'text/plain',
    '.json': 'application/json',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.zip': 'application/zip',
    '.csv': 'text/csv',
    '.md': 'text/markdown',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
  }
  return MAP[ext] || 'application/octet-stream'
}
function ts(): string {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`
}
function randomStr(n = 6): string {
  return Math.random().toString(36).slice(2, 2 + n)
}
export function bytesToSize(n: number): string {
  if (!n) return '0 B'
  const u = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(n) / Math.log(1024))
  return `${(n / Math.pow(1024, i)).toFixed(1)} ${u[i]}`
}

export async function ensureDir() {
  await fsp.mkdir(fileDir, { recursive: true })
}
export async function listFiles(limit = 500, offset = 0) {
  const files = await fsp.readdir(fileDir).catch(() => [])
  const items: any[] = []
  for (const name of files) {
    const abs = path.join(fileDir, name)
    const stat = await fsp.stat(abs).catch(() => null)
    if (!stat || !stat.isFile()) continue
    items.push({
      name,
      url: `${filePrefix}/${encodeURIComponent(name)}`,
      size: stat.size,
      sizeText: bytesToSize(stat.size),
      ext: path.extname(name).toLowerCase(),
      updatedAt: stat.mtime.getTime(),
    })
  }
  items.sort((a, b) => b.updatedAt - a.updatedAt)
  const total = items.length
  return { items: items.slice(offset, offset + limit), total }
}
export async function infoFile(name: string) {
  const abs = resolveFile(name)
  const stat = await fsp.stat(abs).catch(() => null)
  if (!stat || !stat.isFile()) throw notFound('文件不存在')
  return {
    name: path.basename(abs),
    url: `${filePrefix}/${encodeURIComponent(path.basename(abs))}`,
    size: stat.size,
    sizeText: bytesToSize(stat.size),
    ext: path.extname(abs).toLowerCase(),
    updatedAt: stat.mtime.getTime(),
  }
}
export async function saveUpload(buf: Buffer, original: string): Promise<string> {
  const ext = path.extname(original).toLowerCase()
  const name = safeName(`${ts()}_${randomStr(6)}${ext}`)
  const target = path.join(fileDir, name)
  await ensureDir()
  await fsp.writeFile(target, buf)
  return name
}
export async function deleteFile(name: string): Promise<boolean> {
  const abs = resolveFile(name)
  try {
    await fsp.unlink(abs)
    return true
  } catch (e: any) {
    if (e.code === 'ENOENT') throw notFound('文件不存在')
    throw internalError(`删除失败：${e.message}`)
  }
}
