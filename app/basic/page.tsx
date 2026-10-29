'use client'

import { useCallback, useEffect, useState } from 'react'
import { TreeNode } from './tree-node'
import type { Todo, TodoNode, ImageItem, Captcha } from '@/types/todo'
import type { ApiListResult, ApiResult } from '@/types/api'

export default function BasicDemo() {
  // 📌 生产写法：state 用真实类型（不用 any）——写错字段名编辑器立刻报错。
  const [todos, setTodos] = useState<Todo[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const pageSize = 8
  const [title, setTitle] = useState('')
  const [parentId, setParentId] = useState('')
  const [editing, setEditing] = useState<number | null>(null)
  const [images, setImages] = useState<ImageItem[]>([])
  const [cap, setCap] = useState<Captcha | null>(null)
  const [code, setCode] = useState('')
  const [capMsg, setCapMsg] = useState('')
  const [tree, setTree] = useState<TodoNode[]>([])

  const loadTodos = useCallback(async (p: number) => {
    const r = await fetch(`/api/todo?page=${p}&pageSize=${pageSize}&sort=-id`)
    // 📌 生产写法：fetch 没有泛型，用 `as` 从 any 收窄成具体信封类型。
    const j = (await r.json()) as ApiListResult<Todo>
    setTodos(j.data || [])
    setTotal(j.total || 0)
    setPage(p)
  }, [])

  const loadImages = useCallback(async () => {
    const r = await fetch('/api/image/list?pageSize=12')
    if (!r.ok) return
    const j = (await r.json().catch(() => null)) as ApiListResult<ImageItem> | null
    if (j) setImages(j.data || [])
  }, [])

  const loadCap = useCallback(async () => {
    const r = await fetch('/api/captcha')
    if (!r.ok) return
    const j = (await r.json().catch(() => null)) as ApiResult<Captcha> | null
    if (j) setCap(j.data)
    setCode('')
    setCapMsg('')
  }, [])

  const loadTree = useCallback(async () => {
    const r = await fetch('/api/todo?tree=1')
    if (!r.ok) return
    const j = (await r.json().catch(() => null)) as ApiListResult<TodoNode> | null
    if (j) setTree(j.data || [])
  }, [])

  useEffect(() => {
    loadTodos(1)
    loadImages()
    loadCap()
    loadTree()
  }, [loadTodos, loadImages, loadCap, loadTree])

  const saveTodo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    const payload = { title, parentId: parentId ? Number(parentId) : 0 }
    if (editing != null) {
      await fetch(`/api/todo/${editing}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      setEditing(null)
    } else {
      await fetch('/api/todo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, done: false }),
      })
    }
    setTitle('')
    setParentId('')
    loadTodos(page)
    loadTree()
  }

  const startEdit = (t: Todo) => {
    setEditing(t.id)
    setTitle(t.title)
    setParentId(String(t.parentId ?? 0))
  }

  const cancelEdit = () => {
    setEditing(null)
    setTitle('')
    setParentId('')
  }

  const delTodo = async (id: number) => {
    await fetch(`/api/todo/${id}`, { method: 'DELETE' })
    loadTodos(page)
    loadTree()
  }

  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const fd = new FormData()
    fd.append('file', file)
    await fetch('/api/image/upload', { method: 'POST', body: fd })
    loadImages()
    e.target.value = ''
  }

  const verify = async () => {
    if (!cap) return
    const r = await fetch('/api/captcha/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ captchaId: cap.captchaId, code }),
    })
    const j = (await r.json()) as ApiResult<{ success?: boolean }>
    setCapMsg(j.data?.success ? '✅ 校验通过' : '❌ 验证码错误')
  }

  const totalPages = Math.max(Math.ceil(total / pageSize), 1)

  return (
    <main className="mx-auto max-w-6xl p-6 space-y-6">
      <h1 className="text-2xl font-bold">Basic 基座能力演示 · app/basic.tsx</h1>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Todo CRUD + 分页 */}
        <section className="rounded-xl border p-4 space-y-3">
          <h2 className="font-semibold">Todo（增删查 + 分页 + 树形 parentId）</h2>
          <form onSubmit={saveTodo} className="space-y-2">
            <input
              className="w-full rounded border px-2 py-1"
              placeholder="标题"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <input
              className="w-full rounded border px-2 py-1"
              placeholder="parentId（0=根，可做树）"
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
            />
            <div className="flex gap-2">
              <button className="rounded bg-blue-600 px-3 py-1 text-white" type="submit">
                {editing != null ? '保存修改' : '新增'}
              </button>
              {editing != null && (
                <button
                  className="rounded border px-3 py-1"
                  type="button"
                  onClick={cancelEdit}
                >
                  取消
                </button>
              )}
            </div>
          </form>
          <ul className="text-sm space-y-1">
            {todos.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-2 border-b py-1">
                <span>
                  #{t.id} {t.title} {t.done ? '✅' : ''}{' '}
                  {t.parentId ? `(p:${t.parentId})` : ''}
                </span>
                <span className="flex gap-1 shrink-0">
                  <button
                    className="rounded border px-2 py-0.5 text-xs"
                    type="button"
                    onClick={() => startEdit(t)}
                  >
                    改
                  </button>
                  <button
                    className="rounded border px-2 py-0.5 text-xs text-red-600"
                    type="button"
                    onClick={() => delTodo(t.id)}
                  >
                    删
                  </button>
                </span>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between text-sm">
            <button
              className="px-2 py-1 border rounded disabled:opacity-40"
              disabled={page <= 1}
              onClick={() => loadTodos(page - 1)}
            >
              上一页
            </button>
            <span>
              {page} / {totalPages}（共 {total}）
            </span>
            <button
              className="px-2 py-1 border rounded disabled:opacity-40"
              disabled={page >= totalPages}
              onClick={() => loadTodos(page + 1)}
            >
              下一页
            </button>
          </div>
        </section>

        {/* 图片上传 + 展示 */}
        <section className="rounded-xl border p-4 space-y-3">
          <h2 className="font-semibold">图片（上传 + 静态访问）</h2>
          <input type="file" accept="image/*" onChange={upload} />
          <div className="grid grid-cols-3 gap-2">
            {images.map((img) => (
              <a key={img.name} href={img.url} target="_blank" rel="noreferrer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.name} className="h-20 w-full rounded object-cover" />
              </a>
            ))}
          </div>
        </section>

        {/* 验证码 */}
        <section className="rounded-xl border p-4 space-y-3">
          <h2 className="font-semibold">图形验证码</h2>
          {cap && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cap.image} alt="captcha" className="h-10" />
              <div className="flex gap-2">
                <input
                  className="w-24 rounded border px-2 py-1"
                  placeholder="输入"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
                <button className="rounded bg-green-600 px-3 py-1 text-white" onClick={verify}>
                  校验
                </button>
                <button className="rounded border px-2" onClick={loadCap}>
                  换一张
                </button>
              </div>
              <p className="text-sm">{capMsg}</p>
            </>
          )}
        </section>
      </div>

      {/* 树形展示：复用 todo 的 parentId 关系，?tree=1 返回嵌套结构 */}
      <section className="rounded-xl border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">树形展示（todo 的 parentId 嵌套）</h2>
          <button className="rounded border px-2 py-1 text-sm" onClick={loadTree}>
            刷新树
          </button>
        </div>
        {tree.length === 0 ? (
          <p className="text-sm text-gray-500">暂无数据，先在上方「Todo」区新增带 parentId 的条目</p>
        ) : (
          <ul className="text-sm space-y-1">
            {tree.map((n) => (
              <TreeNode key={n.id} node={n} />
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
