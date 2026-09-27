import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/** API 索引 */
export async function GET() {
  return NextResponse.json({
    name: 'Social Start JSON API',
    message: '一个 JSON 文件 = 一套完整 CRUD。把路径里的 resource 换成你的集合名即可。',
    health: '/api/health',
    collections: '/api/collections',
  })
}
