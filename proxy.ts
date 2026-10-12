import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { isAuthEnabled, verifyToken } from './lib/auth'
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

// 进阶鉴权：仅 /api/* 写操作生效
const READ_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

const intlMiddleware = createMiddleware(routing)

/**
 * Next.js 16 Proxy 文件（取代旧 middleware.ts，单一入口）。
 * - 命中 /api/*：走进阶鉴权（未配置 ADMIN_TOKEN 透明放行，写操作需正确 adminToken）。
 * - 其余（页面 / 语言路由）：走 next-intl 语言重定向（/ → /zh 等）。
 */
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // —— API 鉴权层 ——
  if (pathname.startsWith('/api')) {
    if (!isAuthEnabled()) return NextResponse.next()

    const method = req.method.toUpperCase()
    if (READ_METHODS.has(method)) return NextResponse.next()

    if (!verifyToken(req)) {
      return NextResponse.json(
        { code: 40001, data: null, msg: '未授权：写操作需要正确的 adminToken' },
        { status: 401 },
      )
    }
    return NextResponse.next()
  }

  // —— 语言路由层（next-intl）——
  return intlMiddleware(req)
}

export const config = {
  // 页面 / 语言路由 + API 鉴权，两条 matcher 合并
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)', '/api/:path*'],
}
