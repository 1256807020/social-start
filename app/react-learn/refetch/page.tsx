"use client";

// ============================================================
// React 手敲练习 · C 版 worksheet：全量重拉（Refetch After Every Mutation）
// 策略：增 / 改 / 删 每次都先把请求发出去，【成功后再统一 GET 全量列表】。
//       最“稳”（界面永远等于后端真相），但最慢、最费流量。
//       作为 A/B 版的【对照】——体会“重拉”和“乐观”的取舍。
// 老师只搭外壳 + 说明，所有标 👉 的地方由【你】手写完成。
// 接口契约见文件底部注释（和 A 版完全一致，共用 /api/react-learn）。
// ============================================================

import { useEffect, useState } from "react";

// Todo 类型（和 A / B 版一致）
type Todo = {
  id: number;
  title: string;
  done: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export default function RefetchPage() {
  const [title, setTitle] = useState("");
  const [list, setList] = useState<Todo[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");

  useEffect(() => {
    getList(1);
  }, []);

  // C 版核心：一个“重拉”函数，任何增删改之后都调它
  const getList = async (page: number) => {
    const resp = await fetch(
      `/api/react-learn?page=${page}&pageSize=${pageSize}&sort=-id`
    );
    const j = await resp.json();
    setList(j.data);
    setPage(page);
  };

  // 👉 手敲 1：add —— POST 成功后“重拉全量”
  //   1) e.preventDefault(); title.trim() 为空 return
  //   2) POST { title, done: false }
  //   3) 成功：getList(1) 把列表拉到最新（回到第 1 页看新加的）
  //   4) setTitle('')
  const add = async (e: React.FormEvent) => {
    // 👉 在这里写上面的 1)~4)
  };

  // 👉 手敲 2：saveEdit —— PATCH 成功后“重拉全量”
  //   1) editingText.trim() 为空 return
  //   2) PATCH { title: editingText }
  //   3) 成功：getList(page) 重拉当前页
  //   4) setEditingId(null)
  const saveEdit = async (id: number) => {
    // 👉 在这里写上面的 1)~4)
  };

  const startEdit = (item: Todo) => {
    setEditingId(item.id);
    setEditingText(item.title);
  };

  // 👉 手敲 3：remove —— DELETE 成功后“重拉全量”
  //   1) DELETE /api/react-learn/:id
  //   2) 成功：getList(page) 重拉当前页（这条就没了）
  const remove = async (id: number) => {
    // 👉 在这里写上面的 1)~2)
  };

  // 👉 手敲 4：翻页（和 A 版一样，getList(p)）
  const goPage = (p: number) => {
    getList(p);
  };

  return (
    <main className="mx-auto max-w-3xl space-y-4 p-6">
      <h1 className="text-2xl font-bold">C 版 · 全量重拉（增删改后都重新 GET）</h1>
      <p className="text-sm text-gray-500">
        路由 /react-learn/refetch ｜ 和 A 版共用 /api/react-learn
      </p>

      {/* 👉 表单：受控 input + 提交按钮（onSubmit 调 add，type=submit） */}
      <form onSubmit={add} className="flex gap-2">
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

      {/* 👉 列表：map list，每条显示标题 + 修改/删除；编辑中用 input 替换 */}
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
                  onClick={() => saveEdit(item.id)}
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
              onClick={() => remove(item.id)}
            >
              删除
            </span>
          </li>
        ))}
      </ul>

      {/* 翻页：上 / 下一页 */}
      <div className="flex items-center gap-2">
        <button
          className="rounded border px-2 py-1 disabled:opacity-40"
          onClick={() => goPage(page - 1)}
          disabled={page <= 1}
        >
          上一页
        </button>
        <span className="text-sm">第 {page} 页</span>
        <button
          className="rounded border px-2 py-1"
          onClick={() => goPage(page + 1)}
        >
          下一页
        </button>
      </div>

      {/* 空状态：短路与，list 为空才显示 */}
      {list.length === 0 && (
        <p className="text-gray-500">暂无数据，快去上面新增一条吧～</p>
      )}
    </main>
  );
}

/*
=== 接口契约（和 A / B 版完全一致，共用 /api/react-learn）===
POST   /api/react-learn              body:{title,done?}   resp:{code,data:{id,title,done,...}}
GET    /api/react-learn?page=1&pageSize=5&sort=-id   resp:{code,data:[...],total,totalPages}
PATCH  /api/react-learn/:id          body:{title}        resp:{code,data}
DELETE /api/react-learn/:id          resp:{code}
*/
