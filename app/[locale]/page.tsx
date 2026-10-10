// ───────────────────────────────────────────────────────────
// 从 Vue 转 React（国际化篇 · Next 官方方案）· next-intl + middleware
// · Vue2/Vue3 对照：Vue 生态用 vue-i18n；Nuxt 有 @nuxtjs/i18n 做「基于路由的语言前缀」(类似 [locale] 目录)；
// · React/Next 对照：next-intl 用 middleware 拦截、[locale] 动态段做语言路由，useTranslations 在服务端/客户端都能用（本例是服务端组件）。
// 📌 实战定位：多语言路由【了解即可·进阶】；比 react-i18next 更“Next 原生”，适合需要 /en /zh 路由的项目。
// 🧭 学习模式：🔧固定写法=middleware 匹配 locales + [locale]/layout 注入 + useTranslations；👉=练习点（已填，跑通即懂）；文末 <details> 有 Vue2/Vue3/React 三向对照。
// ───────────────────────────────────────────────────────────
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
      <details className="mt-6 rounded border p-3 text-sm">
        <summary className="cursor-pointer font-semibold">📚 Vue2 / Vue3 / React 三向对照 & 本项目小结</summary>
        <table className="mt-2 w-full border-collapse text-left">
          <thead>
            <tr className="border-b"><th className="px-2 py-1">维度</th><th className="px-2 py-1">Vue2 / Vue3 (Nuxt)</th><th className="px-2 py-1">React (Next)</th></tr>
          </thead>
          <tbody>
            <tr className="border-b"><td className="px-2 py-1">路由级 i18n</td><td className="px-2 py-1">@nuxtjs/i18n（/en /zh 前缀）</td><td className="px-2 py-1">next-intl [locale] 目录</td></tr>
            <tr className="border-b"><td className="px-2 py-1">取文案</td><td className="px-2 py-1">$t / useI18n().t</td><td className="px-2 py-1">useTranslations()（本例，服务端可用）</td></tr>
            <tr className="border-b"><td className="px-2 py-1">切语言</td><td className="px-2 py-1">切换路由</td><td className="px-2 py-1">next-intl 的 Link href</td></tr>
            <tr className="border-b"><td className="px-2 py-1">生态</td><td className="px-2 py-1">vue-i18n</td><td className="px-2 py-1">next-intl（更 Next 原生）</td></tr>
          </tbody>
        </table>
        <p className="mt-2 text-gray-500">📝 小结：next-intl 是 Next 官方风 i18n，路由级语言切换；业务数据仍走 /api 真实接口。</p>
      </details>

    </main>
  );
}
