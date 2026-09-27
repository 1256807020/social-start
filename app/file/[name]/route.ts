import { promises as fsp } from 'fs'
import { NextResponse } from 'next/server'
import { mimeOf, resolveFile } from '@/lib/file'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/** 静态文件访问：/file/:name（公开，带缓存，inline 预览） */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params
  let abs: string
  try {
    abs = resolveFile(name)
  } catch {
    return NextResponse.json({ code: 40000, data: null, msg: '非法文件路径' }, { status: 400 })
  }
  let buf: Buffer
  try {
    buf = await fsp.readFile(abs)
  } catch {
    return NextResponse.json({ code: 40004, data: null, msg: '文件不存在' }, { status: 404 })
  }
  return new NextResponse(new Uint8Array(buf), {
    status: 200,
    headers: {
      'Content-Type': mimeOf(abs),
      'Cache-Control': 'public, max-age=86400',
      'Content-Disposition': `inline; filename="${name}"`,
    },
  })
}
