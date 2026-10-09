'use client'

// RTK 页面：用 react-redux 的 Provider + useSelector/useDispatch 连接 store。
// ───── 从 Vue 转 React（RTK 组件篇）─────
//   • Vue3/Pinia：组件里 storeToRefs(store) 读、async action 里 await 后直接改；这里 useSelector 读、useDispatch 触发 thunk。
//   • Vue2/Vuex：this.$store.dispatch('load') 触发 action、action 里 commit 改 state；这里 dispatch(loadTodos(1)) 触发 thunk、thunk 在 fulfilled 里 Immer 改 state。
//   关键技巧：RTK 的 dispatch(thunk()) 返回 Promise，所以能 .then(reload) 在「请求成功后」自动刷新列表（≈ Vuex action 的 await 后再次 dispatch）。
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
  // 🔧 固定写法：useDispatch<AppDispatch>() 拿「带类型的 dispatch」——只有用 AppDispatch 才能 dispatch(thunk()) 并 .then(...)
  const dispatch = useDispatch<AppDispatch>()
  // 🔧 固定写法：useSelector((s: RootState) => s.todos) 读全局 state；s.todos 取本 slice（键名=configureStore 里的 reducer 键）
  const { list, total, page, loading } = useSelector((s: RootState) => s.todos)
  const [title, setTitle] = useState('')
  const [editing, setEditing] = useState<{ id: number; title: string } | null>(null)

  useEffect(() => {
    dispatch(loadTodos(1))
  }, [dispatch])

  // 🔧 固定写法：dispatch(thunk()) 返回 Promise（thunk 内部 await 完才 resolve），所以能 .then(...) 在「写操作成功后」重新拉列表刷新
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

      {/* ④ RTK 异步 CRUD 对照速查（折叠，不打断练习） */}
      <details className="mt-6 text-sm">
        <summary className="cursor-pointer font-medium">④ 状态方案对照：Redux Toolkit / Vue3(Pinia) / Vue2(Vuex)</summary>
        <table className="mt-2 w-full border-collapse border border-border text-left">
          <thead>
            <tr className="bg-muted">
              <th className="border border-border px-2 py-1">维度</th>
              <th className="border border-border px-2 py-1">Redux Toolkit（本分支）</th>
              <th className="border border-border px-2 py-1">Vue3 · Pinia</th>
              <th className="border border-border px-2 py-1">Vue2 · Vuex</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-border px-2 py-1">store 定义</td>
              <td className="border border-border px-2 py-1">createSlice + configureStore</td>
              <td className="border border-border px-2 py-1">defineStore</td>
              <td className="border border-border px-2 py-1">new Vuex.Store</td>
            </tr>
            <tr>
              <td className="border border-border px-2 py-1">异步拉数据</td>
              <td className="border border-border px-2 py-1">createAsyncThunk('todos/load', async (p) =&gt; fetch...)</td>
              <td className="border border-border px-2 py-1">async load() 里 await axios 再 this.list = res.data</td>
              <td className="border border-border px-2 py-1">actions.load 里 await 再 commit('setList', res.data)</td>
            </tr>
            <tr>
              <td className="border border-border px-2 py-1">改状态</td>
              <td className="border border-border px-2 py-1">thunk fulfilled 里 s.list = payload（Immer 直接改）</td>
              <td className="border border-border px-2 py-1">action 里 this.list = ... 直接改</td>
              <td className="border border-border px-2 py-1">mutations.setList(s, d) 里 s.list = d</td>
            </tr>
            <tr>
              <td className="border border-border px-2 py-1">loading 态</td>
              <td className="border border-border px-2 py-1">extraReducers：pending=true / fulfilled=false</td>
              <td className="border border-border px-2 py-1">action 里 this.loading = true/false</td>
              <td className="border border-border px-2 py-1">state.loading + mutation 里改</td>
            </tr>
            <tr>
              <td className="border border-border px-2 py-1">触发</td>
              <td className="border border-border px-2 py-1">dispatch(loadTodos(1))（返回 Promise 可 .then）</td>
              <td className="border border-border px-2 py-1">store.load()</td>
              <td className="border border-border px-2 py-1">this.$store.dispatch('load')</td>
            </tr>
            <tr>
              <td className="border border-border px-2 py-1">读</td>
              <td className="border border-border px-2 py-1">useSelector(s =&gt; s.todos)</td>
              <td className="border border-border px-2 py-1">storeToRefs(store)</td>
              <td className="border border-border px-2 py-1">this.$store.state</td>
            </tr>
            <tr>
              <td className="border border-border px-2 py-1">DevTools</td>
              <td className="border border-border px-2 py-1">configureStore 默认自带</td>
              <td className="border border-border px-2 py-1">Vue DevTools</td>
              <td className="border border-border px-2 py-1">Vue DevTools</td>
            </tr>
          </tbody>
        </table>
        <p className="mt-2 text-gray-500">
          一句话：RTK 的 createAsyncThunk ≈ Vuex 的 async action（或 Pinia 的 async action）；extraReducers 接 pending/fulfilled/rejected ≈
          在请求各阶段「改 state」。区别仅在于 Pinia 最松（action 里直接改）、Vuex 强制 action/mutation 两层、RTK 用 thunk+Immer 一体化。
        </p>
      </details>
    </main>
  )
}

export default function ReduxToolkitPage() {
  // 🔧 固定写法：页面根部用 <Provider store={store}> 包一层，内部组件才能 useSelector/useDispatch 取到同一个 store
  return (
    <Provider store={store}>
      <TodoApp />
    </Provider>
  )
}
