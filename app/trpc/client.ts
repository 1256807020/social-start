'use client'

// ───────────────────────────────────────────────────────────
// 【tRPC 分支 · learn/trpc】客户端实例（"端到端类型安全"的魔法入口）
// ───────────────────────────────────────────────────────────
// 💡 这里只有一行真正干活的代码，但它是整个 tRPC 体验的核心：
//
//   export const trpc = createTRPCReact<AppRouter>()
//
// 把服务端的 `AppRouter` 类型【只作为类型参数】传进去（import type，不打包任何运行时代码），
// createTRPCReact 就会"按那棵树的形状"生成一堆带类型的 hooks：
//   trpc.todoList.useQuery(...)      → 入参/返回值类型 = 服务端 todoList 推导出来的
//   trpc.todoAdd.useMutation(...)    → 同上
//   trpc.todoPatch.useMutation(...)
//   trpc.todoRemove.useMutation(...)
//
// 于是：前端写 `trpc.todoList.useQuery({ page: 1 })`，
//   · 有 TS 自动补全（知道能传 page/pageSize/sort）
//   · 传错字段 / 漏必填 → 编译期直接红
//   · 后端把 pageSize 改成必填 → 前端没改 → 红
// 全程没有"手写一份接口类型、再手写一份前端调用"的重复劳动，也不会两端对不齐。
//
// 🔧 注意：这里【只 import 类型】，所以服务端代码不会被打进浏览器包。
//   真正的网络请求发生在 page.tsx 里 new QueryClient + httpBatchLink 之后。
// ───────────────────────────────────────────────────────────
import { createTRPCReact } from '@trpc/react-query'
import type { AppRouter } from '../../lib/trpc/router'

// 拿到"带类型的 tRPC 客户端"。尖括号里的 AppRouter 就是和服务端共享的那份契约类型。
export const trpc = createTRPCReact<AppRouter>()
