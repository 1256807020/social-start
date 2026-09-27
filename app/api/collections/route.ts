import { withApi, ok } from '@/lib/response'
import { toResponse } from '@/lib/route-utils'
import * as db from '@/lib/json-db'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/** 集合列表（记录数、体积、更新时间） */
export async function GET() {
  return toResponse(await withApi(async () => ok(await db.collections())))
}
