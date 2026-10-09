import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export interface Todo {
  id: number
  text: string
  done: boolean
}

interface TodoState {
  todos: Todo[]
  addTodo: (text: string) => void
  toggleTodo: (id: number) => void
  removeTodo: (id: number) => void
  editTodo: (id: number, text: string) => void
}

/**
 * Zustand = useReducer 的“全局版”：
 *   组件局部的 useReducer  →  state 在组件里，靠 dispatch 触发 reducer 算新 state
 *   全局的 Zustand        →  state 在模块级 store 里，靠“action 函数”直接改（内部用 set 算新 state）
 * 共同点：都走“不可变 + 给新引用”。set((s) => ({...})) 里的 s 是旧 state，你返回的对象会浅合并进 store。
 *
 * ───────────── 从 Vue 转 React（Zustand 篇）─────────────
 * Zustand 最接近 **Vue3 Pinia**：一个全局 store + actions 里改状态。
 *   • Vue3 Pinia：
 *       defineStore('todo', {
 *         state: () => ({ todos: [] }),
 *         actions: {
 *           addTodo(text){ this.todos.push({ id: Date.now(), text, done: false }) }  // 直接改
 *         }
 *       })
 *       store.addTodo('买菜')   // 组件里直接调 action
 *   • Vue2 Vuex：多一层拆分——mutations(同步改) + actions(异步/commit)
 *       mutations: { ADD(state, t){ state.todos.push(t) } }
 *       actions:  { addTodo({ commit }, text){ commit('ADD', { id: Date.now(), text, done:false }) } }
 *       this.$store.dispatch('addTodo', '买菜')
 *   React Zustand：set((s) => ({ todos: [...] })) 必须返回新引用（不可变），不像 Vue 能原地 push。
 *   （进阶：加 immer 中间件后也能像 Pinia 那样直接“改”，但基础版先练不可变写法。）
 */
export const useTodoStore = create<TodoState>()(
  // devtools 中间件：把 store 接进 Chrome 的 Redux DevTools 扩展，
  // F12 → Redux DevTools 面板即可实时看 state 树、每次 action（addTodo/toggleTodo…）、还能时间旅行回溯。
  // 仅开发期生效，生产构建会被 tree-shake 掉，不影响性能。
  devtools((set) => ({
  todos: [],

  // 👉 增：追加到末尾（id 用 Date.now() 演示；注意不可变写法——返回新数组）
  addTodo: (text) => {
    set((s) => ({ todos: [...s.todos, { id: Date.now(), text, done: false }] }))
  },

  // 👉 改（状态）：翻转 done（map 出新的，匹配 id 的那项翻 done）
  toggleTodo: (id) => {
    set((s) => ({
      todos: s.todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    }))
  },

  // 👉 删：filter 掉该 id
  removeTodo: (id) => {
    set((s) => ({ todos: s.todos.filter((t) => t.id !== id) }))
  },

  // 👉 改（文本）：按 id 改 text
  editTodo: (id, text) => {
    set((s) => ({
      todos: s.todos.map((t) => (t.id === id ? { ...t, text } : t)),
    }))
  },
}),
{ name: 'todo-store' }, // ← DevTools 面板里显示的 store 名（多 store 时区分用）
))
