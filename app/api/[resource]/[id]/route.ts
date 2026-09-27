import { NextRequest } from 'next/server'
import { withApi } from '@/lib/response'
import { handlers } from '@/lib/crud'
import { assertName } from '@/lib/json-db'
import { toQuery, readJson, toResponse } from '@/lib/route-utils'
import { populateRecords } from '@/lib/populate'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/** 详情 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ resource: string; id: string }> },
) {
  const { resource, id } = await params
  const q = toQuery(req)
  return toResponse(
    await withApi(async () => {
      assertName(resource)
      const res = await handlers.detail(resource, id)
      if (q.populate) await populateRecords([res.body.data], q.populate)
      return res
    }),
  )
}

/** 全量替换 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ resource: string; id: string }> },
) {
  const { resource, id } = await params
  return toResponse(
    await withApi(async () => {
      assertName(resource)
      return handlers.update(resource, id, await readJson(req), true)
    }),
  )
}

/** 增量修改 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ resource: string; id: string }> },
) {
  const { resource, id } = await params
  return toResponse(
    await withApi(async () => {
      assertName(resource)
      return handlers.update(resource, id, await readJson(req), false)
    }),
  )
}

/** 删除单条 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ resource: string; id: string }> },
) {
  const { resource, id } = await params
  return toResponse(
    await withApi(async () => {
      assertName(resource)
      return handlers.remove(resource, id)
    }),
  )
}
