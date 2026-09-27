import { promises as fsp } from 'fs'
import { NextResponse } from 'next/server'
import { mimeOf, resolveFile } from '../../../lib/media'

export const dynamic = 'force-dynamic'

/** 静态图片访问：/img/:name（安全路径 + 正确 mime + 缓存） */
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
    return NextResponse.json({ code: 40004, data: null, msg: '图片不存在' }, { status: 404 })
  }
  return new NextResponse(new Uint8Array(buf), {
    status: 200,
    headers: {
      'Content-Type': mimeOf(abs),
      'Cache-Control': 'public, max-age=86400',
      'Last-Modified': new Date().toUTCString(),
    },
  })
}
