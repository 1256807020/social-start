/**
 * 查询语法（移植自 BasicApi core/query.js）
 * 支持：分页 / 排序 / 字段投影 / 关键字 / 字段操作符（_like _in _nin _ne _gte ...）/ 树形
 */
import { config } from './config'

/** 保留参数（不作为过滤条件） */
const RESERVED = new Set([
  'page',
  'pageSize',
  'currentPage',
  'sort',
  'order',
  'fields',
  'keyword',
  'keywordFields',
  'tree',
  'parentKey',
  'childrenKey',
  'confirm',
  'adminToken',
  '_t',
])

/** 支持的操作符后缀 */
const OPS: Record<string, string> = {
  like: 'like',
  in: 'in',
  nin: 'nin',
  ne: 'ne',
  gte: 'gte',
  lte: 'lte',
  gt: 'gt',
  lt: 'lt',
}

function looseEq(actual: any, raw: any): boolean {
  if (actual === null || actual === undefined) return raw === '' || raw === 'null'
  if (typeof actual === 'number') return Number(raw) === actual
  if (typeof actual === 'boolean') return (raw === 'true' || raw === '1') === actual
  return String(actual) === String(raw)
}

function test(actual: any, op: string, raw: any): boolean {
  switch (op) {
    case 'like':
      return String(actual ?? '')
        .toLowerCase()
        .includes(String(raw).toLowerCase())
    case 'in':
      return String(raw)
        .split(',')
        .some((v) => looseEq(actual, v.trim()))
    case 'nin':
      return !String(raw)
        .split(',')
        .some((v) => looseEq(actual, v.trim()))
    case 'ne':
      return !looseEq(actual, raw)
    case 'gt':
    case 'gte':
    case 'lt':
    case 'lte': {
      const a = Number(actual)
      const b = Number(raw)
      if (Number.isNaN(a) || Number.isNaN(b)) {
        const sa = String(actual ?? '')
        const sb = String(raw)
        return op === 'gt' ? sa > sb : op === 'gte' ? sa >= sb : op === 'lt' ? sa < sb : sa <= sb
      }
      return op === 'gt' ? a > b : op === 'gte' ? a >= b : op === 'lt' ? a < b : a <= b
    }
    default:
      return looseEq(actual, raw)
  }
}

function parseFilters(q: Record<string, any>): { field: string; op: string; raw: any }[] {
  const filters: { field: string; op: string; raw: any }[] = []
  Object.keys(q || {}).forEach((key) => {
    if (RESERVED.has(key)) return
    const raw = q[key]
    if (raw === undefined || raw === null || raw === '') return
    let field = key
    let op = 'eq'
    const idx = key.lastIndexOf('_')
    if (idx > 0) {
      const suffix = key.slice(idx + 1)
      if (OPS[suffix]) {
        field = key.slice(0, idx)
        op = suffix
      }
    }
    filters.push({ field, op, raw })
  })
  return filters
}

function buildSorter(sort?: string, order?: string) {
  const specs = String(sort || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      let desc = false
      if (s.startsWith('-')) {
        desc = true
        s = s.slice(1)
      } else if (s.startsWith('+')) {
        s = s.slice(1)
      }
      return { key: s, desc: order ? String(order).toLowerCase() === 'desc' : desc }
    })
    .filter((s) => s.key)
  if (!specs.length) return null
  return (a: any, b: any): number => {
    for (const { key, desc } of specs) {
      const av = a?.[key]
      const bv = b?.[key]
      if (av === bv) continue
      // 空值（undefined/null/''）始终沉底，避免排序后列表头部出现一堆空行
      const aEmpty = av === undefined || av === null || av === ''
      const bEmpty = bv === undefined || bv === null || bv === ''
      if (aEmpty || bEmpty) return aEmpty && bEmpty ? 0 : aEmpty ? 1 : -1
      let r: number
      const an = Number(av)
      const bn = Number(bv)
      if (!Number.isNaN(an) && !Number.isNaN(bn)) r = an < bn ? -1 : 1
      else r = String(av) < String(bv) ? -1 : 1
      return desc ? -r : r
    }
    return 0
  }
}

/** 数组转树 */
export function buildTree(list: any[], parentKey = 'parentId', childrenKey = 'children'): any[] {
  const map = new Map<string, any>()
  const roots: any[] = []
  list.forEach((item) => map.set(String(item?.id), { ...item, [childrenKey]: [] }))
  list.forEach((item) => {
    const node = map.get(String(item?.id))
    if (!node) return
    const pid = item?.[parentKey]
    const isRoot =
      pid === undefined || pid === null || pid === '' || pid === 0 || pid === '0'
    const parent = isRoot ? null : map.get(String(pid))
    if (parent) parent[childrenKey].push(node)
    else roots.push(node)
  })
  return roots
}

export interface QueryResult {
  data: any[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/** 列表查询：过滤 / 关键字 / 排序 / 分页 / 投影 / 树形 */
export function applyQuery(list: any[], q: Record<string, any> = {}): QueryResult {
  let rows = Array.isArray(list) ? list.slice() : []
  const filters = parseFilters(q)

  if (filters.length)
    rows = rows.filter((item) => filters.every((f) => test(item?.[f.field], f.op, f.raw)))

  const keyword = q.keyword === undefined || q.keyword === null ? '' : String(q.keyword).trim()
  if (keyword) {
    const fields = String(q.keywordFields || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    const lower = keyword.toLowerCase()
    rows = rows.filter((item) => {
      const keys = fields.length ? fields : Object.keys(item || {})
      return keys.some((k) => {
        const v = item?.[k]
        return v !== null && v !== undefined && String(v).toLowerCase().includes(lower)
      })
    })
  }

  const sorter = buildSorter(q.sort, q.order)
  if (sorter) rows.sort(sorter)

  const total = rows.length

  // 投影
  const fields = String(q.fields || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  if (fields.length)
    rows = rows.map((item) =>
      fields.reduce((o: any, k) => ((o[k] = item?.[k]), o), {}),
    )

  // 树形（不再分页）
  const isTree = String(q.tree) === '1' || String(q.tree) === 'true'
  if (isTree) {
    const data = buildTree(rows, String(q.parentKey || 'parentId'), String(q.childrenKey || 'children'))
    return { data, total, page: 1, pageSize: total, totalPages: 1 }
  }

  // 分页
  const pageSize = Math.min(
    Math.max(parseInt(q.pageSize ?? config.pageSize, 10) || config.pageSize, 1),
    config.maxPageSize,
  )
  const totalPages = Math.max(Math.ceil(total / pageSize), 1)
  const page = Math.min(Math.max(parseInt(q.page ?? q.currentPage ?? 1, 10) || 1, 1), totalPages)
  const start = (page - 1) * pageSize

  return { data: rows.slice(start, start + pageSize), total, page, pageSize, totalPages }
}
