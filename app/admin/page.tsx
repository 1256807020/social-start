// ============================================================================
// 仪表盘页（Server Component，直接读假库）
// ----------------------------------------------------------------------------
// Mantine 的 SimpleGrid / Card 都是 client 组件，但在 server 组件里直接渲染是允许的
// （Next 会在服务端把它们连同 MantineProvider 一起 SSR）。
// ============================================================================
import { SimpleGrid, Card, Text, Title, Group, Button } from '@mantine/core';
import Link from 'next/link';
import { listUsers } from '../../lib/users-store';

export default function DashboardPage() {
  const users = listUsers();
  const active = users.filter((u) => u.status === 'active').length;

  return (
    <>
      <Group justify="space-between" mb="md">
        <Title order={2}>仪表盘</Title>
        <Button component={Link} href="/admin/users">
          去用户管理
        </Button>
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

      {/* 练习 TODO：接 recharts 趋势图；数字接真实接口 + loading 态。 */}
    </>
  );
}
