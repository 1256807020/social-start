"use client";

// ============================================================
// React 手敲练习 · D 版 worksheet：库托管缓存（React Query）
// 这是 A / B / C 三种“手写策略”的【生产级终极形态】：
//   - useQuery 接管 GET（自带缓存、后台重验、loading/error 状态）
//   - useMutation 接管 增/改/删，onMutate 做乐观更新、onError 回滚、onSettled 失效重拉
//   → 等于把 B（乐观+回滚）和 C（自动重拉对齐）打包好了，你只写业务。
//
// ┌─────────── 四种形态对比（同一套 /api/react-learn） ───────────┐
// │ 形态 │ 增/改/删          │ 重拉?          │ 回滚?       │ 手写量 │
// │ A    │ 删乐观,增改读返回 │ 仅挂载一次     │ 删不回滚❌  │ 中     │
// │ B    │ 全乐观           │ 永不重拉       │ ✅ try回滚  │ 多     │
// │ C    │ 请求后统一重拉   │ 每次都拉       │ 不需要      │ 中     │
// │ D    │ 乐观(onMutate)   │ 失效后自动重拉 │ ✅ 内置回滚 │ 少✅   │
// └────────────────────────────────────────────────────────────┘
// 真实项目首选 D：你不必再手写“临时 id / 快照 / 还原”，库全包了。
//
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

// 👉 练习 1：用 useQuery 拉列表（替代手写 useEffect + getList）
//   useQuery({
//     queryKey,                              // 缓存钥匙，mutation 靠它失效
//     queryFn: async () => {
//       const resp = await fetch(`/api/react-learn?page=1&pageSize=5&sort=-id`);
//       const j = await resp.json();
//       return j.data as Todo[];             // 返回的数据就是 list
//     },
//   })
// 拿到 { data: Todo[], isLoading, isError } —— 直接用，不用自己管 loading。

// 👉 练习 2：useMutation 做“新增”，带乐观 + 回滚 + 失效重拉
//   const addMutation = useMutation({
//     mutationFn: async (title: string) => {
//       const resp = await fetch('/api/react-learn', {
//         method:'POST', headers:{'Content-Type':'application/json'},
//         body: JSON.stringify({ title, done:false }),
//       });
//       return (await resp.json()).data as Todo;
//     },
//     onMutate: async (title) => {
//       await queryClient.cancelQueries({ queryKey });        // 1) 取消进行中的拉取
//       const prev = queryClient.getQueryData<Todo[]>(queryKey); // 2) 快照当前数据
//       const temp: Todo = { id: Date.now(), title, done:false }; // 3) 临时项
//       queryClient.setQueryData<Todo[]>(queryKey, (old=[]) => [temp, ...old]); // 4) 乐观插入
//       return { prev };                                       // 5) 把快照交给 onError 回滚
//     },
//     onError: (_e, _v, ctx) => {
//       queryClient.setQueryData(queryKey, ctx?.prev);         // 出错 → 还原快照（回滚！）
//     },
//     onSettled: () => {
//       queryClient.invalidateQueries({ queryKey });           // 最终和后端对齐（= C 的“重拉”）
//     },
//   });

// 👉 练习 3：useMutation 做“改”（乐观改标题 + 回滚 + 失效），结构同上，mutationFn 用 PATCH、onMutate 里 setQueryData 把对应 id 的 title 换掉。
// 👉 练习 4：useMutation 做“删”（乐观过滤掉 + 回滚 + 失效），onMutate 里 setQueryData filter 掉该 id，onError 还原 prev。
// 👉 练习 5：UI —— 表单 onSubmit 调 addMutation.mutate(title)；列表每条的“保存”调 editMutation.mutate(...)， “删除”调 deleteMutation.mutate(id)。

function CacheInner() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");

  // 👉 在这里写 练习 1 的 useQuery（得到 data / isLoading）
  // 👉 在这里写 练习 2~4 的三个 useMutation（addMutation / editMutation / deleteMutation）

  const list: Todo[] = []; // 👉 替换成 useQuery 的 data（如 const { data: list = [] } = useQuery(...)）

  return (
    <main className="mx-auto max-w-3xl space-y-4 p-6">
      <h1 className="text-2xl font-bold">D 版 · React Query 托管缓存（乐观 + 自动重拉）</h1>
      <p className="text-sm text-gray-500">
        路由 /react-learn/cache ｜ A/B/C 的终极形态：乐观+回滚+失效重拉全由库托管
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          // 👉 addMutation.mutate(title); setTitle("");
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
                <span className="cursor-pointer text-green-600">保存</span>
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
                <span className="cursor-pointer text-blue-600">修改</span>
              </>
            )}
            <span className="cursor-pointer text-red-600">删除</span>
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
