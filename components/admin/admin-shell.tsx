// ============================================================================
// 后台外壳（侧边栏 + 顶栏 + 暗色切换）
// ----------------------------------------------------------------------------
// 这是 client component：因为“暗色模式”需要 useState 这种交互状态。
// 在 App Router 里，凡是用了 hooks / 事件 / 浏览器 API 的组件都要标 'use client'。
// ============================================================================
'use client';

import { useState, type ReactNode } from 'react';
import { App, ConfigProvider, Layout, Menu, Switch, theme as antdTheme, Typography } from 'antd';
import Link from 'next/link';

const { Sider, Header, Content } = Layout;

export default function AdminShell({ children }: { children: ReactNode }) {
  // —— 暗色模式：用一个 state 控制 ——
  // 进阶：把 dark 存到 localStorage，或跟着 prefers-color-scheme 系统偏好。
  const [dark, setDark] = useState(false);
  const { defaultAlgorithm, darkAlgorithm } = antdTheme;

  return (
    // ConfigProvider 是 antd 的主题开关：algorithm 决定亮/暗算法。
    <ConfigProvider theme={{ algorithm: dark ? darkAlgorithm : defaultAlgorithm }}>
      {/* App 包裹：让 message/notification/modal 能消费 ConfigProvider 的动态主题（antd v6 推荐，避免静态 message 告警） */}
      <App>
        <Layout style={{ minHeight: '100vh' }}>
        {/* 侧边栏：真实后台会做“可折叠 + 多级菜单 + 选中高亮” */}
        <Sider breakpoint="lg" collapsible>
          <div style={{ color: '#fff', padding: 16, fontWeight: 600 }}>My Admin</div>
          <Menu
            theme={dark ? 'dark' : 'light'}
            mode="inline"
            defaultSelectedKeys={['dashboard']}
            items={[
              { key: 'dashboard', label: <Link href="/admin">仪表盘</Link> },
              { key: 'users', label: <Link href="/admin/users">用户管理</Link> },
            ]}
          />
        </Sider>

        <Layout>
          <Header
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: 8,
              background: dark ? '#001529' : '#fff',
            }}
          >
            <Typography.Text>暗色</Typography.Text>
            <Switch checked={dark} onChange={setDark} />
          </Header>

          {/* Content 就是各子页面的“插槽” */}
          <Content style={{ margin: 16, padding: 16, background: dark ? '#141414' : '#fff', borderRadius: 8 }}>
            {children}
          </Content>
        </Layout>
      </Layout>
      </App>
    </ConfigProvider>
  );
}
