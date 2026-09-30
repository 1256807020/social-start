import { create } from 'zustand'

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

// 用 zustand 的 create 建一个全局 store。组件用 useTodoStore(选择器) 取，互不干扰重渲染。
export const useTodoStore = create<TodoState>((set) => ({
  todos: [],

  // 👉 增：把新 todo 追加到数组末尾（id 用 Date.now() 演示，正式可换后端返回的真实 id）
  addTodo: (text) => {
    // set((s) => ({ todos: [...s.todos, { id: Date.now(), text, done: false }] }))
  },

  // 👉 改（状态）：翻转 done
  toggleTodo: (id) => {
    // set((s) => ({ todos: s.todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)) }))
  },

  // 👉 删：过滤掉该 id
  removeTodo: (id) => {
    // set((s) => ({ todos: s.todos.filter((t) => t.id !== id) }))
  },

  // 👉 改（文本）：按 id 改 text
  editTodo: (id, text) => {
    // set((s) => ({ todos: s.todos.map((t) => (t.id === id ? { ...t, text } : t)) }))
  },
}))
