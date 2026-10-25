// 【next-cookies · cookies() 读写】app/next-cookies/page.tsx
// 从 Vue 转 React（状态存储篇）：
//   Nuxt3 用 useCookie()（同构 composable，赋值即写入，SSR/CSR 都能用）；
//   Vue SPA 里常见 document.cookie 或 js-cookie / universal-cookie。
//   Next 的 cookies() 是<strong>服务端 API</strong>：读在任何服务端组件/Route Handler 里都行，
//   但<strong>写只能在 Server Action 或 Route Handler 里做</strong> —— 这是最容易踩的硬性限制。
// 实战定位：主题偏好、语言、会话 token 这类「跨请求记住」的小状态。
// 学习模式：🔧 固定写法 = 读：await cookies().get()；写：Server Action 里 .set()/ .delete()；
//          👉 练习点 = 加一个 lang cookie，并在 layout 里读它决定文案。
import { cookies } from 'next/headers'
import { setTheme, clearTheme } from './actions'

// 本页面是服务端组件（无 'use client'）→ 可以「读」cookie
export default async function CookiesPage() {
  const cookieStore = await cookies()
  const theme = cookieStore.get('theme')?.value ?? '（还没设置）'
  // 也可以拿到全部 cookie
  const allNames = cookieStore.getAll().map((c) => c.name)

  return (
    <main className="mx-auto max-w-3xl space-y-5 p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">cookies() 读写 · /next-cookies</h1>
        <p className="text-sm text-gray-500">读：服务端组件直接读；写：必须走 Server Action。</p>
      </header>

      <section className="space-y-2 rounded border p-4">
        <h2 className="text-lg font-semibold">① 读（服务端组件）</h2>
        <p className="text-sm">
          当前 theme cookie：<strong className="font-mono">{theme}</strong>
        </p>
        <p className="text-xs text-gray-500">
          本站所有 cookie 名：<span className="font-mono">{allNames.join('、') || '（无）'}</span>
        </p>
      </section>

      <section className="space-y-2 rounded border p-4">
        <h2 className="text-lg font-semibold">② 写（Server Action）</h2>
        {/* 🔧 固定写法：form 的 action 直接指向 Server Action，无需 onSubmit / fetch */}
        <form action={setTheme} className="flex flex-wrap items-center gap-2">
          <select name="theme" defaultValue="light" className="rounded border px-2 py-1 text-sm">
            <option value="light">light</option>
            <option value="dark">dark</option>
            <option value="sepia">sepia</option>
          </select>
          <button className="rounded bg-gray-900 px-3 py-1 text-sm text-white" type="submit">
            保存主题
          </button>
        </form>
        <form action={clearTheme}>
          <button className="rounded border px-3 py-1 text-sm" type="submit">
            删除 theme cookie
          </button>
        </form>
        <p className="text-xs text-gray-500">
          提交后页面会自动重新渲染，上面的「读」立刻显示新值（靠 revalidatePath）。
        </p>
      </section>

      <details className="rounded border p-4 text-sm">
        <summary className="cursor-pointer font-semibold">读写规则 + 常用选项 + 总结</summary>
        <table className="mt-3 w-full border-collapse text-left">
          <thead>
            <tr className="border-b">
              <th className="px-2 py-1">位置</th>
              <th className="px-2 py-1">能读</th>
              <th className="px-2 py-1">能写</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="px-2 py-1">服务端组件</td>
              <td className="px-2 py-1">✅</td>
              <td className="px-2 py-1">❌（会报错）</td>
            </tr>
            <tr className="border-b">
              <td className="px-2 py-1">Server Action</td>
              <td className="px-2 py-1">✅</td>
              <td className="px-2 py-1">✅</td>
            </tr>
            <tr>
              <td className="px-2 py-1">Route Handler</td>
              <td className="px-2 py-1">✅</td>
              <td className="px-2 py-1">✅</td>
            </tr>
          </tbody>
        </table>
        <p className="mt-3 text-gray-600">
          常用选项：<code>httpOnly</code>（JS 读不到，防 XSS）、<code>secure</code>（仅 HTTPS）、
          <code>sameSite</code>（lax/strict 防 CSRF）、<code>maxAge</code>（有效期秒）、<code>path</code>（作用范围）。
          注意 <code>await cookies()</code> —— Next 15+ 起它是异步的。
        </p>
      </details>
    </main>
  )
}
