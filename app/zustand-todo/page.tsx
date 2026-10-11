// ───────────────────────────────────────────────────────────
// 从 Vue 转 React（轻量状态管理篇）· Zustand
// · Vue2 对照：Vuex / eventBus
// · Vue3 对照：Pinia（最常用轻量方案）
// · React 对照：Zustand（create 一个 store，组件内 hook 直接读/写，无 Provider 包裹）
// 📌 实战定位：Zustand 属【常规业务常用】；React 全局状态的「首选轻量方案」，API 比 Redux 简洁太多。
// 🧭 学习模式：🔧固定写法=create((set)=>({todos,add:(t)=>set(s=>({todos:[...]}))}))；组件内 const {todos,add}=useStore()；👉=练习点已填；文末对照。
// ───────────────────────────────────────────────────────────
'use client'

import { useState } from 'react'
import { useTodoStore } from './store'

const cellStyle: React.CSSProperties = {
  border: '1px solid #ccc',
  padding: '6px 10px',
  textAlign: 'left',
  verticalAlign: 'top',
}

export default function ZustandTodoPage() {
  // 用选择器分别取，避免整个 store 变化都触发本组件重渲染
  const todos = useTodoStore((s) => s.todos)
  const addTodo = useTodoStore((s) => s.addTodo)
  const toggleTodo = useTodoStore((s) => s.toggleTodo)
  const removeTodo = useTodoStore((s) => s.removeTodo)
  const editTodo = useTodoStore((s) => s.editTodo)

  const [text, setText] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editText, setEditText] = useState('')

  // 👉 增：trim 非空后 addTodo(text)，再清空输入
  const handleAdd = () => {
    if (!text.trim()) return
    addTodo(text.trim())
    setText('')
  }

  // 👉 进入编辑态：记下 id + 预填文本
  const startEdit = (t: { id: number; text: string }) => {
    setEditingId(t.id)
    setEditText(t.text)
  }

  // 👉 改（文本）：editTodo(editingId, editText) 后退出编辑态
  const handleEdit = () => {
    if (editingId != null) editTodo(editingId, editText.trim())
    setEditingId(null)
    setEditText('')
  }

  return (
    <main style={{ maxWidth: 640, margin: '40px auto', fontFamily: 'system-ui' }}>
      <h1>
        Zustand Todo <small>（learn/zustand-todo）</small>
      </h1>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleAdd()
        }}
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="👉 输入 todo 后回车添加"
        />
        <button type="submit">添加</button>
      </form>

      <ul>
        {todos.map((t) => (
          <li
            key={t.id}
            style={{ display: 'flex', gap: 8, alignItems: 'center', margin: '6px 0' }}
          >
            <input type="checkbox" checked={t.done} onChange={() => toggleTodo(t.id)} />
            {editingId === t.id ? (
              <>
                <input
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleEdit()}
                />
                <button onClick={handleEdit}>保存</button>
                <button onClick={() => setEditingId(null)}>取消</button>
              </>
            ) : (
              <>
                <span
                  style={{ textDecoration: t.done ? 'line-through' : 'none', flex: 1 }}
                >
                  {t.text}
                </span>
                <button onClick={() => startEdit(t)}>编辑</button>
                <button onClick={() => removeTodo(t.id)}>删除</button>
              </>
            )}
          </li>
        ))}
      </ul>

      {todos.length === 0 && <p>👉 列表空，添加一条试试</p>}

      {/* ④ React↔Vue2/Vue3 对照速查（Zustand ≈ Pinia / Vuex） */}
      <section
        style={{ marginTop: 32, borderTop: '2px solid #333', paddingTop: 16 }}
      >
        <h2>④ React↔Vue2/Vue3 对照速查（Zustand ≈ Pinia / Vuex）</h2>
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th style={cellStyle}>维度</th>
              <th style={cellStyle}>React Zustand</th>
              <th style={cellStyle}>Vue2 + Vuex</th>
              <th style={cellStyle}>Vue3 + Pinia</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={cellStyle}>建 store</td>
              <td style={cellStyle}>
                <code>{'create((set) => ({ todos: [], addTodo() {} }))'}</code>
              </td>
              <td style={cellStyle}>
                <code>{'new Vuex.Store({ state, mutations, actions })'}</code>
              </td>
              <td style={cellStyle}>
                <code>{"defineStore('todo', { state, actions })"}</code>
              </td>
            </tr>
            <tr>
              <td style={cellStyle}>读状态</td>
              <td style={cellStyle}>
                <code>{'useTodoStore(s => s.todos)'}</code>
              </td>
              <td style={cellStyle}>
                <code>{'this.$store.state.todos'}</code>
              </td>
              <td style={cellStyle}>
                <code>{'store.todos'}</code>
              </td>
            </tr>
            <tr>
              <td style={cellStyle}>改状态</td>
              <td style={cellStyle}>
                <b>不可变</b>：<code>{'set(s => ({ todos: [...] }))'}</code>
              </td>
              <td style={cellStyle}>
                <b>直接改</b>：<code>{'state.todos.push(t)'}</code>
              </td>
              <td style={cellStyle}>
                <b>直接改</b>：<code>{'this.todos.push(t)'}</code>
              </td>
            </tr>
            <tr>
              <td style={cellStyle}>触发</td>
              <td style={cellStyle}>
                <code>{'addTodo(text)'}</code>（action 直接调）
              </td>
              <td style={cellStyle}>
                <code>{"dispatch('addTodo', text)"}</code>
              </td>
              <td style={cellStyle}>
                <code>{'store.addTodo(text)'}</code>
              </td>
            </tr>
            <tr>
              <td style={cellStyle}>心智模型</td>
              <td style={cellStyle} colSpan={3}>
                Zustand = useReducer 的全局版：state 在模块级 store，靠 action
                函数内部 set 算新 state；组件用选择器取，互不影响重渲染。Vue 侧靠响应式拦截，可直接原地改（Pinia 最接近）。
              </td>
            </tr>
          </tbody>
        </table>
        <p style={{ color: '#666', fontSize: 13 }}>
          延伸：Zustand 与 Redux 都是“状态放哪”（二选一）；Zustand 轻、Redux
          重（见 redux-todo / redux-toolkit）。核心三步 ① 走通后，下一步 ② Zod 校验、③ Redux。
        </p>
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
            <tr className="border-b"><td className="px-2 py-1">全局方案</td><td className="px-2 py-1">Vuex</td><td className="px-2 py-1">Pinia</td><td className="px-2 py-1">Zustand / Redux</td></tr>
            <tr className="border-b"><td className="px-2 py-1">定义 store</td><td className="px-2 py-1">new Vuex.Store</td><td className="px-2 py-1">defineStore</td><td className="px-2 py-1">create((set)=>({...}))</td></tr>
            <tr className="border-b"><td className="px-2 py-1">读取</td><td className="px-2 py-1">mapState / this.$</td><td className="px-2 py-1">storeToRefs(store)</td><td className="px-2 py-1">useStore(s=&gt;s.x)</td></tr>
            <tr className="border-b"><td className="px-2 py-1">写入</td><td className="px-2 py-1">commit / dispatch</td><td className="px-2 py-1">action 直接改</td><td className="px-2 py-1">set(...) 直接改</td></tr>
          </tbody>
        </table>
        <p className="mt-2 text-gray-500">📝 小结：Zustand 不用 reducer/action 样板，set 直接改；无 Provider，import 即用，最贴近 Pinia 的爽感。</p>
      </details>
    </main>
  )
}
