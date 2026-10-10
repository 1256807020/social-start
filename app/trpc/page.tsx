// ───────────────────────────────────────────────────────────
// 从 Vue 转 React（全栈类型安全篇）· tRPC
// · Vue2/Vue3 对照：Vue 没有 tRPC 的“原生”绑定，但可用 @trpc/vue-query 适配器，或 Hono RPC 拿到类型安全；
// · React 对照：tRPC 前后端共享 AppRouter 类型，trpc.todoList.useQuery 直接获得 TS 提示与编译期校验（本例走 /api/trpc）。
// 📌 实战定位：类型安全全栈 API【了解即可·进阶】；省掉手写的 API 客户端与类型同步，适合 TS 重度项目。
// 🧭 学习模式：🔧固定写法=createTRPCReact + httpBatchLink + useQuery/useMutation；👉=练习点（已填，跑通即懂）；文末 <details> 有 Vue2/Vue3/React 三向对照。
// 注：tRPC 也是“真实接口”（/api/trpc），未直读 json，符合铁律。
// ───────────────────────────────────────────────────────────
'use client'

// 【tRPC 分支 · learn/trpc】前端页面
// 用 @trpc/react-query 的 Provider + createTRPCReact hooks 调用类型安全 API。
import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { httpBatchLink } from '@trpc/client'
import { trpc } from './client'

const PAGE_SIZE = 8

function TodoApp() {
  const [page, setPage] = useState(1)
  const [title, setTitle] = useState('')
  const [editing, setEditing] = useState<{ id: number; title: string } | null>(null)

  const listQ = trpc.todoList.useQuery({ page, pageSize: PAGE_SIZE, sort: '-id' })
  const addM = trpc.todoAdd.useMutation({ onSuccess: () => { setTitle(''); listQ.refetch() } })
  const patchM = trpc.todoPatch.useMutation({ onSuccess: () => listQ.refetch() })
  const removeM = trpc.todoRemove.useMutation({ onSuccess: () => listQ.refetch() })

  const todos = (listQ.data?.data || []) as { id: number; title: string; done: boolean }[]
  const total = listQ.data?.total || 0
  const totalPages = Math.max(Math.ceil(total / PAGE_SIZE), 1)

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-4">
      <h1 className="text-2xl font-bold">tRPC 类型安全全栈 API · app/trpc</h1>
      <p className="text-sm text-gray-500">
        前后端共享 AppRouter 类型：调用 <code>trpc.todoList.useQuery</code> 即可获得完整 TS 提示与编译期校验。loading={String(listQ.isLoading)}。
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (!title.trim()) return
          addM.mutate({ title, done: false })
        }}
        className="flex gap-2"
      >
        <input className="flex-1 rounded border px-2 py-1" placeholder="新待办标题" value={title} onChange={(e) => setTitle(e.target.value)} />
        <button className="rounded bg-blue-600 px-3 py-1 text-white" type="submit" disabled={addM.isLoading}>新增</button>
        <button className="rounded border px-3 py-1" type="button" onClick={() => listQ.refetch()}>刷新</button>
      </form>

      <ul className="space-y-2">
        {todos.map((t) => (
          <li key={t.id} className="flex items-center gap-2 border-b py-1">
            <input type="checkbox" checked={!!t.done} onChange={() => patchM.mutate({ id: t.id, patch: { done: !t.done } })} />
            {editing?.id === t.id ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  patchM.mutate({ id: t.id, patch: { title: editing.title } })
                  setEditing(null)
                }}
                className="flex flex-1 gap-2"
              >
                <input className="flex-1 rounded border px-2 py-1" value={editing?.title ?? ''} onChange={(e) => setEditing({ id: t.id, title: e.target.value })} />
                <button className="rounded bg-green-600 px-2 py-1 text-white" type="submit">保存</button>
              </form>
            ) : (
              <span className={`flex-1 ${t.done ? 'line-through text-gray-400' : ''}`} onDoubleClick={() => setEditing({ id: t.id, title: t.title })}>
                #{t.id} {t.title}
              </span>
            )}
            <button className="text-sm text-blue-600" onClick={() => setEditing({ id: t.id, title: t.title })}>改</button>
            <button className="text-sm text-red-600" onClick={() => removeM.mutate({ id: t.id })}>删</button>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between text-sm">
        <button className="px-2 py-1 border rounded disabled:opacity-40" disabled={page <= 1} onClick={() => setPage(page - 1)}>上一页</button>
        <span>{page} / {totalPages}（共 {total}）</span>
        <button className="px-2 py-1 border rounded disabled:opacity-40" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>下一页</button>
      </div>
      <details className="mt-6 rounded border p-3 text-sm">
        <summary className="cursor-pointer font-semibold">📚 Vue2 / Vue3 / React 三向对照 & 本项目小结</summary>
        <table className="mt-2 w-full border-collapse text-left">
          <thead>
            <tr className="border-b"><th className="px-2 py-1">维度</th><th className="px-2 py-1">Vue2</th><th className="px-2 py-1">Vue3</th><th className="px-2 py-1">React</th></tr>
          </thead>
          <tbody>
            <tr className="border-b"><td className="px-2 py-1">类型安全</td><td className="px-2 py-1">无原生</td><td className="px-2 py-1">@trpc/vue-query</td><td className="px-2 py-1">共享 AppRouter（本例）</td></tr>
            <tr className="border-b"><td className="px-2 py-1">前端调用</td><td className="px-2 py-1">手写</td><td className="px-2 py-1">useQuery</td><td className="px-2 py-1">trpc.x.useQuery</td></tr>
            <tr className="border-b"><td className="px-2 py-1">接口形式</td><td className="px-2 py-1">REST/手写</td><td className="px-2 py-1">trpc 适配器</td><td className="px-2 py-1">/api/trpc 真实接口</td></tr>
            <tr className="border-b"><td className="px-2 py-1">适用</td><td className="px-2 py-1">TS 项目</td><td className="px-2 py-1">TS 项目</td><td className="px-2 py-1">TS 项目</td></tr>
          </tbody>
        </table>
        <p className="mt-2 text-gray-500">📝 小结：tRPC 前后端共享类型，省手写 API 客户端；本例走 /api/trpc 真实接口（非读 json）。</p>
      </details>

    </main>
  )
}

export default function TrpcPage() {
  const [qc] = useState(() => new QueryClient())
  const [client] = useState(() =>
    trpc.createClient({ links: [httpBatchLink({ url: '/api/trpc' })] }),
  )
  return (
    <trpc.Provider client={client} queryClient={qc}>
      <QueryClientProvider client={qc}>
        <TodoApp />
      </QueryClientProvider>
    </trpc.Provider>
  )
}
