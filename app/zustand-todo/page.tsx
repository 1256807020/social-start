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
    </main>
  )
}
