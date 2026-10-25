'use client'

// 【next-script · 加载策略三选一】app/next-script/page.tsx
// 从 Vue 转 React（第三方脚本篇）：
//   Vue 里通常自己在 index.html 塞 <script>，或在 mounted 里动态 createElement('script')；
//   后者要自己管「加载时机 / 去重 / 加载完回调」，很容易重复插入或阻塞首屏。
//   Next 的 next/script 就是把这套脏活标准化：<strong>strategy 决定时机，onLoad 给回调，自动去重</strong>。
// 实战定位：统计（GA/神策）、地图 SDK、客服插件、支付 SDK。
// 学习模式：🔧 固定写法 = 按「是否阻塞首屏」选 strategy；👉 练习点 = 把 onLoad 换成 onReady，观察它每次挂载都触发。
import Script from 'next/script'
import { useState } from 'react'

export default function ScriptPage() {
  const [log, setLog] = useState<string[]>([])

  function push(msg: string) {
    setLog((prev) => [...prev, `${new Date().toLocaleTimeString('zh-CN')} — ${msg}`])
  }

  return (
    <main className="space-y-5">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">next/script 加载策略 · /next-script</h1>
        <p className="text-sm text-gray-500">
          三种 strategy 决定「脚本什么时候加载」，直接影响首屏性能。
        </p>
      </header>

      {/* ① afterInteractive（默认）：页面可交互后才加载 —— 最常用的选择 */}
      <section className="space-y-2 rounded border p-4">
        <h2 className="text-lg font-semibold">① afterInteractive（默认）</h2>
        <p className="text-sm text-gray-600">水合完成后加载，不阻塞首屏。统计类脚本用它。</p>
        <Script
          src="/next-script-demo.js"
          strategy="afterInteractive"
          onLoad={() => push('afterInteractive：脚本加载完成（onLoad）')}
        />
      </section>

      {/* ② lazyOnLoad：浏览器空闲时才加载 —— 优先级最低 */}
      <section className="space-y-2 rounded border p-4">
        <h2 className="text-lg font-semibold">② lazyOnLoad</h2>
        <p className="text-sm text-gray-600">等到浏览器空闲才加载，优先级最低。客服插件、低优先级埋点用它。</p>
        <Script
          src="/next-script-demo.js"
          strategy="lazyOnLoad"
          onLoad={() => push('lazyOnLoad：脚本加载完成（onLoad）')}
        />
      </section>

      {/* ③ beforeInteractive 已在本目录 layout.tsx 中演示（必须放 layout，不能放 page） */}
      <section className="space-y-2 rounded border p-4">
        <h2 className="text-lg font-semibold">③ beforeInteractive</h2>
        <p className="text-sm text-gray-600">
          已写在 <code>app/next-script/layout.tsx</code> ——
          <strong>只能放 layout</strong>，会在 Next 自身 JS 之前加载。
        </p>
      </section>

      <section className="space-y-2 rounded border p-4">
        <h2 className="text-lg font-semibold">加载日志（onLoad 回调）</h2>
        {log.length === 0 ? (
          <p className="text-sm text-gray-400">等待脚本加载…（打开控制台还能看到脚本自己打的日志）</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {log.map((l, i) => (
              <li key={i} className="font-mono text-xs">{l}</li>
            ))}
          </ul>
        )}
        <button
          className="rounded border px-3 py-1 text-sm"
          onClick={() => push(window.__NextScriptDemo?.hello() ?? '脚本还没挂上 window')}
        >
          调用脚本提供的方法
        </button>
      </section>

      <details className="rounded border p-4 text-sm">
        <summary className="cursor-pointer font-semibold">三种策略怎么选 + 总结</summary>
        <table className="mt-3 w-full border-collapse text-left">
          <thead>
            <tr className="border-b">
              <th className="px-2 py-1">strategy</th>
              <th className="px-2 py-1">加载时机</th>
              <th className="px-2 py-1">能用在哪</th>
              <th className="px-2 py-1">典型用途</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="px-2 py-1">beforeInteractive</td>
              <td className="px-2 py-1">Next JS 之前</td>
              <td className="px-2 py-1">仅 layout</td>
              <td className="px-2 py-1">埋点 SDK、polyfill</td>
            </tr>
            <tr className="border-b">
              <td className="px-2 py-1">afterInteractive</td>
              <td className="px-2 py-1">水合之后（默认）</td>
              <td className="px-2 py-1">page / layout</td>
              <td className="px-2 py-1">统计、常规插件</td>
            </tr>
            <tr>
              <td className="px-2 py-1">lazyOnLoad</td>
              <td className="px-2 py-1">浏览器空闲时</td>
              <td className="px-2 py-1">page / layout</td>
              <td className="px-2 py-1">客服、低优先级</td>
            </tr>
          </tbody>
        </table>
        <p className="mt-3 text-gray-600">
          另外：<code>onReady</code> 与 <code>onLoad</code> 的区别是 ——
          <code>onLoad</code> 只在「首次加载完成」触发一次，<code>onReady</code> 在<strong>每次组件挂载</strong>都会触发
          （客户端路由来回切换时会重复执行）。
        </p>
      </details>
    </main>
  )
}
