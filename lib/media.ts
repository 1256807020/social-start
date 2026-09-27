/**
 * 媒体 / 图片服务（进阶能力，独立于核心 CRUD）。
 * 存储落点：data/uploads/（与核心 JSON 存储同目录，未来可随 json-db 一起换存储后端）。
 * 不修改 lib/crud.ts / lib/json-db.ts，纯独立模块。
 */
import { promises as fsp } from 'fs'
import path from 'path'
import { badRequest, notFound, forbidden, internalError } from './response'

const MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.bmp': 'image/bmp',
  '.ico': 'image/x-icon',
  '.avif': 'image/avif',
}
const ALLOW_EXT = Object.keys(MIME)
export const uploadDir = path.join(process.cwd(), process.env.UPLOAD_DIR || 'data/uploads')
export const imagePrefix = '/img'

/** 仅保留安全字符，杜绝路径穿越 */
function safeName(name: string): string {
  return String(name).replace(/[^\w.\-]/g, '_')
}

/** 解析文件绝对路径，杜绝 ../ 穿越 */
export function resolveFile(rel: string): string {
  const decoded = decodeURIComponent(String(rel || ''))
  if (!decoded || decoded.includes('\0')) throw badRequest('非法文件名')
  const base = path.resolve(uploadDir)
  const abs = path.resolve(base, decoded)
  if (abs !== base && !abs.startsWith(base + path.sep)) throw forbidden('非法文件路径')
  return abs
}

export const mimeOf = (file: string): string =>
  MIME[path.extname(file).toLowerCase()] || 'application/octet-stream'
export const isImageExt = (ext: string): boolean => ALLOW_EXT.includes(ext.toLowerCase())

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
  await fsp.mkdir(uploadDir, { recursive: true })
}

export async function listImages(limit = 500, offset = 0) {
  const files = (await fsp.readdir(uploadDir).catch(() => [])).filter((f) =>
    ALLOW_EXT.includes(path.extname(f).toLowerCase()),
  )
  const items: any[] = []
  for (const name of files) {
    const abs = path.join(uploadDir, name)
    const stat = await fsp.stat(abs).catch(() => null)
    if (!stat || !stat.isFile()) continue
    items.push({
      name,
      url: `${imagePrefix}/${encodeURIComponent(name)}`,
      size: stat.size,
      sizeText: bytesToSize(stat.size),
      updatedAt: stat.mtime.getTime(),
    })
  }
  items.sort((a, b) => b.updatedAt - a.updatedAt)
  const total = items.length
  return { items: items.slice(offset, offset + limit), total }
}

export async function infoImage(name: string) {
  const abs = resolveFile(name)
  const stat = await fsp.stat(abs).catch(() => null)
  if (!stat || !stat.isFile()) throw notFound('图片不存在')
  return {
    name: path.basename(abs),
    url: `${imagePrefix}/${encodeURIComponent(path.basename(abs))}`,
    size: stat.size,
    sizeText: bytesToSize(stat.size),
    updatedAt: stat.mtime.getTime(),
  }
}

export async function saveUpload(buf: Buffer, original: string): Promise<string> {
  const ext = path.extname(original).toLowerCase()
  if (!ALLOW_EXT.includes(ext)) throw badRequest(`不支持的图片格式：${ext || '未知'}`)
  const name = safeName(`${ts()}_${randomStr(6)}${ext}`)
  const target = path.join(uploadDir, name)
  await ensureDir()
  await fsp.writeFile(target, buf)
  return name
}

export async function deleteImage(name: string): Promise<boolean> {
  const abs = resolveFile(name)
  try {
    await fsp.unlink(abs)
    return true
  } catch (e: any) {
    if (e.code === 'ENOENT') throw notFound('图片不存在')
    throw internalError(`删除失败：${e.message}`)
  }
}

export function placeholderSvg(
  w: number,
  h: number,
  text: string,
  bg: string,
  color: string,
): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">\n<rect width="100%" height="100%" fill="${bg}"/>\n<text x="50%" y="50%" fill="${color}" font-family="Helvetica,Arial,sans-serif" font-size="${Math.max(
    Math.round(Math.min(w, h) / 6),
    12,
  )}" text-anchor="middle" dominant-baseline="middle">${text}</text>\n</svg>`
}
