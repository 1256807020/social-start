// ============================================================================
// 用户管理页：react-hook-form + zod 做「带校验」的 CRUD（已连真实后端 /api/users）
// ----------------------------------------------------------------------------
// 这是本分支的主角。对比 admin-* 分支里“手写 if (!form.name) alert(...)”的朴素校验，
// 这里用 RHF 接管表单状态，zod 接管校验规则，二者通过 zodResolver 接起来。
// 数据不再放内存假库（lib/users-store.ts），而是走 lib/users-api.ts → 真实后端，
// 刷新页面数据不丢（落在 data/users.json）。
//
// ───── 从 Vue 转 React（表单 + CRUD 篇）─────
//   • Vue3 + vee-validate + Pinia：useForm({ validationSchema: toTypedSchema(userSchema) }) 接管表单，
//     actions 里 await axios 增删改、再拉列表塞回 store —— 和本页的 RHF + users-api 一一对应。
//   • Vue2 + Vuex：methods 里手写校验 + this.$store.dispatch('saveUser')；这里用 RHF 的 handleSubmit
//     自动拦校验 + dispatch 换成直接调 users-api 的 async 函数。
//   共同点：表单「声明式校验」+ 数据「异步拉/写」这两条主线完全一样，只是 API 名字不同。
// ============================================================================
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userSchema, type UserForm } from './schema';
import { Button } from '@/components/ui/button';
import { listUsers, createUser, updateUser, deleteUser, type User } from '../../../lib/users-api';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);

  // useForm：RHF 的核心。
  //  - resolver: zodResolver(userSchema) → 提交时自动跑 zod 校验
  //  - defaultValues: 初始值（新建时清空，编辑时由 reset 灌入）
  //  - mode: 'onBlur' → 失焦即校验（默认是提交时才校验，体验更及时）
  //  - formState.errors: 校验失败后的错误信息；isSubmitting: 提交中为禁用按钮用
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserForm>({
    // 🔧 固定写法：resolver: zodResolver(schema) —— 把 zod 规则接到 RHF，提交前自动校验
    resolver: zodResolver(userSchema),
    mode: 'onBlur',
    defaultValues: { name: '', email: '', role: 'viewer', status: 'active' },
  });

  // 🔧 固定写法：首次挂载用 useEffect 拉列表（数据在后端，组件自己不持有）
  async function refresh() {
    setLoading(true);
    try {
      setUsers(await listUsers());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    refresh();
  }, []);

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
  // 🔧 固定写法：onSubmit 写成 async —— RHF 会在 await 期间把 isSubmitting 置 true（可禁用按钮）
  async function onSubmit(values: UserForm) {
    if (editing) await updateUser(editing.id, values);
    else await createUser(values);
    setOpen(false);
    await refresh();
  }
  async function remove(id: number) {
    await deleteUser(id);
    await refresh();
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={openCreate}>新建用户</Button>
      </div>

      {/* 🔧 固定写法：加载/错误态——数据来自异步请求，必须处理「正在取 / 取失败」 */}
      {loading && <p className="text-muted-foreground text-sm">加载中…</p>}
      {error && <p className="text-destructive text-sm">加载失败：{error}</p>}

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
            {/* 🔧 固定写法：handleSubmit(onSubmit) —— 校验不过就不调 onSubmit，errors 自动填充 */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div>
                <label className="block text-sm mb-1">姓名</label>
                {/* 🔧 固定写法：register('字段名') 把输入框交给 RHF（自动管值 + 校验绑定） */}
                <input
                  className="w-full rounded border border-input px-2 py-1 bg-background"
                  {...register('name')}
                />
                {/* 🔧 固定写法：errors.字段?.message 是 zod 返回的报错文案 */}
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
                {/* 🔧 固定写法：isSubmitting 在 onSubmit 的 await 期间为 true，禁用按钮防重复提交 */}
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? '保存中…' : '保存'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ④ 表单 CRUD 方案对照速查（折叠，不打断练习） */}
      <details className="mt-6 text-sm">
        <summary className="cursor-pointer font-medium">④ 表单 CRUD 对照：RHF+zod(React) / Vue3 vee-validate+zod / Vue2 手写</summary>
        <table className="mt-2 w-full border-collapse border border-border text-left">
          <thead>
            <tr className="bg-muted">
              <th className="border border-border px-2 py-1">维度</th>
              <th className="border border-border px-2 py-1">React（RHF + zod）</th>
              <th className="border border-border px-2 py-1">Vue3（vee-validate + zod）</th>
              <th className="border border-border px-2 py-1">Vue2（手写 / Element UI）</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-border px-2 py-1">定义规则</td>
              <td className="border border-border px-2 py-1">{'z.object({ name: z.string().min(1) })'}</td>
              <td className="border border-border px-2 py-1">同 zod schema（toTypedSchema 包）</td>
              <td className="border border-border px-2 py-1">methods 里 if/else 或 rules 数组</td>
            </tr>
            <tr>
              <td className="border border-border px-2 py-1">类型推导</td>
              <td className="border border-border px-2 py-1">z.infer&lt;typeof schema&gt;</td>
              <td className="border border-border px-2 py-1">同 z.infer</td>
              <td className="border border-border px-2 py-1">手写 interface</td>
            </tr>
            <tr>
              <td className="border border-border px-2 py-1">接管表单</td>
              <td className="border border-border px-2 py-1">useForm + register</td>
              <td className="border border-border px-2 py-1">useForm + defineField</td>
              <td className="border border-border px-2 py-1">v-model + ValidationProvider</td>
            </tr>
            <tr>
              <td className="border border-border px-2 py-1">提交校验</td>
              <td className="border border-border px-2 py-1">handleSubmit 拦在门外</td>
              <td className="border border-border px-2 py-1">handleSubmit 同</td>
              <td className="border border-border px-2 py-1">提交前手动 valid</td>
            </tr>
            <tr>
              <td className="border border-border px-2 py-1">错误展示</td>
              <td className="border border-border px-2 py-1">formState.errors.x.message</td>
              <td className="border border-border px-2 py-1">errors.x</td>
              <td className="border border-border px-2 py-1">各自 error 对象</td>
            </tr>
            <tr>
              <td className="border border-border px-2 py-1">数据来源</td>
              <td className="border border-border px-2 py-1">本页：lib/users-api.ts 异步 fetch /api/users</td>
              <td className="border border-border px-2 py-1">Pinia action 里 axios 增删改</td>
              <td className="border border-border px-2 py-1">methods 里 this.$http</td>
            </tr>
          </tbody>
        </table>
      </details>
    </div>
  );
}
