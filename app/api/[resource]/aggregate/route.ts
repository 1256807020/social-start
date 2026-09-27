import type { NextRequest } from 'next/server'
import { ok, withApi } from '@/lib/response'
import { aggregate } from '@/lib/aggregate'
import { assertName } from '@/lib/json-db'
import { toQuery } from '@/lib/route-utils'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/** 聚合统计：?groupBy=status&sum=amount&avg=score&min=age&max=age */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ resource: string }> },
) {
  const { resource } = await params
  return withApi(async () => {
    assertName(resource)
    const rows = await aggregate(resource, toQuery(req))
    return ok(rows, 'success', { total: rows.length })
  })
}
