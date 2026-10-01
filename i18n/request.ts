// ============================================================================
// 请求级配置：根据 URL 里的语言段加载对应消息文件
// ----------------------------------------------------------------------------
// 这是 next-intl 与服务端渲染对接的地方。createNextIntlPlugin() 默认就会找
// 这个文件（./i18n/request.ts），所以路径别乱改。
// ============================================================================
import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  // requestLocale 来自中间件——即 URL 里的语言段（如 /zh 的 zh）
  const requested = await requestLocale;
  // 校验合法性：不在支持列表里就退回默认语言
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    // 动态 import 对应语言的 json（messages/zh.json、messages/en.json）
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
