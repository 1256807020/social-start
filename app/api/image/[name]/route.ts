import { NextResponse } from 'next/server'
import { ok, withApi } from '@/lib/response'
import { deleteImage } from '@/lib/media'

export const dynamic = 'force-dynamic'

/** 删除图片 */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  return withApi(async () => {
    const { name } = await params
    await deleteImage(name)
    return ok({ name }, '删除成功')
  })
}
