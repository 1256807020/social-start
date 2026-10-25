// 【next-draft-mode · 关闭预览】app/next-draft-mode/api/disable/route.ts
import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

export async function GET() {
  const dm = await draftMode()
  dm.disable() // 清除 __prerender_bypass cookie
  redirect('/next-draft-mode')
}
