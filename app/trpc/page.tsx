// ───────────────────────────────────────────────────────────
// 从 Vue 转 React（全栈类型安全篇）· tRPC
// · Vue2/Vue3 对照：Vue 没有 tRPC 的"原生"绑定，但可用 @trpc/vue-query 适配器，或 Hono RPC 拿到类型安全；
// · React 对照：tRPC 前后端共享 AppRouter 类型，trpc.todoList.useQuery 直接获得 TS 提示与编译期校验（本例走 /api/trpc）。
// 📌 实战定位：类型安全全栈 API【了解即可·进阶】；省掉手写的 API 客户端与类型同步，适合 TS 重度项目。
// 🧭 学习模式：🔧固定写法=createTRPCReact + httpBatchLink + useQuery/useMutation；👉=练习点（已填，跑通即懂）；文末 <details> 有 Vue2/Vue3/React 三向对照。
// 注：tRPC 也是"真实接口"（/api/trpc），未直读 json，符合铁律。
// ───────────────────────────────────────────────────────────
'use client'

// 【tRPC 分支 · learn/trpc】前端页面
// 用 @trpc/react-query 的 Provider + createTRPCReact hooks 调用类型安全 API。
//
// 整体接线（从上到下）：
//   1) AppRouter 类型  ──(import type)──▶  client.ts 的 trpc 实例
//   2) TrpcPage 里 new QueryClient + trpc.createClient(httpBatchLink)  ──▶  trpc.Provider
//   3) TodoApp 里 trpc.xxx.useQuery / useMutation  ──▶  自动打 /api/trpc/*  ──▶  后端 appRouter
import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { httpBatchLink } from '@trpc/client'
import { trpc } from './client'

const PAGE_SIZE = 8

function TodoApp() {
  const [page, setPage] = useState(1)
  const [title, setTitle] = useState('')
  const [editing, setEditing] = useState<{ id: number; title: string } | null>(null)

  // ── 查询：useQuery ──────────────────────────────────
  // trpc.todoList.useQuery({...}) 的入参类型 = 服务端 todoList 的 zod input（自动推导）。
  // 返回 { data, isLoading, refetch, ... }，和 react-query 完全一致（tRPC 只是套了层类型壳）。
  // 注意取数路径：listQ.data 已经是 { code,data,msg,total,... } 这种本项目信封结构，
  // 所以下面从 listQ.data?.data 取真正的数组、listQ.data?.total 取总数。
  const listQ = trpc.todoList.useQuery({ page, pageSize: PAGE_SIZE, sort: '-id' })
  // ── 写操作：useMutation ─────────────────────────────
  // onSuccess 里调用 listQ.refetch() 让列表自动刷新（react-query 缓存失效重拉）。
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

      {/* 新增：addM.mutate({ title, done }) 的入参类型 = 服务端 todoAdd 的 zod input */}
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
            {/* 勾选 = 局部更新：patchM.mutate({ id, patch:{ done } }) */}
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
            {/* 删除：removeM.mutate({ id }) */}
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

// ── 接线收尾：把 tRPC 客户端 + react-query 的 QueryClient 包到 Provider 里 ──
// 🔧 固定写法（每个 tRPC React 项目都这么搭一次）：
//   1) new QueryClient()                          → react-query 的缓存/重试等配置中心
//   2) trpc.createClient({ links:[ httpBatchLink({ url:'/api/trpc' }) ] })
//        · httpBatchLink 会把【同一帧内】的多个 tRPC 调用合并成【一个】HTTP 请求（批处理，省带宽/往返）
//        · url 指向我们的适配层入口 /api/trpc（与 route.ts 的 endpoint 对应）
//   3) <trpc.Provider client={client} queryClient={qc}> 包住页面
//      → 之后任意子组件里的 trpc.xxx.useQuery/useMutation 都自动走这个 client
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
