// 【next-dynamic-routes · [[...rest]] 可选 Catch-all】app/next-dynamic-routes/files/[[...rest]]/page.tsx
// 双层方括号 = 可选：既匹配 /files 本身（rest 为 undefined），也匹配 /files/a/b（rest = ['a','b']）。
// 对比 [...path]：那写法<strong>必须</strong>至少有一段，/docs 会 404。
import Link from 'next/link'

export default async function FilesPage({ params }: { params: Promise<{ rest?: string[] }> }) {
  const { rest } = await params

  return (
    <main className="mx-auto max-w-3xl space-y-3 p-6">
      <h1 className="text-2xl font-bold">文件浏览 · 可选 Catch-all [[...rest]]</h1>
      {rest && rest.length > 0 ? (
        <p className="text-sm text-gray-700">
          当前路径：<span className="font-mono">/{rest.join('/')}</span>
        </p>
      ) : (
        <p className="text-sm text-gray-700">
          当前在<strong>根目录</strong>（rest 为 undefined）—— 这就是「可选」的含义。
        </p>
      )}
      <p className="rounded bg-gray-50 p-2 text-xs text-gray-600">
        用 <code>[...rest]</code>（单层括号）时，<code>/files</code> 会 404；
        用 <code>[[...rest]]</code> 则父子路径都能命中。
      </p>
      <Link className="inline-block underline" href="/next-dynamic-routes">
        ← 返回
      </Link>
    </main>
  )
}
