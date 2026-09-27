// 【B 版 · 服务端组件 SSR】背诵范本 · 路由 /todos
// 特点：首屏数据在服务端直接 fetch 好再渲染，无需 useEffect / useState 拉列表，
// 对 SEO 和首屏更友好。用户侧的"增 / 改 / 删"交给同目录 <TodoClient/> 客户端子组件。
import { TodoClient, type Todo } from './todo-client'

// 服务端取数：必须用绝对地址（或 NEXT_PUBLIC_BASE_URL）；
// cache: 'no-store' 表示不缓存、每次都实时读最新数据。
async function getTodos(): Promise<Todo[]> {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const res = await fetch(`${base}/api/todo?pageSize=20&sort=-id`, { cache: 'no-store' })
  const json = await res.json()
  return json.data || []
}

export default async function TodosPage() {
  const todos = await getTodos()
  return (
    <main className="mx-auto max-w-3xl p-6 space-y-4">
      <h1 className="text-2xl font-bold">Todo 服务端组件 SSR 范本 · app/todos</h1>
      <p className="text-sm text-gray-500">
        路由 <code>/todos</code> ｜ 列表为服务端渲染（SSR），增删改用客户端子组件 + router.refresh()
      </p>
      <TodoClient initial={todos} />
    </main>
  )
}
