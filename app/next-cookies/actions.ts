'use server'

// 【next-cookies · 写 cookie（必须走 Server Action 或 Route Handler）】app/next-cookies/actions.ts
// ⚠️ 核心规则：<strong>服务端组件里只能「读」cookie，不能「写」</strong>。
//    直接在一个 Server Component 的渲染过程中调用 cookieStore.set() 会报错
//    （"Cookies can only be modified in a Server Action or Route Handler"）。
//    所以「写」必须放在这里（'use server'）或 app/**/route.ts 里。
// 从 Vue 转 React：Nuxt3 有 useCookie()（同构、直接赋值即写）；
//    Next 把它拆得更严格 —— 读用 cookies()，写必须走 Action / Route Handler。
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function setTheme(formData: FormData) {
  const theme = String(formData.get('theme') || 'light')

  // 🔧 固定写法：Next 15+ 的 cookies() 是异步的，要 await
  const cookieStore = await cookies()

  cookieStore.set('theme', theme, {
    httpOnly: true, // JS 读不到（防 XSS 窃取）—— 会话类 cookie 必开
    path: '/', // 全站可见
    maxAge: 60 * 60 * 24 * 7, // 7 天（秒）
    sameSite: 'lax', // 防 CSRF 的常规选择
    secure: process.env.NODE_ENV === 'production', // 生产环境只走 HTTPS
  })

  // 写完让本页面重新渲染，好让「读」的部分立刻显示新值
  revalidatePath('/next-cookies')
}

export async function clearTheme() {
  const cookieStore = await cookies()
  cookieStore.delete('theme')
  revalidatePath('/next-cookies')
}
