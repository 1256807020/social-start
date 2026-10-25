// 【next-draft-mode · 开启预览】app/next-draft-mode/api/enable/route.ts
// 🔧 固定写法：开关（写 cookie）必须放在 Route Handler / Server Action 里 ——
//    和服务端组件里不能写 cookie 是同一条规则。
import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

export async function GET() {
  // ⚠️ 真实项目这里必须先鉴权：确认请求者有预览权限，否则等于把未发布内容公开
  //    （例如校验一个一次性预览 token，或从 CMS 回调里带签名参数）

  const dm = await draftMode()
  dm.enable() // 写 __prerender_bypass cookie

  // 开启后跳回页面：之后该浏览器就能看到草稿内容
  redirect('/next-draft-mode')
}
