'use client'

// 【B 版 · 客户端子组件】负责"增 / 改 / 删"等用户操作。
// 思路：本组件只管发请求调接口，改完调用 router.refresh()，
// 让父级服务端组件（page.tsx）重新执行、重新拉列表——这是 App Router 里
// "服务端渲染 + 客户端写" 的标准配合姿势。
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export type Todo = { id: number; title: string; done?: boolean; parentId?: number }

export function TodoClient({ initial, page, totalPages, total }: { initial: Todo[]; page: number; totalPages: number; total: number }) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [editing, setEditing] = useState<Todo | null>(null)

  // 写操作后刷新：重新执行服务端组件、重新取数（替代手动 setState 拉列表）
  const refresh = () => router.refresh()

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
    refresh()
  }

  // 改状态（PUT /api/todo/:id，增量合并）
  const toggle = async (t: Todo) => {
    await fetch(`/api/todo/${t.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ done: !t.done }),
    })
    refresh()
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
    refresh()
  }

  // 删（DELETE /api/todo/:id）
  const remove = async (id: number) => {
    await fetch(`/api/todo/${id}`, { method: 'DELETE' })
    refresh()
  }

  return (
    <div className="space-y-4">
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
        {/* 刷新：router.refresh() 让服务端组件重新执行、重新取数（B 版的标准刷新姿势） */}
        <button className="rounded border px-3 py-1" type="button" onClick={refresh}>
          刷新
        </button>
      </form>

      {/* 列表：查=SSR 已给 initial；改 / 删 在客户端 */}
      <ul className="space-y-2">
        {initial.map((t) => (
          <li key={t.id} className="flex items-center gap-2 border-b py-1">
            <input type="checkbox" checked={!!t.done} onChange={() => toggle(t)} />
            {editing?.id === t.id ? (
              <form onSubmit={saveEdit} className="flex flex-1 gap-2">
                <input
                  className="flex-1 rounded border px-2 py-1"
                  value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                />
                <button className="rounded bg-green-600 px-2 py-1 text-white" type="submit">
                  保存
                </button>
              </form>
            ) : (
              <span
                className={`flex-1 ${t.done ? 'line-through text-gray-400' : ''}`}
                onDoubleClick={() => setEditing(t)}
              >
                #{t.id} {t.title}
              </span>
            )}
            <button className="text-sm text-blue-600" onClick={() => setEditing(t)}>
              改
            </button>
            <button className="text-sm text-red-600" onClick={() => remove(t.id)}>
              删
            </button>
          </li>
        ))}
      </ul>

      {/* 服务端分页：点链接改 URL 的 page，服务端重新按页取数（无需客户端 fetch） */}
      <div className="flex items-center justify-between text-sm">
        <Link
          href={`/todos?page=${Math.max(page - 1, 1)}`}
          className={`px-2 py-1 border rounded ${page <= 1 ? 'pointer-events-none opacity-40' : ''}`}
        >
          上一页
        </Link>
        <span>
          {page} / {totalPages}（共 {total}）
        </span>
        <Link
          href={`/todos?page=${Math.min(page + 1, totalPages)}`}
          className={`px-2 py-1 border rounded ${page >= totalPages ? 'pointer-events-none opacity-40' : ''}`}
        >
          下一页
        </Link>
      </div>
    </div>
  )
}
