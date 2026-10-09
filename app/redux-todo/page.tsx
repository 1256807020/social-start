"use client";

import { useState } from "react";
import { Provider, useDispatch, useSelector } from "react-redux";
import {
  addTodo,
  editTodo,
  removeTodo,
  store,
  Todo,
  toggleTodo,
} from "./store";

function TodoList() {
  // 🔧 固定写法：useSelector((s) => ...) 读全局 state；s 就是 store 顶层，s.todos 取本 slice
  //    （想类型安全可写成 useSelector((s: RootState) => s.todos)）
  const todos = useSelector((s: { todos: Todo[] }) => s.todos);
  // 🔧 固定写法：useDispatch() 拿到 dispatch 函数，组件里所有「改状态」都靠它触发 action
  const dispatch = useDispatch();
  const [text, setText] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

  // 👉 增：空内容直接返回；否则 dispatch(addTodo) 后清空输入框
  const handleAdd = () => {
    if (!text.trim()) return;
    dispatch(addTodo(text.trim()));
    setText("");
  };

  // 👉 进入编辑态：记下 id + 预填文本
  const startEdit = (t: Todo) => {
    setEditingId(t.id);
    setEditText(t.text);
  };

  // 👉 改（文本）：dispatch(editTodo({ id, text })) 后退出编辑态
  const handleEdit = () => {
    if (editingId != null)
      dispatch(editTodo({ id: editingId, text: editText.trim() }));
    setEditingId(null);
    setEditText("");
  };

  return (
    <main
      style={{ maxWidth: 640, margin: "40px auto", fontFamily: "system-ui" }}
    >
      <h1>
        Redux Toolkit Todo <small>（learn/redux-todo）</small>
      </h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAdd();
        }}
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="👉 输入 todo 后回车添加"
        />
        <button type="submit">添加</button>
      </form>

      <ul>
        {todos.map((t) => (
          <li
            key={t.id}
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              margin: "6px 0",
            }}
          >
            <input
              type="checkbox"
              checked={t.done}
              onChange={() => dispatch(toggleTodo(t.id))}
            />
            {editingId === t.id ? (
              <>
                <input
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleEdit()}
                />
                <button onClick={handleEdit}>保存</button>
                <button onClick={() => setEditingId(null)}>取消</button>
              </>
            ) : (
              <>
                <span
                  style={{
                    textDecoration: t.done ? "line-through" : "none",
                    flex: 1,
                  }}
                >
                  {t.text}
                </span>
                <button onClick={() => startEdit(t)}>编辑</button>
                <button onClick={() => dispatch(removeTodo(t.id))}>删除</button>
              </>
            )}
          </li>
        ))}
      </ul>

      {todos.length === 0 && <p>👉 列表空，添加一条试试</p>}
      {/* RTK = createSlice(填 name/initialState/reducers) → actions 解构 → configureStore 装配 → <Provider> 包 → 组件 useSelector 读 / useDispatch 触发。 这套骨架是全局固定的，只有 reducer 函数体、selector、handler 是你会变的业务。对比你之前学的：Zustand 也要 create+Provider 思路但更轻；Vue3 Pinia 的 defineStore 几乎一一对应（actions 直接改 this.x，对应 RTK 的 Immer 直接改）。 */}
      {/* ④ 三种 React 状态方案对照速查（折叠，不打断练习） */}
      <details style={{ marginTop: 24, fontSize: 13 }}>
        <summary>
          ④ React 状态方案对照：useReducer / Zustand / Redux Toolkit
        </summary>
        <table
          border={1}
          cellPadding={6}
          style={{ borderCollapse: "collapse", marginTop: 8, width: "100%" }}
        >
          <thead>
            <tr>
              <th>维度</th>
              <th>useReducer（局部）</th>
              <th>Zustand（全局）</th>
              <th>Redux Toolkit（全局）</th>
              <th>Vue 对照</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>定义</td>
              <td>reducer fn + useReducer</td>
              <td>create() store</td>
              <td>createSlice + configureStore</td>
              <td>Vue3 Pinia store</td>
            </tr>
            <tr>
              <td>改状态</td>
              <td>return 新 state（不可变）</td>
              <td>{"set((s) => ({ ... })) 不可变"}</td>
              <td>state.x=... 直接改（Immer）</td>
              <td>Pinia 直接改 / Vuex mutation</td>
            </tr>
            <tr>
              <td>触发</td>
              <td>dispatch(action)</td>
              <td>调用 action 函数</td>
              <td>dispatch(action)</td>
              <td>store.xxx() / commit</td>
            </tr>
            <tr>
              <td>读状态</td>
              <td>组件内 state</td>
              <td>useStore(selector)</td>
              <td>useSelector</td>
              <td>store.xxx</td>
            </tr>
            <tr>
              <td>DevTools</td>
              <td>无</td>
              <td>需加 devtools 中间件</td>
              <td>默认自带</td>
              <td>Vue DevTools</td>
            </tr>
            <tr>
              <td>心智 ≈</td>
              <td>纯函数</td>
              <td>Pinia（要新引用）</td>
              <td>Pinia（Immer 改原地）</td>
              <td>—</td>
            </tr>
          </tbody>
        </table>
      </details>
    </main>
  );
}

export default function ReduxTodoPage() {
  // 🔧 固定写法：每个用全局 store 的页面，根部都要用 <Provider store={store}> 包一层
  //    这样内部任意组件才能 useSelector/useDispatch 取到同一个 store（否则拿不到）
  return (
    <Provider store={store}>
      <TodoList />
    </Provider>
  );
}
