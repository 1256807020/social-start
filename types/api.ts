// ───────────────────────────────────────────────────────────
// 通用 API 类型（前端「消费视图模型」，**不是**后端 schema）
// 📌 基座是 schema-less：后端 JSON 字段可任意增删 → 前端类型【不锁定后端】。
//    后端加字段，这里不用改；前端往请求体多塞字段，后端照收不误
//    （引擎不做 schema 校验），所以类型不会变成前后端之间的枷锁。
// 📌 前端类型真正的作用是：锁住「我自己写错了」——把 t.title 写成 t.titlee
//    时编辑器立刻标红。这与后端契约无关。
// 📌 动态字段一律 unknown（不是 any）：unknown 强制使用前先收窄，
//    any 则彻底关闭类型检查。
// ───────────────────────────────────────────────────────────

/** 任意 JSON 记录：引擎动态字段的兜底类型 */
export type JsonRecord = Record<string, unknown>

/** 统一响应信封：{ code, data, msg }（见 lib/response.ts 的 ok()） */
export interface ApiResult<T = unknown> {
  code: number
  data: T
  msg: string
}

/**
 * 列表接口信封：额外带分页字段
 * （见 lib/crud.ts 的 handlers.list → applyQuery 返回值）
 */
export interface ApiListResult<T = unknown> extends ApiResult<T[]> {
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// ───────────────────────────────────────────────────────────
// 收窄工具：把 unknown 安全转成具体类型。
// 📌 用法：字段可能不存在 / 类型不确定时，先收窄再用。
//    const title = asString(row.title, '(无标题)')
// ───────────────────────────────────────────────────────────

/** unknown → string */
export function asString(v: unknown, fallback = ''): string {
  return typeof v === 'string' ? v : fallback
}

/** unknown → number */
export function asNumber(v: unknown, fallback = 0): number {
  return typeof v === 'number' ? v : fallback
}

/** unknown → boolean */
export function asBoolean(v: unknown, fallback = false): boolean {
  return typeof v === 'boolean' ? v : fallback
}
