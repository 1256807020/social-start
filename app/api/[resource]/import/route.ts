import { NextRequest, NextResponse } from 'next/server'
import * as db from '@/lib/json-db'
import { handlers } from '@/lib/crud'
import { csvToArray } from '@/lib/csv'
import { HttpError } from '@/lib/response'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function toEnvelope(e: unknown) {
  const err = e as HttpError
  return NextResponse.json(
    { code: err?.code || 50000, data: null, msg: err?.message || '服务器内部错误' },
    { status: err?.status || 500 },
  )
}

/** 导入集合：POST /api/:resource/import —— 支持 JSON 数组或上传 .json/.csv 文件 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ resource: string }> },
) {
  const { resource } = await params
  try {
    db.assertName(resource)
    const ct = req.headers.get('content-type') || ''
    let records: any[]
    if (ct.includes('multipart/form-data')) {
      const form = await req.formData()
      const file = form.get('file')
      if (!file || typeof file === 'string') throw new HttpError(400, 40000, '缺少文件字段 file')
      const text = await (file as File).text()
      const name = (file as File).name || ''
      const isCsv =
        name.toLowerCase().endsWith('.csv') || req.nextUrl.searchParams.get('format') === 'csv'
      records = isCsv ? csvToArray(text) : JSON.parse(text)
    } else {
      records = await req.json()
    }
    if (!Array.isArray(records)) records = [records]
    const res = await handlers.create(resource, records)
    return NextResponse.json(res.body, { status: res.status })
  } catch (e) {
    return toEnvelope(e)
  }
}
