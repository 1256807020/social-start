// ───────────────────────────────────────────────────────────
// 从 Vue 转 React（模式篇）· 高级组件模式
// · Vue2 对照：ErrorBoundary 无（靠 errorCaptured 钩子）；Portal 用 &lt;teleport&gt;（Vue3 才有）；ref 用 this.$refs；HOC/RenderProps 思路类似；
// · Vue3 对照：&lt;Teleport&gt; 原生支持；ref 用 ref()+defineExpose；ErrorBoundary 仍需第三方（无内置）；
// · React 对照：ErrorBoundary 必须 class；createPortal 原生；forwardRef+useImperativeHandle；HOC/RenderProps 函数式（本例）。
// 📌 实战定位：这些模式【了解即可·进阶】，日常写业务不常用，但读源码/封装库必遇。
// 🧭 学习模式：🔧固定写法=各模式骨架；👉=练习点（已填，跑通即懂）；文末 <details> 有 Vue2/Vue3/React 三向对照。
// ───────────────────────────────────────────────────────────
'use client'

import {
  Component,
  createPortal,
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import type { ReactNode, ComponentType } from 'react'

/**
 * 高级模式（搬运自 ReactAdm03）
 *  ErrorBoundary / Portal / forwardRef / HOC / RenderProps
 * 每个 👉 是给你手敲的练习点。
 */

/* ---------- 1. Error Boundary（必须是 class 组件） ---------- */
class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false }
  // 👉 手敲：static getDerivedStateFromError() 返回 { hasError: true }
  // 👉 手敲：componentDidCatch(error, info) 记录日志
  render() {
    if (this.state.hasError) return <h2>出错了，已降级显示</h2>
    return this.props.children
  }
}

/* ---------- 2. Portal：渲染到 body 外的弹窗 ---------- */
function Modal({ onClose }: { onClose: () => void }) {
  return createPortal(
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)' }}>
      <div style={{ background: '#fff', margin: 100, padding: 20 }}>
        <p>我是 Portal 弹窗（脱离父级 DOM 树）</p>
        <button onClick={onClose}>关闭</button>
      </div>
    </div>,
    document.body,
  )
}

/* ---------- 3. forwardRef + useImperativeHandle ---------- */
const FancyInput = forwardRef<{ focus: () => void }, { placeholder?: string }>(
  (props, ref) => {
    const inputRef = useRef<HTMLInputElement>(null)
    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
    }))
    return <input ref={inputRef} placeholder={props.placeholder} />
  },
)

/* ---------- 4. HOC：withLoading ---------- */
function withLoading<P extends object>(Wrapped: ComponentType<P>) {
  return (props: P & { loading?: boolean }) =>
    props.loading ? (
      <p>加载中…</p>
    ) : (
      <Wrapped {...(props as P)} />
    )
}

/* ---------- 5. Render Props：MouseTracker ---------- */
function MouseTracker({
  render,
}: {
  render: (pos: { x: number; y: number }) => ReactNode
}) {
  const [pos, setPos] = useState({ x: 0, y: 0 })
  return (
    <div
      style={{ height: 120, border: '1px solid #ccc' }}
      onMouseMove={(e) => setPos({ x: e.clientX, y: e.clientY })}
    >
      {render(pos)}
    </div>
  )
}

export default function PatternsPage() {
  const [showModal, setShowModal] = useState(false)
  const ref = useRef<{ focus: () => void }>(null)
  const Loadable = withLoading(({ label }: { label: string }) => <p>{label}</p>)

  return (
    <main style={{ maxWidth: 720, margin: '40px auto', fontFamily: 'system-ui' }}>
      <h1>高级模式</h1>
      <section>
        <h2>ErrorBoundary</h2>
        <ErrorBoundary>
          <p>安全内容（抛出错误会降级）</p>
        </ErrorBoundary>
      </section>
      <section>
        <h2>Portal</h2>
        <button onClick={() => setShowModal(true)}>开弹窗</button>
        {showModal && <Modal onClose={() => setShowModal(false)} />}
      </section>
      <section>
        <h2>forwardRef</h2>
        <FancyInput ref={ref} placeholder="点下面按钮聚焦我" />
        <button onClick={() => ref.current?.focus()}>聚焦</button>
      </section>
      <section>
        <h2>HOC</h2>
        <Loadable label="已加载内容" />
        <Loadable label="" loading />
      </section>
      <section>
        <h2>RenderProps</h2>
        <MouseTracker render={(p) => <p>鼠标：{p.x}, {p.y}</p>} />
      </section>
      <details className="mt-6 rounded border p-3 text-sm">
        <summary className="cursor-pointer font-semibold">📚 Vue2 / Vue3 / React 三向对照 & 本项目小结</summary>
        <table className="mt-2 w-full border-collapse text-left">
          <thead>
            <tr className="border-b">
              <th className="px-2 py-1">模式</th>
              <th className="px-2 py-1">Vue2 / Vue3</th>
              <th className="px-2 py-1">React</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b"><td className="px-2 py-1">错误边界</td><td className="px-2 py-1">errorCaptured / 第三方</td><td className="px-2 py-1">class ErrorBoundary（本例）</td></tr>
            <tr className="border-b"><td className="px-2 py-1">传送 DOM</td><td className="px-2 py-1">&lt;Teleport&gt;</td><td className="px-2 py-1">createPortal（本例）</td></tr>
            <tr className="border-b"><td className="px-2 py-1">跨层 ref</td><td className="px-2 py-1">this.$refs / defineExpose</td><td className="px-2 py-1">forwardRef+useImperativeHandle（本例）</td></tr>
            <tr className="border-b"><td className="px-2 py-1">复用</td><td className="px-2 py-1">mixins / composable / HOC</td><td className="px-2 py-1">HOC + RenderProps（本例）</td></tr>
          </tbody>
        </table>
        <p className="mt-2 text-gray-500">📝 小结：React 高级模式偏函数式，读源码/造轮子必会；业务里按需取用，不必强行堆砌。</p>
      </details>

    </main>
  )
}
