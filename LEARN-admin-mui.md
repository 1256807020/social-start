# learn/admin-mui —— Material UI (MUI) 9 后台管理骨架

> 从 `basic` 分支切出。MUI 是 Material Design 实现，大厂/海外常用。
> 目标：**带注释的学习骨架**。

## 跑起来
```bash
pnpm dev          # 访问 http://localhost:4000/admin
```

## 这个分支练什么
1. **MUI 主题系统** —— `ThemeProvider` + `createTheme({ palette: { mode } })` 切暗色（`components/admin/mui-theme.tsx`）。
2. **MUI 布局组件** —— `AppBar`（顶栏）+ `Drawer`（侧边栏）+ `Box`（flex 容器）。
3. **MUI Table / Dialog / TextField** 做 CRUD（与 antd/shadcn/mantine 同一需求对比）。
4. **CssBaseline** —— 等价于 Tailwind 的 preflight，统一浏览器默认样式。

## 关键文件
| 文件 | 作用 |
|---|---|
| `components/admin/mui-theme.tsx` | ThemeProvider + AppBar + Drawer 布局（client） |
| `app/admin/layout.tsx` | 后台根布局 |
| `app/admin/page.tsx` | 仪表盘（Grid + Card） |
| `app/admin/users/page.tsx` | 用户 CRUD（Table + Dialog） |
| `lib/users-store.ts` | 内存假库 |

## 注意点
- MUI 依赖 `@emotion/react` + `@emotion/styled`（已在 package.json）。
- 暗色这里用 `palette.mode`（最直观）。MUI v6+ 官方更推荐 `colorSchemes` + `useColorScheme`（CSS 变量方案，避免重渲染），进阶可改。
- 表单没做校验；接 `react-hook-form + zod` 见 `learn/rhf-zod-crud`。
- MUI 包体偏大，注意按需引入（或用 `@mui/material` 的 tree-shaking，已默认支持）。

## 练习 TODO
1. [ ] 用 `useColorScheme` 改成官方推荐的 CSS 变量暗色方案。
2. [ ] 给 Dialog 表单加 react-hook-form 校验。
3. [ ] 接真实接口（`app/api/users`）。
4. [ ] 加 MUI 的 DataGrid 做带分页/排序的高级表格。

## 对比（四个后台模板）
- `admin-antd`：国内最常用，组件最全。
- `admin-shadcn`：Tailwind 手写，最灵活、包体最小。
- `admin-mantine`：布局开箱即用，开发最快。
- `admin-mui`：Material 规范统一，大厂熟悉。
