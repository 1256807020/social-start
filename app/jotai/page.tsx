// ============================================================================
// Jotai 练习页（客户端组件）
// ----------------------------------------------------------------------------
// 演示三种“读/写原子”的 hook：
//   - useAtom(atom)        → 读写（返回 [value, setValue]）
//   - useAtomValue(atom)   → 只读（只要值）
//   - useSetAtom(atom)     → 只写（只要 setter）
// 还演示 Provider：给本页圈一个独立的 store（避免 SSR 下跨请求串状态）。
//
// ───── 从 Vue 转 React（Jotai 组件篇）─────
//   • Vue3/Pinia：组件里直接 storeToRefs(store) 读、store.xxx() 调 action；Jotai 用上面三个 hook 按「读写/只读/只写」精确订阅。
//     对应：useAtom ≈ ref 双向绑、useAtomValue ≈ computed/getter 只读、useSetAtom ≈ 只拿 action 函数。
//   • Vue2/Vuex：this.$store.state.xxx 读、this.$store.dispatch 调；Jotai 细到「单个原子」粒度，重渲染更精准。
//   关键差异：Vue/Pinia 是「store 整体」，Jotai 是「原子组合」——只用某个原子的组件，其它原子变它不重渲染。
// ============================================================================
'use client';

import { useAtom, useAtomValue, useSetAtom, Provider } from 'jotai';
import {
  inputAtom,
  todosAtom,
  remainingAtom,
  addTodoAtom,
  toggleTodoAtom,
  removeTodoAtom,
} from '@/lib/jotai-store';

export default function JotaiPage() {
  // 输入框：读写
  // 🔧 固定写法：useAtom(atom) 返回 [值, 设值函数]，像 useState 一样双向绑
  const [input, setInput] = useAtom(inputAtom);
  // 列表 / 剩余数：只读
  // 🔧 固定写法：useAtomValue(atom) 只取当前值（不需要改时优先用它，少订阅 setter 避免多余重渲染）
  const todos = useAtomValue(todosAtom);
  const remaining = useAtomValue(remainingAtom);
  // 动作：只写
  // 🔧 固定写法：useSetAtom(atom) 只拿 setter/动作函数（不需要值时用它，组件不会因该原子的值变化而重渲染）
  const addTodo = useSetAtom(addTodoAtom);
  const toggleTodo = useSetAtom(toggleTodoAtom);
  const removeTodo = useSetAtom(removeTodoAtom);

  return (
    // 🔧 固定写法：客户端组件根用 <Provider> 圈作用域（默认一个全局 store；包一层可让本页独立、避免 SSR 串状态）
    <Provider>
      <main className="p-8 max-w-xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold">Jotai 原子状态练习</h1>
        <p className="text-muted-foreground">剩余 {remaining} 项未完成</p>

        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') addTodo();
            }}
            placeholder="输入待办，回车添加"
            className="flex-1 rounded border border-input px-2 py-1 bg-background"
          />
          <button
            onClick={() => addTodo()}
            className="rounded bg-primary text-primary-foreground px-3 py-1"
          >
            添加
          </button>
        </div>

        <ul className="space-y-2">
          {todos.map((t) => (
            <li
              key={t.id}
              className="flex items-center justify-between border border-border rounded px-3 py-2"
            >
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={t.done} onChange={() => toggleTodo(t.id)} />
                <span className={t.done ? 'line-through text-muted-foreground' : ''}>{t.text}</span>
              </label>
              <button onClick={() => removeTodo(t.id)} className="text-destructive text-sm">
                删除
              </button>
            </li>
          ))}
        </ul>

        {/* ④ 四方案状态管理对照速查（折叠，不打断练习） */}
        <details className="mt-6 text-sm">
          <summary className="cursor-pointer font-medium">④ 状态方案对照：Jotai / Zustand / Redux Toolkit / Vue</summary>
          <table className="mt-2 w-full border-collapse border border-border text-left">
            <thead>
              <tr className="bg-muted">
                <th className="border border-border px-2 py-1">维度</th>
                <th className="border border-border px-2 py-1">Jotai（原子）</th>
                <th className="border border-border px-2 py-1">Zustand（单一 store）</th>
                <th className="border border-border px-2 py-1">Redux Toolkit</th>
                <th className="border border-border px-2 py-1">Vue 对照</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-border px-2 py-1">状态单元</td>
                <td className="border border-border px-2 py-1">atom（最小原子）</td>
                <td className="border border-border px-2 py-1">一个 store 对象</td>
                <td className="border border-border px-2 py-1">单一 state 树</td>
                <td className="border border-border px-2 py-1">Pinia store / Vuex</td>
              </tr>
              <tr>
                <td className="border border-border px-2 py-1">定义</td>
                <td className="border border-border px-2 py-1">atom(值)/atom((get)=&gt;…)/atom(null,(get,set)=&gt;…)</td>
                <td className="border border-border px-2 py-1">create()(set=&gt;…)</td>
                <td className="border border-border px-2 py-1">createSlice + configureStore</td>
                <td className="border border-border px-2 py-1">defineStore / state+getters+actions</td>
              </tr>
              <tr>
                <td className="border border-border px-2 py-1">读状态</td>
                <td className="border border-border px-2 py-1">useAtomValue / useAtom</td>
                <td className="border border-border px-2 py-1">useStore(selector)</td>
                <td className="border border-border px-2 py-1">useSelector</td>
                <td className="border border-border px-2 py-1">store.xxx / storeToRefs</td>
              </tr>
              <tr>
                <td className="border border-border px-2 py-1">改状态</td>
                <td className="border border-border px-2 py-1">set(atom, 新值)（写原子里）</td>
                <td className="border border-border px-2 py-1">set((s)=&gt; 新引用) 不可变</td>
                <td className="border border-border px-2 py-1">state.x=… 直接改（Immer）</td>
                <td className="border border-border px-2 py-1">Pinia 直接改 / Vuex mutation</td>
              </tr>
              <tr>
                <td className="border border-border px-2 py-1">派生值</td>
                <td className="border border-border px-2 py-1">atom((get)=&gt;…) 自动重算</td>
                <td className="border border-border px-2 py-1">组件内 useMemo / selector</td>
                <td className="border border-border px-2 py-1">selector / createSelector</td>
                <td className="border border-border px-2 py-1">Pinia getters / Vue computed</td>
              </tr>
              <tr>
                <td className="border border-border px-2 py-1">重渲染粒度</td>
                <td className="border border-border px-2 py-1">最细（单原子订阅）</td>
                <td className="border border-border px-2 py-1">按 selector</td>
                <td className="border border-border px-2 py-1">按 selector</td>
                <td className="border border-border px-2 py-1">响应式依赖追踪</td>
              </tr>
              <tr>
                <td className="border border-border px-2 py-1">DevTools</td>
                <td className="border border-border px-2 py-1">需 jotai-devtools</td>
                <td className="border border-border px-2 py-1">需 devtools 中间件</td>
                <td className="border border-border px-2 py-1">默认自带</td>
                <td className="border border-border px-2 py-1">Vue DevTools</td>
              </tr>
            </tbody>
          </table>
        </details>
      </main>
    </Provider>
  );
}
