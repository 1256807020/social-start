// ============================================================================
// [locale] 布局：把消息注入客户端 Provider
// ----------------------------------------------------------------------------
// 为什么放在 [locale] 而不是根布局？
//   根布局（app/layout.tsx）已经有 <html>，next-intl 只需在这里包一层
//   NextIntlClientProvider 让“客户端组件”能读到翻译。服务端组件直接用
//   useTranslations 即可，不需要 Provider。
// 想让 <html lang> 也随语言变？把 <html> 挪到这层、删掉根布局的 <html> 即可
// （代价是其它非 i18n 路由也要包一层 [locale]，这里为简化骨架先不动）。
// ============================================================================
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

// 预生成 /zh、/en 两个静态参数（配合 setRequestLocale 可做静态渲染）
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // 非法语言段 → 404
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // 声明本请求的语言（启用静态渲染时必需）
  setRequestLocale(locale);

  // 读取当前语言的消息，注入 Provider 供客户端组件使用
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
