# learn/admin-antd —— Ant Design 6 后台管理骨架

> 从 `basic` 分支切出。目标：**带注释的学习骨架**，不是生产代码。跟着 TODO 练。

## 跑起来
```bash
pnpm dev          # 访问 http://localhost:4000/admin
```
- `/admin` 仪表盘（Server Component 走 /api/users 接口，不直读 json）
- `/admin/users` 用户管理（表格 + 弹窗表单 + 删除，CRUD 核心）

## 这个分支练什么
1. **antd + Next 16 App Router 的 SSR 样式接入** —— 看 `app/admin/layout.tsx` 里的 `AntdRegistry`（少了它首屏闪没样式）。
2. **亮/暗主题切换** —— `components/admin/admin-shell.tsx` 用 `ConfigProvider` + `theme.darkAlgorithm`。
3. **后台三件套布局** —— Sider（侧边栏菜单）+ Header（顶栏）+ Content（内容插槽）。
4. **表格 CRUD** —— `app/admin/users/page.tsx`：Table 列定义、`Form` 表单校验、`Popconfirm` 删除、Modal 弹窗复用（新建/编辑同一弹窗）。
5. **真实 JSON 后端（统一走接口）** —— `data/users.json` 是存储、`app/api/[resource]` 是接口层：无论服务端/客户端组件都通过 `/api/users` 取数，**不直接读 json 文件**（参考 /todos、/todo-client 范本）。

## 关键文件
| 文件 | 作用 |
|---|---|
| `app/admin/layout.tsx` | 后台根布局，包 `AntdRegistry`（SSR 样式） |
| `components/admin/admin-shell.tsx` | 侧边栏 + 顶栏 + 暗色切换（client） |
| `app/admin/page.tsx` | 仪表盘（server，走 /api/users 接口，不直读 json） |
| `app/admin/users/page.tsx` | 用户 CRUD 页（client，打 /api/users） |
| `data/users.json` + `app/api/[resource]` | 真实 JSON 后端：集合=json 文件，通用 CRUD（GET/POST/PATCH/DELETE） |

## 给你的练习 TODO（按顺序做）
1. [ ] 给 `users` 页加**分页 / 搜索 / 按角色筛选**（`GET /api/users` 已支持 `?page=&pageSize=&role=` 等查询参数）。
2. [x] 把"假库"换成真实接口：本分支 `users` 页 / 仪表盘现已直接打 `/api/users`（集合=data/users.json，无需自建 route）。
3. [ ] 加一个**登录页** + 用 `proxy.ts` 的 `adminToken` 思路做写操作路由守卫。
4. [ ] 把暗色偏好存到 `localStorage`，刷新不丢。

## 对比其他分支
- `learn/admin-shadcn`：同一套后台，换成 Tailwind v4 + shadcn/ui（国外主流审美）。
- `learn/admin-mantine` / `learn/admin-mui`：换 Mantine / MUI 实现同一布局。
- 三者布局结构一致，方便你横向对比"同一需求不同 UI 库怎么写"。
