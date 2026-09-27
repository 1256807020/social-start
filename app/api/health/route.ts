import { withApi, ok } from '@/lib/response'
import { toResponse } from '@/lib/route-utils'
import * as db from '@/lib/json-db'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/** 健康检查：环境、运行时间、集合数、数据目录 */
export async function GET() {
  return toResponse(
    await withApi(async () =>
      ok({
        env: process.env.NODE_ENV || 'development',
        uptime: Math.floor(process.uptime()),
        collections: (await db.collections()).length,
        dataDir: db.dataDir,
      }),
    ),
  )
}
