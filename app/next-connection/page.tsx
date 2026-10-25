// 【next-connection · connection() + 流式渲染】app/next-connection/page.tsx
// 从 Vue 转 React（渲染策略篇）：
//   Nuxt 用 routeRules 在「路由粒度」声明渲染策略（ssr / isr / spa / swr），
//   或用 <NuxtLazyBoundary> / useAsyncData 的 lazy 做局部延迟。
//   Next 的 connection() 更细：它在「组件粒度」声明「这一段要等真实请求」，
//   配合 <Suspense> 就能做到「静态外壳先出、动态部分流式补」—— 这是 PPR 的心智模型。
// 实战定位：页面大部分是静态的（可预渲染、可 CDN 缓存），
//   只有「用户昵称 / 购物车数量 / 实时库存」这类要等请求 —— 别让它们把整页拖成动态。
// 学习模式：🔧 固定写法 = 静态内容直接渲染 + 动态子组件里 await connection() + 外层 Suspense；
//          👉 练习点 = 去掉 connection()，改用 headers()，对比整页是否被迫变成动态。
import { Suspense } from 'react'
import DynamicPart from './dynamic-part'

export default function ConnectionPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-5 p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">connection() · /next-connection</h1>
        <p className="text-sm text-gray-500">
          静态外壳立刻出现，动态部分 2 秒后流式补上 —— 靠 connection() 划清界限。
        </p>
      </header>

      {/* ① 静态部分：不碰任何请求期 API，可被预渲染 */}
      <section className="rounded border p-4">
        <h2 className="mb-2 text-lg font-semibold">① 静态外壳（立刻可见）</h2>
        <p className="text-sm text-gray-700">
          这一段不依赖请求，可以被预渲染、可被 CDN 缓存 —— 用户几乎立刻就能看到。
        </p>
      </section>

      {/* ② 动态部分：包在 Suspense 里，先显示骨架，再由 DynamicPart 内部的 connection() 触发请求期渲染 */}
      <section className="space-y-2">
        <h2 className="text-lg font-semibold">② 动态部分（流式补上）</h2>
        <Suspense
          fallback={
            <div className="space-y-2 rounded border p-3">
              <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-48 animate-pulse rounded bg-gray-200" />
              <p className="text-xs text-gray-400">动态内容加载中（骨架屏）…</p>
            </div>
          }
        >
          <DynamicPart />
        </Suspense>
      </section>

      <details className="rounded border p-4 text-sm">
        <summary className="cursor-pointer font-semibold">什么时候用 connection()？+ 总结</summary>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-gray-700">
          <li>
            页面<strong>整体静态</strong>、只有一小块要「实时」时用它 —— 避免整页被拖成动态（保住 CDN 缓存）。
          </li>
          <li>
            它本身<strong>不返回任何数据</strong>，语义就是一句声明：「从这里开始，等到真实请求再算」。
          </li>
          <li>
            用了它之后，后面就可以安全调用 <code>headers()</code> / <code>cookies()</code> /
            <code>new Date()</code> / 随机数等请求期 API，而<strong>不会</strong>把整页变成动态。
          </li>
          <li>
            对比：直接调用 <code>headers()</code> 而不用 connection()，会让<strong>整条路由</strong>退化为动态渲染。
          </li>
        </ul>
        <p className="mt-3 text-gray-600">
          一句话：<strong>connection() = 给「动态」划一个最小边界</strong>，
          让静态的归静态（可缓存），动态的归动态（流式补）。
        </p>
      </details>
    </main>
  )
}
