// ============================================================================
// i18n 首页（服务端组件，直接用 useTranslations）
// ----------------------------------------------------------------------------
// next-intl 的 useTranslations 在“服务端组件”里也能用，无需 'use client'。
// 翻译内容来自 messages/<locale>.json，由 [locale]/layout 注入。
// ============================================================================
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import LocaleSwitcher from '@/components/LocaleSwitcher';

export default function Home() {
  const t = useTranslations('Home');

  return (
    <main className="p-8 max-w-2xl mx-auto space-y-4">
      {/* 语言切换器（客户端组件） */}
      <LocaleSwitcher />

      <h1 className="text-2xl font-bold">{t('title')}</h1>
      <p className="text-muted-foreground">{t('welcome')}</p>

      {/* 用 next-intl 的 Link：自动带当前语言前缀 */}
      <Link href="/" className="text-blue-600 underline">
        {t('home')}
      </Link>
    </main>
  );
}
