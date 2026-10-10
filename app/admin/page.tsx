// ============================================================================
// 仪表盘页（Server Component，经 /api/users 接口读真实数据）
// ----------------------------------------------------------------------------
// 【实战定位】后台仪表盘 = 实际项目【常用】。Server Component 经接口读真实数据渲染，
//   无需 'use client' / useState（和 users 页的客户端 CRUD 形成对照：读多写少用 Server，交互用 Client）。
// 🔧 固定写法：卡片用 Tailwind 工具类 + shadcn 颜色变量（--card / --border / --muted-foreground），亮暗自动翻。
// 📌 点名已学：Server Component 渲染（next 基础）、Tailwind 工具类（react-basics-styling）。
// ============================================================================
import Link from 'next/link';
import { Button } from '@/components/ui/button';

// 一律走基座通用接口 /api/users（一个 JSON = 一套接口，无需自建路由）；统一信封解包 (await res.json()).data
async function getUsers(): Promise<any[]> {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
  const res = await fetch(`${base}/api/users?pageSize=20&sort=-id`, { cache: 'no-store' });
  const j = await res.json();
  return j.data || [];
}

export default async function DashboardPage() {
  const users = await getUsers();
  const active = users.filter((u: any) => u.status === 'active').length;

  // 卡片用 Tailwind 工具类 + shadcn 的颜色变量（--card / --border / --muted-foreground）
  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">仪表盘</h2>
        <Link href="/admin/users">
          <Button>去用户管理</Button>
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-sm text-muted-foreground">用户总数</div>
          <div className="text-2xl font-bold">{users.length}</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-sm text-muted-foreground">启用中</div>
          <div className="text-2xl font-bold">{active}</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-sm text-muted-foreground">今日新增</div>
          <div className="text-2xl font-bold">0</div>
        </div>
      </div>

      {/* 练习 TODO：
          1. 用 recharts / @ant-design/charts 加趋势图；
          2. 把数字接真实接口（loading 态用 useState + useEffect 或 React Query）；
          3. 卡片hover 加过渡：className 里加 `transition` / `hover:shadow`。 */}
    </>
  );
}
