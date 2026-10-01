# learn/rhf-zod-crud —— react-hook-form + zod 表单型 CRUD 骨架

> 从 `basic` 分支切出。后台最高频的不是“表格”而是“表单”，本分支专门练**带校验的表单**。
> 目标：**带注释的学习骨架**。

## 跑起来
```bash
pnpm dev          # 访问 http://localhost:4000/admin/users
```
点「新建用户」，表单留空或乱填邮箱 → 看 zod 报错；填对 → 保存入库。

## 这个分支练什么
1. **zod schema 即数据契约** —— `app/admin/users/schema.ts`：一份 schema 同时管「运行时校验」和「TS 类型」（`z.infer`）。
2. **react-hook-form 接管表单** —— `useForm` + `register` + `handleSubmit`，不再手写 `onChange` 攒 state。
3. **RHF + zod 接起来** —— `resolver: zodResolver(userSchema)`；提交时自动校验，不过不调用 onSubmit。
4. **错误展示** —— `formState.errors.xxx.message` 渲染校验失败文案。
5. **编辑回填** —— `reset(行数据)` 把记录灌进表单并清掉旧错误。

## 关键文件
| 文件 | 作用 |
|---|---|
| `app/admin/users/schema.ts` | zod 校验 schema + 推导类型 |
| `app/admin/users/page.tsx` | RHF 表单 CRUD（主角） |
| `components/admin/admin-shell.tsx` | 复用 Tailwind 外壳（非重点） |
| `lib/users-store.ts` | 内存假库 |

## 对比
- `admin-antd/shadcn/mantine/mui` 四个分支的表单都是“朴素受控 + alert 校验”，这里升级成工业级 RHF + zod。
- 实际项目里：四个 UI 库的表单**都应该**套 RHF + zod，本分支就是那个“标准写法模板”。

## 练习 TODO
1. [ ] 加字段：手机号（`z.string().regex(/^1\d{10}$/, '手机号格式')`）。
2. [ ] 接真实接口：onSubmit 里 `await fetch('/api/users', { method: editing ? 'PUT' : 'POST', body: JSON.stringify(values) })`，并用 `useMutation`（见 `learn/react-query`）管理。
3. [ ] 加 `mode: 'onBlur'` 让校验在失焦时就触发（默认是提交时才校验）。
4. [ ] 用 shadcn 的 `Form`/`Input` 组件替换裸 `<input>`，但 register 用法不变。
