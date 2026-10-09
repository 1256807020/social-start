// ============================================================================
// Jotai 原子（atom）定义
// ----------------------------------------------------------------------------
// Jotai 的核心思想：**状态拆成一个个最小的「原子」，组件只订阅自己关心的原子**。
// 对比 zustand（一个大 store）/ redux（单一 state 树），原子化的粒度更细、
// 组件重渲染范围更小，2026 年非常流行。
//
// 注意：这个文件只用 atom()，不需要 'use client'，因为它只是定义、不碰 React。
// （真正“用”原子的是客户端组件 app/jotai/page.tsx）
//
// ───── 从 Vue 转 React（Jotai 原子篇）─────
//   • Vue3 / Pinia：一个 store 里 state + getters（派生）+ actions；Jotai 把这些都拆成「原子」：
//       inputAtom      ≈ store 里的 state（useAtom 双向绑，≈ Pinia 的 ref/state）
//       todosAtom      ≈ store 的源数据 state
//       remainingAtom  ≈ store 的 getter（依赖其它 state 自动算，≈ Pinia 的 getters）
//       *TodoAtom      ≈ store 的 actions（get 读其它原子、set 改原子，≈ Pinia actions/this.x=）
//     区别：Pinia 是「一个 store 包全部」，Jotai 是「一堆原子自由组合」，粒度更细、重渲染更精准。
//   • Vue2 / Vuex：state + getters + mutations(actions) 三层拆分；Jotai 的「派生/写原子」对应 getters/actions，
//     但 Jotai 没有 mutation/action 的强制区分，写原子里直接 set 即可（≈ Vuex 的 actions 里 commit）。
//   共同点：派生值都是「声明式依赖、自动重算」，不用自己手动维护。
// ============================================================================
import { atom } from 'jotai';

export type Todo = { id: number; text: string; done: boolean };

// 1) 基元 atom（primitive）：输入框文本。组件用 useAtom 双向绑定。
// 🔧 固定写法：atom(初始值) —— 不带 get/set 的就是「基元原子」，初始值即它的状态
export const inputAtom = atom('');

// 2) 列表 atom：唯一的“源数据”原子。增删改都 set 它。
// 🔧 固定写法：atom<T>(初始值) —— 带类型的源数据原子，initial 就是唯一的“真值来源”
export const todosAtom = atom<Todo[]>([
  { id: 1, text: '学 Jotai 原子状态', done: false },
  { id: 2, text: '用 derive atom 算剩余数', done: true },
]);

// 3) 派生 atom（read-only）：从 todosAtom 算“未完成数量”。
//    派生原子不存数据，只依赖其它原子；任一依赖变了它会自动重算。
// 🔧 固定写法：atom((get) => ...) —— 单参函数是「只读派生原子」，get(其它原子) 声明依赖、自动重算
export const remainingAtom = atom((get) => get(todosAtom).filter((t) => !t.done).length);

// 4) 写原子（write-only）：新增待办。第二个参数是 (get, set, ...args)。
//    约定 atom(null, ...) 表示“无读值、只写”。
// 🔧 固定写法：atom(null, (get, set, ...args) => {}) —— 第一参 null 表示「无读值=只写」；
//    get 读其它原子、set(原子, 新值) 改原子、args 是组件调用时传的参数。函数体才是业务。
export const addTodoAtom = atom(null, (get, set) => {
  const text = get(inputAtom).trim();
  if (!text) return; // 空内容不添加
  const list = get(todosAtom);
  set(todosAtom, [...list, { id: Date.now(), text, done: false }]);
  set(inputAtom, ''); // 清空输入框
});

// 5) 写原子：切换完成状态
// 🔧 固定写法：写原子第二参 (get, set, id) —— 这里的 id 是组件调用时传进来的参数
export const toggleTodoAtom = atom(null, (get, set, id: number) => {
  set(
    todosAtom,
    get(todosAtom).map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
  );
});

// 6) 写原子：删除
export const removeTodoAtom = atom(null, (get, set, id: number) => {
  set(
    todosAtom,
    get(todosAtom).filter((t) => t.id !== id),
  );
});
