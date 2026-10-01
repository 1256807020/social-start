'use client'

// 【ahooks 分支 · learn/ahooks】
// 演示：阿里 hooks 库 ahooks 的 useRequest 统一管理「请求 / 加载态 / 手动触发」。
// 业务：复用 /api/todo 做增删改查。相比手写 useEffect+fetch，useRequest 自动管 loading、缓存、刷新。
import { useState } from 'react'
import { useRequest } from 'ahooks'

type Todo = { id: number; title: string; done: boolean }

const PAGE_SIZE = 8

export default function AhooksPage() {
  const [page, setPage] = useState(1)
  const [title, setTitle] = useState('')
  const [editing, setEditing] = useState<{ id: number; title: string } | null>(null)

  // 列表：自动执行（不 manual），依赖 page 刷新
  const listReq = useRequest(
    async (p: number) => {
      const r = await fetch(`/api/todo?page=${p}&pageSize=${PAGE_SIZE}&sort=-id`)
      return r.json()
    },
    { defaultParams: [1] },
  )

  const todos: Todo[] = listReq.data?.data || []
  const total: number = listReq.data?.total || 0
  const reload = () => listReq.run(page)

  // 写操作：manual，调用 run(...) 触发
  const addReq = useRequest(
    async (t: string) => {
      await fetch('/api/todo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: t, done: false }),
      })
    },
    { manual: true, onSuccess: reload },
  )

  const patchReq = useRequest(
    async (id: number, patch: Partial<Todo>) => {
      await fetch(`/api/todo/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      })
    },
    { manual: true, onSuccess: reload },
  )

  const delReq = useRequest(
    async (id: number) => {
      await fetch(`/api/todo/${id}`, { method: 'DELETE' })
    },
    { manual: true, onSuccess: reload },
  )

  const totalPages = Math.max(Math.ceil(total / PAGE_SIZE), 1)

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-4">
      <h1 className="text-2xl font-bold">ahooks · useRequest 封装 CRUD · app/ahooks</h1>
      <p className="text-sm text-gray-500">
        useRequest 自动管理 loading / 手动触发 / 成功回调刷新。列表 loading={String(listReq.loading)}。
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (!title.trim()) return
          addReq.run(title)
          setTitle('')
        }}
        className="flex gap-2"
      >
        <input
          className="flex-1 rounded border px-2 py-1"
          placeholder="新待办标题"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button className="rounded bg-blue-600 px-3 py-1 text-white" disabled={addReq.loading}>
          新增
        </button>
        <button className="rounded border px-3 py-1" type="button" onClick={reload}>
          刷新
        </button>
      </form>

      {listReq.loading && <p className="text-sm text-gray-400">加载中…</p>}

      <ul className="space-y-2">
        {todos.map((t) => (
          <li key={t.id} className="flex items-center gap-2 border-b py-1">
            <input
              type="checkbox"
              checked={!!t.done}
              onChange={() => patchReq.run(t.id, { done: !t.done })}
            />
            {editing?.id === t.id ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  patchReq.run(t.id, { title: editing.title })
                  setEditing(null)
                }}
                className="flex flex-1 gap-2"
              >
                <input
                  className="flex-1 rounded border px-2 py-1"
                  value={editing?.title ?? ''}
                  onChange={(e) => setEditing({ id: t.id, title: e.target.value })}
                />
                <button className="rounded bg-green-600 px-2 py-1 text-white" type="submit">
                  保存
                </button>
              </form>
            ) : (
              <span
                className={`flex-1 ${t.done ? 'line-through text-gray-400' : ''}`}
                onDoubleClick={() => setEditing({ id: t.id, title: t.title })}
              >
                #{t.id} {t.title}
              </span>
            )}
            <button className="text-sm text-blue-600" onClick={() => setEditing({ id: t.id, title: t.title })}>
              改
            </button>
            <button className="text-sm text-red-600" disabled={delReq.loading} onClick={() => delReq.run(t.id)}>
              删
            </button>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between text-sm">
        <button
          className="px-2 py-1 border rounded disabled:opacity-40"
          disabled={page <= 1}
          onClick={() => {
            setPage(page - 1)
            listReq.run(page - 1)
          }}
        >
          上一页
        </button>
        <span>
          {page} / {totalPages}（共 {total}）
        </span>
        <button
          className="px-2 py-1 border rounded disabled:opacity-40"
          disabled={page >= totalPages}
          onClick={() => {
            setPage(page + 1)
            listReq.run(page + 1)
          }}
        >
          下一页
        </button>
      </div>
    </main>
  )
}
