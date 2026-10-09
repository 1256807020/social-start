import { createSlice, configureStore, PayloadAction } from '@reduxjs/toolkit'

export interface Todo {
  id: number
  text: string
  done: boolean
}

/**
 * Redux Toolkit（RTK）= Redux 官方推荐写法，是「最像 Vue 的 Redux」：
 *   • createSlice 把 state + reducers(action) 写在一起，底层用 Immer，
 *     所以 reducers 里能 **直接 state.push / state.x = ...**（改原地），
 *     不用像纯 Redux 那样 return {...} 不可变 —— 心智和 Vue3 Pinia 一样。
 *   • configureStore 自动组合 reducer + **默认自带 Redux DevTools**（不用额外中间件，
 *     这点不同于 Zustand：Zustand 要手动加 devtools 中间件）。
 *   • 组件侧用 <Provider store> 包一层 + useSelector(读) / useDispatch(触发)，
 *     全局状态任何组件都能取，不用 props 层层传。
 *
 * ───── 从 Vue 转 React（Redux 篇）─────
 *   • Vue3 Pinia：actions 里直接 this.todos.push(...) / this.t.done = !this.done —— 和 RTK 的 Immer 写法几乎一致。
 *   • Vue2 Vuex：多一层拆分 mutations(同步改 state) + actions(异步/commit)；RTK 用 createAsyncThunk 处理异步。
 *   对比上一支 zustand-todo：Zustand 也是全局 store + 直接改，但 set 要 return 新引用（除非加 immer 中间件）；
 *   RTK 默认就 Immer，所以「最像 Vue」。
 */
// 🔧 固定写法：createSlice 的 { name, initialState, reducers } 是 RTK 的「标准三件套」骨架
//    ├─ name         ：slice 名（DevTools 里显示的标签），随意起
//    ├─ initialState ：初始 state（这里用 as Todo[] 给空数组标类型）
//    └─ reducers     ：每个 reducer = 一个 action，函数体才是你要写的「业务」；其余都是固定框
const todoSlice = createSlice({
  name: 'todos',
  initialState: [] as Todo[],
  reducers: {
    // 👉 增：createSlice 内置 Immer，直接 push 即可（不用 return 新数组）
    // 🔧 固定写法：第二个参数统一是 action，类型用 PayloadAction<T> 包一层（T=携带的数据类型）
    //    action.payload 就是 dispatch 时传进来的数据；函数体才是你要写的业务
    addTodo: (state, action: PayloadAction<string>) => {
      state.push({ id: Date.now(), text: action.payload, done: false })
    },
    // 👉 改（状态）：翻转 done（Immer 下直接改原对象，像 Vue 那样）
    toggleTodo: (state, action: PayloadAction<number>) => {
      const t = state.find((x) => x.id === action.payload)
      if (t) t.done = !t.done
    },
    // 👉 删：返回 filter 新数组（Immer 下也可直接 state.splice，但 filter 最直观）
    removeTodo: (state, action: PayloadAction<number>) => {
      return state.filter((x) => x.id !== action.payload)
    },
    // 👉 改（文本）：按 id 改 text（Immer 下直接改）
    editTodo: (state, action: PayloadAction<{ id: number; text: string }>) => {
      const t = state.find((x) => x.id === action.payload.id)
      if (t) t.text = action.payload.text
    },
  },
})

// 🔧 固定写法：从 slice.actions 自动解构导出「action creators」
//    RTK 会按 reducer 名自动生成 addTodo/toggleTodo...，dispatch 时直接用，名字别改
export const { addTodo, toggleTodo, removeTodo, editTodo } = todoSlice.actions

// 👉 每个页面自带一个 store 实例（演示用）；正式项目通常在 app 根部用 <Provider store={store}> 包一层
// 🔧 固定写法：configureStore 装配 store；reducer 对象的「键名」(todos) = 顶层 state 字段名
//    （即组件里 useSelector(s => s.todos) 取到的就是它）
export const store = configureStore({ reducer: { todos: todoSlice.reducer } })
// 🔧 固定写法：用 ReturnType<typeof store.getState> 推导全局 state 类型（官方推荐，给 useSelector 用）
export type RootState = ReturnType<typeof store.getState>
// 🔧 固定写法：推导 dispatch 类型（可选，组件里要用「带类型的 dispatch」时方便）
export type AppDispatch = typeof store.dispatch
