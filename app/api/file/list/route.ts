import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { ok, withApi } from '@/lib/response'
import { listFiles } from '@/lib/file'
import { toQuery } from '@/lib/route-utils'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/** 文件列表（分页） */
export async function GET(req: NextRequest) {
  return withApi(async () => {
    const q = toQuery(req)
    const page = Math.max(parseInt(q.page || '1', 10) || 1, 1)
    const pageSize = Math.min(Math.max(parseInt(q.pageSize || '50', 10) || 50, 1), 500)
    const r = await listFiles(pageSize, (page - 1) * pageSize)
    return ok(r.items, 'success', {
      total: r.total,
      page,
      pageSize,
      totalPages: Math.max(Math.ceil(r.total / pageSize), 1),
    })
  })
}
