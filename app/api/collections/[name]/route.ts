import { NextRequest } from 'next/server'
import { withApi, ok, notFound } from '@/lib/response'
import { toResponse } from '@/lib/route-utils'
import * as db from '@/lib/json-db'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/** 字段结构自动推断 */
function inferSchema(list: any[]) {
  const fields = new Map<string, { types: Set<string>; filled: number; sample: any }>()
  const take = list.slice(0, Math.min(list.length, 50))
  take.forEach((item) => {
    Object.keys(item || {}).forEach((k) => {
      if (!fields.has(k)) fields.set(k, { types: new Set(), filled: 0, sample: undefined })
      const f = fields.get(k)!
      const v = item[k]
      if (v !== undefined && v !== null && v !== '') {
        f.filled++
        if (f.sample === undefined) f.sample = v
      }
      f.types.add(typeof v)
    })
  })
  return [...fields.entries()].map(([field, f]) => ({
    field,
    types: [...f.types].filter((t) => t !== 'undefined'),
    filled: f.filled,
    sample: f.sample,
  }))
}

/** 集合详情 + 字段结构自动推断 + 前 5 条预览 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params
  return toResponse(
    await withApi(async () => {
      db.assertName(name)
      const list = await db.read(name)
      return ok({
        name,
        total: list.length,
        file: db.fileOf(name),
        schema: inferSchema(list),
        preview: list.slice(0, 5),
      })
    }),
  )
}

/** 删除集合文件 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params
  return toResponse(
    await withApi(async () => {
      db.assertName(name)
      const dropped = await db.dropCollection(name)
      if (!dropped) throw notFound(`集合 ${name} 不存在`)
      return ok({ dropped: name }, `已删除集合 ${name}`)
    }),
  )
}
