/**
 * todos 的「数据访问层 + 状态层」集中在这里（SWR 官方推荐的 colocation 写法，与 react-query 的 todos.ts 对称）：
 *   • 数据函数 fetcher / createTodo / patchTodo / deleteTodo —— 只管发请求 + res.ok 校验
 *   • 自定义 hook useTodos —— 包住 useSWR，组件只消费 hook
 * SWR 没有 useMutation，写操作后统一用 useSWR 返回的 mutate() 重新校验（≈ react-query 的 invalidateQueries）。
 * 本文件是「生产级参考样板」，与 app/swr/page.tsx 的内联练习写法并存；page.tsx 不 import 它也照常跑。
 */
import useSWR from "swr";

export type Todo = { id: number; title: string; done: boolean };

// ───── 数据访问层 ─────
// 🔧 固定写法：通用 fetcher（检查 res.ok，返回原始响应）
export const fetcher = async (url: string) => {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`请求失败：${r.status}`);
  return r.json();
};

// 👉 新增：POST /api/todo
export async function createTodo(title: string) {
  const r = await fetch("/api/todo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, done: false }),
  });
  if (!r.ok) throw new Error(`新增失败：${r.status}`);
}

// 👉 改：PATCH /api/todo/:id
export async function patchTodo(id: number, p: Partial<Todo>) {
  const r = await fetch(`/api/todo/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(p),
  });
  if (!r.ok) throw new Error(`修改失败：${r.status}`);
}

// 👉 删：DELETE /api/todo/:id
export async function deleteTodo(id: number) {
  const r = await fetch(`/api/todo/${id}`, { method: "DELETE" });
  if (!r.ok) throw new Error(`删除失败：${r.status}`);
}

// ───── 状态层（自定义 hook）─────
const PAGE_SIZE = 8;

// 🔧 固定写法：useSWR(key, fetcher) —— key 是缓存键兼依赖；返回 { data, isLoading, mutate }
export function useTodos(page: number) {
  const { data, isLoading, mutate } = useSWR<{ data: Todo[]; total: number }>(
    `/api/todo?page=${page}&pageSize=${PAGE_SIZE}&sort=-id`,
    fetcher,
  );
  return {
    todos: data?.data ?? [],
    total: data?.total ?? 0,
    totalPages: Math.max(Math.ceil((data?.total ?? 0) / PAGE_SIZE), 1),
    isLoading,
    mutate, // 写操作后调用它重新校验
  };
}
