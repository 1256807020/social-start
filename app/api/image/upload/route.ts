import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { ok, badRequest, withApi } from '@/lib/response'
import { saveUpload } from '@/lib/media'
import { toResponse } from '@/lib/route-utils'

export const dynamic = 'force-dynamic'

/** 上传（单张或多张，字段名 file） */
export async function POST(req: NextRequest) {
  return toResponse(withApi(async () => {
    const form = await req.formData()
    const files = (form.getAll('file') as unknown[]).filter(
      (f): f is File => f instanceof File && f.size > 0,
    )
    if (!files.length) throw badRequest('请选择要上传的图片')

    const saved: any[] = []
    for (const f of files) {
      const buf = Buffer.from(await f.arrayBuffer())
      const name = await saveUpload(buf, f.name)
      saved.push({
        name,
        original: f.name,
        url: `/img/${encodeURIComponent(name)}`,
        size: f.size,
        sizeText: `${Math.round(f.size / 1024)} KB`,
      })
    }
    return ok(saved.length === 1 ? saved[0] : saved, `上传成功 ${saved.length} 张`, {}, 201)
  })
}
