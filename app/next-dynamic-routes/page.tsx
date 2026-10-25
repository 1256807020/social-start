// 【next-dynamic-routes · 动态路由三兄弟】app/next-dynamic-routes/page.tsx
// 从 Vue 转 React（路由篇）：
//   Vue Router：path: '/post/:slug' 是单段动态；'*' / pathMatch(.*)* 是通配。
//   Next.js 把「动态」直接写进<strong>文件夹名</strong>：
//     [slug]         → 单段动态（≈ Vue :slug）
//     [...path]      → Catch-all，吃掉剩下所有段（≈ Vue pathMatch(.*)*）
//     [[...rest]]    → 可选 Catch-all，<strong>连父路径本身也能匹配</strong>（Vue 没直接对应，要写两条路由）
//   generateStaticParams 则近似 Nuxt3 的 prerender routes：构建期把动态页预先渲染成静态页。
import Link from 'next/link'

const demos = [
  { href: '/next-dynamic-routes/post/hello', name: '[slug] 单段动态', desc: 'params.slug = hello' },
  { href: '/next-dynamic-routes/docs/guide/start/install', name: '[...path] Catch-all', desc: 'params.path = [guide, start, install]' },
  { href: '/next-dynamic-routes/files', name: '[[...rest]] 可选 Catch-all', desc: '不带子路径也能进（rest 为 undefined）' },
  { href: '/next-dynamic-routes/files/a/b', name: '[[...rest]] 带层级', desc: 'rest = [a, b]' },
]

export default function DynamicRoutesIndex() {
  return (
    <main className="mx-auto max-w-3xl space-y-6 p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">动态路由 [slug] / [...path] / [[...rest]]</h1>
        <p className="text-sm text-gray-500">
          文件夹名带方括号就是动态段；三类写法覆盖「一段 / 多段 / 可有可无」三种需求。
        </p>
      </header>

      <ul className="space-y-2">
        {demos.map((d) => (
          <li key={d.href} className="rounded border p-3">
            <Link className="font-medium underline" href={d.href}>
              {d.name}
            </Link>
            <p className="text-sm text-gray-500">{d.desc}</p>
            <p className="font-mono text-xs text-gray-400">{d.href}</p>
          </li>
        ))}
      </ul>

      <details className="rounded border p-4 text-sm">
        <summary className="cursor-pointer font-semibold">Vue2 / Vue3 / React 三向对照 + 总结</summary>
        <table className="mt-3 w-full border-collapse text-left">
          <thead>
            <tr className="border-b">
              <th className="px-2 py-1">需求</th>
              <th className="px-2 py-1">Vue Router</th>
              <th className="px-2 py-1">Next.js App Router</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="px-2 py-1">单段参数</td>
              <td className="px-2 py-1">path: /post/:slug</td>
              <td className="px-2 py-1">post/[slug]/</td>
            </tr>
            <tr className="border-b">
              <td className="px-2 py-1">多级通配</td>
              <td className="px-2 py-1">pathMatch(.*)*</td>
              <td className="px-2 py-1">docs/[...path]/</td>
            </tr>
            <tr className="border-b">
              <td className="px-2 py-1">可选通配</td>
              <td className="px-2 py-1">需写两条路由</td>
              <td className="px-2 py-1">files/[[...rest]]/</td>
            </tr>
            <tr>
              <td className="px-2 py-1">构建期预渲染</td>
              <td className="px-2 py-1">Nuxt3 prerender routes</td>
              <td className="px-2 py-1">generateStaticParams()</td>
            </tr>
          </tbody>
        </table>
        <p className="mt-3 text-gray-600">
          总结：① Next 15+ 起 <code>params</code> 是 <strong>Promise，必须 await</strong>；
          ② Catch-all 拿到的是<strong>字符串数组</strong>；
          ③ <code>generateStaticParams</code> 返回哪些参数，构建时就预渲染哪些页（没列到的按需生成）。
        </p>
      </details>
    </main>
  )
}
