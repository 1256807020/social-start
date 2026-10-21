'use client'

// 【portal-modal · 演示页】 app/portal-modal/page.tsx
// 从 Vue 转 React（Portal / 弹窗篇）：
//   Vue3 用内置 <Teleport to="body">；Vue2 无内建，靠第三方 portal-vue 或手动 appendChild 到 body。
//   React 用 createPortal 把节点挂到父组件 DOM 树之外（通常 document.body），
//   从而脱离父级 overflow/transform/z-index 限制——这是弹窗、抽屉、toast 的标准解法。
// 实战定位：任何「要浮在最上层、又不想被祖先样式裁剪」的 UI，都用 Portal 渲染到 body 下。
// 学习模式：🔧 固定写法 = createPortal(节点, 容器) + 关闭前先 return null；👉 练习点 = 给 Modal 加一个"确认按钮"回调 onConfirm。
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

// 🔧 固定写法：createPortal 从 react-dom 导入（不是 react），签名 createPortal(节点, 真实 DOM 容器)
function Modal({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean
  title: string
  onClose: () => void
  children: React.ReactNode
}) {
  // 🔧 固定写法：Esc 关闭——useEffect 监听 keydown，仅在 open 时生效；依赖变化/卸载时清理
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  // ⚙️ 通用做法（非唯一）：打开时锁 body 滚动，关闭时还原——effect 内先判 open，再存旧值恢复
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  // 🔧 固定写法：关闭时直接 return null，连 Portal 都不渲染
  // （注意：hooks 已在上面「无条件」先调用，顺序稳定；return null 放最后才不破坏 hooks 规则）
  if (!open) return null

  return createPortal(
    // 🔧 固定写法：遮罩 onClick 关闭；内层 onClick 阻止冒泡，点弹窗内部不致误关
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="rounded bg-white p-4 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-2 text-lg font-bold">{title}</h2>
        <div className="text-sm">{children}</div>
        <button
          className="mt-3 rounded bg-blue-600 px-3 py-1 text-white"
          onClick={onClose}
        >
          关闭
        </button>
      </div>
    </div>,
    document.body, // 🔧 固定写法：第二参是「真实 DOM 节点」，弹窗挂到 body 下，脱离父级样式
  )
}

export default function PortalModalPage() {
  const [open, setOpen] = useState(false)
  return (
    <main className="mx-auto max-w-3xl space-y-4 p-6">
      <h1 className="text-2xl font-bold">createPortal 弹窗 · /portal-modal</h1>
      <p className="text-sm text-gray-500">
        弹窗用 createPortal 渲染到 body 下，不受父容器 overflow:hidden / transform 影响，永远浮在最上层。
      </p>
      <button
        className="rounded bg-blue-600 px-3 py-1 text-white"
        onClick={() => setOpen(true)}
      >
        打开弹窗
      </button>

      <Modal open={open} title="我是 Portal 弹窗" onClose={() => setOpen(false)}>
        <p>这段内容被渲染到了 {'<body>'} 下，而不是这个 main 里。</p>
        <p className="mt-1 text-gray-400">按 Esc 或点遮罩可关闭。</p>
      </Modal>

      <details className="mt-6 rounded border p-3 text-sm">
        <summary className="cursor-pointer font-semibold">📚 React / Vue2 / Vue3 三向对照（Portal / 弹窗）</summary>
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
            <tr className="border-b"><td className="px-2 py-1">渲染到父 DOM 之外</td><td className="px-2 py-1">createPortal(节点, document.body)</td><td className="px-2 py-1">无内建；第三方 portal-vue 或手动 appendChild 到 body</td><td className="px-2 py-1">&lt;Teleport to=&quot;body&quot;&gt; ← 与 createPortal 对位</td></tr>
            <tr className="border-b"><td className="px-2 py-1">挂载容器</td><td className="px-2 py-1">传真实 DOM 节点（如 document.body）</td><td className="px-2 py-1">手动指定父节点 / body</td><td className="px-2 py-1">to=&quot;body&quot; 或 CSS 选择器</td></tr>
            <tr className="border-b"><td className="px-2 py-1">关闭交互</td><td className="px-2 py-1">点遮罩 / Esc（useEffect 监听 keydown）</td><td className="px-2 py-1">同左，手动实现</td><td className="px-2 py-1">同左</td></tr>
            <tr className="border-b"><td className="px-2 py-1">脱离祖先样式</td><td className="px-2 py-1">挂到 body 下，避开 overflow/transform/z-index 裁剪</td><td className="px-2 py-1">同理（挂到 body 后不受父裁切）</td><td className="px-2 py-1">同理</td></tr>
          </tbody>
        </table>
        <p className="mt-2 text-gray-500">📝 小结：React createPortal ↔ Vue3 &lt;Teleport&gt; 直接对位（都「把内容送到指定 DOM 容器」）；Vue2 无内建，靠库或手写。三者都靠「挂到 body 下」避开祖先 overflow/transform 裁剪，这是弹窗/抽屉/toast 的通用套路。注意 createPortal 第二参必须是真实 DOM 节点，且关闭时应 return null 不挂空节点。</p>
      </details>
    </main>
  )
}
