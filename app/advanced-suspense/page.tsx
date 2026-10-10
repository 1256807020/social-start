// ───────────────────────────────────────────────────────────
// 从 Vue 转 React（并发篇）· Suspense + 资源预取 + use()
// · Vue2 对照：无内置 Suspense；异步数据靠路由守卫 / axios 后赋值，加载态手写；
// · Vue3 对照：有内置 &lt;Suspense&gt; 组件 + async setup()/defineAsyncComponent，fallback 写法类似；
// · React 对照：&lt;Suspense fallback&gt; 包异步子组件，use() 读资源（pending 自动挂起），本例用 wrapPromise 模式。
// 📌 实战定位：异步加载边界【了解即可·进阶】；SSR 数据流 / 代码分割必懂，但日常多在框架层已封装。
// 🧭 学习模式：🔧固定写法=wrapPromise + &lt;Suspense fallback&gt; + use(resource.read())；👉=练习点（已填，跑通即懂）；文末 <details> 有 Vue2/Vue3/React 三向对照。
// ───────────────────────────────────────────────────────────
'use client'

import { Suspense, use } from 'react'

/**
 * Suspense 进阶：资源预取（wrapPromise）+ use()（搬运自 learning-demos 的 SuspenseListPreloadDemo）
 * 每个 👉 是给你手敲的练习点。
 *
 * 注：React 19 已移除实验性的 SuspenseList（不再是稳定 API）。
 *     这里演示更通用、仍能运行的「资源预取 + use() 读取」模式。
 */

// 👉 手敲：资源包装器，让组件可用 use(promise) 读取；pending 时抛 Promise 触发 Suspense
function wrapPromise<T>(p: Promise<T>) {
  let status: 'pending' | 'done' = 'pending'
  let result: T
  const suspender = p.then((r) => {
    status = 'done'
    result = r
  })
  return {
    read(): T {
      if (status === 'pending') throw suspender
      return result
    },
  }
}

function fetchUser(id: number) {
  const p = new Promise<{ name: string }>((res) =>
    setTimeout(() => res({ name: `用户${id}` }), id === 1 ? 600 : 1200),
  )
  return wrapPromise(p)
}

function User({ resource }: { resource: ReturnType<typeof fetchUser> }) {
  const user = use(resource.read()) // 👉 React 19 use() 读资源（pending 时自动挂起到外层 Suspense）
  return <p>{user.name}</p>
}

export default function SuspensePage() {
  const r1 = fetchUser(1)
  const r2 = fetchUser(2)
  return (
    <main style={{ maxWidth: 720, margin: '40px auto', fontFamily: 'system-ui' }}>
      <h1>Suspense 进阶：资源预取</h1>
      <p>
        注：React 19 已移除实验性的 <code>SuspenseList</code>；下面用更通用的
        wrapPromise + use() 模式分别挂起两个资源。
      </p>
      <Suspense fallback={<p>加载用户1…</p>}>
        <User resource={r1} />
      </Suspense>
      <Suspense fallback={<p>加载用户2…</p>}>
        <User resource={r2} />
      </Suspense>
      <details className="mt-6 rounded border p-3 text-sm">
        <summary className="cursor-pointer font-semibold">📚 Vue2 / Vue3 / React 三向对照 & 本项目小结</summary>
        <table className="mt-2 w-full border-collapse text-left">
          <thead>
            <tr className="border-b"><th className="px-2 py-1">维度</th><th className="px-2 py-1">Vue2</th><th className="px-2 py-1">Vue3</th><th className="px-2 py-1">React</th></tr>
          </thead>
          <tbody>
            <tr className="border-b"><td className="px-2 py-1">异步边界</td><td className="px-2 py-1">无内置</td><td className="px-2 py-1">&lt;Suspense&gt; 组件</td><td className="px-2 py-1">&lt;Suspense&gt; + use()（本例）</td></tr>
            <tr className="border-b"><td className="px-2 py-1">读取资源</td><td className="px-2 py-1">手写赋值</td><td className="px-2 py-1">async setup</td><td className="px-2 py-1">use(resource.read())</td></tr>
            <tr className="border-b"><td className="px-2 py-1">加载态</td><td className="px-2 py-1">手写 loading</td><td className="px-2 py-1">fallback slot</td><td className="px-2 py-1">fallback prop</td></tr>
            <tr className="border-b"><td className="px-2 py-1">注意</td><td className="px-2 py-1">—</td><td className="px-2 py-1">内置</td><td className="px-2 py-1">React19 移除 SuspenseList</td></tr>
          </tbody>
        </table>
        <p className="mt-2 text-gray-500">📝 小结：Suspense 做异步加载边界；Vue3 也有内置 &lt;Suspense&gt;，写法接近，React 多了 use() 读 Promise。</p>
      </details>

    </main>
  )
}
