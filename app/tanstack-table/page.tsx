'use client'

// 【TanStack Table 分支 · learn/tanstack-table】
// 演示：@tanstack/react-table（headless 表格，国际主流表格方案，不绑定 UI，自己渲染 <table>）。
// 业务：复用 /api/todo 做增删改查；分页走我们自己的 API（table 仅负责渲染当前页）。
import { useEffect, useMemo, useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table'

type Todo = { id: number; title: string; done: boolean }
const PAGE_SIZE = 8

const columnHelper = createColumnHelper<Todo>()

export default function TanStackTablePage() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [title, setTitle] = useState('')
  const [editing, setEditing] = useState<{ id: number; title: string } | null>(null)

  const load = async (p: number) => {
    const r = await fetch(`/api/todo?page=${p}&pageSize=${PAGE_SIZE}&sort=-id`)
    const j = await r.json()
    setTodos(j.data || [])
    setTotal(j.total || 0)
    setPage(p)
  }

  useEffect(() => {
    load(1)
  }, [])

  const patch = async (id: number, p: Partial<Todo>) => {
    await fetch(`/api/todo/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(p),
    })
    load(page)
  }

  const remove = async (id: number) => {
    await fetch(`/api/todo/${id}`, { method: 'DELETE' })
    load(page)
  }

  const columns = useMemo(
    () => [
      columnHelper.accessor('id', { header: 'ID', cell: (i) => i.getValue() }),
      columnHelper.accessor('title', {
        header: '标题',
        cell: (i) => {
          const t = i.row.original
          if (editing?.id === t.id)
            return (
              <input
                className="rounded border px-1 py-0.5"
                value={editing.title}
                onChange={(e) => setEditing({ id: t.id, title: e.target.value })}
                onBlur={() => {
                  patch(t.id, { title: editing.title })
                  setEditing(null)
                }}
              />
            )
          return <span className={t.done ? 'line-through text-gray-400' : ''}>#{t.id} {t.title}</span>
        },
      }),
      columnHelper.accessor('done', {
        header: '状态',
        cell: (i) => (i.getValue() ? '✅ 已完成' : '⬜ 未完成'),
      }),
      columnHelper.display({
        id: 'actions',
        header: '操作',
        cell: (i) => {
          const t = i.row.original
          return (
            <span className="space-x-2">
              <button className="text-blue-600" onClick={() => patch(t.id, { done: !t.done })}>
                {t.done ? '取消' : '完成'}
              </button>
              <button className="text-blue-600" onClick={() => setEditing({ id: t.id, title: t.title })}>
                改
              </button>
              <button className="text-red-600" onClick={() => remove(t.id)}>
                删
              </button>
            </span>
          )
        },
      }),
    ],
    [editing, page],
  )

  const table = useReactTable({ data: todos, columns, getCoreRowModel: getCoreRowModel() })
  const totalPages = Math.max(Math.ceil(total / PAGE_SIZE), 1)

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-4">
      <h1 className="text-2xl font-bold">TanStack Table（headless）· app/tanstack-table</h1>
      <p className="text-sm text-gray-500">不绑定 UI 的表格内核，自己渲染 &lt;table&gt;；列定义用 createColumnHelper。</p>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (!title.trim()) return
          fetch('/api/todo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, done: false }),
          }).then(() => {
            setTitle('')
            load(page)
          })
        }}
        className="flex gap-2"
      >
        <input className="flex-1 rounded border px-2 py-1" placeholder="新待办标题" value={title} onChange={(e) => setTitle(e.target.value)} />
        <button className="rounded bg-blue-600 px-3 py-1 text-white" type="submit">新增</button>
        <button className="rounded border px-3 py-1" type="button" onClick={() => load(page)}>刷新</button>
      </form>

      <table className="w-full border-collapse text-sm">
        <thead>
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id} className="border-b bg-gray-50">
              {hg.headers.map((h) => (
                <th key={h.id} className="px-2 py-1 text-left">
                  {flexRender(h.column.columnDef.header, h.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border-b">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-2 py-1">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex items-center justify-between text-sm">
        <button className="px-2 py-1 border rounded disabled:opacity-40" disabled={page <= 1} onClick={() => load(page - 1)}>上一页</button>
        <span>{page} / {totalPages}（共 {total}）</span>
        <button className="px-2 py-1 border rounded disabled:opacity-40" disabled={page >= totalPages} onClick={() => load(page + 1)}>下一页</button>
      </div>
    </main>
  )
}
