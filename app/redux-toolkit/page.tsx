'use client'

// RTK 页面：用 react-redux 的 Provider + useSelector/useDispatch 连接 store。
import { useEffect, useState } from 'react'
import { Provider, useDispatch, useSelector } from 'react-redux'
import {
  store,
  loadTodos,
  addTodo,
  patchTodo,
  removeTodo,
  type RootState,
  type AppDispatch,
  type Todo,
} from './store'

const PAGE_SIZE = 8

function TodoApp() {
  const dispatch = useDispatch<AppDispatch>()
  const { list, total, page, loading } = useSelector((s: RootState) => s.todos)
  const [title, setTitle] = useState('')
  const [editing, setEditing] = useState<{ id: number; title: string } | null>(null)

  useEffect(() => {
    dispatch(loadTodos(1))
  }, [dispatch])

  const reload = () => dispatch(loadTodos(page))

  const totalPages = Math.max(Math.ceil(total / PAGE_SIZE), 1)

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-4">
      <h1 className="text-2xl font-bold">Redux Toolkit · createSlice + createAsyncThunk · app/redux-toolkit</h1>
      <p className="text-sm text-gray-500">
        现代 Redux 标准写法（取代老 redux 的 action/types/reducer 样板）。loading={String(loading)}。
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (!title.trim()) return
          dispatch(addTodo(title)).then(() => setTitle('')).then(reload)
        }}
        className="flex gap-2"
      >
        <input
          className="flex-1 rounded border px-2 py-1"
          placeholder="新待办标题"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button className="rounded bg-blue-600 px-3 py-1 text-white" type="submit">
          新增
        </button>
        <button className="rounded border px-3 py-1" type="button" onClick={reload}>
          刷新
        </button>
      </form>

      {loading && <p className="text-sm text-gray-400">加载中…</p>}

      <ul className="space-y-2">
        {list.map((t) => (
          <li key={t.id} className="flex items-center gap-2 border-b py-1">
            <input type="checkbox" checked={!!t.done} onChange={() => dispatch(patchTodo({ id: t.id, patch: { done: !t.done } })).then(reload)} />
            {editing?.id === t.id ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  dispatch(patchTodo({ id: t.id, patch: { title: editing.title } })).then(() => setEditing(null)).then(reload)
                }}
                className="flex flex-1 gap-2"
              >
                <input
                  className="flex-1 rounded border px-2 py-1"
                  value={editing?.title ?? ''}
                  onChange={(e) => setEditing({ id: t.id, title: e.target.value })}
                />
                <button className="rounded bg-green-600 px-2 py-1 text-white" type="submit">
                  保存
                </button>
              </form>
            ) : (
              <span className={`flex-1 ${t.done ? 'line-through text-gray-400' : ''}`} onDoubleClick={() => setEditing({ id: t.id, title: t.title })}>
                #{t.id} {t.title}
              </span>
            )}
            <button className="text-sm text-blue-600" onClick={() => setEditing({ id: t.id, title: t.title })}>
              改
            </button>
            <button className="text-sm text-red-600" onClick={() => dispatch(removeTodo(t.id)).then(reload)}>
              删
            </button>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between text-sm">
        <button
          className="px-2 py-1 border rounded disabled:opacity-40"
          disabled={page <= 1}
          onClick={() => dispatch(loadTodos(page - 1))}
        >
          上一页
        </button>
        <span>
          {page} / {totalPages}（共 {total}）
        </span>
        <button className="px-2 py-1 border rounded disabled:opacity-40" disabled={page >= totalPages} onClick={() => dispatch(loadTodos(page + 1))}>
          下一页
        </button>
      </div>
    </main>
  )
}

export default function ReduxToolkitPage() {
  return (
    <Provider store={store}>
      <TodoApp />
    </Provider>
  )
}
