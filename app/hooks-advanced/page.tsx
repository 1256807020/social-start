'use client'

import {
  useState,
  useTransition,
  useDeferredValue,
  useId,
  useLayoutEffect,
  useRef,
  useSyncExternalStore,
} from 'react'

/**
 * 进阶 Hooks 合集（搬运自 learning-demos）
 *  useTransition / useDeferredValue —— React 并发特性，保持 UI 响应
 *  useId —— 生成稳定唯一 id（表单 label 关联 / SSR 安全）
 *  useLayoutEffect —— 绘制前同步操作 DOM（测量/聚焦）
 *  useSyncExternalStore —— 订阅外部 store（window、第三方状态源）
 * 每个 👉 是给你手敲的练习点。
 */

/* ---------- 1. useTransition：把耗时更新标记为“可中断” ---------- */
function TransitionDemo() {
  const [isPending, startTransition] = useTransition()
  const [list, setList] = useState<string[]>([])
  function handle() {
    startTransition(() => {
      // 👉 在 Transition 里做重更新（如生成 10000 条 setList(...)），输入框仍不卡
      const big = Array.from({ length: 5000 }, (_, i) => `项 ${i}`)
      setList(big)
    })
  }
  return (
    <div>
      <button onClick={handle} disabled={isPending}>
        {isPending ? '更新中…' : '生成大列表'}
      </button>
      <p>数量：{list.length}</p>
    </div>
  )
}

/* ---------- 2. useDeferredValue：派生“低优先级”值 ---------- */
function DeferredDemo() {
  const [query, setQuery] = useState('')
  const deferred = useDeferredValue(query) // 👉 输入时 query 立即变，deferred 稍后追赶，不阻塞输入
  const isStale = query !== deferred
  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="搜索（不卡）"
      />
      <p>{isStale ? '（更新中…）' : ''} 过滤词：{deferred}</p>
    </div>
  )
}

/* ---------- 3. useId：稳定唯一 id ---------- */
function IdDemo() {
  const id = useId() // 👉 SSR/CSR 一致，适合 <label htmlFor={id}>
  return (
    <div>
      <label htmlFor={id}>姓名</label>
      <input id={id} />
    </div>
  )
}

/* ---------- 4. useLayoutEffect：绘制前同步改 DOM ---------- */
function LayoutEffectDemo() {
  const ref = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    // 👉 在浏览器绘制前读取尺寸/位置并同步调整（避免闪烁）
    const w = ref.current?.offsetWidth
    console.log('宽度', w)
  }, [])
  return (
    <div ref={ref} style={{ width: 200, background: '#eee' }}>
      测量我
    </div>
  )
}

/* ---------- 5. useSyncExternalStore：订阅外部 store ---------- */
function SyncExternalStoreDemo() {
  function subscribe(cb: () => void) {
    window.addEventListener('online', cb)
    window.addEventListener('offline', cb)
    return () => {
      window.removeEventListener('online', cb)
      window.removeEventListener('offline', cb)
    }
  }
  function getSnapshot() {
    return navigator.onLine
  }
  const online = useSyncExternalStore(subscribe, getSnapshot) // 👉 外部状态变化自动重渲染
  return <p>网络：{online ? '在线' : '离线'}</p>
}

export default function HooksAdvancedPage() {
  return (
    <main style={{ maxWidth: 720, margin: '40px auto', fontFamily: 'system-ui' }}>
      <h1>进阶 Hooks</h1>
      <section>
        <h2>① useTransition</h2>
        <TransitionDemo />
      </section>
      <section>
        <h2>② useDeferredValue</h2>
        <DeferredDemo />
      </section>
      <section>
        <h2>③ useId</h2>
        <IdDemo />
      </section>
      <section>
        <h2>④ useLayoutEffect</h2>
        <LayoutEffectDemo />
      </section>
      <section>
        <h2>⑤ useSyncExternalStore</h2>
        <SyncExternalStoreDemo />
      </section>
    </main>
  )
}
