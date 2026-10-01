// ============================================================================
// 带 locale 的导航 API
// ----------------------------------------------------------------------------
// 用 next-intl 的 Link/useRouter 替代 next/link、next/navigation，
// 好处：切换语言时 URL 自动带上正确的语言前缀（/zh、/en），不用手动拼。
// ============================================================================
import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
