// ============================================================================
// 用户管理页：表格 + 弹窗表单 + 删除（CRUD 核心）
// ----------------------------------------------------------------------------
// 这里故意“手写”表格和弹窗（不用 shadcn 的 Table/Dialog 组件），原因：
//   1) 让你看清底层就是 <table> + 一个 fixed 遮罩 div；
//   2) 真实项目里跑 `npx shadcn add table dialog input card select` 就能换成官方组件，
//      替换时只改 JSX，不改用结构。
// 表单校验这里用最朴素的 `if (!form.name) alert(...)`，更优雅的做法见 learn/rhf-zod-crud。
// ============================================================================
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { listUsers, createUser, updateUser, deleteUser, type User } from '../../../lib/users-store';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(() => listUsers());
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState({ name: '', email: '', role: 'viewer', status: 'active' });

  function refresh() {
    setUsers(listUsers());
  }
  function openCreate() {
    setEditing(null);
    setForm({ name: '', email: '', role: 'viewer', status: 'active' });
    setOpen(true);
  }
  function openEdit(u: User) {
    setEditing(u);
    setForm({ name: u.name, email: u.email, role: u.role, status: u.status });
    setOpen(true);
  }
  function save() {
    if (!form.name || !form.email) {
      alert('姓名和邮箱必填');
      return;
    }
    if (editing) updateUser(editing.id, form);
    else createUser(form);
    setOpen(false);
    refresh();
  }
  function remove(id: number) {
    deleteUser(id);
    refresh();
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={openCreate}>新建用户</Button>
      </div>

      {/* 表格：全部 Tailwind 工具类。颜色变量让亮暗自动切换 */}
      <table className="w-full text-sm border border-border">
        <thead className="bg-muted">
          <tr>
            <th className="p-2 text-left">ID</th>
            <th className="p-2 text-left">姓名</th>
            <th className="p-2 text-left">邮箱</th>
            <th className="p-2 text-left">角色</th>
            <th className="p-2 text-left">状态</th>
            <th className="p-2 text-left">操作</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t border-border">
              <td className="p-2">{u.id}</td>
              <td className="p-2">{u.name}</td>
              <td className="p-2">{u.email}</td>
              <td className="p-2">{u.role}</td>
              <td className="p-2">{u.status}</td>
              <td className="p-2 space-x-2">
                <Button variant="outline" size="sm" onClick={() => openEdit(u)}>
                  编辑
                </Button>
                <Button variant="destructive" size="sm" onClick={() => remove(u.id)}>
                  删除
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 弹窗：fixed 遮罩 + 居中卡片。这是 Dialog 的底层原理 */}
      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="w-96 rounded-lg border border-border bg-card p-4">
            <h3 className="font-semibold mb-3">{editing ? '编辑用户' : '新建用户'}</h3>

            <label className="block text-sm mb-1">姓名</label>
            <input
              className="w-full rounded border border-input px-2 py-1 mb-3 bg-background"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <label className="block text-sm mb-1">邮箱</label>
            <input
              className="w-full rounded border border-input px-2 py-1 mb-3 bg-background"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />

            <label className="block text-sm mb-1">角色</label>
            <select
              className="w-full rounded border border-input px-2 py-1 mb-3 bg-background"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as User['role'] })}
            >
              <option value="admin">管理员</option>
              <option value="editor">编辑</option>
              <option value="viewer">访客</option>
            </select>

            <label className="block text-sm mb-1">状态</label>
            <select
              className="w-full rounded border border-input px-2 py-1 mb-3 bg-background"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as User['status'] })}
            >
              <option value="active">启用</option>
              <option value="disabled">停用</option>
            </select>

            <div className="flex justify-end gap-2 mt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                取消
              </Button>
              <Button onClick={save}>保存</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
