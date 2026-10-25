// 【next-use-search-params · 服务端 searchParams vs 客户端 useSearchParams】app/next-use-search-params/page.tsx
// 两套读法，别混：
//   ① 服务端页面（page.tsx）：用 <strong>searchParams 属性</strong>，Next 15+ 起是 Promise，要 await。
//   ② 客户端组件：用 <strong>useSearchParams()</strong>，但必须包在 Suspense 里。
// 实战定位：筛选/分页/排序这类「URL 即状态」的场景 —— 可分享、可后退、可收藏。
import { Suspense } from 'react'
import SearchReader from './search-reader'

export default async function UseSearchParamsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  // ① 服务端读法：searchParams 是 Promise（Next 15+ 破坏性变更）
  const sp = await searchParams

  return (
    <main className="mx-auto max-w-3xl space-y-5 p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">useSearchParams · /next-use-search-params</h1>
        <p className="text-sm text-gray-500">
          同一个 URL 查询串，服务端和客户端各有一套读法。
        </p>
      </header>

      <section className="space-y-2 rounded border p-4">
        <h2 className="text-lg font-semibold">① 服务端：searchParams 属性</h2>
        <pre className="overflow-x-auto rounded bg-gray-50 p-3 text-xs">
          {JSON.stringify(sp, null, 2)}
        </pre>
        <p className="text-xs text-gray-500">
          在服务端组件里直接 await 即可，常用于「按 URL 参数在服务端取数」（如分页）。
        </p>
      </section>

      <section className="space-y-2 rounded border p-4">
        <h2 className="text-lg font-semibold">② 客户端：useSearchParams()</h2>
        {/* 🔧 固定写法：客户端组件读查询串必须包 Suspense，否则静态预渲染会报错 */}
        <Suspense fallback={<p className="text-sm text-gray-400">读取查询参数中…</p>}>
          <SearchReader />
        </Suspense>
      </section>

      <details className="rounded border p-4 text-sm">
        <summary className="cursor-pointer font-semibold">Vue / React 对照 + 三个易错点</summary>
        <table className="mt-3 w-full border-collapse text-left">
          <thead>
            <tr className="border-b">
              <th className="px-2 py-1">场景</th>
              <th className="px-2 py-1">Vue Router</th>
              <th className="px-2 py-1">Next.js</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="px-2 py-1">读查询串</td>
              <td className="px-2 py-1">$route.query</td>
              <td className="px-2 py-1">searchParams 属性 / useSearchParams()</td>
            </tr>
            <tr className="border-b">
              <td className="px-2 py-1">改查询串</td>
              <td className="px-2 py-1">router.push({'{query}'})</td>
              <td className="px-2 py-1">router.replace(pathname + '?' + params)</td>
            </tr>
            <tr>
              <td className="px-2 py-1">响应式</td>
              <td className="px-2 py-1">自动</td>
              <td className="px-2 py-1">URL 变化触发重渲染</td>
            </tr>
          </tbody>
        </table>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-gray-700">
          <li>
            <strong>必须包 Suspense</strong>：客户端组件用 <code>useSearchParams()</code> 而不包，
            静态预渲染阶段会报错（这是最高频的坑）。
          </li>
          <li>
            <strong>它是只读的</strong>：要改查询串得自己拼 URL 再 <code>router.replace/push</code>
            （配合 <code>usePathname()</code> 拿到当前路径）。
          </li>
          <li>
            <strong>Next 15+ 服务端 searchParams 是 Promise</strong>，忘了 <code>await</code> 会拿到
            Promise 对象而不是参数。
          </li>
        </ul>
      </details>
    </main>
  )
}
