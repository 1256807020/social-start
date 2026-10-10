"use client";

// ============================================================
// React 手敲练习 · D 版 worksheet：库托管缓存（React Query）
// 这是 A / B / C 三种“手写策略”的【生产级终极形态】：
//   - useQuery 接管 GET（自带缓存、后台重验、loading/error 状态）
//   - useMutation 接管 增/改/删，onMutate 做乐观更新、onError 回滚、onSettled 失效重拉
//   → 等于把 B（乐观+回滚）和 C（自动重拉对齐）打包好了，你只写业务。
// Vue2 对照：和你已学的 react-query/swr 分支一致——Vue 对应 @tanstack/vue-query / swrv，
//           useQuery≈swrv 的 useSWR，onMutate 乐观+invalidate 重验≈Vue 里手动 refetch。
// 老师只搭外壳 + 说明，所有标 👉 的地方由【你】手写完成。
// ============================================================

import { useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

type Todo = {
  id: number;
  title: string;
  done: boolean;
  createdAt?: string;
  updatedAt?: string;
};

const queryKey = ["react-learn-todos"] as const;

function CacheInner() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");

  // 🔧 固定写法：练习 1 —— useQuery 接管 GET（自带缓存/后台重验/loading）
  const { data: list = [], isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const resp = await fetch(`/api/react-learn?page=1&pageSize=5&sort=-id`);
      const j = await resp.json();
      return j.data as Todo[];
    },
  });

  // 🔧 固定写法：练习 2 —— 新增（乐观插入 + 失败回滚 + 失效重拉，全由库托管）
  const addMutation = useMutation({
    mutationFn: async (title: string) => {
      const resp = await fetch("/api/react-learn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, done: false }),
      });
      return (await resp.json()).data as Todo;
    },
    onMutate: async (title) => {
      await queryClient.cancelQueries({ queryKey }); // 1) 取消进行中的拉取
      const prev = queryClient.getQueryData<Todo[]>(queryKey); // 2) 快照当前数据
      const temp: Todo = { id: Date.now(), title, done: false }; // 3) 临时项
      queryClient.setQueryData<Todo[]>(queryKey, (old = []) => [temp, ...old]); // 4) 乐观插入
      return { prev }; // 5) 交给 onError 回滚
    },
    onError: (_e, _v, ctx) => {
      queryClient.setQueryData(queryKey, ctx?.prev); // 出错 → 还原快照
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey }); // 最终和后端对齐（= C 的「重拉」）
    },
  });

  // 🔧 固定写法：练习 3 —— 改（乐观改标题 + 回滚 + 失效）
  const editMutation = useMutation({
    mutationFn: async ({ id, title }: { id: number; title: string }) => {
      const resp = await fetch(`/api/react-learn/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      return (await resp.json()).data as Todo;
    },
    onMutate: async ({ id, title }) => {
      await queryClient.cancelQueries({ queryKey });
      const prev = queryClient.getQueryData<Todo[]>(queryKey);
      queryClient.setQueryData<Todo[]>(queryKey, (old = []) =>
        old.map((t) => (t.id === id ? { ...t, title } : t)),
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      queryClient.setQueryData(queryKey, ctx?.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // 🔧 固定写法：练习 4 —— 删（乐观过滤 + 回滚 + 失效）
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await fetch(`/api/react-learn/${id}`, { method: "DELETE" });
      return id;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey });
      const prev = queryClient.getQueryData<Todo[]>(queryKey);
      queryClient.setQueryData<Todo[]>(queryKey, (old = []) =>
        old.filter((t) => t.id !== id),
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      queryClient.setQueryData(queryKey, ctx?.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // 进入编辑态（和 B/C 版一致）
  const startEdit = (item: Todo) => {
    setEditingId(item.id);
    setEditingText(item.title);
  };

  return (
    <main className="mx-auto max-w-3xl space-y-4 p-6">
      <h1 className="text-2xl font-bold">D 版 · React Query 托管缓存（乐观 + 自动重拉）</h1>
      <p className="text-sm text-gray-500">
        路由 /react-learn/cache ｜ A/B/C 的终极形态：乐观+回滚+失效重拉全由库托管
      </p>
      {isLoading && <p className="text-gray-500">加载中…</p>}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          addMutation.mutate(title); // 🔧 固定写法：提交直接触发乐观新增
          setTitle("");
        }}
        className="flex gap-2"
      >
        <input
          className="flex-1 rounded border px-2 py-1"
          placeholder="新待办标题"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button className="rounded bg-blue-600 px-3 py-1 text-white" type="submit">
          新增
        </button>
      </form>

      <ul className="space-y-2">
        {list.map((item) => (
          <li key={item.id} className="flex items-center gap-2 border-b py-1">
            {editingId === item.id ? (
              <>
                <input
                  className="flex-1 rounded border px-2 py-1"
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                />
                <span
                  className="cursor-pointer text-green-600"
                  onClick={() => {
                    editMutation.mutate({ id: item.id, title: editingText });
                    setEditingId(null);
                  }}
                >
                  保存
                </span>
                <span
                  className="cursor-pointer text-gray-500"
                  onClick={() => setEditingId(null)}
                >
                  取消
                </span>
              </>
            ) : (
              <>
                <span className="flex-1">
                  #{item.id} {item.title}
                </span>
                <span
                  className="cursor-pointer text-blue-600"
                  onClick={() => startEdit(item)}
                >
                  修改
                </span>
              </>
            )}
            <span
              className="cursor-pointer text-red-600"
              onClick={() => deleteMutation.mutate(item.id)}
            >
              删除
            </span>
          </li>
        ))}
      </ul>

      {list.length === 0 && (
        <p className="text-gray-500">暂无数据，快去上面新增一条吧～</p>
      )}
    </main>
  );
}

export default function CachePage() {
  // React Query 要求外层有 QueryClientProvider； worksheet 里自包含创建一个即可
  const [client] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={client}>
      <CacheInner />
    </QueryClientProvider>
  );
}

/*
=== 接口契约（和 A / B / C 版完全一致，共用 /api/react-learn）===
POST   /api/react-learn              body:{title,done?}   resp:{code,data:{id,title,done,...}}
GET    /api/react-learn?page=1&pageSize=5&sort=-id   resp:{code,data:[...],total,totalPages}
PATCH  /api/react-learn/:id          body:{title}        resp:{code,data}
DELETE /api/react-learn/:id          resp:{code}
*/
