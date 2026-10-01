// ============================================================================
// 后台根布局（Server Component）
// ----------------------------------------------------------------------------
// 只包一层 MantineProviderWrap。Mantine 是运行时 CSS-in-JS，provider 必须在客户端，
// 所以 MantineProviderWrap 是 'use client'，这里只负责把它套在 children 外面。
// ============================================================================
import type { ReactNode } from 'react';
import MantineProviderWrap from '@/components/admin/mantine-provider';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <MantineProviderWrap>{children}</MantineProviderWrap>;
}
