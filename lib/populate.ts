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

    for (const item of items) {
      if (item == null) continue
      const key = item[field]
      if (key === undefined || key === null) continue
      item[field] = map.get(String(key)) || null
    }
  }
  return items
}
