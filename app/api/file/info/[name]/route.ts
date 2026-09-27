import { NextResponse } from 'next/server'
import { ok, withApi } from '@/lib/response'
import { infoFile } from '@/lib/file'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/** 文件信息 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  return withApi(async () => {
    const { name } = await params
    return ok(await infoFile(name))
  })
}
