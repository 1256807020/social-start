// 【next-server-only · server-only / client-only 边界】app/next-server-only/page.tsx
// 从 Vue 转 React（边界篇）：
//   Vue / Nuxt 里靠「约定」达到同样目的：Nuxt3 的 server/ 目录、*.server.ts 后缀、
//   以及 .env 里非 NUXT_PUBLIC_ 前缀的变量不会进客户端。
//   Next 的做法更硬：用 server-only 包把约束变成<strong>构建期报错</strong>。
// 实战定位：任何含密钥、数据库连接、fs 读取的模块，都该 import 'server-only' 锁死。
// 学习模式：🔧 固定写法 = 敏感模块顶部 import 'server-only'，数据经 props 下发给客户端组件；
//          👉 练习点 = 在 show.tsx 顶部加 import { getServerSecret } from './secret'，看构建报错。
import ShowSecret from './show'
import { getServerSecret } from './secret'

// 本页面没有 'use client' → 是服务端组件，可以安全调用服务端模块。
export default function ServerOnlyPage() {
  const secret = getServerSecret()

  return (
    <main className="mx-auto max-w-3xl space-y-5 p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">server-only / client-only · /next-server-only</h1>
        <p className="text-sm text-gray-500">
          用构建期报错来防止「服务端密钥被打包进浏览器」。
        </p>
      </header>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">① 服务端取数 → props 下发</h2>
        <ShowSecret secret={secret} />
      </section>

      <section className="space-y-2 rounded border p-4">
        <h2 className="text-lg font-semibold">② 两个包的分工</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
          <li>
            <code>server-only</code>：标了它，被客户端组件引用就<strong>构建报错</strong>。
            用于数据库、密钥、fs 等模块。
          </li>
          <li>
            <code>client-only</code>：反过来，标了它，被服务端组件引用就报错。
            用于依赖 <code>window</code> / <code>document</code> 的库（如某些图表、编辑器）。
          </li>
        </ul>
      </section>

      <details className="rounded border p-4 text-sm">
        <summary className="cursor-pointer font-semibold">Vue / Nuxt / React 三向对照 + 总结</summary>
        <table className="mt-3 w-full border-collapse text-left">
          <thead>
            <tr className="border-b">
              <th className="px-2 py-1">能力</th>
              <th className="px-2 py-1">Nuxt3</th>
              <th className="px-2 py-1">Next.js</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="px-2 py-1">服务端专用代码</td>
              <td className="px-2 py-1">server/ 目录、*.server.ts</td>
              <td className="px-2 py-1">import server-only</td>
            </tr>
            <tr className="border-b">
              <td className="px-2 py-1">变量不下发</td>
              <td className="px-2 py-1">非 NUXT_PUBLIC_ 前缀</td>
              <td className="px-2 py-1">非 NEXT_PUBLIC_ 前缀</td>
            </tr>
            <tr>
              <td className="px-2 py-1">违规后果</td>
              <td className="px-2 py-1">靠约定，易漏</td>
              <td className="px-2 py-1">构建期直接报错</td>
            </tr>
          </tbody>
        </table>
        <p className="mt-3 text-gray-600">
          总结：<strong>把「约定」升级成「编译期约束」</strong> —— 这就是 server-only 的全部意义。
          配套记住：<code>NEXT_PUBLIC_</code> 前缀的变量才会进客户端，没前缀的只在服务端可读。
        </p>
      </details>
    </main>
  )
}
