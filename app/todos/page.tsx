// 【B 版 · 服务端组件 SSR + 服务端分页】背诵范本 · 路由 /todos
// 特点：① 列表在服务端 await fetch 渲染（首屏快、SEO 好）；
//      ② 分页由 URL 的 ?page= 驱动（searchParams），点链接服务端重新按页取数，无需客户端 fetch；
//      ③ 增/改/删交给同目录 <TodoClient/> 客户端子组件，改完 router.refresh() 让服务端重拉。
import { headers } from 'next/headers'
import { TodoClient, type Todo } from './todo-client'

const PAGE_SIZE = 8

// 服务端按页码取数：cache:'no-store' 保证每次实时读最新
async function getTodos(page: number): Promise<{ data: Todo[]; total: number; totalPages: number }> {
  // 同源优先：未设 NEXT_PUBLIC_BASE_URL 时，用当前请求的真实 host（含端口），
  // 彻底避免写死 localhost:3000 导致 SSR 误请求到其它项目（如 3000 端口跑着 Nuxt）的库。
  const h = await headers()
  const base = process.env.NEXT_PUBLIC_BASE_URL || `http://${h.get('host') || 'localhost'}`
  const res = await fetch(`${base}/api/todo?page=${page}&pageSize=${PAGE_SIZE}&sort=-id`, { cache: 'no-store' })
  const json = await res.json()
  const total = json.total || 0
  return { data: json.data || [], total, totalPages: Math.max(Math.ceil(total / PAGE_SIZE), 1) }
}

// Next.js 15+：searchParams 是 Promise，需 await
export default async function TodosPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const sp = await searchParams
  const page = Math.max(Number(sp.page) || 1, 1)
  const { data, total, totalPages } = await getTodos(page)
  return (
    <main className="mx-auto max-w-3xl p-6 space-y-4">
      <h1 className="text-2xl font-bold">Todo 服务端组件 SSR 范本 · app/todos</h1>
      <p className="text-sm text-gray-500">
        路由 <code>/todos</code> ｜ SSR 列表 + 服务端分页（searchParams）+ 客户端子组件写
      </p>
      <TodoClient initial={data} page={page} totalPages={totalPages} total={total} />
    </main>
  )
}
