import { NextResponse } from 'next/server'
import { ok, withApi } from '@/lib/response'
import { deleteFile } from '@/lib/file'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/** 删除文件 */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  return withApi(async () => {
    const { name } = await params
    await deleteFile(name)
    return ok({ name }, '删除成功')
  })
}
