// ============================================================================
// 后台区域的根布局（Server Component）
// ----------------------------------------------------------------------------
// 关键点：antd 用 CSS-in-JS 在“运行时”注入样式。Next 开了 SSR 后，
// 首屏 HTML 是服务端渲染的，必须靠 AntdRegistry 把服务端算出的样式收集进 <head>，
// 否则刷新页面会“闪一下没样式”。这是 antd + Next App Router 的固定写法。
// ============================================================================
import type { ReactNode } from 'react';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import AdminShell from '@/components/admin/admin-shell';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AntdRegistry>
      <AdminShell>{children}</AdminShell>
    </AntdRegistry>
  );
}
