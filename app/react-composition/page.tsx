'use client'

import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react'

/**
 * 组合 / 插槽模式（搬运自 learning-demos 的 ReactChildrenDemo）
 *  React.Children / React.cloneElement / 复合组件（Compound Components）
 *
 * 学习模式（与 learn/react-query、learn/swr 对齐）：
 *   🔧 固定写法 = 该 API 的标准用法（背下来即可）
 *   👉 = 练习点（已填好，可直接 npm run dev 看效果）
 *   各能力的「Vue2 / Vue3 / React」对比在页面【末尾】折叠区，不在代码中间。
 *
 * 实战定位（先看这句，省得白费劲）：
 *   ⚠️ 本章属「组件封装专项」，常规业务开发【不怎么用】——
 *      你几乎只当「消费者」用（antd 的 <Select.Option> / <Tabs.TabPane> / <Form.Item> 都是复合组件模式），
 *      极少自己手写 cloneElement / React.Children。看得懂、认得出即可，【了解即可，不要求练熟】。
 *
 * ───── 从 Vue 转 React（组合 / 插槽篇）─────
 *   • Vue 用 <slot> 做内容分发；React 没有 slot，用 `children`（内容透传）+ `React.Children` 遍历 +
 *     `cloneElement` 注入 props 实现等价能力。
 *   • Vue3 的 <slot name="header"> 具名插槽，对应 React 的「复合组件」(Card.Header / Card.Body)——
 *     用 createContext 共享父组件的隐式状态（如折叠、主题）。
 *   • Vue 的 provide / inject 默认【非】响应式（要 ref / reactive 才响应式）；React 的 useContext
 *     天然响应式——context 值一变，所有消费组件自动重渲染。
 *   • 三者（slots / cloneElement 注入 / 复合组件）都是「结构 / 布局复用」，和数据流无关，
 *     与 props 透传、render props 是互补的复用手段。
 */

/* ---------- 1. React.Children：计数 / 遍历 / 映射 ---------- */
function List({ children }: { children: ReactNode }) {
  // 🔧 固定写法：Children.count 统计直接子节点数量（比 children.length 可靠，能正确处理字符串/数组）
  const count = Children.count(children)
  return (
    <div>
      <p>共 {count} 个孩子</p>
      <ul>
        {/* 🔧 固定写法：Children.map 遍历并映射子节点；必须用 isValidElement 过滤文本/非法节点 */}
        {Children.map(children, (child, i) =>
          isValidElement(child) ? <li key={i}>{child}</li> : null,
        )}
      </ul>
    </div>
  )
}

/* ---------- 2. cloneElement：给子组件注入 props ---------- */
// 👉 练习点：用 cloneElement 给每个 child 注入额外 prop（这里注入 injected，让子组件知道自己被包了一层）
type BoxProps = { injected?: boolean }
function Slot({ children }: { children: ReactNode }) {
  return (
    <>
      {Children.map(children, (child) =>
        isValidElement(child)
          ? cloneElement(child as ReactElement<BoxProps>, { injected: true }) // 🔧 固定写法：cloneElement(element, extraProps)
          : child,
      )}
    </>
  )
}
function Box({ injected }: BoxProps) {
  return <div>Box {injected ? '（被注入）' : ''}</div>
}

/* ---------- 3. 复合组件（上下文共享）：可折叠 Card ---------- */
// 👉 练习点：用 createContext 让 Card.Header / Card.Body / Card.Footer 共享卡片状态（这里共享「是否展开」）
type CardContextValue = { expanded: boolean; toggle: () => void }
const CardContext = createContext<CardContextValue | null>(null)

function useCardContext(): CardContextValue {
  const ctx = useContext(CardContext)
  if (!ctx) throw new Error('Card.* 子组件必须写在 <Card> 内部')
  return ctx
}

function Card({ children }: { children: ReactNode }) {
  const [expanded, setExpanded] = useState(false)
  const value: CardContextValue = { expanded, toggle: () => setExpanded((v) => !v) }
  return (
    <CardContext.Provider value={value}>
      <div style={{ border: '1px solid #ccc', padding: 12, borderRadius: 6 }}>
        {children}
      </div>
    </CardContext.Provider>
  )
}

function CardHeader({ title }: { title: string }) {
  const { expanded, toggle } = useCardContext()
  return (
    <div
      style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer' }}
      onClick={toggle}
    >
      <strong>{title}</strong>
      <span>{expanded ? '▼' : '▶'}</span>
    </div>
  )
}

function CardBody({ children }: { children: ReactNode }) {
  const { expanded } = useCardContext()
  if (!expanded) return null
  return <div style={{ marginTop: 8 }}>{children}</div>
}

function CardFooter({ children }: { children: ReactNode }) {
  const { expanded } = useCardContext()
  if (!expanded) return null
  return (
    <div style={{ marginTop: 8, fontSize: 12, color: '#888' }}>{children}</div>
  )
}

// 🔧 固定写法：把子组件挂到父组件上，形成「复合组件」(declaration merging：function + namespace 同名)
namespace Card {
  export let Header: typeof CardHeader
  export let Body: typeof CardBody
  export let Footer: typeof CardFooter
}
Card.Header = CardHeader
Card.Body = CardBody
Card.Footer = CardFooter

export default function CompositionPage() {
  return (
    <main style={{ maxWidth: 720, margin: '40px auto', fontFamily: 'system-ui' }}>
      <h1>组合 / 插槽模式</h1>

      <section>
        <h2>① React.Children（计数 + 遍历）</h2>
        <List>
          <span>a</span>
          <span>b</span>
          <span>c</span>
        </List>
      </section>

      <section>
        <h2>② cloneElement 注入 props</h2>
        <Slot>
          <Box />
        </Slot>
      </section>

      <section>
        <h2>③ 复合组件（Card.Header / Body / Footer 共享折叠状态）</h2>
        <Card>
          <Card.Header title="可折叠卡片（点标题试试）" />
          <Card.Body>
            <p>卡片正文：Header 通过 context 拿到 toggle，Body/Footer 通过 context 拿到 expanded。</p>
          </Card.Body>
          <Card.Footer>脚注：三者共享同一个 expanded 状态，无需逐层透传 props。</Card.Footer>
        </Card>
      </section>

      <details style={{ marginTop: 32, borderTop: '1px solid #eee', paddingTop: 12 }}>
        <summary style={{ cursor: 'pointer', fontWeight: 600 }}>
          末尾对照表：Vue2 / Vue3 / React（组合 / 插槽）
        </summary>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12, fontSize: 14 }}>
          <thead>
            <tr style={{ textAlign: 'left' }}>
              <th style={{ borderBottom: '1px solid #ccc', padding: 6 }}>能力</th>
              <th style={{ borderBottom: '1px solid #ccc', padding: 6 }}>Vue2</th>
              <th style={{ borderBottom: '1px solid #ccc', padding: 6 }}>Vue3</th>
              <th style={{ borderBottom: '1px solid #ccc', padding: 6 }}>React</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: 6, borderBottom: '1px solid #eee' }}>默认内容分发</td>
              <td style={{ padding: 6, borderBottom: '1px solid #eee' }}>&lt;slot&gt;</td>
              <td style={{ padding: 6, borderBottom: '1px solid #eee' }}>&lt;slot&gt;</td>
              <td style={{ padding: 6, borderBottom: '1px solid #eee' }}>children 透传</td>
            </tr>
            <tr>
              <td style={{ padding: 6, borderBottom: '1px solid #eee' }}>具名插槽</td>
              <td style={{ padding: 6, borderBottom: '1px solid #eee' }}>name + slot=</td>
              <td style={{ padding: 6, borderBottom: '1px solid #eee' }}>#header</td>
              <td style={{ padding: 6, borderBottom: '1px solid #eee' }}>复合组件 Card.Header</td>
            </tr>
            <tr>
              <td style={{ padding: 6, borderBottom: '1px solid #eee' }}>给子节点注入 props</td>
              <td style={{ padding: 6, borderBottom: '1px solid #eee' }}>$slots 遍历有限</td>
              <td style={{ padding: 6, borderBottom: '1px solid #eee' }}>$slots / 作用域插槽</td>
              <td style={{ padding: 6, borderBottom: '1px solid #eee' }}>cloneElement + Children.map</td>
            </tr>
            <tr>
              <td style={{ padding: 6, borderBottom: '1px solid #eee' }}>父子共享状态</td>
              <td style={{ padding: 6, borderBottom: '1px solid #eee' }}>provide/inject（非响应式）</td>
              <td style={{ padding: 6, borderBottom: '1px solid #eee' }}>provide/inject（ref 才响应）</td>
              <td style={{ padding: 6, borderBottom: '1px solid #eee' }}>createContext + useContext（响应式）</td>
            </tr>
            <tr>
              <td style={{ padding: 6, borderBottom: '1px solid #eee' }}>计数 / 遍历子节点</td>
              <td style={{ padding: 6, borderBottom: '1px solid #eee' }}>无直接 API</td>
              <td style={{ padding: 6, borderBottom: '1px solid #eee' }}>无直接 API</td>
              <td style={{ padding: 6, borderBottom: '1px solid #eee' }}>Children.count / Children.map</td>
            </tr>
          </tbody>
        </table>
        <p style={{ fontSize: 13, color: '#666', marginTop: 12 }}>
          一句话：React 没有 &lt;slot&gt;，用 children + cloneElement + createContext 实现等价；复合组件是
          「共享同一隐式 context 的关联组件集合」，目的和 Vue 具名插槽一致，但写法是「把子组件挂到父组件上」。
        </p>
      </details>
    </main>
  )
}
