/**
 * 可选 adminToken 鉴权（进阶能力，独立于核心 CRUD / NextAuth 登录）。
 *
 * 设计原则：
 * - 仅当环境变量 ADMIN_TOKEN 被设置时才「启用」；未设置时完全透明。
 * - 启用后：写操作（POST / PUT / PATCH / DELETE）必须携带正确 token；
 *   读操作（GET / HEAD / OPTIONS）始终开放。
 * - 与 Auth.js 的登录鉴权互不干扰：proxy.ts 已把 /api/auth/** 设为公开端点，
 *   故即使启用 adminToken，登录 POST 也不会被本层拦截。
 * - 本文件与 NextAuth 配置（lib/auth.ts）分离，避免两者争用同一模块路径。
 */
export function isAuthEnabled(): boolean {
  return Boolean(process.env.ADMIN_TOKEN)
}

function expectedToken(): string {
  return process.env.ADMIN_TOKEN || ''
}

/**
 * 从请求中提取客户端 token，优先级：
 *   Authorization: Bearer <token>  >  x-admin-token: <token>  >  ?adminToken=<token>
 */
export function extractToken(req: { headers: Headers; url?: string }): string | null {
  const auth = req.headers.get('authorization')
  if (auth && auth.toLowerCase().startsWith('bearer ')) return auth.slice(7).trim()

  const header = req.headers.get('x-admin-token')
  if (header) return header.trim()

  if (req.url) {
    try {
      const q = new URL(req.url).searchParams.get('adminToken')
      if (q) return q.trim()
    } catch {
      /* url 解析异常时忽略 */
    }
  }
  return null
}

/** 校验请求是否放行（未启用 => 始终 true） */
export function verifyToken(req: { headers: Headers; url?: string }): boolean {
  if (!isAuthEnabled()) return true
  const t = extractToken(req)
  return t !== null && t === expectedToken()
}
