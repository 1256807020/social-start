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

/**
 * 进阶 Hooks 合集（搬运自 learning-demos）
 *  useTransition / useDeferredValue —— React 并发特性，保持 UI 响应
 *  useId —— 生成稳定唯一 id（表单 label 关联 / SSR 安全）
 *  useLayoutEffect —— 绘制前同步操作 DOM（测量/聚焦）
 *  useSyncExternalStore —— 订阅外部 store（window、第三方状态源）
 *
 * 学习模式（与 learn/react-query、learn/swr 对齐）：
 *   🔧 固定写法 = 该 hook 的标准用法（背下来即可）
 *   👉 = 练习点（已填好，可直接 npm run dev 看效果）
 *   各 hook 的「Vue2 / Vue3 / React」对比在页面【末尾】折叠区，不在代码中间。
 *
 * ───── 从 Vue 转 React（进阶 Hooks 篇）─────
 *   • ① useTransition / ② useDeferredValue 是 React 独有的「并发渲染」能力：把某些更新
 *     标记为低优先级、可中断，输入框等高优先级更新先走。Vue2 / Vue3 的响应式都是同步提交，
 *     【没有】并发可中断概念——同类问题在 Vue 里靠 watch + debounce、setTimeout 分块、Web Worker 解决。
 *   • ③ useId 解决「SSR 时服务端/客户端生成的 id 必须一致」（否则 hydration 告警）；
 *     Vue2 / Vue3 没有内建 id 原语，手写 :id / uuid，无 SSR 一致性保证。
 *   • ④ useLayoutEffect 是「浏览器绘制前同步执行 DOM 操作」，避免闪烁；Vue2 的 watch
 *     默认在「数据变→渲染前」触发（≈ pre），但 nextTick 其实是绘制后（microtask），
 *     真正的「绘制前同步」Vue 没有对应物。对应你文档第八节的 flush 时机。
 *   • ⑤ useSyncExternalStore 是「订阅外部可变源」的底层 API（subscribe + getSnapshot）；
 *     zustand / redux 都基于它。Vue 对应：事件总线 $on/$off、Vuex/Pinia 的 subscribe、watch。
 */

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
