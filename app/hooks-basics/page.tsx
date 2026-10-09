"use client";

// ============================================================
// React 中级 · 基础内置 Hook 练习（learn/basic-react-0002）
// 本页只练【纯 React 内置、零依赖】的部分，对应路线“中级”前三项：
//   useRef / useMemo / useCallback / 自定义 Hook / Context
// 状态库（Zustand / Redux）/ 表单校验（react-hook-form+Zod）各自独立分支，不在这里。
//
// 老师只搭外壳 + 说明，所有标 👉 的地方由【你】手写完成。
// 跑法：pnpm dev → http://localhost:4000/hooks-basics
// ============================================================

// ------------------------------------------------------------
// Hook 签名速记（判断一个 hook 长什么样）
// 1) “回调 + 依赖数组”是【effect / 派生】类 hook 的通用形态：
//      useEffect / useLayoutEffect / useMemo / useCallback / useImperativeHandle
//      第一个参数是“要做什么”，第二个参数是“什么时候重跑（依赖）”。
// 2) 凡是“算出来要被渲染用到的（值 / 函数）”→ 大概率用 useMemo / useCallback 这种 (() => {}, [deps]) 形。
// 3) 凡是“存状态 / 读上下文 / 造引用”（useState / useRef / useContext）→ 各自独立签名，没有依赖数组：
//      useState(初值)      useRef(初值)      useReducer(reducer, 初值)      useContext(Ctx)
//    注意：useState(() => x) 里的函数只在第一渲染跑一次（惰性初始化），不是按 deps 重跑，别和 useMemo 混了。
// 准确说法：“回调 + 依赖数组”是 effect / 派生类 hook 的通用形态，而非所有 hook 的形态。

// 一、和 useMemo/useCallback 同形（都是 () => {}, [deps]）的还有 3 个
// 1. useEffect —— 最重要的"兄弟" 和 useMemo 只差在用途：useMemo 返回值参与渲染，useEffect 跑副作用（改标题、发请求、加事件监听），不返回值。

// tsx
// useEffect(() => {
//   document.title = `计数：${n}`;
// }, [n]); // n 变才重跑；[] 只跑一次；不写 deps 每次都跑
// （你 ① 里自动聚焦那段 useEffect(() => inputRef.current?.focus(), []) 就是它，只是当时没单独练。）

// 2. useLayoutEffect —— 和 useEffect 一模一样，只差"时机" 在浏览器绘制之前同步跑，适合读 DOM 尺寸 / 避免闪烁。日常几乎用不到，能用 useEffect 就别用它。

// tsx
// useLayoutEffect(() => { /* 读 DOM 布局 */ }, [deps]);
// 3. useImperativeHandle —— 同样 () => {}, [deps]，但第一个参数是 ref 让子组件通过 ref 向父暴露方法（反向操作 DOM）。这是"同形家族"里最容易被忽略的一个。

// tsx
// useImperativeHandle(ref, () => ({
//   focus: () => inputRef.current?.focus(),
// }), []); // 第三个参数还是依赖数组
// 二、其他常用、但"签名不同"的 hook（useState/useRef/useContext 你已会）
// Hook	干啥	签名
// useReducer	复杂 state 逻辑（Redux 迷你版）	useReducer(reducer, init)
// useId	SSR 安全的唯一 id	useId()
// useTransition	标记"非紧急更新"，UI 不卡	const [p, s] = useTransition()
// useDeferredValue	把一个值"延后"更新	const v = useDeferredValue(val)
// useSyncExternalStore	订阅外部 store（Zustand/Redux 底层）	useSyncExternalStore(sub, get)
// 三、对照记忆
// 你刚确立的"签名速记"正好框住全部：

// 同形族（()=>{},[deps]）：useEffect / useLayoutEffect / useMemo / useCallback / useImperativeHandle —— 区别只在"返回什么 / 干嘛用"。
// 异形族：useState(初值) / useRef(初值) / useReducer / useContext(Ctx) / useId 等，没有依赖数组。
// ------------------------------------------------------------

import {
  createContext,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

// ============================================================
// 练习 1：useRef —— DOM 引用 + 存“上一次渲染的值”
// 要点：ref.current 改了不触发重渲染；适合存“不需要参与渲染”的东西。
// ============================================================
const UseRefDemo = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const prevTitle = useRef<string>(""); // 👉 用来存“上一次的值”
  const [val, setVal] = useState("");

  // 👉 1) 挂载后自动聚焦：useEffect(() => { inputRef.current?.focus(); }, [])
  // 👉 2) onChange：先 prevTitle.current = val（记下旧值），再 setVal(e.target.value)
  // 👉 3) 按钮“看上一次”：alert(`当前：${val}，上一次：${prevTitle.current}`)
  useEffect(() => {
    inputRef.current?.focus(); // 看光标在输入框中闪烁
  }, []);
  return (
    <section className="rounded border p-3">
      <h2 className="font-bold">① useRef（自动聚焦 + 存上一次的值）</h2>
      <input
        ref={inputRef}
        className="mr-2 rounded border px-2 py-1"
        placeholder="打字后点按钮"
        value={val}
        onChange={(e) => {
          prevTitle.current = val;
          setVal(e.target.value);
        }}
      />
      <button
        className="rounded bg-gray-700 px-2 py-1 text-white"
        onClick={() => alert(`当前：${val}，上一次：${prevTitle.current}`)}
      >
        看上一次的值
      </button>
    </section>
  );
};

// ============================================================
// 练习 2：useMemo —— 缓存“昂贵计算”
// 要点：依赖不变就不重算；适合大列表 filter/sort/聚合。
// ============================================================
const UseMemoDemo = () => {
  // 造 1000 条假数据当“大列表”
  const [list] = useState(() =>
    Array.from({ length: 1000 }, (_, i) => ({ id: i, name: `用户${i}` }))
  );
  const [query, setQuery] = useState("");
  const [count, setCount] = useState(0); // 👉 故意加一个“与过滤无关”的 state

  // 👉 用 useMemo 缓存 filter 结果：仅当 list/query 变化时重算，点“无关按钮”改 count 不会重算

  // const filtered = list.filter((u) => u.name.includes(query));
  // useMemo 的价值只有在"组件重渲染了、但依赖没变"时才显现。
  const filtered = useMemo(() => {
    console.log("② filter 重算了（仅 list/query 变化时，点无关按钮不会跑）");
    return list.filter((u) => u.name.includes(query));
  }, [list, query]);
  // const filterClick = useCallback(() => {
  //   console.log("filterClick 重算了");
  //   return list.filter((u) => u.name.includes(query));
  // }, [list, query]); // 返回函数，必须调用才能拿到值
  // 跑起来后点"无关按钮 count" → Console 照样打印 "filterClick 重算了"，这就用反例坐实了：useCallback 缓存的是函数引用，不是计算结果；缓存【值】得用 useMemo。
  // const filtered = filterClick(); // 👉 必须调用，每次渲染都重算
  return (
    <section className="rounded border p-3">
      <h2 className="font-bold">② useMemo 缓存版（用了 useMemo）</h2>
      <input
        className="mr-2 rounded border px-2 py-1"
        placeholder="搜索用户名"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button
        className="ml-2 rounded border px-2 py-1"
        onClick={() => setCount((c) => c + 1)}
      >
        无关按钮 count: {count}
      </button>
      <p className="text-sm">
        匹配 {filtered.length} 条（打开 Console，点“无关按钮”看 filter
        是否还在跑—— 用 useMemo 时它不会跑）
      </p>
      <ul className="max-h-32 overflow-auto text-sm">
        {filtered.slice(0, 20).map((u) => (
          <li key={u.id}>{u.name}</li>
        ))}
      </ul>
    </section>
  );
};

// ============================================================
// 练习 3：useCallback + memo —— 稳定“函数引用”
// 要点：子组件被 memo 包裹时，传进去的函数若每次都是新引用，memo 就失效。
// 对照 ② useMemo：两者签名完全一样 (() => X, [deps])，唯一区别——
//    useMemo 返回【算出来的“值”】，useCallback 返回【“函数”本身】。
// ============================================================
const MemoChild = memo(function MemoChild({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) {
  console.log("MemoChild 渲染了（函数引用稳定就不该出现）");
  return (
    <button
      className="rounded bg-blue-600 px-2 py-1 text-white"
      onClick={onClick}
    >
      {label}
    </button>
  );
});

const UseCallbackDemo = () => {
  const [n, setN] = useState(0);

  // 👉 const handle = useCallback(() => setN(x => x + 1), [])
  // 空依赖 → handle 引用永远不变 → MemoChild 不会被白白重渲染。
  // 若直接写 () => setN(x=>x+1)，每次渲染都是新函数，memo 白费。
  // const handle = () => setN((x) => x + 1); // 👉 替换成上面 useCallback 版本
  const handle = useCallback(() => setN((x) => x + 1), []);

  // 👉 与 ② useMemo 对照：签名一模一样 (() => X, [deps])，唯一区别是返回的东西
  const doubled = useMemo(() => n * 2, [n]); // 返回【值】
  const add = useCallback((x: number) => n + x, [n]); // 返回【函数】
  return (
    <section className="rounded border p-3">
      <h2 className="font-bold">③ useCallback + memo（稳定函数引用）</h2>
      <MemoChild onClick={handle} label="点我 +1" />
      <span className="ml-2">
        计数：{n}（打开 Console 看 MemoChild 是否重渲染）
      </span>
      {/* 👉 对照 ②：useMemo 给“值”，useCallback 给“函数”，依赖写法完全一样 */}
      <p className="mt-2 text-sm text-gray-600">
        n={n} ｜ useMemo 算的值 doubled={doubled} ｜ useCallback 给的函数
        add(10)=
        {add(10)}
      </p>
    </section>
  );
};

// ============================================================
// 练习 4：自定义 Hook —— 把“状态逻辑”抽出来复用
// 要点：useXxx 命名；内部用 useState/useEffect；返回 [值, 操作]。
// ============================================================
// 👉 手写 useToggle：返回 [开关, 切换函数]
//   function useToggle(initial = false) {
//     const [on, setOn] = useState(initial);
//     const toggle = () => setOn(v => !v);
//     return [on, toggle] as const;   // as const 保留元组类型
//   }
// function useToggle(initial = false) {
//   const [on, setOn] = useState(initial);
//   const toggle = () => setOn((v) => !v);
//   return [on, toggle] as const;
// }

function useMyToggle(initBoolean = false) {
  const [open, setOpen] = useState(initBoolean);
  const toggle = () => setOpen((v) => !v);
  return [open, toggle] as const;
}
const UseCustomHookDemo = () => {
  const [open, toggle] = useMyToggle(); // 👉 直接用自定义 hook
  return (
    <section className="rounded border p-3">
      <h2 className="font-bold">④ 自定义 Hook（useMyToggle）</h2>
      <button className="rounded border px-2 py-1" onClick={toggle}>
        {open ? "收起" : "展开"}
      </button>
      {open && <p className="text-sm">这是被 toggle 控制的内容</p>}
    </section>
  );
};

// ============================================================
// 练习 5：Context —— 跨层共享，免 prop drilling
// 要点：createContext 建对象 → Provider 提供值 → 深层子组件 useContext 取。
// ============================================================
type ThemeCtx = { theme: string; setTheme: (t: string) => void };
const ThemeContext = createContext<ThemeCtx | null>(null);

const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState("light");
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// 深层子组件：不用任何 props 也能拿到 theme
const DeepChild = () => {
  const ctx = useContext(ThemeContext); // 👉 取共享值
  if (!ctx) return null; // Context 可能为 null，记得兜底
  return (
    <p className="text-sm">
      当前主题：{ctx.theme}
      <button
        className="ml-2 rounded border px-2 py-1"
        onClick={() => ctx.setTheme(ctx.theme === "light" ? "dark" : "light")}
      >
        切换
      </button>
    </p>
  );
};

export default function HooksBasicsPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-4 p-6">
      <h1 className="text-2xl font-bold">
        中级基础 · 内置 Hook（useRef/useMemo/useCallback/自定义Hook/Context）
      </h1>
      <p className="text-sm text-gray-500">
        分支 learn/basic-react-0002 ｜ 纯 React 内置，零依赖 ｜ 标 👉 处由你手敲
      </p>

      <ThemeProvider>
        <UseRefDemo />
        <UseMemoDemo />
        <UseCallbackDemo />
        <UseCustomHookDemo />
        <section className="rounded border p-3">
          <h2 className="font-bold">⑤ Context（跨层共享，免 prop drilling）</h2>
          <DeepChild />
        </section>
      </ThemeProvider>
    </main>
  );
}
