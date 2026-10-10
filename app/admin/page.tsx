// ============================================================================
// 仪表盘页（Server Component，服务端 fetch 真实接口 /api/users）
// ----------------------------------------------------------------------------
// ⚠️ 实战定位：Mantine 后台仪表盘 = 常用（布局组件 AppShell/NavLink 开箱即用，开发最快）。
//   本分支和 antd/shadcn/mui 是「同一需求换 UI 库」，重点认领 Mantine 组件写法差异
//   （SimpleGrid/Card、MantineProvider forceColorScheme 暗色、Table/Modal/TextInput/Select），不深讲。
// 数据走真实接口（同 admin-antd/admin-mui，禁止假库/直读 json）：
//   GET /api/users → 列表（统一信封 { code, data, total }，取 data）。
// 已学知识点点名：Server Component 服务端取数 + 同源 base URL（避免写死 localhost）+ 数组 filter 统计
//   + RSC 边界不跨传函数（Button 不写 component={Link}，改 <Link> 包裹）。
// 暗色/布局见 components/admin/mantine-provider.tsx；校验见 learn/rhf-zod-crud。
// ============================================================================
import { headers } from 'next/headers';
import { SimpleGrid, Card, Text, Title, Group, Button } from '@mantine/core';
import Link from 'next/link';

type DashUser = { id: number; status: 'active' | 'disabled' };

async function getUsers(): Promise<DashUser[]> {
  const h = await headers();
  const base = process.env.NEXT_PUBLIC_BASE_URL || `http://${h.get('host') || 'localhost'}`;
  const res = await fetch(`${base}/api/users`, { cache: 'no-store' });
  const json = await res.json();
  return json.data ?? [];
}

export default async function DashboardPage() {
  const users = await getUsers();
  const active = users.filter((u) => u.status === 'active').length;

  return (
    <>
      <Group justify="space-between" mb="md">
        <Title order={2}>仪表盘</Title>
        {/* RSC 边界不能把 Link 函数当 component={Link} 传给 client 按钮，
            故用 <Link> 包住 <Button>（href 落外层 <a>，点击即导航） */}
        <Link href="/admin/users">
          <Button>去用户管理</Button>
        </Link>
      </Group>

      <SimpleGrid cols={3}>
        <Card withBorder>
          <Text size="sm" c="dimmed">
            用户总数
          </Text>
          <Text fw={700} size="xl">
            {users.length}
          </Text>
        </Card>
        <Card withBorder>
          <Text size="sm" c="dimmed">
            启用中
          </Text>
          <Text fw={700} size="xl">
            {active}
          </Text>
        </Card>
        <Card withBorder>
          <Text size="sm" c="dimmed">
            今日新增
          </Text>
          <Text fw={700} size="xl">
            0
          </Text>
        </Card>
      </SimpleGrid>

      {/* 练习 TODO：接 recharts 趋势图。 */}
    </>
  );
}
