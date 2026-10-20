/**
 * 关联查询 populate（进阶能力，路由层组装，不修改核心 CRUD）。
 * 把记录里存的外键值（如 item.author 存的是用户 id）替换为对应集合的整条记录。
 * 语法：?populate=author                -> 默认去 authors 集合按 id 查找
 *       ?populate=author:users          -> 去 users 集合按 id 查找
 *       ?populate=author:users:uid      -> 去 users 集合按 uid 字段匹配
 * 多字段：?populate=author,category
 */
import * as db from './json-db'

export async function populateRecords(
  items: any[],
  spec: string,
): Promise<any[]> {
  if (!items || !items.length || !spec) return items
  const fields = spec.split(',').map((s) => s.trim()).filter(Boolean)
  if (!fields.length) return items

  // ⚠️ 关键：必须复制出新对象再改字段，不能原地改。
  // 原因：db.read() 带 mtime 缓存，返回的是同一批对象引用；applyQuery 只做的 list.slice()
  // 是「数组浅拷贝」，item 仍是缓存里的那个对象。若原地把 author 改成整条作者对象，
  // 会把内存缓存也毒化 —— 之后不带 populate 的请求同样会返回对象（外键原值丢失）。
  const out = items.map((it) => (it == null ? it : { ...it }))

  for (const f of fields) {
    const [field, from, fk] = f.split(':')
    const collection = from || field // 默认集合名 = 字段名
    const foreignKey = fk || 'id'

    let foreignList: any[] = []
    try {
      foreignList = await db.read(collection)
    } catch {
      foreignList = []
    }
    const map = new Map(foreignList.map((r) => [String(r?.[foreignKey]), r]))

    for (const item of out) {
      if (item == null) continue
      const key = item[field]
      if (key === undefined || key === null) continue
      item[field] = map.get(String(key)) || null
    }
  }
  return out
}
