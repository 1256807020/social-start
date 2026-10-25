'use client'

// 【next-server-only · 客户端组件（只收 props）】app/next-server-only/show.tsx
// 🔧 固定写法：客户端组件<strong>不 import 服务端模块</strong>，
//    而是由服务端父组件把「已经算好的值」当作 props 传进来。
//    这是 RSC 的核心分工：服务端拿数据 → 客户端负责交互。
import type { ServerSecret } from './secret'
import { useState } from 'react'

// ❌ 反例（不要这么写，这里只作说明）：
//    import { getServerSecret } from './secret'
//    一旦在本文件顶部加这一行，构建会直接报：
//    "This module cannot be imported from a Client Component module.
//     It should only be used from a Server Component."
//    —— 这正是 server-only 在保护你。

export default function ShowSecret({ secret }: { secret: ServerSecret }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="space-y-2 rounded border p-3">
      <button className="rounded bg-gray-900 px-3 py-1 text-sm text-white" onClick={() => setOpen(!open)}>
        {open ? '收起' : '展开'}服务端数据
      </button>
      {open && (
        <dl className="space-y-1 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-500">DB_HOST</dt>
            <dd className="font-mono">{secret.dbHost}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">DB_USER</dt>
            <dd className="font-mono">{secret.dbUser}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">有密码</dt>
            <dd className="font-mono">{String(secret.hasPassword)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">读取时间</dt>
            <dd className="font-mono">{secret.readAt}</dd>
          </div>
        </dl>
      )}
      <p className="text-xs text-gray-500">
        这些值由服务端组件算好、经 props 传来；本组件自身没有、也不能 import 那个服务端模块。
      </p>
    </div>
  )
}
