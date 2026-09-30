"use client";

// ============================================================
// React 手敲练习 · B 版 worksheet：全乐观更新（Optimistic Update）
// 策略：增 / 改 / 删 全部【本地先改 state】，请求在后台飞；
//       只有接口报错才把那条数据【还原回去（rollback）】。
//       增删改后【永不重拉】全量列表（和 A 版最大的区别）。
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
    setList(j.data);
  };

  // 👉 手敲 1：add —— 全乐观新增
  //   1) e.preventDefault()
  //   2) 若 title.trim() 为空 return
  //   3) 造一个“临时项” temp = { id: Date.now(), title, done: false }
  //      （用 Date.now() 当临时 id，等后端返回真实 id 再替换）
  //   4) 乐观：setList(prev => [temp, ...prev])  本地立刻出现
  //   5) 后台 POST，成功后把 temp 换成返回的 j.data（真实 id）：
  //      setList(prev => prev.map(t => t.id === temp.id ? j.data : t))
  //   6) 失败（!resp.ok 或 try/catch）：把 temp 从列表移除（回滚）+ alert 提示
  //   7) 清空 title
  const add = async (e: React.FormEvent) => {
    // 👉 在这里写上面的 1)~7)
  };

  // 👉 手敲 2：saveEdit —— 全乐观改
  //   1) 先记下来“原始标题” oldTitle（从 list 里按 id 找）
  //   2) 乐观：setList(prev => prev.map(t => t.id===id ? {...t, title: editingText} : t))
  //   3) 后台 PATCH { title: editingText }
  //   4) 失败：把标题还原成 oldTitle（回滚）+ alert
  //   5) 退出编辑态 setEditingId(null)
  const saveEdit = async (id: number) => {
    // 👉 在这里写上面的 1)~5)
  };

  const startEdit = (item: Todo) => {
    setEditingId(item.id);
    setEditingText(item.title);
  };

  // 👉 手敲 3：remove —— 全乐观删（带回滚，这是和 A 版最关键的差别！）
  //   1) 先备份要删的那条 backup = list.find(t => t.id===id)
  //   2) 乐观：setList(prev => prev.filter(t => t.id !== id))  本地立刻消失
  //   3) 后台 DELETE
  //   4) 失败：把 backup 加回来（回滚）+ alert
  //   （A 版删了不回滚 → 删除请求失败会“假删除”，这是 B 版要修掉的坑）
  const remove = async (id: number) => {
    // 👉 在这里写上面的 1)~4)
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
