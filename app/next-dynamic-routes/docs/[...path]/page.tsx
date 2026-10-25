// 【next-dynamic-routes · [...path] Catch-all】app/next-dynamic-routes/docs/[...path]/page.tsx
// 三个点 [...] 表示「吃掉剩下所有层级」：
//   /docs/guide/start/install → params.path = ['guide', 'start', 'install']
//   （对比 [path] 单段：只会匹配 /docs/xxx 一层）
import Link from 'next/link'

export default async function DocsPage({ params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params

  return (
    <main className="mx-auto max-w-3xl space-y-3 p-6">
      <h1 className="text-2xl font-bold">文档 · Catch-all [...path]</h1>
      <p className="text-sm text-gray-600">
        当前层级：<strong>{path.length}</strong> 级
      </p>
      <ul className="space-y-1 text-sm">
        {path.map((seg, i) => (
          <li key={i} className="font-mono">
            [{i}] {seg}
          </li>
        ))}
      </ul>
      <p className="rounded bg-gray-50 p-2 text-xs text-gray-600">
        params.path 是<strong>字符串数组</strong> —— 这就是 Catch-all 与单段动态的唯一区别。
      </p>
      <Link className="inline-block underline" href="/next-dynamic-routes">
        ← 返回
      </Link>
    </main>
  )
}
