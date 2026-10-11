'use client'

import {
  useState,
  useTransition,
  useDeferredValue,
  useId,
  useLayoutEffect,
  useRef,
  useSyncExternalStore,
  type CSSProperties,
} from 'react'

// ───────────────────────────────────────────────────────────
// 从 Vue 转 React（进阶 Hook 篇）· useTransition/useDeferredValue/useSyncExternalStore
// · Vue2 对照：无直接对应（nextTick / 手动优化）
// · Vue3 对照：有类似并发/过渡概念但 API 不同
// · React 对照：并发特性 Hook：过渡更新（useTransition）、降级值（useDeferredValue）、订阅外部存储（useSyncExternalStore）
// 📌 实战定位：进阶 Hook 属【了解即可·进阶】；性能与并发渲染优化用，日常 CRUD 少碰，看懂即可。
// 🧭 学习模式：🔧固定写法=useTransition()(返回 [isPending,startTransition]); useDeferredValue(value); useSyncExternalStore(subscribe,getSnapshot); 👉=练习点已填；文末对照。
// ───────────────────────────────────────────────────────────

/* ---------- 1. useTransition：把耗时更新标记为“可中断” ---------- */
function TransitionDemo() {
  const [isPending, startTransition] = useTransition()
  const [list, setList] = useState<string[]>([])
  const [text, setText] = useState('') // 紧急更新：始终立刻响应
  function handle() {
    // 🔧 固定写法：startTransition(fn) 把 fn 内的 setState 标记为「低优先级、可中断」
    startTransition(() => {
      // 👉 在 Transition 里做重更新（生成 10000 条），text 输入框仍不卡
      const big = Array.from({ length: 10000 }, (_, i) => `项 ${i}`)
      setList(big)
    })
  }
  return (
    <div>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="我不会被大列表卡住"
      />
      <button onClick={handle} disabled={isPending}>
        {isPending ? '更新中…' : '生成 10000 条'}
      </button>
      <p>输入内容：{text || '（空）'}</p>
      <p>数量：{list.length}</p>
    </div>
  )
}

/* ---------- 2. useDeferredValue：派生“低优先级”值 ---------- */
const ALL = Array.from({ length: 20000 }, (_, i) => `选项 ${i}`)
function DeferredDemo() {
  const [query, setQuery] = useState('')
  // 🔧 固定写法：useDeferredValue(value) 返回 value 的「低优先级副本」，自动追赶、不阻塞输入
  const deferred = useDeferredValue(query)
  const isStale = query !== deferred
  // 👉 用 deferred 做重过滤：deferred 落后时用户仍能继续打字
  const filtered = deferred
    ? ALL.filter((s) => s.includes(deferred)).slice(0, 20)
    : []
  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="搜索（不卡）"
      />
      <p>{isStale ? '（重过滤追赶中…）' : ''} 过滤词：{deferred}</p>
      <ul>
        {filtered.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>
    </div>
  )
}

/* ---------- 3. useId：稳定唯一 id ---------- */
function IdDemo() {
  // 🔧 固定写法：useId() 每次调用返回【不同且 SSR/CSR 一致】的 id；可多次调用拿多个
  const nameId = useId()
  const emailId = useId()
  return (
    <div>
      <div>
        <label htmlFor={nameId}>姓名</label>
        <input id={nameId} />
      </div>
      <div>
        <label htmlFor={emailId}>邮箱</label>
        <input id={emailId} />
      </div>
    </div>
  )
}

/* ---------- 4. useLayoutEffect：绘制前同步改 DOM ---------- */
function LayoutEffectDemo() {
  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(200)
  // 🔧 固定写法：useLayoutEffect 在浏览器「绘制前」同步执行；返回的清理函数在下次执行前跑
  useLayoutEffect(() => {
    // 👉 绘制前测量，再同步决定宽度——用户不会看到「先宽后窄」的闪烁
    const w = ref.current?.scrollWidth ?? 0
    if (w > width) setWidth(w + 20)
  }, [width])
  return (
    <div>
      <div
        ref={ref}
        style={{ width, background: '#eee', whiteSpace: 'nowrap', overflow: 'hidden' }}
      >
        测量我（内容很长很长很长很长很长很长很长很长很长很长）
      </div>
      <p>已测量并同步宽度：{width}px</p>
    </div>
  )
}

/* ---------- 5. useSyncExternalStore：订阅外部 store ---------- */
// 👉 外部状态变化自动重渲染；subscribe 返回取消订阅函数，getSnapshot 返回当前快照
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
  // 🔧 固定写法：在 Next.js 这类「先 SSR 再 hydrate」框架里，必须传第三个参数 getServerSnapshot，
  //    否则服务端不知道用哪个值 → 报 Missing getServerSnapshot。返回稳定默认值即可（客户端 hydrate 后自动切到真实值）
  function getServerSnapshot() {
    return true
  }
  // 🔧 固定写法：useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot) 拿外部可变源的「当前值」
  const online = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
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

      {/* ───── 末尾：Vue2 / Vue3 / React 对照小结（不在代码中间）───── */}
      <details style={detailsStyle}>
        <summary style={{ cursor: 'pointer', fontWeight: 600 }}>
          展开：5 个进阶 Hook 的 Vue2 / Vue3 / React 对照
        </summary>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12, fontSize: 14 }}>
          <thead>
            <tr style={{ textAlign: 'left' }}>
              <th style={th}>Hook</th>
              <th style={th}>Vue2</th>
              <th style={th}>Vue3</th>
              <th style={th}>React</th>
            </tr>
          </thead>
          <tbody>
            <tr style={tr}>
              <td style={td}>可中断的低优先级更新</td>
              <td style={td}>无（重计算阻塞主线程，需 setTimeout 分块 / Web Worker）</td>
              <td style={td}>无（响应式同步，无并发可中断概念）</td>
              <td style={td}>useTransition（startTransition 包住 setState）</td>
            </tr>
            <tr style={trA}>
              <td style={td}>派生值降级、输入不卡</td>
              <td style={td}>watch + debounce(fn, n)</td>
              <td style={td}>watch + debounce；无自动追赶原语</td>
              <td style={td}>useDeferredValue（自动追赶、不丢输入）</td>
            </tr>
            <tr style={tr}>
              <td style={td}>稳定唯一 id（SSR 安全）</td>
              <td style={td}>手写 :id / uuid（无 SSR 一致性保证）</td>
              <td style={td}>无内建；同样手写</td>
              <td style={td}>useId()</td>
            </tr>
            <tr style={trA}>
              <td style={td}>绘制前同步改 DOM（测量/聚焦）</td>
              <td style={td}>watch 默认≈pre 时机，但无「绘制前」概念；nextTick 实为绘制后</td>
              <td style={td}>无对应；近似用 watch 同步 + 手动操作</td>
              <td style={td}>useLayoutEffect（真·绘制前同步）</td>
            </tr>
            <tr style={tr}>
              <td style={td}>订阅外部 store</td>
              <td style={td}>事件总线 $on/$off、Vuex subscribe</td>
              <td style={td}>Pinia $subscribe、watch</td>
              <td style={td}>useSyncExternalStore（≈ zustand/redux 的底层订阅原语）</td>
            </tr>
          </tbody>
        </table>
        <p style={{ marginTop: 12, color: '#555', fontSize: 13 }}>
          一句话：① ② 是 React 并发特性（Vue 无对等物，靠防抖 / 分块 / Worker 解决同类问题）；
          ③ 是 SSR 友好的 id 原语；④ 对应「绘制前同步」（你文档第八节的 pre 时机）；
          ⑤ 是订阅外部 store 的底层 API，zustand / redux 都基于它。
        </p>
      </details>
      <details className="mt-6 rounded border p-3 text-sm">
        <summary className="cursor-pointer font-semibold">📚 Vue2 / Vue3 / React 三向对照 &amp; 本项目小结</summary>
        <table className="mt-2 w-full border-collapse text-left">
          <thead>
            <tr className="border-b">
              <th className="px-2 py-1">维度</th><th className="px-2 py-1">Vue2 (Options)</th><th className="px-2 py-1">Vue3 (Composition)</th><th className="px-2 py-1">React</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b"><td className="px-2 py-1">过渡更新</td><td className="px-2 py-1">—</td><td className="px-2 py-1">—</td><td className="px-2 py-1">useTransition（标记低优更新）</td></tr>
            <tr className="border-b"><td className="px-2 py-1">降级值</td><td className="px-2 py-1">—</td><td className="px-2 py-1">—</td><td className="px-2 py-1">useDeferredValue（保持响应）</td></tr>
            <tr className="border-b"><td className="px-2 py-1">外部存储</td><td className="px-2 py-1">—</td><td className="px-2 py-1">—</td><td className="px-2 py-1">useSyncExternalStore（订阅 store）</td></tr>
            <tr className="border-b"><td className="px-2 py-1">对标</td><td className="px-2 py-1">nextTick</td><td className="px-2 py-1">watch / effect</td><td className="px-2 py-1">并发 Hook</td></tr>
          </tbody>
        </table>
        <p className="mt-2 text-gray-500">📝 小结：这三个 Hook 服务于并发渲染与性能，日常写业务较少用；理解「过渡/降级/外部订阅」即可，不必死记。</p>
      </details>
    </main>
  )
}

const detailsStyle: CSSProperties = {
  marginTop: 32,
  padding: 12,
  border: '1px solid #ddd',
  borderRadius: 8,
}
const th: CSSProperties = { border: '1px solid #ddd', padding: '6px 8px', background: '#f5f5f5' }
const td: CSSProperties = {
  border: '1px solid #ddd',
  padding: '6px 8px',
  verticalAlign: 'top',
}
const tr: CSSProperties = {}
const trA: CSSProperties = { background: '#fafafa' }
