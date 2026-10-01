// 仪表盘（极简）：本分支重点是“表单校验”，所以仪表盘只做跳转入口。
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold">仪表盘</h2>
      <p className="text-muted-foreground">本分支练习重点在「用户管理」的表单校验，点右侧去体验：</p>
      <Link href="/admin/users">
        <Button>去用户管理（RHF + zod）</Button>
      </Link>
    </div>
  );
}
