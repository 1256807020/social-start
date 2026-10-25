// 【next-redirect · 跳转目标页】app/next-redirect/new/page.tsx
import Link from 'next/link'

export default function NewPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-4 p-6">
      <h1 className="text-2xl font-bold">新地址 · /next-redirect/new</h1>
      <p className="text-sm text-gray-600">
        你是从 <code>/old</code>（307 临时）或 <code>/legacy</code>（308 永久）被送过来的。
      </p>
      <Link className="inline-block underline" href="/next-redirect">
        ← 返回
      </Link>
    </main>
  )
}
