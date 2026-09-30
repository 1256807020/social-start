'use client'

import type { ReactNode, MouseEvent } from 'react'

/**
 * React 基础 · Props 深入 + 组件通信 + 事件对象
 * 搬运自 ReactAdm02，改成 TS/Next。每个 👉 是给你手敲的练习点。
 */

/* ===== Props：默认值 + children ===== */
function ColorfulCom({ color = 'blue', children }: { color?: string; children?: ReactNode }) {
  return (
    <div style={{ color }}>
      <p>this component is {color}.</p>
      {children}
    </div>
  )
}

/* ===== Props：用 props 对象 + 兜底默认值 ===== */
function ColorCom(props: { color?: string; children?: ReactNode }) {
  const color = props.color ?? 'blue'
  return (
    <div style={{ color }}>
      <p>this ColorCom component is {color}.</p>
      {props.children}
    </div>
  )
}

/* ===== Props：展开运算符 ... 批量传参 ===== */
function UserProfile({
  name,
  dateOfBrith,
  company,
  university,
}: {
  name: string
  dateOfBrith: string
  company: string
  university: string
}) {
  return (
    <div>
      <h3>Name: {name}</h3>
      <p>Date of Birth {dateOfBrith}.</p>
      <p>Company: {company}</p>
      <p>University: {university}</p>
    </div>
  )
}

/* ===== 事件对象 e（e.target / e.clientX / e.clientY）===== */
function CustomButton({ text }: { text: string }) {
  // 👉 手敲：在 onClick 里用事件对象 e 打印或更新（e.target、e.clientX、e.clientY）
  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    // 👉 console.log(e.target, e.clientX, e.clientY)
  }
  return <button onClick={handleClick}>{text}</button>
}

/* ===== 木偶组件：只渲染，逻辑由父通过 props 传入 ===== */
function ActionButton({ label, onAction }: { label: string; onAction: () => void }) {
  return <button onClick={onAction}>{label}</button>
}

/* ===== 父传子回调 ===== */
function Contact() {
  // 👉 手敲：定义一个回调，传给 ActionButton 的 onAction
  const handleContact = () => {
    // 👉 alert('联系我们') 或 console.log(...)
  }
  return (
    <div>
      <p>Contact us</p>
      <ActionButton label="联系" onAction={handleContact} />
    </div>
  )
}

/* ===== 子向父传参（经典模式）===== */
function MenuItem({
  name,
  price,
  onOrder,
}: {
  name: string
  price: number
  onOrder: (name: string, price: number) => void
}) {
  return (
    <li>
      {name} - ${price}
      {/* 👉 用箭头函数把子组件自己的参数回传给父的回调 */}
      <button onClick={() => onOrder(name, price)}>点单</button>
    </li>
  )
}

function Menu() {
  // 👉 手敲：定义 onOrder 回调，接收子组件传来的 name/price，并更新父的 state（订单列表）
  const handleOrder = (name: string, price: number) => {
    // 👉 例如 setOrders((prev) => [...prev, { name, price }])
    console.log('点单：', name, price)
  }
  const items = [
    { name: 'Coffee', price: 3 },
    { name: 'Tea', price: 2 },
  ]
  return (
    <ul>
      {items.map((it) => (
        <MenuItem key={it.name} name={it.name} price={it.price} onOrder={handleOrder} />
      ))}
    </ul>
  )
}

export default function ReactBasicsPropsPage() {
  const userDetails = {
    name: 'username',
    dateOfBrith: '1984-1-12',
    company: 'meta',
    university: 'harvard',
  }
  return (
    <main style={{ maxWidth: 720, margin: '40px auto', fontFamily: 'system-ui' }}>
      <h1>React 基础 · Props / 通信 / 事件对象</h1>

      <section>
        <h2>① Props 默认值 + children</h2>
        <ColorfulCom color="yellow" />
        <ColorfulCom>这是 children 内容（标签之间的内容）</ColorfulCom>
        <ColorCom />
      </section>

      <section>
        <h2>② 展开运算符 ... 批量传参</h2>
        {/* 👉 等价于逐个传 name/dateOfBrith/company/university */}
        <UserProfile {...userDetails} />
      </section>

      <section>
        <h2>③ 事件对象 e</h2>
        <CustomButton text="like" />
      </section>

      <section>
        <h2>④ 父传子回调 / 子向父传参</h2>
        <Contact />
        <Menu />
      </section>
    </main>
  )
}
