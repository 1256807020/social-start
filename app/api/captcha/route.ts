import { ok, withApi } from '@/lib/response'
import { generateCaptcha } from '@/lib/captcha'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/** 生成图形验证码：返回 { captchaId, image }（image 为 SVG data URI） */
export async function GET() {
  return withApi(async () => {
    return ok(await generateCaptcha())
  })
}
