import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { placeholderSvg } from '@/lib/media'

export const dynamic = 'force-dynamic'

/** 占位图：/api/image/placeholder/300x200 或 ?w=300&h=200&text=...&bg=...&color=... */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ size: string }> },
) {
  const { size } = await params
  const q = Object.fromEntries(new URL(req.url).searchParams)
  const m = String(size || '').match(/^(\d{1,4})[xX*](\d{1,4})$/)
  const w = Math.min(Math.max(parseInt(m ? m[1] : (q.w as string), 10) || 300, 1), 3000)
  const h = Math.min(Math.max(parseInt(m ? m[2] : (q.h as string), 10) || 200, 1), 3000)
  const text = String(q.text || `${w}×${h}`).slice(0, 40)
  const bg = String(q.bg || '#e2e8f0')
  const color = String(q.color || '#64748b')
  const svg = placeholderSvg(w, h, text, bg, color)
  return new NextResponse(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
