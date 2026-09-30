'use client'

import { lazy, Suspense, useState } from 'react'

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
  // 👉 const [v, setV] = useState(value); useEffect(() => { const t = setTimeout(() => setV(value), delay); return () => clearTimeout(t) }, [value, delay]); return v
  return value
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
    </main>
  )
}
