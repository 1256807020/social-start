// ============================================================================
// 语言切换器（客户端组件）
// ----------------------------------------------------------------------------
// 关键点：
//   - useLocale()：当前语言（来自 Provider）
//   - usePathname()/useRouter()：next-intl 版导航，pathname 不带语言前缀
//   - router.replace(pathname, { locale })：在当前路径上切换语言（保留页面）
// ============================================================================
'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

export default function LocaleSwitcher() {
  const locale = useLocale();
  const t = useTranslations('Nav');
  const pathname = usePathname();
  const router = useRouter();

  return (
    <select
      value={locale}
      onChange={(e) =>
        router.replace(pathname, { locale: e.target.value as 'zh' | 'en' })
      }
      className="rounded border border-input px-2 py-1 bg-background"
    >
      {routing.locales.map((cur) => (
        <option key={cur} value={cur}>
          {t(cur)}
        </option>
      ))}
    </select>
  );
}
