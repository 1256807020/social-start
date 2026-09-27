'use client'

// 【A 版 · 客户端组件】背诵范本 · 路由 /todo-client
// 特点：一个 .tsx 文件内用 useEffect + fetch 把"查 / 增 / 改 / 删"全包了，
// 最直观，最适合初学 CRUD。所有数据交互都走接口 /api/todo，不直接读 data/*.json。
import { useCallback, useEffect, useState } from 'react'

export default function TodoClientPage() {
  const [todos, setTodos] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const pageSize = 8
  const [title, setTitle] = useState('')
  const [editing, setEditing] = useState<{ id: number; title: string } | null>(null)

  // 查（GET /api/todo）
  const load = useCallback(async (p: number) => {
    const r = await fetch(`/api/todo?page=${p}&pageSize=${pageSize}&sort=-id`)
    const j = await r.json()
    setTodos(j.data || [])
    setTotal(j.total || 0)
    setPage(p)
  }, [])

  useEffect(() => { load(1) }, [load])

  // 增（POST /api/todo）
  const add = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    await fetch('/api/todo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, done: false }),
    })
    setTitle('')
    load(page)
  }

  // 改状态（PUT /api/todo/:id，增量合并）
  const toggle = async (t: any) => {
    await fetch(`/api/todo/${t.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ done: !t.done }),
    })
    load(page)
  }

  // 改标题（PUT /api/todo/:id）
  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editing) return
    await fetch(`/api/todo/${editing.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: editing.title }),
    })
    setEditing(null)
    load(page)
  }

  // 删（DELETE /api/todo/:id）
  const remove = async (id: number) => {
    await fetch(`/api/todo/${id}`, { method: 'DELETE' })
    load(page)
  }

  const totalPages = Math.max(Math.ceil(total / pageSize), 1)

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-4">
      <h1 className="text-2xl font-bold">Todo 客户端组件范本 · app/todo-client</h1>
      <p className="text-sm text-gray-500">
        路由 <code>/todo-client</code> ｜ 查/增/改/删 全在一个客户端组件内（useEffect + fetch）
      </p>

      {/* 新增 */}
      <form onSubmit={add} className="flex gap-2">
        <input
          className="flex-1 rounded border px-2 py-1"
          placeholder="新待办标题"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button className="rounded bg-blue-600 px-3 py-1 text-white" type="submit">
          新增
        </button>
        {/* 刷新：重新拉当前页（客户端组件里就是再 fetch 一次） */}
        <button className="rounded border px-3 py-1" type="button" onClick={() => load(page)}>
          刷新
        </button>
      </form>

      {/* 列表 + 改 + 删 */}
      <ul className="space-y-2">
        {todos.map((t) => (
          <li key={t.id} className="flex items-center gap-2 border-b py-1">
            <input type="checkbox" checked={!!t.done} onChange={() => toggle(t)} />
            {editing?.id === t.id ? (
              <form onSubmit={saveEdit} className="flex flex-1 gap-2">
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
            <button className="text-sm text-red-600" onClick={() => remove(t.id)}>
              删
            </button>
          </li>
        ))}
      </ul>

      {/* 分页 */}
      <div className="flex items-center justify-between text-sm">
        <button
          className="px-2 py-1 border rounded disabled:opacity-40"
          disabled={page <= 1}
          onClick={() => load(page - 1)}
        >
          上一页
        </button>
        <span>
          {page} / {totalPages}（共 {total}）
        </span>
        <button
          className="px-2 py-1 border rounded disabled:opacity-40"
          disabled={page >= totalPages}
          onClick={() => load(page + 1)}
        >
          下一页
        </button>
      </div>
    </main>
  )
}
