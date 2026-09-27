/**
 * 聚合统计（进阶能力，独立于核心 CRUD）。
 * 在内存数组上做 group by / sum / avg / min / max / count，返回聚合结果数组。
 * 不修改 lib/crud.ts / lib/json-db.ts，纯独立模块；路由层调用本文件即可。
 */
import * as db from './json-db'
import { applyQuery } from './query'

function sum(arr: any[], f: string) {
  return arr.reduce((s, i) => s + (Number(i?.[f]) || 0), 0)
}
function avg(arr: any[], f: string) {
  return arr.length ? sum(arr, f) / arr.length : 0
}
function min(arr: any[], f: string) {
  return arr.length ? Math.min(...arr.map((i) => Number(i?.[f]) || 0)) : 0
}
function max(arr: any[], f: string) {
  return arr.length ? Math.max(...arr.map((i) => Number(i?.[f]) || 0)) : 0
}

export async function aggregate(resource: string, q: Record<string, any>) {
  const list = await db.read(resource)
  // 复用查询引擎做过滤 / 关键字，但聚合本身忽略分页与树
  // 复用查询引擎做字段过滤，但剔除聚合专用参数（避免被当成普通字段过滤）
  const q2 = { ...q }
  for (const k of [
    'page',
    'pageSize',
    'tree',
    'sort',
    'order',
    'keyword',
    'keywordFields',
    'fields',
    'populate',
    'groupBy',
    'sum',
    'avg',
    'min',
    'max',
  ]) {
    delete (q2 as Record<string, any>)[k]
  }
  const filtered = applyQuery(list, q2).data

  const sumFields = String(q.sum || '').split(',').map((s) => s.trim()).filter(Boolean)
  const avgFields = String(q.avg || '').split(',').map((s) => s.trim()).filter(Boolean)
  const minFields = String(q.min || '').split(',').map((s) => s.trim()).filter(Boolean)
  const maxFields = String(q.max || '').split(',').map((s) => s.trim()).filter(Boolean)

  const rowOf = (items: any[]) => {
    const row: Record<string, unknown> = { count: items.length }
    sumFields.forEach((f) => (row[`sum_${f}`] = sum(items, f)))
    avgFields.forEach((f) => (row[`avg_${f}`] = avg(items, f)))
    minFields.forEach((f) => (row[`min_${f}`] = min(items, f)))
    maxFields.forEach((f) => (row[`max_${f}`] = max(items, f)))
    return row
  }

  if (!q.groupBy) {
    return [rowOf(filtered)]
  }
  const groups = new Map<string, any[]>()
  for (const item of filtered) {
    const key = String(item?.[q.groupBy])
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(item)
  }
  const rows: any[] = []
  for (const [key, items] of groups) {
    const row = rowOf(items)
    row[q.groupBy] = key
    rows.push(row)
  }
  return rows
}
