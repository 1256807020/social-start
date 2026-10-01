// ============================================================================
// 后台区域根布局（Server Component）
// ----------------------------------------------------------------------------
// 和 antd 分支不同：shadcn/Tailwind 是“编译期 CSS”，不需要 AntdRegistry 这类运行时注入器。
// 所以 layout 极其干净——只包一个外壳组件即可。
// ============================================================================
import type { ReactNode } from 'react';
import AdminShell from '@/components/admin/admin-shell';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
