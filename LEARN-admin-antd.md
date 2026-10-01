# learn/admin-antd —— Ant Design 6 后台管理骨架

> 从 `basic` 分支切出。目标：**带注释的学习骨架**，不是生产代码。跟着 TODO 练。

## 跑起来
```bash
pnpm dev          # 访问 http://localhost:4000/admin
```
- `/admin` 仪表盘（Server Component 读假库）
- `/admin/users` 用户管理（表格 + 弹窗表单 + 删除，CRUD 核心）

## 这个分支练什么
1. **antd + Next 16 App Router 的 SSR 样式接入** —— 看 `app/admin/layout.tsx` 里的 `AntdRegistry`（少了它首屏闪没样式）。
2. **亮/暗主题切换** —— `components/admin/admin-shell.tsx` 用 `ConfigProvider` + `theme.darkAlgorithm`。
3. **后台三件套布局** —— Sider（侧边栏菜单）+ Header（顶栏）+ Content（内容插槽）。
4. **表格 CRUD** —— `app/admin/users/page.tsx`：Table 列定义、`Form` 表单校验、`Popconfirm` 删除、Modal 弹窗复用（新建/编辑同一弹窗）。
5. **“假数据库”分层** —— `lib/users-store.ts`：前端只管 UI，数据先放内存数组。

## 关键文件
| 文件 | 作用 |
|---|---|
| `app/admin/layout.tsx` | 后台根布局，包 `AntdRegistry`（SSR 样式） |
| `components/admin/admin-shell.tsx` | 侧边栏 + 顶栏 + 暗色切换（client） |
| `app/admin/page.tsx` | 仪表盘（server，直接读假库） |
| `app/admin/users/page.tsx` | 用户 CRUD 页（client） |
| `lib/users-store.ts` | 内存假库（增删改查 5 个函数） |

## 给你的练习 TODO（按顺序做）
1. [ ] 在 `users-store.ts` 加一个 `seed` 函数，或把数组换成 `localStorage` 持久化。
2. [ ] 给 `users` 页加**分页 / 搜索 / 按角色筛选**。
3. [ ] 把“假库”换成真实接口：新建 `app/api/users/route.ts`（GET/POST）+ `app/api/users/[id]/route.ts`（PUT/DELETE），前端改用 `fetch`。
4. [ ] 加一个**登录页** + 用 `next-middleware-i18n` 分支的思路做路由守卫。
5. [ ] 把暗色偏好存到 `localStorage`，刷新不丢。

## 对比其他分支
- `learn/admin-shadcn`：同一套后台，换成 Tailwind v4 + shadcn/ui（国外主流审美）。
- `learn/admin-mantine` / `learn/admin-mui`：换 Mantine / MUI 实现同一布局。
- 三者布局结构一致，方便你横向对比“同一需求不同 UI 库怎么写”。
