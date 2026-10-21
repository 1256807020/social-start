// ───────────────────────────────────────────────────────────
// 从 Vue 转 React（鉴权篇）· Auth.js (NextAuth) v5
// · Vue2/Vue3 对照：Vue 用 @sidebase/nuxt-auth（Auth.js 的 Nuxt 封装）或 nuxt-auth，思路一致；
// · React/Next 对照：Auth.js v5 用 /api/auth/[...nextauth] 承接登录，前端 SessionProvider + useSession 读登录态（本例凭证登录）。
// 📌 实战定位：登录鉴权【了解即可·进阶】；后台/会员系统必点，凭证登录是最常见形态。
// 🧭 学习模式：🔧固定写法=SessionProvider + useSession + signIn('credentials')；👉=练习点（已填，跑通即懂）；文末 <details> 有 Vue2/Vue3/React 三向对照。
// ───────────────────────────────────────────────────────────
'use client'

// 【Auth.js 分支 · learn/authjs】前端页面
// 演示：SessionProvider + useSession 读取登录态；signIn('credentials') 凭证登录；signOut 登出。
//
// 整体接线（从上到下）：
//   1) lib/auth.ts 的 NextAuth 在 /api/auth/* 提供登录流程
//   2) 本页面用 <SessionProvider> 包住，内部 useSession() 自动去 /api/auth/session 拉登录态
//   3) 登录：signIn('credentials', {...}) 内部自动处理 csrf → 调 callback → 写会话 cookie
//   4) 登出：signOut() 清会话 cookie
import { useState } from 'react'
import { SessionProvider, signIn, signOut, useSession } from 'next-auth/react'

function AuthPanel() {
  // useSession() 返回 { data: session, status }；status 有 'loading' | 'authenticated' | 'unauthenticated'
  const { data: session, status } = useSession()
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('123456')
  const [msg, setMsg] = useState('')

  // 首屏会话还在拉取时，先给个 loading，避免闪"未登录"
  if (status === 'loading') return <p className="text-gray-400">会话加载中…</p>

  // 未登录 → 渲染登录表单
  if (!session) {
    return (
      <form
        onSubmit={async (e) => {
          e.preventDefault()
          setMsg('')
          // 🔧 signIn('credentials', {...})：触发凭证登录。
          //   第一个参数 'credentials' 必须和 lib/auth.ts 里 Credentials 这个 provider 对应。
          //   redirect: false → 不让 Auth.js 跳转，由我们自己读 res.error 决定怎么提示。
          //   （默认 redirect:true 会跳到首页或 callbackUrl，这里要就地显示"登录失败"故关掉。）
          const res = await signIn('credentials', { username, password, redirect: false })
          if (res?.error) setMsg('登录失败：' + res.error)
        }}
        className="space-y-2 max-w-sm"
      >
        <input className="w-full rounded border px-2 py-1" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="用户名" />
        <input className="w-full rounded border px-2 py-1" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="密码" />
        <button className="rounded bg-blue-600 px-3 py-1 text-white" type="submit">登录</button>
        {msg && <p className="text-sm text-red-600">{msg}</p>}
        <p className="text-xs text-gray-400">演示账号：admin / 123456</p>
      </form>
    )
  }

  // 已登录 → 显示会话信息 + 退出按钮
  return (
    <div className="space-y-2">
      <p className="text-green-600">已登录：{session.user?.name}（{session.user?.email}）</p>
      {/* session 就是 JWT 解码后的内容（由 lib/auth.ts 的 authorize 返回值构成） */}
      <p className="text-xs text-gray-400">session 内容（JWT 解码）：{JSON.stringify(session)}</p>
      {/* signOut()：清掉会话 cookie，useSession 状态会立刻变回未登录 */}
      <button className="rounded border px-3 py-1" onClick={() => signOut()}>退出登录</button>
    </div>
  )
}

export default function AuthJsPage() {
  return (
    <main className="mx-auto max-w-3xl p-6 space-y-4">
      <h1 className="text-2xl font-bold">Auth.js（NextAuth）凭证登录 · app/authjs</h1>
      <p className="text-sm text-gray-500">
        Auth.js v5 适配 App Router：/api/auth/[...nextauth] 承接登录流程，前端用 SessionProvider + useSession。
      </p>
      {/* 🔧 SessionProvider 必须包住所有要读登录态的组件（useSession 依赖它提供的 context）。
          它会在后台用 fetch 拉 /api/auth/session，并把结果缓存/广播给子树。 */}
      <SessionProvider>
        <AuthPanel />
      </SessionProvider>
      <details className="mt-6 rounded border p-3 text-sm">
        <summary className="cursor-pointer font-semibold">📚 Vue2 / Vue3 / React 三向对照 & 本项目小结</summary>
        <table className="mt-2 w-full border-collapse text-left">
          <thead>
            <tr className="border-b"><th className="px-2 py-1">维度</th><th className="px-2 py-1">Vue2 / Vue3 (Nuxt)</th><th className="px-2 py-1">React (Next)</th></tr>
          </thead>
          <tbody>
            <tr className="border-b"><td className="px-2 py-1">登录流程</td><td className="px-2 py-1">@sidebase/nuxt-auth</td><td className="px-2 py-1">Auth.js v5（本例）</td></tr>
            <tr className="border-b"><td className="px-2 py-1">读登录态</td><td className="px-2 py-1">useSession</td><td className="px-2 py-1">useSession</td></tr>
            <tr className="border-b"><td className="px-2 py-1">登录入口</td><td className="px-2 py-1">signIn('credentials')</td><td className="px-2 py-1">signIn('credentials')</td></tr>
            <tr className="border-b"><td className="px-2 py-1">用途</td><td className="px-2 py-1">会员/后台系统</td><td className="px-2 py-1">会员/后台系统</td></tr>
          </tbody>
        </table>
        <p className="mt-2 text-gray-500">📝 小结：Auth.js 承接登录流程，前端 useSession 读态；Vue 用 nuxt-auth 同思路。</p>
      </details>

    </main>
  )
}
