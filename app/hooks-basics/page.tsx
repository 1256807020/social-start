"use client";

// ============================================================
// React 中级 · 基础内置 Hook 练习（learn/basic-react-0002）
// 本页只练【纯 React 内置、零依赖】的部分，对应路线“中级”前三项：
//   useRef / useMemo / useCallback / useEffect / useImperativeHandle / 自定义 Hook / Context
//   （useLayoutEffect / useReducer / useId / useTransition 等见顶部“Hook 签名速记”，本页不逐一展开）
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

// ------------------------------------------------------------
// 从 Vue2 转 React 的心智切换（看着用）
// Vue2 里常直接 list.push(x) / arr.splice(i,1) / obj.key = val 改数据，
// 因为 Vue 的响应式会拦截这些“赋值/改写”并自动重渲染。
// React 不一样：state 是【不可变】的，React 靠“引用（地址）变了没”判断要不要重渲染。
//   → 直接改 state 本身（原地 push / 直接赋值），地址没变 → React 以为没变 → 不重渲染 → UI 卡住。
//   → 正确做法：用 setXxx(新值) 去“替换”，而不是“修改”。
// 不可变更新速查（数组）：
//   尾部加(push)     setList([...list, x])
//   头部加(unshift)  setList([x, ...list])
//   删尾部(pop)      setList(list.slice(0, -1))
//   删头部(shift)    setList(list.slice(1))
//   改某项           setList(list.map((it, i) => i === idx ? x : it))
//   删某项(splice)   setList(list.filter((_, i) => i !== idx))
//   排序(不原地)     list.toSorted(...)        // ES2023，返回新数组，原数组不动
// 对象同理：obj.key = val ❌ → setObj({ ...obj, key: val }) ✅
// 口诀：React 不“改”state，而是“给”一个新的 state。
// ------------------------------------------------------------

// 现代语法小Tip：ES2023 有 toSorted / toReversed / toSpliced 等“不改动原数组、直接返回新数组”的方法，写起来更省事（现代浏览器 / Next 环境一般支持；要兼容老环境就用上面的展开写法）。
 import {
  createContext,
  forwardRef,
  memo,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
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

// ============================================================
// 练习 6：useEffect —— 同形家族的“副作用”分支
// 对照 ② useMemo：签名完全一样 (() => X, [deps])，但用途不同——
//   useMemo 返回【值】用于渲染；useEffect 不返回值，只跑【副作用】（改标题/发请求/打日志）。
// useEffect 的返回值根本不参与渲染。它要么不返回，要么返回一个清理函数（cleanup），而这个清理函数是交给 React 在"拆台"时自动调用的，不是给你拿去渲染的。
// useEffect(() => {
//   // 函数体 = 副作用（动作）：发请求、加监听、起定时器
//   // ...
//   return undefined;        // ① 什么都不返回（最常见）
//   // 或
//   return () => { /* 清理函数 */ }; // ② 返回一个函数，React 在"收尾"时调用它
// }, [deps]);
// 清理函数干嘛用（关键）
// 它在两种时机被 React 自动调用：

// 依赖变化、effect 即将重跑前 → 先清理旧的
// 组件卸载时 → 彻底清理
// 目的就是"撤销副作用"，避免内存泄漏 / 重复监听。最常见的例子——定时器
// useMemo 的返回是"产物"（你消费）；useEffect 的返回是"善后"（React 消费），而且通常是清理函数。 所以你说"useEffect 返回的如何理解"——它返回的（若有）不是数据，是"怎么撤销我刚才做的事"。
// ============================================================
const UseEffectDemo = () => {
  const [k, setK] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const [now, setNow] = useState(0);
  // 👉 同形：() => {}, [k] —— k 变才重跑（挂载时也跑一次）
  useEffect(() => {
    console.log("⑥ useEffect 跑了（k 变了）");
    setLog((prev) => [`k=${k} 时副作用触发`, ...prev].slice(0, 5));
    // 典型副作用：document.title = `计数 ${k}`;
  }, [k]);
  //   被渲染的是 now（来自 state），不是 effect 的返回值。
  // effect 函数体"起定时器"是动作；返回的 () => clearInterval(id) 是"怎么收场"。
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000); // 动作：起定时器
    return () => clearInterval(id); // 清理：卸定时器
  }, []);

  return (
    <section className="rounded border p-3">
      <h2 className="font-bold">⑥ useEffect（同形家族 · 副作用版）</h2>
      <button
        className="rounded border px-2 py-1"
        onClick={() => setK((x) => x + 1)}
      >
        改 k：{k}---当前时间：{new Date(now).toLocaleTimeString()}
      </button>
      <p className="text-sm">
        点按钮看 Console + 下方日志（仅 k 变时触发；和 ② useMemo
        同形，但返回的是“动作”不是“值”）
      </p>
      <ul className="text-xs text-gray-500">
        {log.map((l, i) => (
          <li key={i}>{l}</li>
        ))}
      </ul>
    </section>
  );
};

// ============================================================
// 练习 7：useImperativeHandle —— 同形家族的“ref 暴露方法”分支
// 对照 ② useMemo：签名还是 (() => X, [deps])，但第一个参数是 ref，
//   作用是把“子组件的方法”通过 ref 暴露给父组件调用（反向操作 DOM）。
// ============================================================
type ChildHandle = { focus: () => void; blink: () => void };
const FancyInput = forwardRef<ChildHandle>((_, ref) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [on, setOn] = useState(false);

  // 👉 同形：() => ({...}), [] —— 把方法挂到 ref 上，父组件可调用
  useImperativeHandle(
    ref,
    () => ({
      focus: () => inputRef.current?.focus(),
      blink: () => setOn((v) => !v),
    }),
    []
  );

  return (
    <input
      ref={inputRef}
      className={`rounded border px-2 py-1 ${on ? "bg-yellow-200" : ""}`}
      placeholder="父组件可调用我的方法"
    />
  );
});
FancyInput.displayName = "FancyInput";

const UseImperativeHandleDemo = () => {
  const childRef = useRef<ChildHandle>(null);
  return (
    <section className="rounded border p-3">
      <h2 className="font-bold">
        ⑦ useImperativeHandle（同形家族 · 暴露方法给父）
      </h2>
      <FancyInput ref={childRef} />
      <button
        className="ml-2 rounded border px-2 py-1"
        onClick={() => childRef.current?.focus()}
      >
        父调用 focus()
      </button>
      <button
        className="ml-2 rounded border px-2 py-1"
        onClick={() => childRef.current?.blink()}
      >
        父调用 blink()
      </button>
      <p className="text-sm">
        点按钮，父组件通过 ref 直接调子组件的方法（方法体也是箭头函数、依赖写
        []，同形）
      </p>
    </section>
  );
};

export default function HooksBasicsPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-4 p-6">
      <h1 className="text-2xl font-bold">
        中级基础 · 内置
        Hook（useRef/useMemo/useCallback/useEffect/useImperativeHandle/自定义Hook/Context）
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

      {/* 同形家族对照：useEffect / useImperativeHandle 与 ② useMemo 签名一致 */}
      <UseEffectDemo />
      <UseImperativeHandleDemo />
    </main>
  );
}
