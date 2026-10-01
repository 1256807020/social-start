// 后台根布局（Server Component）：只包一层 MUI 的 ThemeProvider 外壳。
import type { ReactNode } from 'react';
import MuiTheme from '@/components/admin/mui-theme';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <MuiTheme>{children}</MuiTheme>;
}
