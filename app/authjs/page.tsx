'use client'

// 【Auth.js 分支 · learn/authjs】前端页面
// 演示：SessionProvider + useSession 读取登录态；signIn('credentials') 凭证登录；signOut 登出。
import { useState } from 'react'
import { SessionProvider, signIn, signOut, useSession } from 'next-auth/react'

function AuthPanel() {
  const { data: session, status } = useSession()
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('123456')
  const [msg, setMsg] = useState('')

  if (status === 'loading') return <p className="text-gray-400">会话加载中…</p>

  if (!session) {
    return (
      <form
        onSubmit={async (e) => {
          e.preventDefault()
          setMsg('')
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

  return (
    <div className="space-y-2">
      <p className="text-green-600">已登录：{session.user?.name}（{session.user?.email}）</p>
      <p className="text-xs text-gray-400">session 内容（JWT 解码）：{JSON.stringify(session)}</p>
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
      <SessionProvider>
        <AuthPanel />
      </SessionProvider>
    </main>
  )
}
