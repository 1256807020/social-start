'use client'

// 【hydration-pitfalls · 演示页】 app/hydration-pitfalls/page.tsx
// 从 Vue 转 React（SSR 水合陷阱篇）：
//   Next.js App Router 里组件默认会被服务端渲染出 HTML（首屏），再在浏览器「水合」成可交互。
//   若「服务端 HTML」与「客户端首屏渲染」不一致，React 会报 hydration mismatch，可能丢弃 SSR HTML 重渲染。
//   最常见的三类坑：① 渲染期用 Date.now()/Math.random()/new Date()（两端算出来不同）；
//   ② 渲染期直接访问 window/document/localStorage（服务端没有，直接崩或值不同）；
//   ③ 用随机/自增当元素 id（两端不一致）。
// 实战定位：任何「依赖浏览器环境或随时间/随机变化」的值，都不能直接进 render，必须「挂载后才算」。
// 学习模式：🔧 固定写法 = mounted 模式（useState(false)+useEffect(set true) 后再渲染客户端值）；
//          浏览器 API 只在 useEffect 读；稳定 id 用 useId()；👉 练习点 = 把「视口宽度」换成「主题色/本地存储值」。
import React from 'react'

export default function HydrationPitfallsPage() {
  // 🔧 固定写法（防坑 1）：渲染期不要直接 new Date()/Math.random()，两端结果不同会 mismatch。
  //    改为「挂载后才渲染」的 mounted 模式：初始 false（与 SSR HTML 一致），useEffect 里翻 true。
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  // 🔧 固定写法（防坑 2）：window/document/localStorage 服务端不存在，
  //    绝不能在渲染期直接读；只能在 useEffect（已到客户端）里读。
  const [width, setWidth] = React.useState<number | null>(null)
  React.useEffect(() => {
    setWidth(window.innerWidth) // ✅ 这里才安全
    const onResize = () => setWidth(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // 🔧 固定写法（防坑 3）：需要「跨服务端/客户端一致」的稳定唯一 id，用 useId()，
  //    别用 Math.random()/自增计数器当 id（两端不一致 → mismatch）。
  const fieldId = React.useId()

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">SSR 水合陷阱 · /hydration-pitfalls</h1>
      <p className="text-sm text-gray-500">
        服务端 HTML 必须和客户端首屏一致，否则报 hydration mismatch。凡是「依赖浏览器或随机/时间」的值，都不能直接进 render。
      </p>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">一、时间 / 随机值：用 mounted 模式</h2>
        {/* 🔧 固定写法：mounted 前渲染稳定占位（与 SSR HTML 一致），mounted 后才显示客户端值 */}
        <p>
          当前时间：
          {mounted ? new Date().toLocaleTimeString() : '————（服务端占位，mount 后填充）'}
        </p>
        {/* ❌ 反例（不执行，仅示意）：直接在 render 里 new Date() → SSR 与客户端时间不同 → 水合警告
            const now = new Date().toLocaleTimeString() */}
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">二、浏览器 API：只在 useEffect 里读</h2>
        {/* 🔧 固定写法：width 初始为 null（与 SSR 一致），Effect 里读 window.innerWidth */}
        <p>视口宽度：{width === null ? '————（服务端占位）' : `${width}px`}</p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">三、稳定 id：用 useId()</h2>
        <label htmlFor={fieldId} className="block text-sm">输入框</label>
        <input id={fieldId} className="rounded border px-3 py-1" />
        <p className="text-xs text-gray-400">useId 生成的 id（两端一致）：{fieldId}</p>
      </section>

      <details className="mt-6 rounded border p-3 text-sm">
        <summary className="cursor-pointer font-semibold">📚 React / Vue2 / Vue3 三向对照（SSR 水合陷阱）</summary>
        <table className="mt-2 w-full border-collapse text-left">
          <thead>
            <tr className="border-b">
              <th className="px-2 py-1">维度</th>
              <th className="px-2 py-1">React（Next App Router）</th>
              <th className="px-2 py-1">Vue2（Nuxt2）</th>
              <th className="px-2 py-1">Vue3（Nuxt3）</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b"><td className="px-2 py-1">服务端无 window/document</td><td className="px-2 py-1">渲染期访问即崩/ mismatch；只在 useEffect 读</td><td className="px-2 py-1">用 process.browser / mounted 钩子里读</td><td className="px-2 py-1">用 import.meta.client / onMounted / process.client 里读</td></tr>
            <tr className="border-b"><td className="px-2 py-1">时间/随机值不一致</td><td className="px-2 py-1">mounted 模式（useState false + useEffect set true）后才渲染</td><td className="px-2 py-1">beforeMount 不渲染、mounted 后填</td><td className="px-2 py-1">同思路；或 &lt;ClientOnly&gt; 包裹</td></tr>
            <tr className="border-b"><td className="px-2 py-1">仅客户端渲染的内容</td><td className="px-2 py-1">'use client' + mounted 模式，或 next/dynamic { ssr: false }</td><td className="px-2 py-1">&lt;client-only&gt; 包裹（Nuxt 提供）</td><td className="px-2 py-1">&lt;ClientOnly&gt; 包裹，SSR 不渲染其内部</td></tr>
            <tr className="border-b"><td className="px-2 py-1">稳定唯一 id（跨端一致）</td><td className="px-2 py-1">useId()（确定性生成）</td><td className="px-2 py-1">无内建，谨慎用随机</td><td className="px-2 py-1">无内建对应（useId 不存在）</td></tr>
            <tr className="border-b"><td className="px-2 py-1">水合不一致兜底</td><td className="px-2 py-1">suppressHydrationWarning（单节点静音，非修复）</td><td className="px-2 py-1">Vue 也有 hydration 警告</td><td className="px-2 py-1">Vue3 hydration mismatch 警告；&lt;ClientOnly&gt; 规避</td></tr>
          </tbody>
        </table>
        <p className="mt-2 text-gray-500">📝 小结：两类框架 SSR 都会遇到「服务端 HTML ≠ 客户端首屏」→ 水合警告/重渲染。共性解法：服务端渲染稳定占位、客户端挂载后再填真实值（React mounted 模式 ↔ Vue onMounted/&lt;ClientOnly&gt;）。差异：React 用 useEffect（确定性、服务端无 window）+ useId 保证 id 一致；Vue/Nuxt 用 process.client/import.meta.client + &lt;ClientOnly&gt;。铁律：渲染期绝不碰 window / Date.now / Math.random，否则必 mismatch。</p>
      </details>
    </main>
  )
}
