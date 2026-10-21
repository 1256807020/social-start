'use client'

// 【ref-forwarding · 演示页】 app/ref-forwarding/page.tsx
// 从 Vue 转 React（ref / 命令式句柄篇）：
//   Vue2 用 this.$refs.x 拿子组件实例 / DOM；Vue3 用 ref="x" + defineExpose 暴露方法。
//   React 的 ref 不是普通 prop——不能靠 <Child ref={...}> 直接透传，要用 forwardRef 显式转发。
// 实战定位：父组件想「命令式」操作子组件（聚焦输入框、清空、滚动），而不只是靠 props 传值。
// 学习模式：🔧 固定写法 = forwardRef 包组件 → 第二参拿到 ref → useImperativeHandle 暴露方法；
//          👉 练习点 = 给 FancyInput 再加一个 reset() 方法，并让父按钮调用它。
import { forwardRef, useImperativeHandle, useRef, useState } from 'react'

// 🔧 固定写法：先定义「暴露给父组件的命令式句柄」类型（useImperativeHandle 返回啥，这里就写啥）
export interface FancyInputHandle {
  focus: () => void
  clear: () => void
}

// 🔧 固定写法：forwardRef<暴露的句柄类型, 组件 props>((props, ref) => {...})
// 第二个参数 ref 就是父组件传下来的 ref——普通函数组件拿不到 ref，必须 forwardRef 包一层
const FancyInput = forwardRef<FancyInputHandle, { placeholder?: string }>(
  (props, ref) => {
    const innerRef = useRef<HTMLInputElement>(null)

    // 🔧 固定写法：useImperativeHandle(ref, () => ({...}), []) 决定「父通过 ref 能调哪些方法」
    // 这里只暴露 focus / clear，父拿不到 innerRef 本身——比直接转发整个 DOM 节点更可控。
    // 第三参 []：句柄只依赖稳定引用 innerRef，无需重建；若闭包用到 props/state 要列进 deps。
    useImperativeHandle(ref, () => ({
      focus: () => innerRef.current?.focus(),
      clear: () => {
        if (innerRef.current) innerRef.current.value = ''
      },
    }), [])

    return (
      <input
        ref={innerRef}
        placeholder={props.placeholder}
        className="flex-1 rounded border px-2 py-1"
      />
    )
  },
)
// 🔧 固定写法：forwardRef 组件要显式起名，否则 React DevTools 里显示 "Anonymous"
FancyInput.displayName = 'FancyInput'

// 父组件：用 useRef 持有子组件的句柄，按钮触发命令式操作
export default function RefForwardingPage() {
  const inputRef = useRef<FancyInputHandle>(null)
  const [log, setLog] = useState('')

  const onFocus = () => {
    inputRef.current?.focus() // 🔧 固定写法：通过 ref.current 调子组件暴露的方法
    setLog('已调用 focus()')
  }
  const onClear = () => {
    inputRef.current?.clear()
    setLog('已调用 clear()')
  }

  return (
    <main className="mx-auto max-w-3xl space-y-4 p-6">
      <h1 className="text-2xl font-bold">forwardRef + useImperativeHandle · /ref-forwarding</h1>
      <p className="text-sm text-gray-500">
        父组件持有子组件的「命令式句柄」，可主动聚焦 / 清空输入框——这是 ref 透传的典型场景。
      </p>

      <div className="flex gap-2">
        {/* 🔧 固定写法：ref={inputRef} 把父的 ref 传给 forwardRef 子组件 */}
        <FancyInput ref={inputRef} placeholder="点下面按钮试试" />
        <button className="rounded bg-blue-600 px-3 py-1 text-white" onClick={onFocus}>
          聚焦
        </button>
        <button className="rounded bg-gray-600 px-3 py-1 text-white" onClick={onClear}>
          清空
        </button>
      </div>

      <p className="text-sm text-gray-400">{log || '尚未操作'}</p>

      <details className="mt-6 rounded border p-3 text-sm">
        <summary className="cursor-pointer font-semibold">📚 React / Vue2 / Vue3 三向对照（ref / 命令式句柄）</summary>
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
            <tr className="border-b"><td className="px-2 py-1">把 ref 传进子组件</td><td className="px-2 py-1">forwardRef 包组件，ref 作第二参数（React19 起 ref 可作普通 prop，forwardRef 可省）</td><td className="px-2 py-1">子组件写 ref=&quot;x&quot;，父 this.$refs.x 拿组件实例</td><td className="px-2 py-1">子组件 ref=&quot;x&quot;，父 const x = ref() 拿组件实例</td></tr>
            <tr className="border-b"><td className="px-2 py-1">父访问子内部 DOM</td><td className="px-2 py-1">子内 &lt;input ref={innerRef}&gt;，父经转发的 ref / handle 间接访问</td><td className="px-2 py-1">this.$refs.x.$el（根 DOM）</td><td className="px-2 py-1">x.value.$el 或子内元素 ref</td></tr>
            <tr className="border-b"><td className="px-2 py-1">选择性暴露方法</td><td className="px-2 py-1">useImperativeHandle(ref, () =&gt; (&#123; focus, clear &#125;))</td><td className="px-2 py-1">无门禁：实例方法直接可调用 this.$refs.x.fn()</td><td className="px-2 py-1">defineExpose(&#123; focus, clear &#125;) ← 与 useImperativeHandle 对位</td></tr>
            <tr className="border-b"><td className="px-2 py-1">普通 DOM ref</td><td className="px-2 py-1">useRef + &lt;div ref={el}&gt;</td><td className="px-2 py-1">ref=&quot;x&quot; + this.$refs.x</td><td className="px-2 py-1">ref=&quot;x&quot; + const x = ref()</td></tr>
            <tr className="border-b"><td className="px-2 py-1">挂载前拿不到</td><td className="px-2 py-1">inputRef.current 为 null，用 ?. 防崩溃</td><td className="px-2 py-1">this.$refs.x 在模板渲染前为 undefined</td><td className="px-2 py-1">x.value 在挂载前为 null</td></tr>
          </tbody>
        </table>
        <p className="mt-2 text-gray-500">📝 小结：三框架都能「父命令式操作子」，门禁不同——React 用 useImperativeHandle 精确暴露方法（React19 起 forwardRef 可省，ref 当普通 prop）；Vue3 用 defineExpose 对位（&lt;script setup&gt; 默认不暴露，须显式 defineExpose）；Vue2 最开放，实例方法直接可调用。注意 ref 在挂载后才有效，访问前务必判空。</p>
      </details>
    </main>
  )
}
