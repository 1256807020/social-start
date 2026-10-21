import { NextRequest, NextResponse } from 'next/server'

/**
 * ============================================================================
 * 高阶：BFF / 鉴权代理（Backend-For-Frontend）的核心实现 —— 一个 Route Handler
 * ----------------------------------------------------------------------------
 * 这是什么？
 *   前端（浏览器）不直接调用真实后端，而是只调用「同源」的 /advanced-auth-proxy/*。
 *   由这段代码（跑在【服务端】）偷偷补上 token、隐藏真实地址，再转发到上游后端。
 *
 * 为什么要这样？
 *   - token 只在服务端存在，浏览器代码/网络面板里【永远看不到】，杜绝泄露。
 *   - 隐藏真实后端域名/IP，前端只认自己的同源地址。
 *   - 可在这里统一加限流、兜底、日志、字段裁剪（企业级常用手法）。
 *
 * 为什么放在 [...path]（catch-all 子路径）而不是 route.ts？
 *   - Next 不允许同一个路径既是「页面(page.tsx)」又是「接口(route.ts)」，会报冲突 500。
 *   - 所以：/advanced-auth-proxy（首页，由 page.tsx 渲染）走页面；
 *            /advanced-auth-proxy/*（任意子路径，由本文件处理）走代理。
 *   - [...path] 会把 /advanced-auth-proxy/api/todo 里的 api/todo 收到数组里，
 *     我们用 req.nextUrl.pathname 直接拿完整路径，更省事。
 *
 * 真实流程（一次 GET /advanced-auth-proxy/api/todo）：
 *   浏览器 ──同域──▶ 本 Route Handler（服务端）
 *                      ① 拿 host，拼出上游 base
 *                      ② 把 /advanced-auth-proxy/xxx 映射成真实 /api/xxx
 *                      ③ 注入 Authorization: Bearer <token>（浏览器看不到）
 *                      ④ fetch 上游，把结果原样返回浏览器
 * ============================================================================
 */
export async function GET(req: NextRequest) {
  // ① 推导上游 base：
  //    演示里我们让代理「转发回自己」（同源自代理），所以 base = 当前请求的 host。
  //    真实 BFF 里这里应填内部上游地址，例如 process.env.API_BASE='http://internal-svc:8080'，
  //    前端永远不知道这个地址。
  const host = req.headers.get('host') ?? 'localhost:4000'
  const proto = req.headers.get('x-forwarded-proto') ?? 'http'
  const base = process.env.API_BASE ?? `${proto}://${host}`

  // ② 路径映射：浏览器请求 /advanced-auth-proxy/api/todo，
  //    剥掉前缀 /advanced-auth-proxy 得到 /api/todo，再转发到上游。
  //    这样前端只要记「/advanced-auth-proxy + 原接口路径」即可，无需知道真实前缀。
  const sub = req.nextUrl.pathname.replace(/^\/advanced-auth-proxy/, '') || '/'
  const upstreamPath = sub.startsWith('/api') ? sub : `/api${sub}`

  // ③ 服务端持有的密钥 —— 关键：这行代码只在服务器执行，
  //    浏览器拿到的响应里不会有它，DevTools 的 Network 也看不到。
  const token = process.env.API_TOKEN ?? ''

  try {
    // ④ 服务端代为发起真实请求，带上 token
    const r = await fetch(`${base}${upstreamPath}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const body = await r.json()
    // 上游返回什么，就原样透传给浏览器（BFF 也可以在这里裁剪/改写字段）
    return NextResponse.json(body)
  } catch (e) {
    // 上游挂了也要给浏览器一个可控的错误，而不是白屏
    return NextResponse.json(
      { hint: '上游转发失败', error: e instanceof Error ? e.message : String(e) },
      { status: 502 },
    )
  }
}
