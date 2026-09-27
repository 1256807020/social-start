/**
 * 通用 CRUD 处理函数（移植自 BasicApi router/crud.js 的 handlers）
 * 纯逻辑层：接收 (resource, query, body) 返回 ApiResult，不接触 Next 请求对象。
 */
import { applyQuery } from './query'
import { config } from './config'
import { badRequest, notFound, ok, HttpError } from './response'
import * as db from './json-db'

function nowStr(): string {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(
    d.getMinutes(),
  )}:${p(d.getSeconds())}`
}

function isPlainObject(v: any): boolean {
  return Object.prototype.toString.call(v) === '[object Object]'
}

function toIdList(v: any): string[] {
  const arr = v === undefined || v === null ? [] : Array.isArray(v) ? v : String(v).split(',')
  return arr
    .map((i: any) => String(i).trim())
    .filter((i: string) => i !== '')
}

export const handlers = {
  /** 列表：分页 / 过滤 / 排序 / 关键字 / 树形 */
  async list(resource: string, q: Record<string, any>) {
    const list = await db.read(resource)
    const r = applyQuery(list, q)
    return ok(r.data, 'success', {
      total: r.total,
      page: r.page,
      pageSize: r.pageSize,
      totalPages: r.totalPages,
    })
  },

  /** 数量统计（支持过滤条件） */
  async count(resource: string, q: Record<string, any>) {
    const list = await db.read(resource)
    const r = applyQuery(list, q)
    return ok({ total: r.total })
  },

  /** 详情 */
  async detail(resource: string, id: any) {
    const list = await db.read(resource)
    const item = db.findById(list, id)
    if (!item) throw notFound(`找不到 id=${id} 的记录`)
    return ok(item)
  },

  /** 新增（对象=单条，数组=批量） */
  async create(resource: string, body: any) {
    if (body === undefined || body === null) throw badRequest('请求体不能为空')
    const items = Array.isArray(body) ? body : [body]
    if (!items.length) throw badRequest('请求体不能为空')
    items.forEach((it: any, i: number) => {
      if (!isPlainObject(it)) throw badRequest(`第 ${i + 1} 条记录必须是对象`)
    })

    const created = await db.transaction(resource, (list: any[]) => {
      const exist = new Set(list.map((i) => String(i?.id)))
      const ts = nowStr()
      return items.map((item: any) => {
        const rec = { ...item }
        if (rec.id === undefined || rec.id === null || rec.id === '') rec.id = db.genId(exist)
        else if (exist.has(String(rec.id))) throw badRequest(`id ${rec.id} 已存在`)
        exist.add(String(rec.id))
        if (config.autoTimestamp) {
          rec.createdAt = rec.createdAt || ts
          rec.updatedAt = ts
        }
        list.unshift(rec)
        return rec
      })
    })
    const data = Array.isArray(body) ? created : created[0]
    return ok(data, '新增成功', {}, 201)
  },

  /** 修改：replace=true 全量替换，false 增量合并 */
  async update(resource: string, id: any, body: any, replace = false) {
    if (id === undefined || id === null || id === '') throw badRequest('缺少 id')
    if (!isPlainObject(body)) throw badRequest('请求体必须是对象')

    const updated = await db.transaction(resource, (list: any[]) => {
      const idx = db.indexOfId(list, id)
      if (idx === -1) throw notFound(`找不到 id=${id} 的记录`)
      const old = list[idx]
      const next = replace ? { ...body } : { ...old, ...body }
      next.id = old.id
      if (config.autoTimestamp) {
        next.createdAt = old.createdAt ?? body.createdAt ?? nowStr()
        next.updatedAt = nowStr()
      }
      list[idx] = next
      return next
    })
    return ok(updated, '修改成功')
  },

  /** 删除单条 */
  async remove(resource: string, id: any) {
    if (id === undefined || id === null || id === '') throw badRequest('缺少 id')
    const removed = await db.transaction(resource, (list: any[]) => {
      const idx = db.indexOfId(list, id)
      if (idx === -1) throw notFound(`找不到 id=${id} 的记录`)
      return list.splice(idx, 1)[0]
    })
    return ok(removed, '删除成功')
  },

  /** 批量删除：body { ids:[1,2] } / [1,2] / ids=1,2 */
  async batchDelete(resource: string, ids: any) {
    const idList = toIdList(ids)
    if (!idList.length) throw badRequest('缺少 ids')
    const set = new Set(idList)
    const removed = await db.transaction(resource, (list: any[]) => {
      const del: any[] = []
      for (let i = list.length - 1; i >= 0; i--) {
        if (set.has(String(list[i]?.id))) del.unshift(list.splice(i, 1)[0])
      }
      return del
    })
    return ok(
      { deleted: removed.length, ids: removed.map((i) => i?.id) },
      `删除成功，共 ${removed.length} 条`,
    )
  },

  /** 批量修改：body [{ id, ... }] */
  async batchUpdate(resource: string, items: any[]) {
    if (!Array.isArray(items)) throw badRequest('请求体必须是数组')
    const ts = nowStr()
    const updated = await db.transaction(resource, (list: any[]) => {
      return items.map((item: any, i: number) => {
        if (!isPlainObject(item)) throw badRequest(`第 ${i + 1} 条记录必须是对象`)
        const idx = db.indexOfId(list, item.id)
        if (idx === -1) throw notFound(`找不到 id=${item.id} 的记录`)
        const next = { ...list[idx], ...item, id: list[idx].id }
        if (config.autoTimestamp) next.updatedAt = ts
        list[idx] = next
        return next
      })
    })
    return ok(updated, `修改成功，共 ${updated.length} 条`)
  },

  /** 清空集合（需 confirm=1 防误删） */
  async truncate(resource: string, confirm: any) {
    if (String(confirm) !== '1') throw badRequest('清空集合需携带 confirm=1')
    const total = await db.transaction(resource, (list: any[]) => {
      const n = list.length
      list.length = 0
      return n
    })
    return ok({ cleared: total }, `已清空 ${total} 条数据`)
  },
}

export type { HttpError }
