// 后台外壳：纯 Tailwind（与 admin-shadcn 同款），本分支重点不是它，复用即可。
'use client';
import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AdminShell({ children }: { children: ReactNode }) {
  const [dark, setDark] = useState(false);
  function toggleDark() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
  }
  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <aside className="w-60 shrink-0 border-r border-border bg-sidebar p-4">
        <div className="font-semibold mb-6 text-sidebar-foreground">My Admin</div>
        <nav className="flex flex-col gap-1">
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
          <Button variant="outline" size="sm" onClick={toggleDark}>
            {dark ? '亮色' : '暗色'}
          </Button>
        </header>
        <main className="flex-1 p-4">{children}</main>
      </div>
    </div>
  );
}
