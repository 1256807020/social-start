// 【next-intercepting-routes · gallery 真实完整页】app/next-intercepting-routes/gallery/page.tsx
// 刷新、直达、从外部点进来 → 都走这里（软导航才会被 albums/(..)gallery 拦截）。
import Link from 'next/link'

export default function GalleryPage() {
  return (
    <section className="space-y-3 rounded border p-4">
      <h2 className="text-lg font-bold">Gallery 完整页 · /next-intercepting-routes/gallery</h2>
      <p className="rounded bg-amber-50 p-2 text-xs text-amber-700">
        当前是<strong>真实完整页</strong>（硬刷新/直达）。如果是从 /albums 点链接过来，
        则会看到 (..) 拦截后的弹层。
      </p>
      <Link className="inline-block underline" href="/next-intercepting-routes/albums">
        ← 回到 albums（再点链接体验拦截）
      </Link>
    </section>
  )
}
