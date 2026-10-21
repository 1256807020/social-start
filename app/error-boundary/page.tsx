'use client'

// 【error-boundary · 演示页】 app/error-boundary/page.tsx
// 从 Vue 转 React（错误边界篇）：
//   Vue2 用组件内 errorCaptured 钩子；Vue3 用 errorCaptured（选项式）或 onErrorCaptured（组合式），
//   都能在「函数组件」里直接捕获子孙组件错误。
//   React 的错误边界（Error Boundary）**至今只能用 class 组件实现**——没有能捕获渲染错误的 hook 等价物，
//   这是 React 一个很反直觉的固定限制（社区 useErrorBoundary 底层仍是 class 边界）。
//   它捕获「子树渲染阶段」抛出的错误并展示降级 UI，避免整页白屏。
// 实战定位：用 ErrorBoundary 包住「可能崩的区块」（如第三方组件、动态数据渲染），崩了只坏这一块，不拖垮全站。
// 学习模式：🔧 固定写法 = class 组件 + getDerivedStateFromError / componentDidCatch + 渲染时判 hasError；
//          👉 练习点 = 下面「重试」按钮通过换 key 重新挂载边界，把 hasError 复位（错误恢复的标准套路）。
import React from 'react'

// 🔧 固定写法：错误边界必须是 class 组件，extends React.Component。
//    React 至今没有能捕获「渲染错误」的 hook；别想在 function 组件里用 hook 实现等价物——这是真·固定限制。
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean }
> {
  // 🔧 固定写法：初始 state 必须有 hasError:false，作为「是否进入降级」的开关
  state = { hasError: false }

  // 🔧 固定写法：static getDerivedStateFromError(error) —— 渲染阶段抛错时调用，
  //    返回要写入 state 的对象（这里返回 { hasError: true }），用来「决定渲染降级 UI」。
  //    它是「纯」的：只能算 state，不能做副作用（打日志不在这做）。
  static getDerivedStateFromError(_error: unknown) {
    return { hasError: true }
  }

  // 🔧 固定写法：componentDidCatch(error, info) —— 同样在抛错后调用，
  //    用来做副作用：上报监控（Sentry 等）、打日志。info.componentStack 能看到出错组件栈。
  //    （副作用放这里，不放 getDerivedStateFromError）
  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    // 实战里这里换成：reportError(error, info.componentStack)
    console.error('[ErrorBoundary] 捕获到渲染错误：', error, info.componentStack)
  }

  render() {
    // 🔧 固定写法：渲染时先判 this.state.hasError，为 true 就 return 降级 UI，否则正常渲染 children。
    //    这是「展示/不展示降级」的唯一开关，顺序固定（先判错再渲染）。
    if (this.state.hasError) {
      return this.props.fallback ?? <p className="text-red-600">⚠️ 这块内容出错了。</p>
    }
    return this.props.children
  }
}

// —— 下面是两个会被「故意弄崩」的演示子组件 ——

// 一个渲染时直接抛错的组件：用来演示「渲染阶段错误被边界接住」
function BoomOnRender() {
  // 🔧 固定写法对照点：这个错误发生在 render 阶段，ErrorBoundary 能接住。
  //    （如果是「事件处理函数里」抛错，边界接不住，要用普通 try/catch——见下方按钮示例）
  throw new Error('我在渲染阶段炸了（BoomOnRender）')
}

// 一个点了按钮才在「事件处理函数」里抛错的组件：演示「事件错误边界接不住」
function BoomOnClick() {
  return (
    <button
      className="rounded bg-red-600 px-3 py-1 text-white"
      onClick={() => {
        // ⚙️ 通用做法（非边界能力）：事件处理函数里的错误 React 不捕获，
        //    必须自己 try/catch 兜住，否则会冒泡成未捕获错误、可能白屏。
        throw new Error('我在点击事件里炸了（BoomOnClick）—— 边界接不住，需 try/catch')
      }}
    >
      点我（事件里抛错，边界接不住）
    </button>
  )
}

export default function ErrorBoundaryPage() {
  // 🔧 固定写法（页面层）：用 state 控制「是否挂载会崩的子树」+「重新挂载的 key」，
  //    换 key 强制重新挂载，等价于「让错误边界复位」——这是错误恢复的标准套路（见「重试」按钮）。
  const [show, setShow] = React.useState(true)
  const [resetKey, setResetKey] = React.useState(0)

  return (
    <main className="mx-auto max-w-3xl space-y-4 p-6">
      <h1 className="text-2xl font-bold">Error Boundary 错误边界 · /error-boundary</h1>
      <p className="text-sm text-gray-500">
        错误边界用 class 组件实现，捕获「子树渲染阶段」的错误并展示降级 UI，避免整页白屏。
      </p>

      <div className="flex gap-2">
        <button
          className="rounded bg-blue-600 px-3 py-1 text-white"
          onClick={() => setShow((s) => !s)}
        >
          {show ? '卸载会崩的子树' : '重新挂载会崩的子树'}
        </button>
        {/* 👉 练习点：换 key 重新挂载边界，把 hasError 复位 */}
        <button
          className="rounded bg-green-600 px-3 py-1 text-white"
          onClick={() => setResetKey((k) => k + 1)}
        >
          重试（复位边界）
        </button>
      </div>

      {/* 🔧 固定写法：用 ErrorBoundary 包住「想保护的子树」，崩了只坏这一块。
          key={resetKey}：换 key 即重新挂载 → 已 hasError 的边界重新开始工作（错误恢复）。
          可多层嵌套，内层边界优先接住，外层兜底。 */}
      <ErrorBoundary
        key={resetKey}
        fallback={<p className="text-red-600">⚠️ 渲染阶段出错，已被边界接住（只坏这一块）。</p>}
      >
        {show && <BoomOnRender />}
      </ErrorBoundary>

      <div className="mt-4">
        {/* ⚙️ 这个按钮在「事件」里抛错，上面的 ErrorBoundary 接不住——演示边界的覆盖范围限制 */}
        <BoomOnClick />
      </div>

      <details className="mt-6 rounded border p-3 text-sm">
        <summary className="cursor-pointer font-semibold">📚 React / Vue2 / Vue3 三向对照（Error Boundary / 错误边界）</summary>
        <table className="mt-2 w-full border-collapse text-left">
          <thead>
            <tr className="border-b">
              <th className="px-2 py-1">维度</th>
              <th className="px-2 py-1">React</th>
              <th className="px-2 py-1">Vue2</th>
              <th className="px-2 py-1">Vue3</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b"><td className="px-2 py-1">捕获子孙组件错误</td><td className="px-2 py-1">class 组件 ErrorBoundary（getDerivedStateFromError + componentDidCatch）</td><td className="px-2 py-1">errorCaptured 钩子（可写在函数/选项式组件）</td><td className="px-2 py-1">errorCaptured（选项式）/ onErrorCaptured（组合式 setup）</td></tr>
            <tr className="border-b"><td className="px-2 py-1">能否用函数组件实现</td><td className="px-2 py-1">❌ 不能，只能是 class 组件（固定限制）</td><td className="px-2 py-1">✅ 能</td><td className="px-2 py-1">✅ 能</td></tr>
            <tr className="border-b"><td className="px-2 py-1">降级 UI 渲染</td><td className="px-2 py-1">判 hasError 后 return 降级节点</td><td className="px-2 py-1">返回 false 阻止继续向上冒泡 + 自行渲染降级</td><td className="px-2 py-1">同理，可继续向父级抛</td></tr>
            <tr className="border-b"><td className="px-2 py-1">事件/异步错误</td><td className="px-2 py-1">❌ 接不住，须自行 try/catch</td><td className="px-2 py-1">❌ 同样接不住（仅捕获渲染期）</td><td className="px-2 py-1">❌ 同样接不住</td></tr>
            <tr className="border-b"><td className="px-2 py-1">错误上报</td><td className="px-2 py-1">componentDidCatch 里打日志/Sentry</td><td className="px-2 py-1">errorCaptured 内调用上报</td><td className="px-2 py-1">onErrorCaptured 内调用上报</td></tr>
          </tbody>
        </table>
        <p className="mt-2 text-gray-500">📝 小结：三者都能「包住子树、捕获子孙渲染错误、展示降级 UI」，但实现形态差异大——React 强制用 class 组件（无 hook 等价物），Vue2/Vue3 都能直接用钩子（含组合式）实现，对函数组件更友好。三者共同的边界限制：都**只捕获渲染阶段**的错误，事件处理 / setTimeout / Promise 等异步里的错误都接不住，得用普通 try/catch。复位方式：React 靠给边界换 key 重新挂载；Vue 靠改变响应式状态重新渲染。</p>
      </details>
    </main>
  )
}
