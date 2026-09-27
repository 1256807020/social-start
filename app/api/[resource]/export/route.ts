import { NextRequest, NextResponse } from 'next/server'
import * as db from '@/lib/json-db'
import { arrayToCsv } from '@/lib/csv'
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

/** 导出集合：GET /api/:resource/export?format=json|csv —— 下载文件 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ resource: string }> },
) {
  const { resource } = await params
  try {
    db.assertName(resource)
    const list = await db.read(resource)
    const format = req.nextUrl.searchParams.get('format') === 'csv' ? 'csv' : 'json'
    let body: string
    let contentType: string
    if (format === 'csv') {
      body = arrayToCsv(list)
      contentType = 'text/csv; charset=utf-8'
    } else {
      body = JSON.stringify(list, null, 2)
      contentType = 'application/json; charset=utf-8'
    }
    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${resource}.${format}"`,
      },
    })
  } catch (e) {
    return toEnvelope(e)
  }
}
