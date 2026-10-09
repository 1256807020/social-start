"use client";

import { useReducer } from "react";

/**
 * useReducer：复杂状态管理（购物车）（搬运自 ReactAdm03）
 * 适合：多个关联状态、状态更新逻辑复杂（如购物车增删改数量）。
 * 每个 👉 是给你手敲的练习点（下面已给出参考实现，可对着自己写的改）。
 *
 * ───────────── 从 Vue 转 React 心智（useReducer 篇）─────────────
 * Vue 没有内置 reducer，状态逻辑靠“可变的响应式 state”：
 *   • Vue2 + Vuex：mutations 里【直接改 state】，再 commit('ADD', payload)
 *       mutations: { ADD(state, item){ state.items.push(item) } }   // 改原地，Vue 拦截到了就更新
 *       this.$store.commit('ADD', item)
 *   • Vue3 + Pinia：去掉 mutations，action 里【直接改 state】
 *       actions: { add(item){ this.items.push(item) } }            // Pinia 用 reactive，原地改即可
 *       store.add(item)
 * React 的 useReducer：reducer 是【纯函数】，必须“返回新 state”（不可变），
 *   且通过 dispatch(action) 触发，绝不直接改 state。
 *   → 一句话：Vue “改 state 本身”，React “给一个新 state”。
 * 这也是为什么下面每个 case 都用 filter / map / 展开，绝不直接 push / splice。
 * 注意：不要把 useReducer 写成 Vue 那种“副作用直接在 action 里发请求”的样子——
 *   React 里副作用走 useEffect（dispatch 只负责算新状态）。
 */

type CartItem = { id: number; name: string; price: number; qty: number };
type State = { items: CartItem[] };
type Action =
  | { type: "ADD"; item: CartItem }
  | { type: "REMOVE"; id: number }
  | { type: "CHANGE_QTY"; id: number; qty: number };

// 👉 手敲：reducer 纯函数，根据 action 返回新 state（不可变更新）
function cartReducer(state: State, action: Action): State {
  // 把 cartReducer 的三个 case 想成 Vuex 的 mutation（同步）
  switch (action.type) {
    case "ADD":
      // 👉 若已存在同 id 则 qty+1，否则追加（不可变写法）
      const exists = state.items.find((it) => it.id === action.item.id);
      if (exists) {
        return {
          items: state.items.map((it) =>
            // 在商品列表中根据id匹配，如果id相同，则返回一个新对象，qty加1，否则返回原对象
            it.id === action.item.id ? { ...it, qty: it.qty + 1 } : it
          ),
        };
      }
      return { items: [...state.items, action.item] };
    case "REMOVE":
      // 👉 filter 掉该 id
      return { items: state.items.filter((it) => it.id !== action.id) };
    case "CHANGE_QTY":
      // 👉 map 修改对应 qty（<=0 时可移除）
      if (action.qty <= 0) {
        // 删除
        return { items: state.items.filter((it) => it.id !== action.id) };
      }
      return {
        // 修改走更新索引方式
        items: state.items.map((it) =>
          it.id === action.id ? { ...it, qty: action.qty } : it
        ),
      };
    default:
      return state;
  }
}

const cellStyle: React.CSSProperties = {
  border: "1px solid #ccc",
  padding: "6px 10px",
  textAlign: "left",
  verticalAlign: "top",
};

export default function ReducerPage() {
  // useReducer 返回 [当前状态, dispatch] 这个元组，和 useState 的 [值, setter] 同构。
  // React 拿到 { items: [] } 当作第一次渲染的 state，之后每次 dispatch(action) 才调用你的 cartReducer(state, action) 算出新 state。
  // 注意：React 不会用初始值去"跑一遍" reducer——它直接把 { items: [] } 存起来当初值。（只有 reducer 里的 default 分支或某次 dispatch 才会真正进 reducer。）
  const [state, dispatch] = useReducer(cartReducer, { items: [] });
  // 计算总价，reduce
  // Array.prototype.reduce 是数组的"累加器"：把一堆元素滚成一单个值（数字、对象、数组都行）。
  //   第一个参数 callback(acc, cur, idx, arr)：
  // sum（我起的名，常叫 acc）= 累加器，上一次的返回值
  // it = 当前遍历到的元素（这里是购物车里的某项）
  // 箭头函数 return 的值，会作为下一次的 sum
  // 第二个参数 0 = 初始值（第一个 sum 从 0 开始）
  // 和Vue 的 computed 一个道理
  const total = state.items.reduce((sum, it) => sum + it.price * it.qty, 0);

  return (
    <main
      style={{ maxWidth: 720, margin: "40px auto", fontFamily: "system-ui" }}
    >
      <h1>useReducer · 购物车</h1>
      {/* dispatch 不是异步——它是同步提交（≈ Vuex commit），不能 await；异步在 useEffect/async 函数里 fetch，数据到手后才 dispatch。dispatch 一出现 = 异步 这个判断要反过来记 */}
      <button
        onClick={() =>
          dispatch({
            type: "ADD",
            item: { id: 1, name: "商品", price: 9, qty: 1 },
          })
        }
      >
        加一件（id=1）
      </button>
      <button
        style={{ marginLeft: 8 }}
        onClick={() =>
          dispatch({
            type: "ADD",
            item: { id: 2, name: "书", price: 29, qty: 1 },
          })
        }
      >
        加一件（id=2）
      </button>

      {/* 👉 渲染 state.items（名称/单价/数量 + 加减/删除按钮 dispatch 对应 action） */}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {state.items.map((it) => (
          <li
            key={it.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "8px 0",
              borderBottom: "1px solid #eee",
            }}
          >
            <span style={{ flex: 1 }}>
              {it.name}（¥{it.price}）
            </span>
            <button
              onClick={() =>
                dispatch({ type: "CHANGE_QTY", id: it.id, qty: it.qty - 1 })
              }
            >
              −
            </button>
            <span>×{it.qty}</span>
            <button
              onClick={() =>
                dispatch({ type: "CHANGE_QTY", id: it.id, qty: it.qty + 1 })
              }
            >
              ＋
            </button>
            <button
              style={{ marginLeft: 8 }}
              onClick={() => dispatch({ type: "REMOVE", id: it.id })}
            >
              删除
            </button>
          </li>
        ))}
      </ul>

      <p>合计：¥{total}</p>
      <pre>{JSON.stringify(state.items, null, 2)}</pre>

      {/* ④ React↔Vue2/Vue3 对照速查 */}
      <section
        style={{
          marginTop: 32,
          borderTop: "2px solid #333",
          paddingTop: 16,
        }}
      >
        <h2>
          ④ React↔Vue2/Vue3 对照速查（useReducer ≈ Vuex / Pinia 的 mutation /
          action）
        </h2>
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th style={cellStyle}>维度</th>
              <th style={cellStyle}>React useReducer</th>
              <th style={cellStyle}>Vue2 + Vuex</th>
              <th style={cellStyle}>Vue3 + Pinia</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={cellStyle}>定义状态</td>
              <td style={cellStyle}>
                <code>{"useReducer(reducer, { items: [] })"}</code>
              </td>
              <td style={cellStyle}>
                <code>{"state: { items: [] }"}</code>
              </td>
              <td style={cellStyle}>
                <code>{"state: () => ({ items: [] })"}</code>
              </td>
            </tr>
            <tr>
              <td style={cellStyle}>更新逻辑</td>
              <td style={cellStyle}>
                纯函数 reducer，<b>返回新 state</b>
              </td>
              <td style={cellStyle}>
                mutation，<b>直接改 state</b>
              </td>
              <td style={cellStyle}>
                action，<b>直接改 state</b>
              </td>
            </tr>
            <tr>
              <td style={cellStyle}>触发方式</td>
              <td style={cellStyle}>
                <code>{"dispatch({ type: 'ADD', item })"}</code>
              </td>
              <td style={cellStyle}>
                <code>{"this.$store.commit('ADD', item)"}</code>
              </td>
              <td style={cellStyle}>
                <code>{"store.add(item)"}</code>
              </td>
            </tr>
            <tr>
              <td style={cellStyle}>增一项</td>
              <td style={cellStyle}>
                <code>{"items: [...items, item]"}</code>
              </td>
              <td style={cellStyle}>
                <code>{"state.items.push(item)"}</code>
              </td>
              <td style={cellStyle}>
                <code>{"this.items.push(item)"}</code>
              </td>
            </tr>
            <tr>
              <td style={cellStyle}>删一项</td>
              <td style={cellStyle}>
                <code>{"items: items.filter(i => i.id !== id)"}</code>
              </td>
              <td style={cellStyle}>
                <code>{"state.items.splice(idx, 1)"}</code>
              </td>
              <td style={cellStyle}>
                <code>{"this.items.splice(idx, 1)"}</code>
              </td>
            </tr>
            <tr>
              <td style={cellStyle}>改一项</td>
              <td style={cellStyle}>
                <code>{"items.map(i => i.id === id ? { ...i, qty } : i)"}</code>
              </td>
              <td style={cellStyle}>
                <code>{"state.items[idx].qty = qty"}</code>
              </td>
              <td style={cellStyle}>
                <code>{"this.items[idx].qty = qty"}</code>
              </td>
            </tr>
            <tr>
              <td style={cellStyle}>心智模型</td>
              <td style={cellStyle} colSpan={3}>
                React 走“不可变 + dispatch 单一入口”，Vue 走“响应式拦截 +
                原地改”；二者都把“能改状态的入口”收敛到一处，便于维护与调试（Redux
                DevTools / Vue DevTools 时间旅行）。
              </td>
            </tr>
          </tbody>
        </table>
        <p style={{ color: "#666", fontSize: 13 }}>
          延伸：useReducer 是 Redux / Zustand 的内置原语——理解了 reducer +
          dispatch，再学全局状态管理会非常顺。
        </p>
      </section>
    </main>
  );
}
