"use client";

// ───────────────────────────────────────────────────────────
// 从 Vue 转 React（轻量取数篇）· SWR
// · Vue2 对照：axios + 手写 loading
// · Vue3 对照：社区 swrv（SWR 的 Vue 版）
// · React 对照：SWR = useSWR(key, fetcher)，更轻量，主打 stale-while-revalidate 自动重验
// 📌 实战定位：SWR 属【常规业务常用·进阶】；比 React Query 轻，适合「拉个列表/详情」的简易取数场景。走 /api/todo。
// 🧭 学习模式：🔧固定写法=const {data,error,isLoading}=useSWR('/api/todo',fetcher); mutate() 触发重拉；👉=练习点已填；文末对照。
// ───────────────────────────────────────────────────────────
import { useState } from "react";
import useSWR from "swr";

type Todo = { id: number; title: string; done: boolean };
const PAGE_SIZE = 8;

// 通用 fetcher
// 🔧 固定写法：fetcher(url) 只负责「发请求 + 返回数据」，SWR 拿它去填缓存；返回类型由 useSWR<T> 泛型决定
// 👉 检查 res.ok 再 json()（同源坑：react-query 那次也补了——否则后端 500 会把错误信封当正常 data 缓存，列表静默空掉）
const fetcher = async (url: string) => {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`请求失败：${r.status}`);
  return r.json();
};

export default function SwrPage() {
  const [page, setPage] = useState(1);
  const [title, setTitle] = useState("");
  const [editing, setEditing] = useState<{ id: number; title: string } | null>(
    null
  );

  // 🔧 固定写法：useSWR(key, fetcher) —— key 是「缓存键」兼「依赖」：key 变了自动重新拉取；
  //   返回 { data, isLoading, mutate }。mutate() 手动触发重新校验（写操作后刷新列表）
  const { data, isLoading, mutate } = useSWR<{ data: Todo[]; total: number }>(
    `/api/todo?page=${page}&pageSize=${PAGE_SIZE}&sort=-id`,
    fetcher
  );

  const todos = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.max(Math.ceil(total / PAGE_SIZE), 1);

  const add = async () => {
    if (!title.trim()) return;
    await fetch("/api/todo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, done: false }),
    });
    setTitle("");
    mutate(); // 🔧 固定写法：写操作成功后 mutate() 重新校验（≈ Vue 里手动 this.load() 再拉一次列表）
  };

  const patch = async (id: number, p: Partial<Todo>) => {
    await fetch(`/api/todo/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(p),
    });
    mutate(); // 🔧 同上：写后刷新
  };

  const remove = async (id: number) => {
    await fetch(`/api/todo/${id}`, { method: "DELETE" });
    mutate(); // 🔧 同上：写后刷新
  };

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-4">
      <h1 className="text-2xl font-bold">
        SWR（Vercel 官方）· todo CRUD · app/swr
      </h1>
      <p className="text-sm text-gray-500">
        useSWR(key, fetcher) 自动管理 loading/缓存/重新校验；写操作后 mutate()
        刷新。loading={String(isLoading)}。
      </p>
      {/* 表单提交 */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          add();
        }}
        className="flex gap-2"
      >
        <input
          className="flex-1 rounded border px-2 py-1"
          placeholder="新待办标题"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button
          className="rounded bg-blue-600 px-3 py-1 text-white"
          type="submit"
        >
          新增
        </button>
        <button
          className="rounded border px-3 py-1"
          type="button"
          onClick={() => mutate()}
        >
          刷新
        </button>
      </form>

      {isLoading && <p className="text-sm text-gray-400">加载中…</p>}

      <ul className="space-y-2">
        {todos.map((t) => (
          <li key={t.id} className="flex items-center gap-2 border-b py-1">
            <input
              type="checkbox"
              checked={!!t.done}
              onChange={() => patch(t.id, { done: !t.done })}
            />
            {editing?.id === t.id ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  patch(t.id, { title: editing.title });
                  setEditing(null);
                }}
                className="flex flex-1 gap-2"
              >
                <input
                  className="flex-1 rounded border px-2 py-1"
                  value={editing?.title ?? ""}
                  onChange={(e) =>
                    setEditing({ id: t.id, title: e.target.value })
                  }
                />
                <button
                  className="rounded bg-green-600 px-2 py-1 text-white"
                  type="submit"
                >
                  保存
                </button>
              </form>
            ) : (
              <span
                className={`flex-1 ${
                  t.done ? "line-through text-gray-400" : ""
                }`}
                onDoubleClick={() => setEditing({ id: t.id, title: t.title })}
              >
                #{t.id} {t.title}
              </span>
            )}
            <button
              className="text-sm text-blue-600"
              onClick={() => setEditing({ id: t.id, title: t.title })}
            >
              改
            </button>
            <button
              className="text-sm text-red-600"
              onClick={() => remove(t.id)}
            >
              删
            </button>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between text-sm">
        <button
          className="px-2 py-1 border rounded disabled:opacity-40"
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
        >
          上一页
        </button>
        <span>
          {page} / {totalPages}（共 {total}）
        </span>
        <button
          className="px-2 py-1 border rounded disabled:opacity-40"
          disabled={page >= totalPages}
          onClick={() => setPage(page + 1)}
        >
          下一页
        </button>
      </div>

      {/* ④ 服务端状态库对照速查（折叠，不打断练习） */}
      <details className="mt-6 text-sm">
        <summary className="cursor-pointer font-medium">
          ④ 数据获取库对照：SWR / TanStack Query / Vue
        </summary>
        <table className="mt-2 w-full border-collapse border border-border text-left">
          <thead>
            <tr className="bg-muted">
              <th className="border border-border px-2 py-1">维度</th>
              <th className="border border-border px-2 py-1">SWR（本分支）</th>
              <th className="border border-border px-2 py-1">
                TanStack Query（react-query）
              </th>
              <th className="border border-border px-2 py-1">Vue 对照</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-border px-2 py-1">定位</td>
              <td className="border border-border px-2 py-1">
                服务端状态库（轻量）
              </td>
              <td className="border border-border px-2 py-1">
                服务端状态库（功能更全）
              </td>
              <td className="border border-border px-2 py-1">
                Pinia + 手写 refetch / swrv / @tanstack/vue-query
              </td>
            </tr>
            <tr>
              <td className="border border-border px-2 py-1">读数据</td>
              <td className="border border-border px-2 py-1">
                {"useSWR(key, fetcher)"}
              </td>
              <td className="border border-border px-2 py-1">
                {"useQuery({ queryKey, queryFn })"}
              </td>
              <td className="border border-border px-2 py-1">
                Pinia action 里 await 再赋值
              </td>
            </tr>
            <tr>
              <td className="border border-border px-2 py-1">loading</td>
              <td className="border border-border px-2 py-1">isLoading</td>
              <td className="border border-border px-2 py-1">isLoading</td>
              <td className="border border-border px-2 py-1">
                自己管 state.loading
              </td>
            </tr>
            <tr>
              <td className="border border-border px-2 py-1">刷新列表</td>
              <td className="border border-border px-2 py-1">{"mutate()"}</td>
              <td className="border border-border px-2 py-1">
                {'invalidateQueries({ queryKey: ["todos"] })'}
              </td>
              <td className="border border-border px-2 py-1">
                手动 this.load() 再拉
              </td>
            </tr>
            <tr>
              <td className="border border-border px-2 py-1">写操作</td>
              <td className="border border-border px-2 py-1">
                手写 fetch + mutate()
              </td>
              <td className="border border-border px-2 py-1">
                {"useMutation + onSuccess 失效"}
              </td>
              <td className="border border-border px-2 py-1">
                Pinia action 写
              </td>
            </tr>
            <tr>
              <td className="border border-border px-2 py-1">缓存/重验</td>
              <td className="border border-border px-2 py-1">
                内置，key 变自动重拉
              </td>
              <td className="border border-border px-2 py-1">
                内置，更强（stale-while-revalidate 等）
              </td>
              <td className="border border-border px-2 py-1">无（自己管）</td>
            </tr>
            <tr>
              <td className="border border-border px-2 py-1">需 Provider</td>
              <td className="border border-border px-2 py-1">
                否（全局默认配置）
              </td>
              <td className="border border-border px-2 py-1">
                是（QueryClientProvider）
              </td>
              <td className="border border-border px-2 py-1">
                是（QueryClientProvider）
              </td>
            </tr>
          </tbody>
        </table>
        <p className="mt-2 text-gray-500">
          一句话：SWR / TanStack Query 管「服务端状态」（接口缓存 +
          自动重验），和
          redux/zustand/jotai（管「客户端状态」：表单、开关、本地计数器）是【不同层】，互补不替代——真实项目常「react-query
          管接口 + zustand 管 UI」。 TanStack Query 有官方 Vue 版
          @tanstack/vue-query（API 完全一致）；SWR 有社区 Vue 版 swrv。
        </p>
      </details>
      <details className="mt-6 rounded border p-3 text-sm">
        <summary className="cursor-pointer font-semibold">📚 Vue2 / Vue3 / React 三向对照 &amp; 本项目小结</summary>
        <table className="mt-2 w-full border-collapse text-left">
          <thead>
            <tr className="border-b">
              <th className="px-2 py-1">维度</th><th className="px-2 py-1">Vue2 (Options)</th><th className="px-2 py-1">Vue3 (Composition)</th><th className="px-2 py-1">React</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b"><td className="px-2 py-1">取数库</td><td className="px-2 py-1">axios</td><td className="px-2 py-1">swrv</td><td className="px-2 py-1">SWR / React Query</td></tr>
            <tr className="border-b"><td className="px-2 py-1">API</td><td className="px-2 py-1">手写</td><td className="px-2 py-1">useSWR 一致</td><td className="px-2 py-1">useSWR(key,fetcher)</td></tr>
            <tr className="border-b"><td className="px-2 py-1">重验策略</td><td className="px-2 py-1">手动</td><td className="px-2 py-1">stale-while-revalidate</td><td className="px-2 py-1">SWR（同名策略）</td></tr>
            <tr className="border-b"><td className="px-2 py-1">写后刷新</td><td className="px-2 py-1">手动 refetch</td><td className="px-2 py-1">mutate()</td><td className="px-2 py-1">mutate()</td></tr>
          </tbody>
        </table>
        <p className="mt-2 text-gray-500">📝 小结：SWR 比 React Query 更轻，useSWR(key,fetcher) 一行取数；本项目接 /api/todo，mutate() 即可重拉最新。</p>
      </details>
    </main>
  );
}
