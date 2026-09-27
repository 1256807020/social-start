import type { NextRequest } from 'next/server'
import { ok, badRequest, withApi } from '@/lib/response'
import { saveUpload, filePrefix } from '@/lib/file'
import { toResponse } from '@/lib/route-utils'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/** 上传通用文件（单/多，字段名 file，任意格式） */
export async function POST(req: NextRequest) {
  return toResponse(
    await withApi(async () => {
      const form = await req.formData()
      const files = (form.getAll('file') as unknown[]).filter(
        (f): f is File => f instanceof File && f.size > 0,
      )
      if (!files.length) throw badRequest('请选择要上传的文件')
      const saved: any[] = []
      for (const f of files) {
        const buf = Buffer.from(await f.arrayBuffer())
        const name = await saveUpload(buf, f.name)
        saved.push({
          name,
          original: f.name,
          url: `${filePrefix}/${encodeURIComponent(name)}`,
          size: f.size,
          sizeText: `${Math.round(f.size / 1024)} KB`,
          ext: (f.name.split('.').pop() || '').toLowerCase(),
        })
      }
      return ok(saved.length === 1 ? saved[0] : saved, `上传成功 ${saved.length} 个`, {}, 201)
    }),
  )
}
