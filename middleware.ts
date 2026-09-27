import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { isAuthEnabled, verifyToken } from './lib/auth'

const WRITE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])
const READ_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

/**
 * 进阶鉴权中间件（仅在 /api/* 生效，不干扰页面渲染与 SEO）。
 * - 未配置 ADMIN_TOKEN：完全透明，核心 CRUD 本地 / 公开开放。
 * - 已配置：写操作需正确 adminToken，读操作始终放行。
 */
export function middleware(req: NextRequest) {
  // 未启用：透明放行，核心能力零负担
  if (!isAuthEnabled()) return NextResponse.next()

  const method = req.method.toUpperCase()
  // 只读请求放行（列表 / 详情 / 统计 / 利于 SEO 的公开读）
  if (READ_METHODS.has(method)) return NextResponse.next()

  // 写操作必须携带正确的 adminToken
  if (!verifyToken(req)) {
    return NextResponse.json(
      { code: 40001, data: null, msg: '未授权：写操作需要正确的 adminToken' },
      { status: 401 },
    )
  }
  return NextResponse.next()
}

export const config = {
  // 仅匹配 /api 路由，页面（含 SSR/SEO）完全不受影响
  matcher: ['/api/:path*'],
}
