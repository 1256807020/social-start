// ============================================================================
// 用户管理页：react-hook-form + zod 做「带校验」的 CRUD
// ----------------------------------------------------------------------------
// 这是本分支的主角。对比 admin-* 分支里“手写 if (!form.name) alert(...)”的朴素校验，
// 这里用 RHF 接管表单状态，zod 接管校验规则，二者通过 zodResolver 接起来。
// ============================================================================
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userSchema, type UserForm } from './schema';
import { Button } from '@/components/ui/button';
import { listUsers, createUser, updateUser, deleteUser, type User } from '../../../lib/users-store';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(() => listUsers());
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);

  // useForm：RHF 的核心。
  //  - resolver: zodResolver(userSchema) → 提交时自动跑 zod 校验
  //  - defaultValues: 初始值（新建时清空，编辑时由 reset 灌入）
  //  - formState.errors: 校验失败后的错误信息；isSubmitting: 提交中为禁用按钮用
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserForm>({
    resolver: zodResolver(userSchema),
    defaultValues: { name: '', email: '', role: 'viewer', status: 'active' },
  });

  function refresh() {
    setUsers(listUsers());
  }
  function openCreate() {
    setEditing(null);
    reset({ name: '', email: '', role: 'viewer', status: 'active' });
    setOpen(true);
  }
  function openEdit(u: User) {
    setEditing(u);
    // reset 把行数据灌进表单，同时清空上次的校验错误
    reset({ name: u.name, email: u.email, role: u.role, status: u.status });
    setOpen(true);
  }
  // handleSubmit 会先跑 zod：校验不过就不调用 onSubmit，errors 自动填充
  function onSubmit(values: UserForm) {
    if (editing) updateUser(editing.id, values);
    else createUser(values);
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

      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="w-96 rounded-lg border border-border bg-card p-4">
            <h3 className="font-semibold mb-3">{editing ? '编辑用户' : '新建用户'}</h3>

            {/* form 用 RHF 的 handleSubmit 包裹：点“保存”先校验再 onSubmit */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div>
                <label className="block text-sm mb-1">姓名</label>
                {/* register('name') 把输入框交给 RHF 管理（值+校验） */}
                <input
                  className="w-full rounded border border-input px-2 py-1 bg-background"
                  {...register('name')}
                />
                {/* errors.name?.message 是 zod 返回的报错文案 */}
                {errors.name && <p className="text-destructive text-xs mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm mb-1">邮箱</label>
                <input
                  className="w-full rounded border border-input px-2 py-1 bg-background"
                  {...register('email')}
                />
                {errors.email && <p className="text-destructive text-xs mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm mb-1">角色</label>
                <select className="w-full rounded border border-input px-2 py-1 bg-background" {...register('role')}>
                  <option value="admin">管理员</option>
                  <option value="editor">编辑</option>
                  <option value="viewer">访客</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-1">状态</label>
                <select className="w-full rounded border border-input px-2 py-1 bg-background" {...register('status')}>
                  <option value="active">启用</option>
                  <option value="disabled">停用</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 mt-2">
                {/* type="button" 防止误触发表单提交 */}
                <Button variant="outline" type="button" onClick={() => setOpen(false)}>
                  取消
                </Button>
                <Button type="submit">保存</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
