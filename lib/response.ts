/**
 * 统一响应与错误码（移植自 BasicApi core/response.js）
 * 不依赖 next/server，返回纯对象，由路由层用 NextResponse.json 包装。
 */

export const CODES = {
  SUCCESS: 0,
  ARG_ERROR: 40000,
  NO_LOGIN: 40001,
  FORBIDDEN: 40003,
  NOT_FOUND: 40004,
  UPLOAD_ERROR: 40005,
  INTERNAL_ERROR: 50000,
  FAIL: 50003,
} as const

export class HttpError extends Error {
  status: number
  code: number
  data: unknown
  constructor(
    status = 500,
    code: number = CODES.INTERNAL_ERROR,
    message = '服务器内部错误',
    data: unknown = null,
  ) {
    super(message)
    this.name = 'HttpError'
    this.status = status
    this.code = code
    this.data = data
  }
}

export const badRequest = (msg = '参数错误') => new HttpError(400, CODES.ARG_ERROR, msg)
export const notFound = (msg = '数据不存在') => new HttpError(404, CODES.NOT_FOUND, msg)
export const forbidden = (msg = '禁止访问') => new HttpError(403, CODES.FORBIDDEN, msg)
export const noLogin = (msg = '未登录') => new HttpError(401, CODES.NO_LOGIN, msg)
export const internalError = (msg = '服务器内部错误') => new HttpError(500, CODES.INTERNAL_ERROR, msg)

export interface ApiResult {
  body: Record<string, unknown>
  status: number
}

/** 统一成功响应体 */
export function ok(
  data: unknown = null,
  msg = 'success',
  extra: Record<string, unknown> = {},
  status = 200,
): ApiResult {
  return { body: { code: CODES.SUCCESS, data, msg, ...extra }, status }
}

export function fail(err: HttpError): ApiResult {
  return { body: { code: err.code, data: err.data ?? null, msg: err.message }, status: err.status }
}

export function serverError(): ApiResult {
  return { body: { code: CODES.INTERNAL_ERROR, data: null, msg: '服务器内部错误' }, status: 500 }
}

/** 包装 handler 执行：正常返回 ApiResult，抛 HttpError 转业务错误，其余转 500 */
export async function withApi(fn: () => Promise<ApiResult>): Promise<ApiResult> {
  try {
    return await fn()
  } catch (e) {
    if (e instanceof HttpError) return fail(e)
    console.error('[api] 未捕获异常:', e)
    return serverError()
  }
}
