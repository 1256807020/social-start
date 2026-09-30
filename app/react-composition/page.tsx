'use client'

import { Children, cloneElement, isValidElement } from 'react'
import type { ReactNode } from 'react'

/**
 * 组合 / 插槽模式（搬运自 learning-demos 的 ReactChildrenDemo）
 *  React.Children / React.cloneElement / 复合组件（Compound Components）
 * 每个 👉 是给你手敲的练习点。
 */

/* ---------- 1. React.Children 遍历/计数/映射 ---------- */
function List({ children }: { children: ReactNode }) {
  const count = Children.count(children) // 👉 统计子节点数量
  return (
    <div>
      <p>共 {count} 个孩子</p>
      <ul>
        {Children.map(children, (child, i) =>
          isValidElement(child) ? <li key={i}>{child}</li> : null,
        )}
      </ul>
    </div>
  )
}

/* ---------- 2. cloneElement：给子组件注入 props ---------- */
function Slot({ children }: { children: ReactNode }) {
  return (
    <>
      {Children.map(children, (child) =>
        isValidElement(child)
          ? cloneElement(child, { injected: true } as Record<string, unknown>) // 👉 给每个 child 注入额外 prop
          : child,
      )}
    </>
  )
}
function Box({ injected }: { injected?: boolean }) {
  return <div>Box {injected ? '（被注入）' : ''}</div>
}

/* ---------- 3. 复合组件（上下文共享） ---------- */
function Card({ children }: { children: ReactNode }) {
  return (
    <div style={{ border: '1px solid #ccc', padding: 12 }}>{children}</div>
  )
}
// 👉 练习：用 React.createContext 让 Card.Header / Card.Body 共享卡片状态（如折叠、主题）

export default function CompositionPage() {
  return (
    <main style={{ maxWidth: 720, margin: '40px auto', fontFamily: 'system-ui' }}>
      <h1>组合 / 插槽模式</h1>
      <section>
        <h2>① React.Children</h2>
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
        <h2>③ 复合组件（Card.Header/Body）</h2>
        <Card>
          <p>卡片内容</p>
        </Card>
      </section>
    </main>
  )
}
