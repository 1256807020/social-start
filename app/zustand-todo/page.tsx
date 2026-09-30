'use client'

import { useState } from 'react'
import { useTodoStore } from './store'

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
    // if (!text.trim()) return
    // addTodo(text.trim())
    // setText('')
  }

  // 👉 进入编辑态：记下 id + 预填文本
  const startEdit = (t: { id: number; text: string }) => {
    // setEditingId(t.id)
    // setEditText(t.text)
  }

  // 👉 改（文本）：editTodo(editingId, editText) 后退出编辑态
  const handleEdit = () => {
    // if (editingId != null) editTodo(editingId, editText.trim())
    // setEditingId(null)
    // setEditText('')
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
    </main>
  )
}
