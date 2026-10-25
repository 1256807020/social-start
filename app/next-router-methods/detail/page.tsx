// 【next-router-methods · push/prefetch 的目标页】app/next-router-methods/detail/page.tsx
import Link from 'next/link'

export default function DetailPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-4 p-6">
      <h1 className="text-2xl font-bold">详情页 · /next-router-methods/detail</h1>
      <p className="text-sm text-gray-600">
        由 <code>router.push()</code> 或 <code>router.prefetch()</code> 过来的目标页。
        试试浏览器「后退」：用 <code>push</code> 进来的能退回，用 <code>replace</code> 的回不去。
      </p>
      <Link className="inline-block underline" href="/next-router-methods">
        ← 返回
      </Link>
    </main>
  )
}
