import { NextResponse } from 'next/server'
import { ok, withApi } from '@/lib/response'
import { infoImage } from '@/lib/media'
import { toResponse } from '@/lib/route-utils'

export const dynamic = 'force-dynamic'

/** 图片信息 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  return toResponse(withApi(async () => {
    const { name } = await params
    return ok(await infoImage(name))
  }))
}
