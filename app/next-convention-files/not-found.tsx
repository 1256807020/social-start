// 【next-convention-files · 段级 404】app/next-convention-files/not-found.tsx
// 🔧 固定写法：notFound() 被谁调用，就找<strong>离它最近</strong>的 not-found.tsx。
//    放在本段 → 只有本段内的 404 用它；放在 app 根 → 全站兜底 404。
import Link from 'next/link'

export default function NotFound() {
  return (
    <section className="space-y-2 rounded border p-4">
      <h2 className="text-lg font-semibold">404 · 这一段没找到</h2>
      <p className="text-sm text-gray-600">
        这是 <code>app/next-convention-files/not-found.tsx</code> —— 段级 404，
        由 <code>notFound()</code> 就近命中。
      </p>
      <Link className="inline-block underline" href="/next-convention-files">
        ← 返回
      </Link>
    </section>
  )
}
