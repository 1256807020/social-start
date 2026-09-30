'use client'

import { useReducer } from 'react'

/**
 * useReducer：复杂状态管理（购物车）（搬运自 ReactAdm03）
 * 适合：多个关联状态、状态更新逻辑复杂（如购物车增删改数量）。
 * 每个 👉 是给你手敲的练习点。
 */

type CartItem = { id: number; name: string; price: number; qty: number }
type State = { items: CartItem[] }
type Action =
  | { type: 'ADD'; item: CartItem }
  | { type: 'REMOVE'; id: number }
  | { type: 'CHANGE_QTY'; id: number; qty: number }

// 👉 手敲：reducer 纯函数，根据 action 返回新 state（不可变更新）
function cartReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD':
      // 👉 若已存在同 id 则 qty+1，否则追加
      return state
    case 'REMOVE':
      // 👉 filter 掉该 id
      return state
    case 'CHANGE_QTY':
      // 👉 map 修改对应 qty（<=0 时可移除）
      return state
    default:
      return state
  }
}

export default function ReducerPage() {
  const [state, dispatch] = useReducer(cartReducer, { items: [] })
  return (
    <main style={{ maxWidth: 720, margin: '40px auto', fontFamily: 'system-ui' }}>
      <h1>useReducer · 购物车</h1>
      <button
        onClick={() =>
          dispatch({
            type: 'ADD',
            item: { id: 1, name: '商品', price: 9, qty: 1 },
          })
        }
      >
        加一件
      </button>
      {/* 👉 渲染 state.items（名称/单价/数量 + 加减/删除按钮 dispatch 对应 action） */}
      <pre>{JSON.stringify(state.items, null, 2)}</pre>
    </main>
  )
}
