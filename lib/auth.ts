// ───────────────────────────────────────────────────────────
// 【Auth.js 分支 · learn/authjs】服务端配置（Auth.js v5 / next-auth beta）
// ───────────────────────────────────────────────────────────
// 💡 Auth.js（即 NextAuth）是"登录/会话"的事实标准库。v5 适配 App Router，
//    核心思路：在 `/api/auth/[...nextauth]` 挂一个 handler 承接整套登录流程
//    （csrf / login / callback / session / signout …），前端用
//    SessionProvider + useSession 读登录态、signIn/signOut 触发动作。
//
// 🔧 固定写法（务必背，别背错）：
//    NextAuth({...})                       → 返回 { handlers, auth, signIn, signOut }
//      secret                              → 签名 JWT 的密钥，生产必用 AUTH_SECRET 环境变量
//      trustHost: true                     → Next16 下 Auth.js 跑在 proxy 之后需显式信任 host
//      session.strategy: 'jwt'             → 会话存在加密 JWT 里（无数据库也能跑）
//      providers: [ Credentials({...}) ]   → 凭证登录：自己校验账号密码
//        authorize(c) => user | null       → 返回用户对象=登录成功；返回 null=失败
//
// ⚠️ 本例 authorize 写死 admin/123456 仅作演示；真实项目必须查库 + 密文比对（bcrypt 等）。
// ───────────────────────────────────────────────────────────
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

// 演示用：写死一个账号 admin / 123456。真实项目应查库 + 加密比对。
export const { handlers, auth, signIn, signOut } = NextAuth({
  // 生产务必用环境变量 AUTH_SECRET；这里给开发兜底值（仅本地演示用，勿上生产）
  secret: process.env.AUTH_SECRET || 'dev-secret-change-me',
  // Next 16 下 Auth.js 跑在 proxy 层之后，需显式信任 host，否则报 Missing trustHost。
  // （这是 Next16 + Auth.js 的"祖传坑"，少了这行本地直接 500。）
  trustHost: true,
  // 会话策略：'jwt' = 把会话信息加密进 JWT 存 cookie（无需数据库会话表，最简）；
  //          若用 'database' 则需配套会话存储。本项目无 DB，故用 jwt。
  session: { strategy: 'jwt' },
  providers: [
    // 凭证登录（username + password 这种"自己校验"的形态，最常见的后台/会员登录）
    Credentials({
      name: 'Credentials',
      // 声明前端要填的字段（仅用于 Auth.js 自动生成的登录页；本例前端自绘表单，这里主要是类型/文档作用）
      credentials: {
        username: { label: '用户名', type: 'text' },
        password: { label: '密码', type: 'password' },
      },
      // 核心校验函数：拿到 { username, password }，返回"用户对象"表示成功、返回 null 表示失败。
      // 返回的字段会进入 JWT，并作为前端 useSession() 拿到的 session.user。
      authorize: async (c) => {
        if (c?.username === 'admin' && c?.password === '123456') {
          return { id: '1', name: 'admin', email: 'admin@example.com' }
        }
        return null // 任意不符 → 登录失败（前端 signIn 会收到 res.error）
      },
    }),
  ],
})
