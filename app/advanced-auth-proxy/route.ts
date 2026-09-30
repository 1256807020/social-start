import { NextRequest, NextResponse } from 'next/server'

/**
 * 高阶：BFF / 鉴权代理（搬运自进阶大纲 advanced-auth-proxy）
 *  前端不直接调第三方后端，而是走本仓库的一个 Route Handler，
 *  由它在「服务端」注入 token / 隐藏真实地址，再转发到上游。
 *  本仓库根目录 proxy.ts 正是这类 dev 代理的等价物。
 *
 *  👉 练习：补全下面 route.ts，把请求转发到真实上游并带上 Authorization。
 */

export async function GET(req: NextRequest) {
  const upstream = process.env.API_BASE ?? 'http://127.0.0.1:1234'
  const token = process.env.API_TOKEN ?? '' // 👉 服务端持有密钥，绝不暴露给浏览器
  // 👉 转发：const r = await fetch(`${upstream}${req.nextUrl.pathname.replace('/advanced-auth-proxy', '/api')}`, {
  //      headers: { Authorization: `Bearer ${token}` },
  //    })
  // 👉 return NextResponse.json(await r.json())
  return NextResponse.json({ hint: '在 route.ts 里补全上游转发逻辑' })
}
