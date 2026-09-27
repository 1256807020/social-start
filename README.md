# Social Start

一个最小化的 **Next.js (App Router) + Tailwind CSS v4 + shadcn（base 风格）** 起步模板。

## 技术栈

- Next.js 16（Turbopack）
- React 19
- Tailwind CSS v4（`@tailwindcss/postcss`）
- shadcn — base-nova 风格（基于 `@base-ui/react`）
- 图标：`lucide-react`
- 包管理：pnpm

## 目录结构

```
app/
  globals.css      # Tailwind v4 + shadcn 主题变量（标准模板）
  layout.tsx       # 根布局
  page.tsx         # 首页（水平垂直居中的带图标按钮示例）
components/
  ui/button.tsx    # shadcn Button
lib/
  utils.ts         # cn() 工具（clsx + tailwind-merge）
```

## 快速开始

```bash
pnpm install
pnpm dev        # http://localhost:3000
```

构建与生产启动：

```bash
pnpm build
pnpm start
```

## 添加 shadcn 组件

```bash
pnpm dlx shadcn@latest add button
```

> 注意：base 风格文档示例的图标库是 `@tabler/icons-react`，但本项目的标准图标库为 `lucide-react`
>（`components.json` 中 `iconLibrary: "lucide"`），复制示例时请对应替换图标导入。

## 环境变量

- `.env` — 本地开发（已纳入版本库，仅含非敏感的 `NEXT_PUBLIC_*` 占位）
- `.env.production` — 生产环境
- 真实密钥请放在 `.env.local`（已被 `.gitignore` 忽略，不会入库）

## 分支

- `main` — 主干
- `basic` — 开发分支
