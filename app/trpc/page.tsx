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
