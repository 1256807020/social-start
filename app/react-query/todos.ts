/**
 * todos 的「数据访问层 + 状态层」集中在这里（TanStack Query 官方推荐的 colocation 写法）：
 *   • 数据函数 fetchTodos / addTodo / patchTodo / deleteTodo —— 只管发请求 + res.ok 校验
 *   • 自定义 hook useTodos / useAddTodo / useUpdateTodo / useDeleteTodo —— 包住 useQuery/useMutation
 * 组件（page.tsx）不再直接碰 useQuery/useMutation，也不直接碰 fetch，只消费这里的 hook。
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ───── 数据访问层（抽出去的请求函数）─────
// 👉 检查 res.ok，再解包 { code, data, msg } 信封
export async function fetchTodos(): Promise<{ id: number; title: string }[]> {
  const res = await fetch("/api/todo");
  if (!res.ok) throw new Error(`请求失败：${res.status}`);
  const json = await res.json();
  return Array.isArray(json?.data) ? json.data : [];
}

// 👉 新增：POST /api/todo，body: JSON.stringify({ title })
export async function addTodo(title: string) {
  const res = await fetch("/api/todo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error(`新增失败：${res.status}`);
}

// 👉 改标题：PATCH /api/todo/:id，body 只传要改的字段（增量合并，其余字段保留）
export async function patchTodo(id: number, patch: { title: string }) {
  const res = await fetch(`/api/todo/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error(`修改失败：${res.status}`);
}

// 👉 删除单条：DELETE /api/todo/:id
export async function deleteTodo(id: number) {
  const res = await fetch(`/api/todo/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`删除失败：${res.status}`);
}

// ───── 状态层（自定义 hook，组件只消费这些）─────
// 🔧 固定写法：useQuery({ queryKey, queryFn }) —— queryKey 是缓存键兼依赖，queryFn 指向数据函数
export function useTodos() {
  return useQuery({
    queryKey: ["todos"],
    queryFn: fetchTodos, // 👉 手敲 queryFn
  });
}

export function useAddTodo() {
  const qc = useQueryClient();
  // 🔧 固定写法（增）：mutationFn 调 addTodo，onSuccess invalidate 让列表重取
  return useMutation({
    mutationFn: (title: string) => addTodo(title),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["todos"] }), // 👉 成功后让列表重新拉取
  });
}

export function useUpdateTodo() {
  const qc = useQueryClient();
  // 🔧 固定写法（改）：mutationFn 调 patchTodo，onSuccess invalidate 让列表重取
  return useMutation({
    mutationFn: ({ id, title }: { id: number; title: string }) => patchTodo(id, { title }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["todos"] }),
  });
}

export function useDeleteTodo() {
  const qc = useQueryClient();
  // 🔧 固定写法（删）：mutationFn 调 deleteTodo，onSuccess invalidate 让列表重取
  return useMutation({
    mutationFn: (id: number) => deleteTodo(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["todos"] }),
  });
}
