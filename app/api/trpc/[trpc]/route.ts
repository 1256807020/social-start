// ───────────────────────────────────────────────────────────
// 【tRPC 分支 · learn/trpc】Next.js App Router 适配层入口
// ───────────────────────────────────────────────────────────
// 💡 tRPC 自己不管"HTTP 怎么接"，它只提供各种 adapter。
//    在 Next App Router 里，我们用官方的 `fetchRequestHandler`，
//    把每个 `/api/trpc/*` 进来的 Request 转交给 appRouter 处理。
//
// 📁 为什么放在 app/api/trpc/[trpc]/route.ts？
//    [trpc] 是 Next 的动态段（catch-all 单段）。tRPC 客户端会请求
//    `/api/trpc/todoList`、`/api/trpc/todoAdd`... 把"过程名"放在路径里；
//    这个动态段就把过程名接住，交给同一个 handler 统一路由到 appRouter 树。
//    （和 advanced-auth-proxy 用 [...path] 接代理子路径是同一类思路：
//     用一个动态段把"变化的后半截"兜住。）
//
// 🔧 固定写法：
//   export { handler as GET, handler as POST } → Next 会把 GET/POST 都交给它
//   endpoint: '/api/trpc'                       → 告诉 tRPC 自己的根路径（用于拼 URL / CORS 校验）
//   createContext: () => ({})                   → 每个请求构造一次"上下文"（这里无鉴权，留空）
//                                                想加登录态就在这里读 cookie/header 塞进 ctx，
//                                                服务端 procedure 里就能用 { ctx } 拿到。
// ───────────────────────────────────────────────────────────
import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter } from '../../../../lib/trpc/router'

// 一个函数同时当 GET 和 POST 处理器：tRPC 的 query 走 GET、mutation 走 POST。
const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc', // 必须和服务端挂载路径一致
    req,                   // 把原始 Request 交给 tRPC
    router: appRouter,     // 路由到我们在 lib/trpc/router.ts 定义的整棵树
    createContext: () => ({}),
  })

export { handler as GET, handler as POST }
