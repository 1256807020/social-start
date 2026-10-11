// ───────────────────────────────────────────────────────────
// 从 Vue 转 React（props 数据流篇）· 单向数据流
// · Vue2 对照：props 向下、$emit 向上；或 .sync
// · Vue3 对照：defineProps 向下、defineEmits 向上
// · React 对照：props 向下（父传子）；子传父靠「父传下来的回调函数」
// 📌 实战定位：props 单向流属【常规业务常用】；React 里「子改父」= 父传 setter 当 prop 给子调用。
// 🧭 学习模式：🔧固定写法={<Child value={v} onChange={fn}/>}；子内 props.onChange(...)；👉=练习点已填；文末对照。
// ───────────────────────────────────────────────────────────
"use client";

import { type MouseEvent, type ReactNode, useState } from "react";

/**
 * React 基础 · Props 深入 + 组件通信 + 事件对象
 * 搬运自 ReactAdm02，改成 TS/Next。每个 👉 是给你手敲的练习点。
 */

/* ===== Props：默认值 + children ===== */
function ColorfulCom({
  color = "blue",
  children,
}: {
  color?: string;
  children?: ReactNode;
}) {
  return (
    <div style={{ color }}>
      <p>this component is {color}.</p>
      {children}
    </div>
  );
}

/* ===== Props：用 props 对象 + 兜底默认值 ===== */
function ColorCom(props: { color?: string; children?: ReactNode }) {
  const color = props.color ?? "blue";
  return (
    <div style={{ color }}>
      <p>this ColorCom component is {color}.</p>
      {props.children}
    </div>
  );
}

/* ===== Props：展开运算符 ... 批量传参 ===== */
function UserProfile({
  name,
  dateOfBrith,
  company,
  university,
}: {
  name: string;
  dateOfBrith: string;
  company: string;
  university: string;
}) {
  return (
    <div>
      <h3>Name: {name}</h3>
      <p>Date of Birth {dateOfBrith}.</p>
      <p>Company: {company}</p>
      <p>University: {university}</p>
    </div>
  );
}

/* ===== 事件对象 e（e.target / e.clientX / e.clientY）===== */
function CustomButton({ text }: { text: string }) {
  // 👉 用 useState 记录点击次数和鼠标坐标
  const [count, setCount] = useState(0);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    // 每次点击：次数 +1，并记录鼠标相对视口的坐标
    setCount((c) => c + 1);
    setPos({ x: e.clientX, y: e.clientY });
  };
  return (
    <span>
      <button onClick={handleClick}>{text}</button>
      <span style={{ marginLeft: 12, color: "#666" }}>
        已点击 {count} 次，坐标 ({pos.x}, {pos.y})
      </span>
    </span>
  );
}

/* ===== 木偶组件：只渲染，逻辑由父通过 props 传入 ===== */
function ActionButton({
  label,
  onAction,
}: {
  label: string;
  onAction: () => void;
}) {
  return <button onClick={onAction}>{label}</button>;
}

/* ===== 父传子回调 ===== */
function Contact() {
  // 👉 手敲：定义一个回调，传给 ActionButton 的 onAction
  const [txt, setTxt] = useState("");
  const handleContact = () => {
    // 👉 alert('联系我们') 或 console.log(...)
    // alert("联系我们");
    setTxt("联系我们");
  };
  return (
    <div>
      <p>Contact us {txt}</p>
      <ActionButton label="联系" onAction={handleContact} />
    </div>
  );
}

/* ===== 子向父传参（经典模式）===== */
function MenuItem({
  name,
  price,
  onOrder,
}: {
  name: string;
  price: number;
  onOrder: (name: string, price: number) => void;
}) {
  return (
    <li>
      {name} - ${price}
      {/* 👉 用箭头函数把子组件自己的参数回传给父的回调 */}
      <button onClick={() => onOrder(name, price)}>点单</button>
    </li>
  );
}

function Menu() {
  // 👉 手敲：定义 onOrder 回调，接收子组件传来的 name/price，并更新父的 state（订单列表）
  const [orders, setOrders] = useState<{ name: string; price: number }[]>([]);
  const handleOrder = (name: string, price: number) => {
    // 👉 例如 setOrders((prev) => [...prev, { name, price }])

    console.log("点单：", name, price);
    setOrders((prev) => [...prev, { name, price }]);
  };
  const items = [
    { name: "Coffee", price: 3 },
    { name: "Tea", price: 2 },
  ];
  return (
    <>
      <ul>
        {items.map((it) => (
          <MenuItem
            key={it.name}
            name={it.name}
            price={it.price}
            onOrder={handleOrder}
          />
        ))}
      </ul>

      {/* 👉 渲染父组件里累积的订单列表（state 变化自动重渲染） */}
      <div style={{ marginTop: 16 }}>
        <ul>
          {orders.length === 0 ? (
            <p>还没点单</p>
          ) : (
            orders.map((o: { name: string; price: number }, i) => (
              <li key={i}>
                {o.name}--{o.price}
              </li>
            ))
          )}
        </ul>
      </div>
    </>
  );
}

export default function ReactBasicsPropsPage() {
  const userDetails = {
    name: "username",
    dateOfBrith: "1984-1-12",
    company: "meta",
    university: "harvard",
  };
  return (
    <main
      style={{ maxWidth: 720, margin: "40px auto", fontFamily: "system-ui" }}
    >
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
      <details className="mt-6 rounded border p-3 text-sm">
        <summary className="cursor-pointer font-semibold">📚 Vue2 / Vue3 / React 三向对照 &amp; 本项目小结</summary>
        <table className="mt-2 w-full border-collapse text-left">
          <thead>
            <tr className="border-b">
              <th className="px-2 py-1">维度</th><th className="px-2 py-1">Vue2 (Options)</th><th className="px-2 py-1">Vue3 (Composition)</th><th className="px-2 py-1">React</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b"><td className="px-2 py-1">父→子</td><td className="px-2 py-1">props（驼峰）</td><td className="px-2 py-1">defineProps</td><td className="px-2 py-1">函数参数 props</td></tr>
            <tr className="border-b"><td className="px-2 py-1">子→父</td><td className="px-2 py-1">$emit / defineEmits</td><td className="px-2 py-1">defineEmits</td><td className="px-2 py-1">父传回调函数当 prop</td></tr>
            <tr className="border-b"><td className="px-2 py-1">双向</td><td className="px-2 py-1">.sync / v-model</td><td className="px-2 py-1">v-model</td><td className="px-2 py-1">value + onChange 约定（受控）</td></tr>
            <tr className="border-b"><td className="px-2 py-1">透传</td><td className="px-2 py-1">v-bind="$attrs"</td><td className="px-2 py-1">inheritAttrs / $attrs</td><td className="px-2 py-1">JSX 直接展开 {...props}</td></tr>
          </tbody>
        </table>
        <p className="mt-2 text-gray-500">📝 小结：React 没有 emit，子要改父数据就调用父给的回调；受控组件（value+onChange）是表单基石。</p>
      </details>
    </main>
  );
}
