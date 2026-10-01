// 【Redux Toolkit 分支 · learn/redux-toolkit】
// 现代 Redux 标准写法：configureStore + createSlice + createAsyncThunk（替代老 redux 的 action/types/reducer 样板）。
import { createAsyncThunk, createSlice, configureStore } from '@reduxjs/toolkit'

export type Todo = { id: number; title: string; done: boolean }

const PAGE_SIZE = 8

// 异步 thunk：拉列表（API 返回信封 { code, data, total }）
export const loadTodos = createAsyncThunk(
  'todos/load',
  async (page: number) => {
    const r = await fetch(`/api/todo?page=${page}&pageSize=${PAGE_SIZE}&sort=-id`)
    const j = await r.json()
    return { list: (j.data || []) as Todo[], total: j.total || 0, page }
  },
)

export const addTodo = createAsyncThunk('todos/add', async (title: string) => {
  await fetch('/api/todo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, done: false }),
  })
})

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

export const store = configureStore({ reducer: { todos: todosSlice.reducer } })
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
