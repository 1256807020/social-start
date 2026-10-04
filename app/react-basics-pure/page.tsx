"use client";

import { useEffect, useState } from "react";
/**
 * React 基础 · 纯函数 vs 非纯函数 + StrictMode + 不可变数据
 * 搬运自 ReactAdm02，改成 TS/Next。
 * 注：Next.js 开发模式默认开启 React.StrictMode，会故意双重渲染，正好观察非纯函数的坑。
 */

/* ===== 纯函数：相同输入 → 相同输出，无副作用 ===== */
function Greeting({ name }: { name: string }) {
  return <h3>Hello, {name}!</h3>;
}

/* ===== 非纯函数反例（StrictMode 下会暴露，且 SSR 会 Hydration 报错）===== */
// 这是「错误示范」，先别改它：运行后 DevTools 会看到 `Hydration failed`，
// 原因见下——render 里改了模块级变量 itemCounter，而它服务端/客户端各自从 0 开始，文本对不上。
let itemCounter = 0;
function ImpureGreeting({ name }: { name: string }) {
  // 警示错误写法的
  itemCounter++; // 副作用：修改了外部（模块级）变量，违反纯函数原则 → 触发水合错
  return (
    <h3>
      Hello, {name}! Count: {itemCounter}
    </h3>
  );
}

/* ===== 👉 练习：实现纯函数版，消除上面的 Hydration 报错 =====
 * 目标：
 *  1. 不在 render 里改外部变量；
 *  2. 初始渲染服务端/客户端 HTML 要一致（别直接渲染会变的模块级值）；
 *  3. 副作用放进 useEffect，用 useState 保存结果。
 * 完成后页面不再报 Hydration failed，且 StrictMode 下仍能观察到「被调用两次」。
 * 提示：需要 `import { useEffect, useState } from 'react'`
 */
function PureGreeting({ name }: { name: string }) {
  // 👉 练习实现：render 保持纯函数（不改外部变量），副作用放进 useEffect（空依赖，挂载后跑一次）
  const [count, setCount] = useState(0);
  useEffect(() => {
    setCount((c) => c + 1); // 函数式更新：StrictMode 下会跑两次 → 最终为 2，且不碰模块变量
  }, []);
  return (
    <h3>
      Hello, {name}! Count: {count}
    </h3>
  );
}

/* ===== 不可变数据：不直接改 props/state，用展开创建新数组 ===== */
function ShopingList({ items }: { items: { id: number; label: string }[] }) {
  // 👉 练习：不要直接 items.push(...)，用展开运算符创建新数组（原数组不变）
  const extendedItems = [...items, { id: 4, label: "Add Item" }];
  // ❌ 错误示范（取消注释会污染原 props）：items.push({ id: 4, label: 'Add Item' })
  return (
    <ul>
      {extendedItems.map((item) => (
        <li key={item.id}>{item.label}</li>
      ))}
    </ul>
  );
}

export default function ReactBasicsPurePage() {
  const items = [
    { id: 1, label: "milk" },
    { id: 2, label: "bread" },
    { id: 3, label: "eggs" },
  ];
  return (
    <main
      style={{ maxWidth: 720, margin: "40px auto", fontFamily: "system-ui" }}
    >
      <h1>React 基础 · 纯函数 / StrictMode / 不可变</h1>
      <p>
        👇 Next.js 开发模式默认开启 <code>StrictMode</code>，会双重调用渲染。
        下面 <code>ImpureGreeting</code> 会触发 <code>Hydration failed</code>{" "}
        报错—— 这就是你要练的「坑」。照着下方 👉 练习，实现{" "}
        <code>PureGreeting</code> 把它修掉。
      </p>

      <section>
        <h2>纯函数 vs 非纯函数（错误示范）</h2>
        <Greeting name="john" />
        <Greeting name="john" />
        <ImpureGreeting name="john" />
        <ImpureGreeting name="john" />
      </section>

      <section>
        <h2>👉 练习：纯函数版（消除 Hydration 报错）</h2>
        <PureGreeting name="john" />
      </section>

      <section>
        <h2>不可变数据</h2>
        <ShopingList items={items} />
      </section>
    </main>
  );
}
