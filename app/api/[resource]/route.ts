import { NextRequest } from 'next/server'
import { withApi } from '@/lib/response'
import { handlers } from '@/lib/crud'
import { assertName } from '@/lib/json-db'
import { toQuery, readJson, toResponse } from '@/lib/route-utils'
import { populateRecords } from '@/lib/populate'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ resource: string }> },
) {
  const { resource } = await params
  const q = toQuery(req)
  return toResponse(
    await withApi(async () => {
      assertName(resource)
      const res = await handlers.list(resource, q)
      if (q.populate) await populateRecords(res.body.data as any[], q.populate)
      return res
    }),
  )
}

/** 新增：对象=单条，数组=批量 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ resource: string }> },
) {
  const { resource } = await params
  return toResponse(
    await withApi(async () => {
      assertName(resource)
      return handlers.create(resource, await readJson(req))
    }),
  )
}

/** 清空集合（需 confirm=1 防误删） */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ resource: string }> },
) {
  const { resource } = await params
  return toResponse(
    await withApi(async () => {
      assertName(resource)
      return handlers.truncate(resource, toQuery(req).confirm)
    }),
  )
}
