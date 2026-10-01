'use client'

// 【SWR 分支 · learn/swr】
// 演示：Vercel 官方数据获取库 SWR（比 React Query 更轻量，专注「客户端数据同步 + 自动重验」）。
// 业务：复用 /api/todo 做增删改查。useSWR(fetcher) 自动管缓存/重新校验/loading。
import useSWR from 'swr'
import { useState } from 'react'

type Todo = { id: number; title: string; done: boolean }
const PAGE_SIZE = 8

// 通用 fetcher
const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function SwrPage() {
  const [page, setPage] = useState(1)
  const [title, setTitle] = useState('')
  const [editing, setEditing] = useState<{ id: number; title: string } | null>(null)

  // useSWR 自动请求 + 缓存 + 重新校验；key 变化即重新拉取
  const { data, isLoading, mutate } = useSWR<{ data: Todo[]; total: number }>(
    `/api/todo?page=${page}&pageSize=${PAGE_SIZE}&sort=-id`,
    fetcher,
  )

  const todos = data?.data || []
  const total = data?.total || 0
  const totalPages = Math.max(Math.ceil(total / PAGE_SIZE), 1)

  const add = async () => {
    if (!title.trim()) return
    await fetch('/api/todo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, done: false }),
    })
    setTitle('')
    mutate() // 手动触发重新校验（乐观刷新）
  }

  const patch = async (id: number, p: Partial<Todo>) => {
    await fetch(`/api/todo/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(p),
    })
    mutate()
  }

  const remove = async (id: number) => {
    await fetch(`/api/todo/${id}`, { method: 'DELETE' })
    mutate()
  }

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-4">
      <h1 className="text-2xl font-bold">SWR（Vercel 官方）· todo CRUD · app/swr</h1>
      <p className="text-sm text-gray-500">
        useSWR(key, fetcher) 自动管理 loading/缓存/重新校验；写操作后 mutate() 刷新。loading={String(isLoading)}。
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          add()
        }}
        className="flex gap-2"
      >
        <input className="flex-1 rounded border px-2 py-1" placeholder="新待办标题" value={title} onChange={(e) => setTitle(e.target.value)} />
        <button className="rounded bg-blue-600 px-3 py-1 text-white" type="submit">新增</button>
        <button className="rounded border px-3 py-1" type="button" onClick={() => mutate()}>刷新</button>
      </form>

      {isLoading && <p className="text-sm text-gray-400">加载中…</p>}

      <ul className="space-y-2">
        {todos.map((t) => (
          <li key={t.id} className="flex items-center gap-2 border-b py-1">
            <input type="checkbox" checked={!!t.done} onChange={() => patch(t.id, { done: !t.done })} />
            {editing?.id === t.id ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  patch(t.id, { title: editing.title })
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
            <button className="text-sm text-red-600" onClick={() => remove(t.id)}>删</button>
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
