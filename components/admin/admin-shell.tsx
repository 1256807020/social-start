// ============================================================================
// 后台外壳：纯 Tailwind v4 实现（侧边栏 + 顶栏 + 暗色切换）
// ----------------------------------------------------------------------------
// 为什么不用 antd 那套？因为 shadcn 的哲学是“你拥有代码”：组件就是项目里的 TSX，
// 样式全靠 Tailwind 工具类，所以这里没有第三方布局组件，全手写 class。
// ============================================================================
'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AdminShell({ children }: { children: ReactNode }) {
  // —— 暗色：Tailwind v4 在 globals.css 里写了 `@custom-variant dark (&:is(.dark *))` ——
  // 含义：任何祖先带 .dark 的元素，其 `dark:` 工具类才生效。
  // 所以暗色切换 = 给 <html> 加/去掉 .dark class，全部颜色用 shadcn 的 CSS 变量自动翻转。
  const [dark, setDark] = useState(false);
  function toggleDark() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
  }

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* 侧边栏：颜色用了 --sidebar / --sidebar-foreground 等 shadcn 变量，亮暗自动跟随 */}
      <aside className="w-60 shrink-0 border-r border-border bg-sidebar p-4">
        <div className="font-semibold mb-6 text-sidebar-foreground">My Admin</div>
        <nav className="flex flex-col gap-1">
          {/* 这里用 Next 的 <Link> 做客户端导航，不会整页刷新 */}
          <Link href="/admin" className="rounded px-3 py-2 hover:bg-sidebar-accent text-sidebar-foreground">
            仪表盘
          </Link>
          <Link href="/admin/users" className="rounded px-3 py-2 hover:bg-sidebar-accent text-sidebar-foreground">
            用户管理
          </Link>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="h-14 flex items-center justify-end gap-2 border-b border-border px-4">
          {/* shadcn 的 Button 组件（components/ui/button.tsx），variant/size 可配 */}
          <Button variant="outline" size="sm" onClick={toggleDark}>
            {dark ? '亮色' : '暗色'}
          </Button>
        </header>
        {/* Content 插槽 */}
        <main className="flex-1 p-4">{children}</main>
      </div>
    </div>
  );
}
