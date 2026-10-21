// ───────────────────────────────────────────────────────────
// 从 Vue 转 React（性能篇）· 三板斧
// · Vue2/Vue3 对照：代码分割用 defineAsyncComponent(() => import())；虚拟列表用 vue-virtual-scroller；
//   防抖用 lodash.debounce 或自定义 composable（ref + watch + setTimeout）；
// · React 对照：React.lazy + Suspense、自写虚拟列表（只渲可视区）、useDebounce 自定义 Hook（本例）。
// 📌 实战定位：性能优化【常规业务常用】；列表万级必上虚拟列表，搜索框必防抖，重组件必懒加载。
// 🧭 学习模式：🔧固定写法=lazy+Suspense / 虚拟列表算 start-end / useDebounce；👉=练习点（已填，跑通即懂）；文末 <details> 有 Vue2/Vue3/React 三向对照。
// ───────────────────────────────────────────────────────────
'use client'

import { lazy, Suspense, useEffect, useState } from 'react'

/**
 * 性能优化三板斧（搬运自 ReactAdm03）
 *  1. 代码分割：React.lazy + Suspense（组件级按需加载）
 *  2. 虚拟列表：只渲染可视区域（1000+ 条必须）
 *  3. 防抖/节流：useDebounce 自定义 Hook
 * 每个 👉 是给你手敲的练习点。
 */

/* ---------- 1. 代码分割 ---------- */
const Heavy = lazy(() => import('./Heavy')) // 👉 抽成单独文件 lazy 加载

function CodeSplit() {
  const [show, setShow] = useState(false)
  return (
    <div>
      <button onClick={() => setShow(true)}>加载重组件</button>
      {show && (
        <Suspense fallback={<p>加载中…</p>}>
          <Heavy />
        </Suspense>
      )}
    </div>
  )
}

/* ---------- 2. 虚拟列表 ---------- */
function VirtualList({ total = 10000 }: { total?: number }) {
  const [scrollTop, setScrollTop] = useState(0)
  const itemH = 30
  const viewH = 300
  const start = Math.floor(scrollTop / itemH) // 👉 起始索引（只渲染可视区）
  const end = start + Math.ceil(viewH / itemH) // 👉 结束索引
  const visible = Array.from({ length: total }, (_, i) => i).slice(start, end + 1)
  return (
    <div
      style={{ height: viewH, overflow: 'auto', border: '1px solid #ccc' }}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
    >
      <div style={{ height: total * itemH, position: 'relative' }}>
        {visible.map((i) => (
          <div key={i} style={{ height: itemH, lineHeight: `${itemH}px` }}>
            行 {i}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---------- 3. 防抖/节流 ---------- */
// 👉 手敲 useDebounce：用 useEffect + setTimeout 返回防抖后的值
function useDebounce<T>(value: T, delay = 300): T {
  // debounced 才是「稳定后」的值，页面用它做实际动作（搜索请求等）
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    // 每次 value 变化都重置计时器：连续输入时旧 timer 被清掉，只有「停下 delay ms」才真正 setDebounced
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t) // 关键：输入未停就清掉上一次的延时，达到「防抖」
  }, [value, delay])
  return debounced
}

function Search() {
  const [q, setQ] = useState('')
  const debounced = useDebounce(q, 500)
  return (
    <div>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="搜索（防抖 500ms）"
      />
      <p>防抖值：{debounced}</p>
    </div>
  )
}

export default function PerfPage() {
  return (
    <main style={{ maxWidth: 720, margin: '40px auto', fontFamily: 'system-ui' }}>
      <h1>性能优化</h1>
      <section>
        <h2>① 代码分割（React.lazy + Suspense）</h2>
        <CodeSplit />
      </section>
      <section>
        <h2>② 虚拟列表（{10000} 行）</h2>
        <VirtualList />
      </section>
      <section>
        <h2>③ 防抖（useDebounce）</h2>
        <Search />
      </section>
      <details className="mt-6 rounded border p-3 text-sm">
        <summary className="cursor-pointer font-semibold">📚 Vue2 / Vue3 / React 三向对照 & 本项目小结</summary>
        <table className="mt-2 w-full border-collapse text-left">
          <thead>
            <tr className="border-b"><th className="px-2 py-1">维度</th><th className="px-2 py-1">Vue2 / Vue3</th><th className="px-2 py-1">React</th></tr>
          </thead>
          <tbody>
            <tr className="border-b"><td className="px-2 py-1">代码分割</td><td className="px-2 py-1">defineAsyncComponent</td><td className="px-2 py-1">React.lazy + Suspense（本例）</td></tr>
            <tr className="border-b"><td className="px-2 py-1">虚拟列表</td><td className="px-2 py-1">vue-virtual-scroller</td><td className="px-2 py-1">自写可视区（start/end）</td></tr>
            <tr className="border-b"><td className="px-2 py-1">防抖</td><td className="px-2 py-1">lodash.debounce / composable</td><td className="px-2 py-1">useDebounce Hook</td></tr>
            <tr className="border-b"><td className="px-2 py-1">触发场景</td><td className="px-2 py-1">万级列表 / 搜索框</td><td className="px-2 py-1">同左</td></tr>
          </tbody>
        </table>
        <p className="mt-2 text-gray-500">📝 小结：三板斧 React/Vue 一一对应；万级列表必虚拟、搜索必防抖、重组件必懒加载。</p>
      </details>

    </main>
  )
}
