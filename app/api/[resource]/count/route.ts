import { NextRequest } from 'next/server'
import { withApi } from '@/lib/response'
import { handlers } from '@/lib/crud'
import { assertName } from '@/lib/json-db'
import { toQuery, toResponse } from '@/lib/route-utils'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/** 数量统计（支持过滤条件） */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ resource: string }> },
) {
  const { resource } = await params
  return toResponse(
    await withApi(async () => {
      assertName(resource)
      return handlers.count(resource, toQuery(req))
    }),
  )
}
