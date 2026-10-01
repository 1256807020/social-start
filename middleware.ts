// ============================================================================
// 中间件：在请求进入页面前做“语言路由”
// ----------------------------------------------------------------------------
// 作用：访问 / → 按浏览器/默认重定向到 /zh；/zh、/en 正常放行；
//       同时把 locale 注入请求上下文，供 i18n/request.ts 读取。
// matcher 排除 api、_next、_vercel 和带后缀的静态文件（*.png 等）。
// ============================================================================
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: ['/', '/(zh|en)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)'],
};
