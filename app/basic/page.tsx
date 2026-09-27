'use client'

import { useCallback, useEffect, useState } from 'react'

export default function BasicDemo() {
  const [todos, setTodos] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const pageSize = 8
  const [title, setTitle] = useState('')
  const [parentId, setParentId] = useState('')
  const [images, setImages] = useState<any[]>([])
  const [cap, setCap] = useState<{ captchaId: string; image: string } | null>(null)
  const [code, setCode] = useState('')
  const [capMsg, setCapMsg] = useState('')

  const loadTodos = useCallback(async (p: number) => {
    const r = await fetch(`/api/todo?page=${p}&pageSize=${pageSize}&sort=-id`)
    const j = await r.json()
    setTodos(j.data || [])
    setTotal(j.total || 0)
    setPage(p)
  }, [])

  const loadImages = useCallback(async () => {
    const r = await fetch('/api/image/list?pageSize=12')
    const j = await r.json()
    setImages(j.data || [])
  }, [])

  const loadCap = useCallback(async () => {
    const r = await fetch('/api/captcha')
    const j = await r.json()
    setCap(j.data)
    setCode('')
    setCapMsg('')
  }, [])

  useEffect(() => {
    loadTodos(1)
    loadImages()
    loadCap()
  }, [loadTodos, loadImages, loadCap])

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    await fetch('/api/todo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, done: false, parentId: parentId ? Number(parentId) : 0 }),
    })
    setTitle('')
    setParentId('')
    loadTodos(page)
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
    const j = await r.json()
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
          <form onSubmit={addTodo} className="space-y-2">
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
            <button className="rounded bg-blue-600 px-3 py-1 text-white" type="submit">
              新增
            </button>
          </form>
          <ul className="text-sm space-y-1">
            {todos.map((t) => (
              <li key={t.id} className="flex justify-between border-b py-1">
                <span>
                  #{t.id} {t.title} {t.parentId ? `(p:${t.parentId})` : ''}
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
    </main>
  )
}
