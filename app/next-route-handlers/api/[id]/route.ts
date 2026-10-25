// 【next-route-handlers · 单资源端点（动态段 + 多方法）】app/next-route-handlers/api/[id]/route.ts
// 🔧 固定写法：文件夹名 [id] 就是动态段；Next 15+ 起 params 是 Promise，必须 await。
//    一个文件里可以同时导出多个 HTTP 方法，语义清晰（RESTful）。
import { NextResponse } from 'next/server'

type Ctx = { params: Promise<{ id: string }> }

const items: Record<string, { id: string; name: string }> = {
  '1': { id: '1', name: '苹果' },
  '2': { id: '2', name: '香蕉' },
}

export async function GET(_request: Request, ctx: Ctx) {
  const { id } = await ctx.params
  const item = items[id]
  if (!item) {
    // 约定：找不到就 404（也可以用 notFound()，但 Route Handler 里通常直接返状态码）
    return NextResponse.json({ code: 404, msg: 'not found' }, { status: 404 })
  }
  return NextResponse.json({ code: 0, data: item })
}

export async function PUT(request: Request, ctx: Ctx) {
  const { id } = await ctx.params
  const body = await request.json()
  items[id] = { id, name: String(body.name ?? items[id]?.name ?? '') }
  return NextResponse.json({ code: 0, data: items[id] })
}

// PATCH：局部更新（这里只改 name，演示与 PUT 的语义区别）
export async function PATCH(request: Request, ctx: Ctx) {
  const { id } = await ctx.params
  const body = await request.json()
  if (items[id] && body.name) items[id].name = String(body.name)
  return NextResponse.json({ code: 0, data: items[id] })
}

export async function DELETE(_request: Request, ctx: Ctx) {
  const { id } = await ctx.params
  const existed = Boolean(items[id])
  delete items[id]
  // 204 No Content：删除成功且无需返回体
  return new Response(null, { status: existed ? 204 : 404 })
}
