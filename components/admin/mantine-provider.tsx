// ============================================================================
// 后台外壳：Mantine 自带 AppShell 布局（client）
// ----------------------------------------------------------------------------
// Mantine 的特点：布局组件（AppShell / NavLink / Burger）和暗色都是“开箱即用”的，
// 不用像 Tailwind 那样手写 class。代价是它是 CSS-in-JS 运行时方案，必须包 MantineProvider。
// ============================================================================
'use client';

import { useState, type ReactNode } from 'react';
import {
  MantineProvider,
  AppShell,
  NavLink,
  Group,
  Switch,
  Text,
  Burger,
} from '@mantine/core';
import '@mantine/core/styles.css'; // 必须引入 Mantine 样式（Next 里放 client 组件内）
import Link from 'next/link';

export default function MantineProviderWrap({ children }: { children: ReactNode }) {
  const [dark, setDark] = useState(false);
  const [opened, setOpened] = useState(false); // 移动端抽屉菜单开关

  return (
    <MantineProvider forceColorScheme={dark ? 'dark' : 'light'}>
      <AppShell
        header={{ height: 56 }}
        navbar={{ width: 220, breakpoint: 'sm', collapsed: { mobile: !opened } }}
        padding="md"
      >
        <AppShell.Header>
          <Group h="100%" px="md" justify="space-between">
            <Group>
              {/* Burger 仅小屏显示（hiddenFrom="sm"），点开/收起侧边栏 */}
              <Burger opened={opened} onClick={() => setOpened((o) => !o)} hiddenFrom="sm" size="sm" />
              <Text fw={700}>My Admin</Text>
            </Group>
            <Group>
              <Text size="sm">暗色</Text>
              <Switch checked={dark} onChange={(e) => setDark(e.currentTarget.checked)} />
            </Group>
          </Group>
        </AppShell.Header>

        <AppShell.Navbar p="md">
          {/* component={Link} 让 Mantine 的 NavLink 用 Next 的 <Link> 做客户端导航 */}
          <NavLink component={Link} href="/admin" label="仪表盘" />
          <NavLink component={Link} href="/admin/users" label="用户管理" />
        </AppShell.Navbar>

        <AppShell.Main>{children}</AppShell.Main>
      </AppShell>
    </MantineProvider>
  );
}
