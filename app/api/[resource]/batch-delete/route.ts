import { NextRequest } from 'next/server'
import { withApi } from '@/lib/response'
import { handlers } from '@/lib/crud'
import { assertName } from '@/lib/json-db'
import { toQuery, readJson, toResponse } from '@/lib/route-utils'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/** 批量删除：body [{id}] / {ids:[...]} / {ids:"1,2"} / ?ids=1,2 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ resource: string }> },
) {
  const { resource } = await params
  return toResponse(
    await withApi(async () => {
      assertName(resource)
      const body = await readJson(req)
      const q = toQuery(req)
      const ids = Array.isArray(body) ? body : body?.ids ?? q.ids
      return handlers.batchDelete(resource, ids)
    }),
  )
}
