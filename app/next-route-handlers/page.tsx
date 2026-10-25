// 【next-route-handlers · Route Handler 专题】app/next-route-handlers/page.tsx
// 从 Vue 转 React（服务端接口篇）：
//   Nuxt3 写在 server/api/*.ts，用 defineEventHandler(event)：
//     getQuery(event) / readBody(event) / setCookie(event) / getRequestHeader(event)。
//   Next 写在 app/**/route.ts，<strong>导出名即 HTTP 方法</strong>，
//     参数是标准 Request，返回标准 Response（NextResponse 是其增强）。
// 实战定位：需要「非页面」的 HTTP 端点时用它 —— 第三方回调、健康检查、导出下载、BFF 代理等。
// 学习模式：🔧 固定写法 = 只在 route.ts 里处理请求、不渲染 UI；用段配置控制缓存；
//          👉 练习点 = 加一个 HEAD 方法，观察 Next 自动实现的 OPTIONS 行为。
import Tester from './tester'

export default function RouteHandlersPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-5 p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">Route Handler 专题 · /next-route-handlers</h1>
        <p className="text-sm text-gray-500">
          app/**/route.ts：导出名就是 HTTP 方法，请求/响应基于 Web 标准。
        </p>
      </header>

      <Tester />

      <details className="rounded border p-4 text-sm">
        <summary className="cursor-pointer font-semibold">Next vs Nuxt 对照 + 关键规则</summary>
        <table className="mt-3 w-full border-collapse text-left">
          <thead>
            <tr className="border-b">
              <th className="px-2 py-1">需求</th>
              <th className="px-2 py-1">Nuxt3（server/api）</th>
              <th className="px-2 py-1">Next.js（route.ts）</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="px-2 py-1">定义一个接口</td>
              <td className="px-2 py-1">defineEventHandler</td>
              <td className="px-2 py-1">export async function GET/POST…</td>
            </tr>
            <tr className="border-b">
              <td className="px-2 py-1">读查询串</td>
              <td className="px-2 py-1">getQuery(event)</td>
              <td className="px-2 py-1">new URL(req.url).searchParams</td>
            </tr>
            <tr className="border-b">
              <td className="px-2 py-1">读 body</td>
              <td className="px-2 py-1">readBody(event)</td>
              <td className="px-2 py-1">await request.json()</td>
            </tr>
            <tr className="border-b">
              <td className="px-2 py-1">写 cookie</td>
              <td className="px-2 py-1">setCookie(event, …)</td>
              <td className="px-2 py-1">Set-Cookie 头 或 cookies().set()</td>
            </tr>
            <tr>
              <td className="px-2 py-1">缓存策略</td>
              <td className="px-2 py-1">routeRules</td>
              <td className="px-2 py-1">export const dynamic / revalidate</td>
            </tr>
          </tbody>
        </table>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-gray-700">
          <li>
            同一目录里 <code>route.ts</code> 与 <code>page.tsx</code> <strong>不能共存</strong>（会路由冲突）——
            要分开放在不同子目录。
          </li>
          <li>
            只有 <strong>GET</strong> 能被静态化/ISR；一旦用了 <code>request</code>、<code>cookies()</code>、
            <code>headers()</code> 就退化为动态。
          </li>
          <li>
            <code>NextResponse</code> 是 <code>Response</code> 的增强（多了 cookies/redirect 等），
            但直接 <code>return Response.json(...)</code> 也完全合法。
          </li>
        </ul>
      </details>
    </main>
  )
}
