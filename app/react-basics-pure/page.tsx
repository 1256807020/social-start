'use client'

import type { ReactNode } from 'react'

/**
 * React 基础 · 纯函数 vs 非纯函数 + StrictMode + 不可变数据
 * 搬运自 ReactAdm02，改成 TS/Next。
 * 注：Next.js 开发模式默认开启 React.StrictMode，会故意双重渲染，正好观察非纯函数的坑。
 */

/* ===== 纯函数：相同输入 → 相同输出，无副作用 ===== */
function Greeting({ name }: { name: string }) {
  return <h3>Hello, {name}!</h3>
}

/* ===== 非纯函数反例（StrictMode 下会暴露）===== */
// 👉 练习：观察 itemCounter 在 StrictMode 下被加两次。思考为什么，以及怎么改成纯函数。
let itemCounter = 0
function ImpureGreeting({ name }: { name: string }) {
  itemCounter++ // 副作用：修改了外部变量，违反纯函数原则
  return (
    <h3>
      Hello, {name}! Count: {itemCounter}
    </h3>
  )
}

/* ===== 不可变数据：不直接改 props/state，用展开创建新数组 ===== */
function ShopingList({ items }: { items: { id: number; label: string }[] }) {
  // 👉 练习：不要直接 items.push(...)，用展开运算符创建新数组（原数组不变）
  const extendedItems = [...items, { id: 4, label: 'Add Item' }]
  // ❌ 错误示范（取消注释会污染原 props）：items.push({ id: 4, label: 'Add Item' })
  return (
    <ul>
      {extendedItems.map((item) => (
        <li key={item.id}>{item.label}</li>
      ))}
    </ul>
  )
}

export default function ReactBasicsPurePage() {
  const items = [
    { id: 1, label: 'milk' },
    { id: 2, label: 'bread' },
    { id: 3, label: 'eggs' },
  ]
  return (
    <main style={{ maxWidth: 720, margin: '40px auto', fontFamily: 'system-ui' }}>
      <h1>React 基础 · 纯函数 / StrictMode / 不可变</h1>
      <p>
        👇 Next.js 开发模式默认开启 <code>StrictMode</code>，会双重调用渲染。
        下面两个 Greeting 结果一致，但两个 ImpureGreeting 的 Count 会不一样。
      </p>

      <section>
        <h2>纯函数 vs 非纯函数</h2>
        <Greeting name="john" />
        <Greeting name="john" />
        <ImpureGreeting name="john" />
        <ImpureGreeting name="john" />
      </section>

      <section>
        <h2>不可变数据</h2>
        <ShopingList items={items} />
      </section>
    </main>
  )
}
