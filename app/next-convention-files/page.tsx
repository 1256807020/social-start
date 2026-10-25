// 【next-convention-files · Next.js 约定文件全家桶】app/next-convention-files/page.tsx
// 从 Vue 转 React（路由篇）：
//   Vue Router / Vue 里这些能力都要「自己接」：<Suspense fallback> 做加载态、
//   errorCaptured / app.config.errorHandler 兜错、通配路由 pathMatch(.*)* 做 404。
//   Next.js 把它们变成了<strong>约定文件</strong>：只要按名字往目录里一放，框架自动接管。
// 实战定位：这 4 个文件几乎每个线上项目都要写 —— loading（首屏骨架）、error（降级不白屏）、
//   not-found（软 404）、global-error（根布局兜底，最后一道防线）。
// 学习模式：🔧 固定写法 = 文件放在哪个路由段，就只保护/作用于那一段（就近原则）；
//          👉 练习点 = 给 slow 段再套一层子路由，验证子段会用它自己的 loading.tsx。
import Link from 'next/link'

const demos = [
  { href: '/next-convention-files/slow', name: 'loading.tsx', desc: '慢页面先出骨架屏（3 秒）' },
  { href: '/next-convention-files/boom?fail=1', name: 'error.tsx', desc: '页面抛错 → 就近错误 UI + 重试' },
  { href: '/next-convention-files/missing', name: 'not-found.tsx', desc: 'notFound() → 就近 404 页' },
]

export default function ConventionIndex() {
  return (
    <main className="mx-auto max-w-3xl space-y-6 p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">约定文件 loading / error / not-found / global-error</h1>
        <p className="text-sm text-gray-500">
          文件名即能力：放在哪个目录，就作用于那个路由段（就近生效，逐层兜底）。
        </p>
      </header>

      <ul className="space-y-2">
        {demos.map((d) => (
          <li key={d.href} className="rounded border p-3">
            <Link className="font-medium underline" href={d.href}>
              {d.name}
            </Link>
            <p className="text-sm text-gray-500">{d.desc}</p>
          </li>
        ))}
      </ul>

      <details className="rounded border p-4 text-sm">
        <summary className="cursor-pointer font-semibold">Vue2 / Vue3 / React 三向对照 + 总结</summary>
        <table className="mt-3 w-full border-collapse text-left">
          <thead>
            <tr className="border-b">
              <th className="px-2 py-1">Next.js 约定文件</th>
              <th className="px-2 py-1">Vue 里怎么做</th>
              <th className="px-2 py-1">作用范围</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="px-2 py-1">loading.tsx</td>
              <td className="px-2 py-1">&lt;Suspense fallback&gt;</td>
              <td className="px-2 py-1">本路由段</td>
            </tr>
            <tr className="border-b">
              <td className="px-2 py-1">error.tsx</td>
              <td className="px-2 py-1">errorCaptured / onErrorCaptured</td>
              <td className="px-2 py-1">本路由段及以下</td>
            </tr>
            <tr className="border-b">
              <td className="px-2 py-1">not-found.tsx</td>
              <td className="px-2 py-1">通配路由 pathMatch(.*)*</td>
              <td className="px-2 py-1">notFound() 就近找</td>
            </tr>
            <tr>
              <td className="px-2 py-1">global-error.tsx</td>
              <td className="px-2 py-1">app.config.errorHandler</td>
              <td className="px-2 py-1">根布局（最后防线）</td>
            </tr>
          </tbody>
        </table>
        <p className="mt-3 text-gray-600">
          总结：三个要点 ——
          ① error.tsx <strong>必须是客户端组件</strong>（要能点「重试」）；
          ② error.tsx 抓不到<strong>同段 layout 自己</strong>的错，那种错要由<strong>上一层</strong>的 error.tsx 或根 global-error.tsx 兜；
          ③ notFound() 会去找<strong>最近的</strong> not-found.tsx。
        </p>
      </details>
    </main>
  )
}
