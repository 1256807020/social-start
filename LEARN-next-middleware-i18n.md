# learn/next-middleware-i18n —— Next.js Middleware + next-intl 国际化骨架

> 从 `basic` 分支切出。练 **Next.js 中间件 + next-intl** 这套业界（尤其国内）高频 i18n 方案。
> 目标：**带注释的学习骨架**。

## 跑起来
```bash
pnpm dev
# 浏览器访问：
#   http://localhost:4000/        → 自动重定向到 http://localhost:4000/zh
#   http://localhost:4000/en      → 英文版
# 右上角下拉框切换语言，URL 前缀随之变化，页面内容跟着翻译。
```

## 这个分支练什么
1. **Middleware 做语言路由** —— `middleware.ts`：`createMiddleware(routing)` 拦截请求，访问 `/` 重定向到 `/zh`，并把 locale 注入上下文。
2. **next-intl 四件套**：
   - `i18n/routing.ts`：`defineRouting` 定义支持的语言
   - `i18n/request.ts`：`getRequestConfig` 按 URL 语言段加载 `messages/*.json`
   - `i18n/navigation.ts`：`createNavigation` 生成带 locale 的 `Link`/`useRouter`
   - `next.config.mjs`：用 `createNextIntlPlugin()` 包裹原配置
3. **[locale] 动态段** —— `app/[locale]/layout.tsx` 注入 `NextIntlClientProvider`；`app/[locale]/page.tsx` 用 `useTranslations` 取词。
4. **语言切换器** —— `components/LocaleSwitcher.tsx`（客户端组件），`router.replace(pathname, { locale })` 原地换语言。

## 关键文件
| 文件 | 作用 |
|---|---|
| `middleware.ts` | 语言路由中间件（根目录） |
| `i18n/routing.ts` | 语言定义 |
| `i18n/request.ts` | 按 locale 加载消息 |
| `i18n/navigation.ts` | 带 locale 的导航 API |
| `app/[locale]/layout.tsx` | 注入 Provider + locale 校验 |
| `app/[locale]/page.tsx` | i18n 首页（服务端取词） |
| `components/LocaleSwitcher.tsx` | 语言切换器 |
| `messages/zh.json` / `messages/en.json` | 翻译文案 |

## 注意点（骨架特有的取舍）
- 根布局 `app/layout.tsx` 仍保留 `<html lang="en">`，所以 `<html lang>` 不会随语言变。
  想让 lang 也动态：把 `<html>` 挪到 `app/[locale]/layout.tsx`，并删掉根布局的 `<html>`（代价是其它非 i18n 路由也要包进 `[locale]`，本骨架为聚焦没这么做）。
- 加新语言：在 `routing.ts` 的 `locales` 加一项 + 新建 `messages/xx.json`，中间件/导航自动生效。
- 文案建议放 JSON 由翻译团队协作；更进阶可用 `next-intl` 的 `$t` 嵌套、ICU 复数/日期数字格式化。

## 练习 TODO
1. [ ] 加第三种语言（如 `ja`），体验“只改一处”的扩展闭环。
2. [ ] 用 `useTranslations('Nav')` 在顶栏做导航菜单（当前只有切换器）。
3. [ ] 接真实后端：把“当前语言”通过请求头/cookie 传给 API（next-intl 推荐用 cookie 持久化 locale）。
4. [ ] 试试 `next-intl` 的日期/数字格式化（`t('price', { value: 9.9 })` + ICU 语法）。

## 对比
- 这是「页面级 i18n」。若只想要“文案多语言”而不要 URL 前缀，可改用纯客户端 i18n（react-i18next），但 SEO 不如 next-intl。
