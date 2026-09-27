/**
 * 图形验证码（进阶能力，独立于核心 CRUD）。
 * 不接 Redis / 数据库：code 以文件形式落在 data/captcha/<id>.json（带 TTL），重启不丢、本地/自托管可用。
 * 不修改 lib/crud.ts / lib/json-db.ts，纯独立模块。
 */
import { promises as fsp } from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'
import { badRequest } from './response'

const DIR = path.join(process.cwd(), 'data', 'captcha')
const TTL = Number(process.env.CAPTCHA_TTL || 5 * 60 * 1000) // 默认 5 分钟
const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // 去掉易混淆字符
const COLORS = ['#1677ff', '#52c41a', '#fa8c16', '#eb2f96']

function svgOf(code: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="40">\n<rect width="120" height="40" fill="#f2f4f7"/>\n${code
    .split('')
    .map(
      (c, i) =>
        `<text x="${18 + i * 26}" y="28" font-size="24" fill="${
          COLORS[i % COLORS.length]
        }" font-family="monospace">${c}</text>`,
    )
    .join('')}\n</svg>`
}

/** 生成验证码：返回 captchaId + image（SVG data URI） */
export async function generateCaptcha() {
  let code = ''
  for (let i = 0; i < 4; i++) code += CHARS[Math.floor(Math.random() * CHARS.length)]
  const captchaId = randomUUID()
  await fsp.mkdir(DIR, { recursive: true })
  await fsp.writeFile(path.join(DIR, `${captchaId}.json`), JSON.stringify({ code, expire: Date.now() + TTL }))
  const image = `data:image/svg+xml;base64,${Buffer.from(svgOf(code)).toString('base64')}`
  return { captchaId, image }
}

/** 校验验证码（一次性，校验成功即删除；过期/不存在返回 false） */
export async function verifyCaptcha(captchaId: string, code: string): Promise<boolean> {
  if (!captchaId || !code) return false
  const file = path.join(DIR, `${captchaId}.json`)
  const raw = await fsp.readFile(file).catch(() => null)
  if (!raw) return false
  let rec: { code: string; expire: number }
  try {
    rec = JSON.parse(raw.toString())
  } catch {
    return false
  }
  await fsp.unlink(file).catch(() => {}) // 一次性使用
  if (Date.now() > rec.expire) return false
  return String(rec.code).toUpperCase() === String(code).toUpperCase()
}
