'use client'

import { Provider, useDispatch, useSelector } from 'react-redux'
import { useState } from 'react'
import { store, addTodo, toggleTodo, removeTodo, editTodo, Todo } from './store'

function TodoList() {
  const todos = useSelector((s: { todos: Todo[] }) => s.todos)
  const dispatch = useDispatch()
  const [text, setText] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editText, setEditText] = useState('')

  // 👉 增：dispatch(addTodo(text.trim())) 后清空
  const handleAdd = () => {
    // if (!text.trim()) return
    // dispatch(addTodo(text.trim()))
    // setText('')
  }

  // 👉 进入编辑态：记下 id + 预填文本
  const startEdit = (t: Todo) => {
    // setEditingId(t.id)
    // setEditText(t.text)
  }

  // 👉 改（文本）：dispatch(editTodo({ id: editingId!, text: editText.trim() })) 后退出
  const handleEdit = () => {
    // if (editingId != null) dispatch(editTodo({ id: editingId, text: editText.trim() }))
    // setEditingId(null)
    // setEditText('')
  }

  return (
    <main style={{ maxWidth: 640, margin: '40px auto', fontFamily: 'system-ui' }}>
      <h1>
        Redux Toolkit Todo <small>（learn/redux-todo）</small>
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
            <input
              type="checkbox"
              checked={t.done}
              onChange={() => dispatch(toggleTodo(t.id))}
            />
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
                <button onClick={() => dispatch(removeTodo(t.id))}>删除</button>
              </>
            )}
          </li>
        ))}
      </ul>

      {todos.length === 0 && <p>👉 列表空，添加一条试试</p>}
    </main>
  )
}

export default function ReduxTodoPage() {
  return (
    <Provider store={store}>
      <TodoList />
    </Provider>
  )
}
