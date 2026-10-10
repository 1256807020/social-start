"use client";

// ============================================================
// React 手敲练习 · B 版 worksheet：全乐观更新（Optimistic Update）
// 策略：增 / 改 / 删 全部【本地先改 state】，请求在后台飞；
//       只有接口报错才把那条数据【还原回去（rollback）】。
//       增删改后【永不重拉】全量列表（和 A 版最大的区别）。
// Vue2 对照：Vue 里同样“先 this.list.unshift/改/过滤，再发请求，catch 里还原”，
//           没有库自动托管，得自己手写回滚（和这里一模一样）。
// 老师只搭外壳 + 说明，所有标 👉 的地方由【你】手写完成。
// 接口契约见文件底部注释（和 A 版完全一致，共用 /api/react-learn）。
// ============================================================

import { useEffect, useState } from "react";

// Todo 类型（和 A 版一致）
type Todo = {
  id: number;
  title: string;
  done: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export default function OptimisticPage() {
  const [title, setTitle] = useState("");
  const [list, setList] = useState<Todo[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");

  // 挂载只拉一次全量（和 A 版一样；B 版只是“之后不再重拉”）
  useEffect(() => {
    getList(1);
  }, []);

  const getList = async (page: number) => {
    const resp = await fetch(`/api/react-learn?page=${page}&pageSize=5&sort=-id`);
    const j = await resp.json();
    // 设置列表值，useEffect查询列表
    setList(j.data);
  };

  // 🔧 固定写法：B 版 = 全乐观新增（本地先插，失败回滚）
  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const temp: Todo = { id: Date.now(), title, done: false }; // 临时 id
    setList((prev) => [temp, ...prev]); // 乐观插入
    try {
      const resp = await fetch("/api/react-learn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, done: false }),
      });
      if (!resp.ok) throw new Error("新增失败");
      const j = await resp.json();
      setList((prev) => prev.map((t) => (t.id === temp.id ? j.data : t))); // 换成真实 id
    } catch {
      setList((prev) => prev.filter((t) => t.id !== temp.id)); // 失败回滚：移除临时项
      alert("新增失败，已回滚");
    }
    setTitle("");
  };

  // 🔧 固定写法：B 版 = 乐观改标题（本地先换，失败还原）
  const saveEdit = async (id: number) => {
    const item = list.find((t) => t.id === id);
    const oldTitle = item?.title ?? "";
    setList((prev) => prev.map((t) => (t.id === id ? { ...t, title: editingText } : t))); // 乐观改
    try {
      const resp = await fetch(`/api/react-learn/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editingText }),
      });
      if (!resp.ok) throw new Error("修改失败");
    } catch {
      setList((prev) => prev.map((t) => (t.id === id ? { ...t, title: oldTitle } : t))); // 回滚
      alert("修改失败，已回滚");
    }
    setEditingId(null);
  };

  const startEdit = (item: Todo) => {
    setEditingId(item.id);
    setEditingText(item.title);
  };

  // 🔧 固定写法：B 版 = 乐观删（本地先移除，失败加回）—— 和 A 版最关键的差别（A 删了不回滚）
  const remove = async (id: number) => {
    const backup = list.find((t) => t.id === id);
    setList((prev) => prev.filter((t) => t.id !== id)); // 乐观删
    try {
      const resp = await fetch(`/api/react-learn/${id}`, { method: "DELETE" });
      if (!resp.ok) throw new Error("删除失败");
    } catch {
      if (backup) setList((prev) => [...prev, backup]); // 回滚：加回
      alert("删除失败，已回滚");
    }
  };

  return (
    <main className="mx-auto max-w-3xl space-y-4 p-6">
      <h1 className="text-2xl font-bold">B 版 · 全乐观更新（增删改本地优先 + 失败回滚）</h1>
      <p className="text-sm text-gray-500">
        路由 /react-learn/optimistic ｜ 和 A 版共用 /api/react-learn
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

      {/* 空状态：短路与，list 为空才显示 */}
      {list.length === 0 && (
        <p className="text-gray-500">暂无数据，快去上面新增一条吧～</p>
      )}
    </main>
  );
}

/*
=== 接口契约（和 A 版完全一致，共用 /api/react-learn）===
POST   /api/react-learn              body:{title,done?}   resp:{code,data:{id,title,done,...}}
GET    /api/react-learn?page=1&pageSize=5&sort=-id   resp:{code,data:[...],total,totalPages}
PATCH  /api/react-learn/:id          body:{title}        resp:{code,data}
DELETE /api/react-learn/:id          resp:{code}
*/
