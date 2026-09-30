import { createSlice, configureStore, PayloadAction } from '@reduxjs/toolkit'

export interface Todo {
  id: number
  text: string
  done: boolean
}

const todoSlice = createSlice({
  name: 'todos',
  initialState: [] as Todo[],
  reducers: {
    // 👉 增：createSlice 内置 Immer，直接 push 即可（不用 return 新数组）
    addTodo: (state, action: PayloadAction<string>) => {
      // state.push({ id: Date.now(), text: action.payload, done: false })
    },
    // 👉 改（状态）：翻转 done
    toggleTodo: (state, action: PayloadAction<number>) => {
      // const t = state.find((x) => x.id === action.payload); if (t) t.done = !t.done
    },
    // 👉 删：用 filter 返回新数组（Immer 下也可直接 state.splice，但 filter 最直观）
    removeTodo: (state, action: PayloadAction<number>) => {
      // return state.filter((x) => x.id !== action.payload)
    },
    // 👉 改（文本）：按 id 改 text
    editTodo: (state, action: PayloadAction<{ id: number; text: string }>) => {
      // const t = state.find((x) => x.id === action.payload.id); if (t) t.text = action.payload.text
    },
  },
})

export const { addTodo, toggleTodo, removeTodo, editTodo } = todoSlice.actions

// 👉 每个页面自带一个 store 实例（演示用）；正式项目通常在 app 根部用 <Provider store={store}> 包一层
export const store = configureStore({ reducer: { todos: todoSlice.reducer } })
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
