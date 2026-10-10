# learn/admin-mantine —— Mantine 9 后台管理骨架

> 从 `basic` 分支切出。Mantine 是国外另一主流组件库，特点是“布局组件开箱即用”。
> 目标：**带注释的学习骨架**。
>
> ⚠️ **实战定位：Mantine 后台模板 = 常用**（AppShell/NavLink/Burger 布局开箱即用、开发最快，你生产系统基本都遇过）。本分支和 antd/shadcn/mui 是「同一需求换 UI 库」，重点认领组件写法差异（Table/Modal/TextInput/Select、MantineProvider `forceColorScheme` 暗色、SimpleGrid/Card），不深讲。
> 数据已全部走【真实 JSON 后端】`/api/users`（GET/POST/PATCH/DELETE，统一信封 `{code,data,total}`），**禁止假库 `lib/users-store` / 直读 json**（框架铁律）。

## 跑起来
```bash
pnpm dev          # 访问 http://localhost:4000/admin
```

## 这个分支练什么
1. **Mantine 自带布局组件** —— `AppShell` / `NavLink` / `Burger`，不用手写侧边栏（对比 shadcn 手写 Tailwind）。
2. **CSS-in-JS 运行时方案** —— 必须 `import '@mantine/core/styles.css'` + 包 `MantineProvider`（`components/admin/mantine-provider.tsx`）。
3. **暗色切换** —— `MantineProvider forceColorScheme="dark"`，比 antd 的 ConfigProvider / Tailwind 的 .dark class 更简单。
4. **Mantine Table / Modal / TextInput / Select** 做 CRUD（与 antd/shadcn 分支同一需求对比）。

## 关键文件
| 文件 | 作用 |
|---|---|
| `components/admin/mantine-provider.tsx` | MantineProvider + AppShell 布局（client） |
| `app/admin/layout.tsx` | 后台根布局 |
| `app/admin/page.tsx` | 仪表盘（SimpleGrid + Card） |
| `app/admin/users/page.tsx` | 用户 CRUD（Table + Modal，走 `/api/users` 真实接口） |
| `lib/users-store.ts` | 内存假库（已弃用，数据改走 `/api/users`） |

## 注意点（骨架特有的坑）
- Mantine 与 Tailwind v4 同处一个项目时，**样式可能互相覆盖**（Tailwind 的 preflight 重置 vs Mantine 自己的 reset）。正式项目通常二选一，或在 `tailwind.config` 关掉 preflight。这里只是练习，能跑即可。
- 表单这里没做校验，真实项目接 `react-hook-form + zod`（见 `learn/rhf-zod-crud`）。

## 练习 TODO
1. [ ] 给 `users` 页加 `react-hook-form` 校验（姓名必填、邮箱格式）。
2. [ ] 用 `next-themes` 或 Mantine 自带 `colorScheme` 持久化暗色偏好。
3. [x] 接真实接口（`app/api/users`）—— 已完成，仪表盘服务端 fetch、用户页客户端 fetch。
4. [ ] 加表格分页 / 排序 / 行选中。

## 对比
- `admin-antd`：国内最常用，组件最全。
- `admin-shadcn`：Tailwind 手写，最灵活、包体最小。
- `admin-mantine`：布局组件开箱即用，开发最快。
