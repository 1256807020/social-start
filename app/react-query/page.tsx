"use client";

import { useState } from "react";

import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

/**
 * TanStack Query：服务端状态管理（搬运自 ReactAdm03）
 * 用基座自带的 /api/todo（列表/新增）与 /api/todo/:id（改/删）当后端，零改动，已补齐为「增删改查」完整样板。
 * 练习前先：pnpm add @tanstack/react-query
 * 每个 👉 是给你手敲的练习点。
 *
 * ───── 从 Vue 转 React（服务端状态篇）─────
 *   • TanStack Query 管「服务端状态」：接口数据 + 缓存 + loading + 自动重验。它和 redux/zustand/jotai（管「客户端状态」：表单/UI）是【不同层】，互补不替代。
 *   • Vue 对照：TanStack Query 有官方 Vue 版 `@tanstack/vue-query`（useQuery/useMutation 与 React 版一模一样）；
 *     否则 Vue 常见写法是 Pinia 存接口数据 + 手写 refetch。心智：queryKey 是缓存键，变了自动重拉；写成功后 invalidateQueries 让列表重取。
 */
const queryClient = new QueryClient();

async function fetchTodos(): Promise<{ id: number; title: string }[]> {
  const res = await fetch("/api/todo");
  // 👉 检查 res.ok，再解包
  if (!res.ok) throw new Error(`请求失败：${res.status}`);
  const json = await res.json();
  // 后端走泛型 CRUD 路由，统一返回 { code, data, msg } 信封——这里解包出真正的数组（同 lib/users-api.ts 的 unwrap）
  return Array.isArray(json?.data) ? json.data : [];
}

// 👉 新增：POST /api/todo，body: JSON.stringify({ title })
async function addTodo(title: string) {
  const res = await fetch("/api/todo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error(`新增失败：${res.status}`);
}

// 👉 改标题：PATCH /api/todo/:id，body 只传要改的字段（增量合并，其余字段保留）
async function patchTodo(id: number, patch: { title: string }) {
  const res = await fetch(`/api/todo/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error(`修改失败：${res.status}`);
}

// 👉 删除单条：DELETE /api/todo/:id
async function deleteTodo(id: number) {
  const res = await fetch(`/api/todo/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`删除失败：${res.status}`);
}

function TodoList() {
  const qc = useQueryClient();
  // 🔧 固定写法：useQuery({ queryKey, queryFn }) —— queryKey 是「缓存键」兼「依赖」（变了自动重拉）；queryFn 是真正发请求的函数
  const { data, isLoading, isError } = useQuery({
    queryKey: ["todos"],
    // queryKey: ['todos'] 是缓存键兼依赖：键变了自动重拉。
    queryFn: () => fetchTodos(), // 👉 手敲 queryFn（箭头形式，和 useMutation 视觉对齐）
  });

  // 🔧 固定写法：useMutation({ mutationFn, onSuccess }) —— mutationFn 是写请求；onSuccess 里 invalidateQueries 让相关列表「失效重取」（≈ Vue 里写后手动 this.load()）
  // queryKey: ['todos'] 是缓存键兼依赖：键变了自动重拉。
  // 写完后 invalidateQueries({queryKey:['todos']}) = 让这个键"失效"→ 自动重新 GET 刷新列表。
  // 这就是它替代你手写 setState + refetch 的地方：你只声明"依赖什么键"，它管缓存、loading、后台重验、去重、重试。
  // useMutation 就是干 C/U/D 的
  const addMutation = useMutation({
    mutationFn: (title: string) => addTodo(title),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["todos"] }), // 👉 成功后让列表重新拉取
  });

  // 🔧 固定写法（改）：useMutation 的 mutationFn 发 PATCH，onSuccess 同样 invalidate 让列表重取
  const updateMutation = useMutation({
    mutationFn: ({ id, title }: { id: number; title: string }) => patchTodo(id, { title }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["todos"] }),
  });

  // 🔧 固定写法（删）：mutationFn 发 DELETE，onSuccess invalidate 让列表重取
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteTodo(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["todos"] }),
  });

  if (isLoading) return <p>加载中…</p>;
  if (isError) return <p>出错了</p>;
  return (
    <div>
      <button
        onClick={() => addMutation.mutate("新待办")}
        disabled={addMutation.isPending}
      >
        {addMutation.isPending ? "添加中…" : "新增"}
      </button>
      <ul>
        {data?.map((t) => (
          <TodoItem
            key={t.id}
            t={t}
            onUpdate={(id, title) => updateMutation.mutate({ id, title })}
            onDelete={(id) => deleteMutation.mutate(id)}
            updatePending={updateMutation.isPending}
            deletePending={deleteMutation.isPending}
          />
        ))}
      </ul>
    </div>
  );
}

// 👉 每条用「受控 input」替代 window.prompt（更贴近真实项目）：点「改标题」切到编辑态，input 双向绑定 draft，保存时 onUpdate
function TodoItem({
  t,
  onUpdate,
  onDelete,
  updatePending,
  deletePending,
}: {
  t: { id: number; title: string }
  onUpdate: (id: number, title: string) => void
  onDelete: (id: number) => void
  updatePending: boolean
  deletePending: boolean
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(t.title)

  if (editing) {
    return (
      <li style={{ display: "flex", gap: 8, alignItems: "center", margin: "4px 0" }}>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          style={{ flex: 1 }}
          autoFocus
        />
        <button
          disabled={updatePending || !draft.trim()}
          onClick={() => {
            onUpdate(t.id, draft.trim())
            setEditing(false)
          }}
        >
          保存
        </button>
        <button onClick={() => { setEditing(false); setDraft(t.title) }}>取消</button>
      </li>
    )
  }

  return (
    <li style={{ display: "flex", gap: 8, alignItems: "center", margin: "4px 0" }}>
      <span style={{ flex: 1 }}>{t.title}</span>
      <button onClick={() => { setDraft(t.title); setEditing(true) }} disabled={updatePending}>
        改标题
      </button>
      <button onClick={() => onDelete(t.id)} disabled={deletePending}>
        删除
      </button>
    </li>
  )
}

export default function ReactQueryPage() {
  // 🔧 固定写法：根部用 <QueryClientProvider client={queryClient}> 包一层（SWR 不需要，这是 TanStack Query 的必选项）
  return (
    <QueryClientProvider client={queryClient}>
      <main
        style={{ maxWidth: 720, margin: "40px auto", fontFamily: "system-ui" }}
      >
        <h1>TanStack Query · /api/todo</h1>
        <TodoList />

        {/* ④ 服务端状态库对照速查（折叠，不打断练习） */}
        <details style={{ marginTop: 24, fontSize: 14 }}>
          <summary style={{ cursor: "pointer", fontWeight: 600 }}>
            ④ 数据获取库对照：TanStack Query / SWR / Vue
          </summary>
          <table
            style={{
              marginTop: 8,
              borderCollapse: "collapse",
              width: "100%",
              fontSize: 13,
            }}
          >
            <thead>
              <tr style={{ background: "#f3f4f6" }}>
                <th style={{ border: "1px solid #ddd", padding: "4px 8px" }}>
                  维度
                </th>
                <th style={{ border: "1px solid #ddd", padding: "4px 8px" }}>
                  TanStack Query（本分支）
                </th>
                <th style={{ border: "1px solid #ddd", padding: "4px 8px" }}>
                  SWR
                </th>
                <th style={{ border: "1px solid #ddd", padding: "4px 8px" }}>
                  Vue 对照
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ border: "1px solid #ddd", padding: "4px 8px" }}>
                  定位
                </td>
                <td style={{ border: "1px solid #ddd", padding: "4px 8px" }}>
                  服务端状态库（功能更全）
                </td>
                <td style={{ border: "1px solid #ddd", padding: "4px 8px" }}>
                  服务端状态库（轻量）
                </td>
                <td style={{ border: "1px solid #ddd", padding: "4px 8px" }}>
                  Pinia+手写refetch / @tanstack/vue-query / swrv
                </td>
              </tr>
              <tr>
                <td style={{ border: "1px solid #ddd", padding: "4px 8px" }}>
                  读数据
                </td>
                <td style={{ border: "1px solid #ddd", padding: "4px 8px" }}>
                  {"useQuery({ queryKey, queryFn })"}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "4px 8px" }}>
                  {"useSWR(key, fetcher)"}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "4px 8px" }}>
                  Pinia action 里 await 再赋值
                </td>
              </tr>
              <tr>
                <td style={{ border: "1px solid #ddd", padding: "4px 8px" }}>
                  loading
                </td>
                <td style={{ border: "1px solid #ddd", padding: "4px 8px" }}>
                  isLoading
                </td>
                <td style={{ border: "1px solid #ddd", padding: "4px 8px" }}>
                  isLoading
                </td>
                <td style={{ border: "1px solid #ddd", padding: "4px 8px" }}>
                  自己管 state.loading
                </td>
              </tr>
              <tr>
                <td style={{ border: "1px solid #ddd", padding: "4px 8px" }}>
                  刷新列表
                </td>
                <td style={{ border: "1px solid #ddd", padding: "4px 8px" }}>
                  {'invalidateQueries({ queryKey: ["todos"] })'}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "4px 8px" }}>
                  {"mutate()"}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "4px 8px" }}>
                  手动 this.load() 再拉
                </td>
              </tr>
              <tr>
                <td style={{ border: "1px solid #ddd", padding: "4px 8px" }}>
                  写操作
                </td>
                <td style={{ border: "1px solid #ddd", padding: "4px 8px" }}>
                  {"useMutation + onSuccess 失效"}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "4px 8px" }}>
                  手写 fetch + mutate()
                </td>
                <td style={{ border: "1px solid #ddd", padding: "4px 8px" }}>
                  Pinia action 写
                </td>
              </tr>
              <tr>
                <td style={{ border: "1px solid #ddd", padding: "4px 8px" }}>
                  需 Provider
                </td>
                <td style={{ border: "1px solid #ddd", padding: "4px 8px" }}>
                  是（QueryClientProvider）
                </td>
                <td style={{ border: "1px solid #ddd", padding: "4px 8px" }}>
                  否（全局默认配置）
                </td>
                <td style={{ border: "1px solid #ddd", padding: "4px 8px" }}>
                  是（QueryClientProvider）
                </td>
              </tr>
            </tbody>
          </table>
          <p style={{ marginTop: 8, color: "#666" }}>
            一句话：TanStack Query / SWR 管「服务端状态」（接口缓存 +
            自动重验），和
            redux/zustand/jotai（管「客户端状态」）是【不同层】，互补不替代。
            本分支是练习桩，👉 处（检查 res.ok / 写 queryFn / POST / PATCH /
            DELETE / invalidate）留给你手敲。
          </p>
        </details>
      </main>
    </QueryClientProvider>
  );
}
