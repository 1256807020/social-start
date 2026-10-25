// 【next-route-handlers · 集合端点】app/next-route-handlers/api/route.ts
// 从 Vue 转 React（服务端接口篇）：
//   Nuxt3 的 server/api/*.ts 用 defineEventHandler（Nitro / h3）：
//     getQuery(event) 取查询串、readBody(event) 取 body、setCookie / getCookie 读写 cookie。
//   Next 的 route.ts 更「贴近 Web 标准」：导出名即 HTTP 方法，参数是 Web 的 Request，
//     返回 Web 的 Response（NextResponse 是它的增强版）。
// 🔧 固定写法：导出 GET / POST / PUT / PATCH / DELETE / HEAD / OPTIONS 中需要的即可；
//    没定义的method 会自动 405；OPTIONS 未定义时 Next 自动实现。

import { NextResponse } from 'next/server'

// 内存里的假数据，仅用于演示（真实项目应落库，本仓库基座走 lib/json-db）
let items = [
  { id: '1', name: '苹果' },
  { id: '2', name: '香蕉' },
]

// GET：读查询串 + 请求头
export async function GET(request: Request) {
  // Web 标准的 URL 解析（NextRequest 才有 nextUrl，这里用原生 URL 同样可行）
  const { searchParams } = new URL(request.url)
  const keyword = searchParams.get('keyword')

  const data = keyword ? items.filter((i) => i.name.includes(keyword)) : items

  // NextResponse.json = 原生 Response.json 的增强版（多了 cookies 等便捷方法）
  const res = NextResponse.json({ code: 0, data, total: data.length }, { status: 200 })

  // 🔧 演示：通过响应头写 cookie（也可以用 next/headers 的 cookies()）
  res.headers.append('Set-Cookie', 'demo=from-route-handler; Path=/; Max-Age=600')
  return res
}

// POST：读请求体
export async function POST(request: Request) {
  // 读 body 的三种常见方式：await request.json() / await request.formData() / await request.text()
  const body = await request.json()
  const item = { id: String(items.length + 1), name: String(body.name ?? '未命名') }
  items.push(item)

  // 返回 201 Created
  return NextResponse.json({ code: 0, data: item }, { status: 201 })
}
