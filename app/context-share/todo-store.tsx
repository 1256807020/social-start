'use client'

// 【context-share · 全局 store 范本】 app/context-share/todo-store.tsx
// 从 Vue 转 React（全局状态篇）：
//   Vue2 用 provide/inject 或 Vuex；Vue3 用 provide/inject 或 Pinia。
//   React 没有"内置 store"，最轻量的等价物 = Context（注入）+ useReducer（状态机）。
// 实战定位：把"跨组件共享的状态"在顶层 Provider 注入，任意深度的子组件用 useTodo() 直接读/写，免 prop drilling。
// 学习模式：🔧 固定写法 = createContext 建上下文 → useReducer 管状态 → Provider 包一层 → 自定义 hook 暴露给组件；👉 练习点 = 把下面 page 里的组件再拆一层，验证它们都没接收 props 却能用同一份状态。

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  type ReactNode,
} from 'react'

export interface Todo {
  id: number
  title: string
  done: boolean
}

interface State {
  list: Todo[]
  loading: boolean
  error: string | null
}

// 用「判别联合」描述所有动作，reducer 纯函数、可预测、易测试（对应 Vuex 的 mutation / Pinia 的 action）
type Action =
  | { type: 'SET_ALL'; list: Todo[] }
  | { type: 'SET_ERROR'; message: string }
  | { type: 'ADD'; todo: Todo }
  | { type: 'TOGGLE'; id: number }
  | { type: 'REMOVE'; id: number }

const initialState: State = { list: [], loading: true, error: null }

// 🔧 固定写法：reducer 永远是 (state, action) => newState 的纯函数，只 switch action.type，
// 绝不修改原 state（一律用展开 / map / filter 返回新对象，React 才能感知变化）
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_ALL':
      return { ...state, list: action.list, loading: false, error: null }
    case 'SET_ERROR':
      return { ...state, loading: false, error: action.message }
    case 'ADD':
      return { ...state, list: [action.todo, ...state.list] }
    case 'TOGGLE':
      return {
        ...state,
        list: state.list.map((t) =>
          t.id === action.id ? { ...t, done: !t.done } : t,
        ),
      }
    case 'REMOVE':
      return { ...state, list: state.list.filter((t) => t.id !== action.id) }
    default:
      return state
  }
}

interface TodoContextValue {
  state: State
  addTodo: (title: string) => Promise<void>
  toggleTodo: (id: number) => Promise<void>
  removeTodo: (id: number) => Promise<void>
}

// 🔧 固定写法：createContext 初始值用 null（而不是一个假对象），
// 这样"忘了包 Provider"会立刻抛错，而不是悄悄拿到空值导致难排查的 bug
const TodoContext = createContext<TodoContextValue | null>(null)

export function TodoProvider({ children }: { children: ReactNode }) {
  // 🔧 固定写法：useReducer(reducer, 初始状态)，返回 [当前状态, 派发函数]；
  // dispatch 身份稳定，可放心放进依赖数组；action 是触发状态变化的唯一入口
  const [state, dispatch] = useReducer(reducer, initialState)

  // 首次挂载：从 /api/todo 拉全部（走接口，不直接读 data/*.json）
  useEffect(() => {
    ;(async () => {
      try {
        const r = await fetch('/api/todo?pageSize=100&sort=-id')
        const j = await r.json()
        dispatch({ type: 'SET_ALL', list: (j.data as Todo[]) ?? [] })
      } catch (e) {
        dispatch({
          type: 'SET_ERROR',
          message: e instanceof Error ? e.message : '加载失败',
        })
      }
    })()
  }, [])

  // 🔧 固定写法：每个"改状态"的操作 = 先调接口持久化，成功后再 dispatch 本地 state，
  // 保持「服务端为真相源」，避免前端状态与后端不一致
  const addTodo = useCallback(async (title: string) => {
    const r = await fetch('/api/todo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, done: false }),
    })
    const j = await r.json()
    dispatch({ type: 'ADD', todo: j.data as Todo })
  }, [])

  const toggleTodo = useCallback(
    async (id: number) => {
      const target = state.list.find((t) => t.id === id)
      if (!target) return
      await fetch(`/api/todo/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ done: !target.done }),
      })
      dispatch({ type: 'TOGGLE', id })
    },
    [state.list],
  )

  const removeTodo = useCallback(async (id: number) => {
    await fetch(`/api/todo/${id}`, { method: 'DELETE' })
    dispatch({ type: 'REMOVE', id })
  }, [])

  // 🔧 固定写法：Provider 把 value 注入，value 里放 state + 操作函数；
  // 任意后代组件用 useContext 取出即可，无需逐层传 props（这就是"免 prop drilling"）
  return (
    <TodoContext.Provider value={{ state, addTodo, toggleTodo, removeTodo }}>
      {children}
    </TodoContext.Provider>
  )
}

// 🔧 固定写法：自定义 hook 读取 context；值为 null 时抛错，等于对"忘了包 Provider"的及早报错；
// 组件统一从这里拿 store，不直接 import 裸 Context
export function useTodo(): TodoContextValue {
  const ctx = useContext(TodoContext)
  if (!ctx) throw new Error('useTodo 必须在 <TodoProvider> 内使用')
  return ctx
}
