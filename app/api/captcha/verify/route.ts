import type { NextRequest } from 'next/server'
import { ok, badRequest, withApi } from '@/lib/response'
import { verifyCaptcha } from '@/lib/captcha'
import { readJson } from '@/lib/route-utils'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/** 校验验证码：body { captchaId, code } -> { success }（一次性） */
export async function POST(req: NextRequest) {
  return withApi(async () => {
    const body = await readJson(req)
    if (!body?.captchaId || body?.code === undefined) throw badRequest('缺少 captchaId 或 code')
    const success = await verifyCaptcha(body.captchaId, String(body.code))
    return ok({ success }, success ? '校验通过' : '验证码错误')
  })
}
