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

  // 👉 const filtered = useMemo(() => list.filter(u => u.name.includes(query)), [list, query])
  // 对比：不加 useMemo，每次渲染都重跑 filter；加了只在 list/query 变时算。
  // const filtered = list; // 👉 替换成上面的 useMemo 结果
  const filtered = useMemo(
    () => list.filter((u) => u.name.includes(query)),
    [list, query]
  );
  return (
    <section className="rounded border p-3">
      <h2 className="font-bold">② useMemo（缓存过滤结果）</h2>
      <input
        className="mr-2 rounded border px-2 py-1"
        placeholder="搜索用户名"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <p className="text-sm">
        匹配 {filtered.length} 条（在 Console 看渲染次数体会差异）
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
  return (
    <section className="rounded border p-3">
      <h2 className="font-bold">③ useCallback + memo（稳定函数引用）</h2>
      <MemoChild onClick={handle} label="点我 +1" />
      <span className="ml-2">
        计数：{n}（打开 Console 看 MemoChild 是否重渲染）
      </span>
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
