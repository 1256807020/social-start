// ───────────────────────────────────────────────────────────
// 【Auth.js 分支 · learn/authjs】Next.js 适配层入口
// ───────────────────────────────────────────────────────────
// 💡 Auth.js 不关心"HTTP 怎么接"，它只给你一个 `handlers` 对象
//    （{ GET, POST } 两个函数）。我们把它挂到 App Router 的 route 上，
//    所有 `/api/auth/*`（csrf / callback/credentials / session / signout …）就都能用了。
//
// 📁 为什么是 app/api/auth/[...nextauth]/route.ts？
//    [...nextauth] 是 Next 的"全捕获动态段"（catch-all），它能匹配
//    /api/auth/csrf、/api/auth/callback/credentials、/api/auth/session … 任意层级，
//    全部交给同一个 handlers 路由。这就是 Auth.js 在 App Router 的标准挂载点。
//
// 🔧 固定写法：export const { GET, POST } = handlers
//    → 把 Auth.js 的 GET/POST 处理器直接导出成该 route 的 GET/POST。
// ───────────────────────────────────────────────────────────
// Auth.js 入口：承接 /api/auth/*（signin、session、callback 等）
import { handlers } from '../../../../lib/auth'

// 一行搞定：把 Auth.js 准备好的 GET/POST 处理器挂到本路由。前端 signIn/signOut/useSession 全靠它。
export const { GET, POST } = handlers
