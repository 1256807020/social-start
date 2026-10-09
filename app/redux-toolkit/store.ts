// 【Redux Toolkit 分支 · learn/redux-toolkit】
// 现代 Redux 标准写法：configureStore + createSlice + createAsyncThunk（替代老 redux 的 action/types/reducer 样板）。
// 相比 learn/redux-todo（内存版、纯同步）：本分支用 createAsyncThunk 连真实后端 /api/todo，并演示「异步生命周期」pending/fulfilled/rejected。
//
// ───── 从 Vue 转 React（RTK 异步篇）─────
//   • Vuex：把「异步」放 action（dispatch 触发）、「同步改 state」放 mutation（commit 触发）；
//           RTK 的 createAsyncThunk ≈ Vuex 的 async action，extraReducers 里 .addCase(loadTodos.pending/fulfilled/rejected) ≈ 在 action 不同阶段的 mutation。
//   • Vue3 / Pinia：async action 里直接 await axios 再 this.xxx = res.data；
//           RTK 的 createAsyncThunk 里直接 await fetch，再在 fulfilled 里 s.xxx = payload（Immer 直接改，≈ Pinia 直接改 state）。
//   共同点：异步请求都「先置 loading=true → 拿到数据写 state → loading=false」，数据流方向一模一样。
//   区别：Vuex 强制 action/mutation 两层拆分；RTK 用 thunk+extraReducers 一体化，Pinia 最松（action 里直接改）。
import { createAsyncThunk, createSlice, configureStore } from '@reduxjs/toolkit'

export type Todo = { id: number; title: string; done: boolean }

const PAGE_SIZE = 8

// 异步 thunk：拉列表（API 返回信封 { code, data, total }）
// 🔧 固定写法：createAsyncThunk('类型前缀', async (参数) => { ... return 数据 })
//   ├─ 第 1 参 'todos/load'：类型前缀字符串（DevTools 里显示为 todos/load/pending 等），随便起但要唯一
//   ├─ 第 2 参：async 函数 = 「真正干活的异步逻辑」，return 的东西会进 fulfilled 的 action.payload
//   └─ 返回值 createAsyncThunk 会自动生成 loadTodos 这个「thunk action creator」（dispatch(loadTodos(1)) 即可触发）
export const loadTodos = createAsyncThunk(
  'todos/load',
  async (page: number) => {
    const r = await fetch(`/api/todo?page=${page}&pageSize=${PAGE_SIZE}&sort=-id`)
    const j = await r.json()
    return { list: (j.data || []) as Todo[], total: j.total || 0, page }
  },
)

// 🔧 固定写法：每个异步操作 = 一个 createAsyncThunk；参数就是 dispatch 时传进来的数据
export const addTodo = createAsyncThunk('todos/add', async (title: string) => {
  await fetch('/api/todo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, done: false }),
  })
})

// 🔧 固定写法：thunk 需要多个参数时，用对象包一层 { id, patch }，组件 dispatch(patchTodo({ id, patch }))
export const patchTodo = createAsyncThunk(
  'todos/patch',
  async ({ id, patch }: { id: number; patch: Partial<Todo> }) => {
    await fetch(`/api/todo/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    })
  },
)

export const removeTodo = createAsyncThunk('todos/remove', async (id: number) => {
  await fetch(`/api/todo/${id}`, { method: 'DELETE' })
})

const todosSlice = createSlice({
  name: 'todos',
  initialState: { list: [] as Todo[], total: 0, page: 1, loading: false },
  reducers: {},
  // 只有 loadTodos 真正改 state；写操作后由组件重新 dispatch loadTodos 刷新
  // 🔧 固定写法：extraReducers 用 .addCase(thunk.某阶段, (state, action) => { ... }) 接「异步生命周期」
  //   ├─ thunk.pending    ：请求发出（这里置 loading=true）
  //   ├─ thunk.fulfilled  ：成功，action.payload = thunk return 的值（Immer 直接改 state）
  //   └─ thunk.rejected   ：失败（这里也别忘了 loading=false）
  //   注意用 (b) => b.addCase(...).addCase(...) 链式写法；reducers 里写同步逻辑，extraReducers 写「接 thunk 结果」
  extraReducers: (b) => {
    b.addCase(loadTodos.pending, (s) => {
      s.loading = true
    })
      .addCase(loadTodos.fulfilled, (s, a) => {
        s.list = a.payload.list
        s.total = a.payload.total
        s.page = a.payload.page
        s.loading = false
      })
      .addCase(loadTodos.rejected, (s) => {
        s.loading = false
      })
  },
})

// 🔧 固定写法：configureStore 装配；reducer 键名 todos = 顶层 state 字段（useSelector(s => s.todos) 取到它）
export const store = configureStore({ reducer: { todos: todosSlice.reducer } })
// 🔧 固定写法：推导全局 state 类型（给 useSelector 用）
export type RootState = ReturnType<typeof store.getState>
// 🔧 固定写法：推导 dispatch 类型（组件里用 useDispatch<AppDispatch>() 才能 dispatch thunk 并 .then）
export type AppDispatch = typeof store.dispatch
