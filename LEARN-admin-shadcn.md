# learn/admin-shadcn —— Tailwind v4 + shadcn/ui 后台管理骨架

> 从 `basic` 分支切出。`basic` 已内置 Tailwind v4 + shadcn/ui（含 `components/ui/button.tsx`）。
> 目标：**带注释的学习骨架**。

## 跑起来
```bash
pnpm dev          # 访问 http://localhost:4000/admin
```
- `/admin` 仪表盘
- `/admin/users` 用户管理（表格 + 弹窗 + 删除）

## 这个分支练什么
1. **shadcn 的“你拥有代码”理念** —— 组件就是项目里的 TSX，样式全靠 Tailwind 工具类，不引第三方布局库。
2. **Tailwind v4 暗色** —— `globals.css` 里的 `@custom-variant dark (&:is(.dark *))`；切换 = 给 `<html>` 加 `.dark` class（`components/admin/admin-shell.tsx`）。
3. **shadcn 配色变量** —— 卡片/边框/侧边栏用 `--card`/`--border`/`--sidebar` 等 CSS 变量，亮暗自动翻。
4. **同一后台布局，三种 UI 库对比** —— 和 `admin-antd` / `admin-mantine` / `admin-mui` 结构一致。

## 关键文件
| 文件 | 作用 |
|---|---|
| `app/admin/layout.tsx` | 后台根布局（无需运行时注册器，比 antd 干净） |
| `components/admin/admin-shell.tsx` | 侧边栏 + 顶栏 + 暗色切换（client） |
| `app/admin/page.tsx` | 仪表盘（server，Tailwind 卡片） |
| `app/admin/users/page.tsx` | 用户 CRUD（手写 table + dialog，便于看清底层） |
| `data/users.json` | 真实存储（基座通用 CRUD 接口 /api/users 直接读写，无需自建路由） |

## 给你的练习 TODO
1. [ ] 跑 `npx shadcn add table dialog input card select` 把官方组件拉进来，把 `users/page.tsx` 的手写 `<table>` 换成 `<Table>`、手写弹窗换成 `<Dialog>`（结构不变，只换标签）。
2. [ ] 用 `next-themes` 接管暗色（跟随系统 + 持久化），替换手写 `classList.toggle`。
3. [x] 已接真实接口：`data/users.json` + 基座通用 `/api/users`（查 GET / 增 POST / 改 PATCH :id / 删 DELETE :id，信封 {code,data,msg}），前端 fetch 解包 `j.data`；可换 React Query。
4. [ ] 加移动端抽屉菜单（shadcn 的 `Sheet` 组件）替换侧边栏在窄屏的展示。

## 对比
- `admin-antd`：同一需求用 antd 组件实现（更“开箱即用”，但要 AntdRegistry 接 SSR）。
- 三者布局结构一致，方便横向对比“同一后台需求，不同 UI 库怎么写”。
