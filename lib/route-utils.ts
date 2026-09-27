/**
 * 路由层工具：从 Next 请求中提取参数，并把 ApiResult 转为 Response。
 */
import { NextRequest, NextResponse } from 'next/server'
import { ApiResult, badRequest } from './response'

/** URL query -> 普通对象（值均为 string） */
export function toQuery(req: NextRequest): Record<string, any> {
  const o: Record<string, any> = {}
  req.nextUrl.searchParams.forEach((v, k) => {
    o[k] = v
  })
  return o
}

/** 解析 JSON 请求体，失败抛 badRequest（统一 400） */
export async function readJson(req: NextRequest): Promise<any> {
  try {
    return await req.json()
  } catch {
    throw badRequest('请求体必须是合法 JSON')
  }
}

/** ApiResult -> NextResponse */
export function toResponse(res: ApiResult) {
  return NextResponse.json(res.body, { status: res.status })
}
