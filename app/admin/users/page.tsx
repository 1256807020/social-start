// ============================================================================
// 用户管理页：Mantine Table + Modal 做 CRUD（走【真实 JSON 后端】）
// ----------------------------------------------------------------------------
// ⚠️ 实战定位：Mantine 后台模板 = 常用（布局开箱即用、开发最快，你生产系统基本都遇过）。
//   本分支和 antd/shadcn/mui 是「同一需求换 UI 库」，重点认领组件写法差异，不深讲。
// 数据走真实接口（同 admin-antd/admin-mui，禁止假库/直读 json）：
//   GET    /api/users          列表
//   POST   /api/users          新增
//   PATCH  /api/users/:id      改（增量合并）
//   DELETE /api/users/:id      删
//   统一响应体 { code:0, data, msg, total }，取 data。
// 已学知识点点名：useState 受控表单 + Server/Client 边界('use client') + useEffect 拉数 + fetch CRUD 信封解包。
// 校验见 learn/rhf-zod-crud（react-hook-form + zod）；暗色/布局见 components/admin/mantine-provider.tsx。
// ============================================================================
'use client';

import { useEffect, useState } from 'react';
import { Table, Button, Modal, TextInput, Select, Group, Text } from '@mantine/core';

type User = {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  status: 'active' | 'disabled';
  createdAt?: string;
  updatedAt?: string;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [opened, setOpened] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<string | null>('viewer');
  const [status, setStatus] = useState<string | null>('active');

  // 查：服务端通用 CRUD 接口（真实 JSON 后端）
  async function refresh() {
    setLoading(true);
    const r = await fetch('/api/users');
    const j = await r.json();
    setUsers(j.data ?? []);
    setLoading(false);
  }
  useEffect(() => {
    refresh();
  }, []);

  function openCreate() {
    setEditing(null);
    setName('');
    setEmail('');
    setRole('viewer');
    setStatus('active');
    setOpened(true);
  }
  function openEdit(u: User) {
    setEditing(u);
    setName(u.name);
    setEmail(u.email);
    setRole(u.role);
    setStatus(u.status);
    setOpened(true);
  }
  // 增 / 改：同一个 Modal，靠 editing 区分
  async function save() {
    const payload = {
      name,
      email,
      role: (role ?? 'viewer') as User['role'],
      status: (status ?? 'active') as User['status'],
    };
    if (editing) {
      await fetch(`/api/users/${editing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }
    setOpened(false);
    refresh();
  }
  // 删
  async function remove(id: number) {
    await fetch(`/api/users/${id}`, { method: 'DELETE' });
    refresh();
  }

  return (
    <>
      <Group justify="flex-end" mb="md">
        <Button onClick={openCreate}>新建用户</Button>
      </Group>

      {loading && <Text c="dimmed">加载中…</Text>}

      <Table striped withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>ID</Table.Th>
            <Table.Th>姓名</Table.Th>
            <Table.Th>邮箱</Table.Th>
            <Table.Th>角色</Table.Th>
            <Table.Th>状态</Table.Th>
            <Table.Th>操作</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {users.map((u) => (
            <Table.Tr key={u.id}>
              <Table.Td>{u.id}</Table.Td>
              <Table.Td>{u.name}</Table.Td>
              <Table.Td>{u.email}</Table.Td>
              <Table.Td>{u.role}</Table.Td>
              <Table.Td>{u.status}</Table.Td>
              <Table.Td>
                <Group gap="xs">
                  <Button variant="outline" size="xs" onClick={() => openEdit(u)}>
                    编辑
                  </Button>
                  <Button color="red" variant="outline" size="xs" onClick={() => remove(u.id)}>
                    删除
                  </Button>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      <Modal opened={opened} onClose={() => setOpened(false)} title={editing ? '编辑用户' : '新建用户'}>
        <TextInput label="姓名" value={name} onChange={(e) => setName(e.currentTarget.value)} mb="sm" />
        <TextInput label="邮箱" value={email} onChange={(e) => setEmail(e.currentTarget.value)} mb="sm" />
        <Select
          label="角色"
          data={[
            { value: 'admin', label: '管理员' },
            { value: 'editor', label: '编辑' },
            { value: 'viewer', label: '访客' },
          ]}
          value={role}
          onChange={setRole}
          mb="sm"
        />
        <Select
          label="状态"
          data={[
            { value: 'active', label: '启用' },
            { value: 'disabled', label: '停用' },
          ]}
          value={status}
          onChange={setStatus}
          mb="sm"
        />
        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={() => setOpened(false)}>
            取消
          </Button>
          <Button onClick={save}>保存</Button>
        </Group>
      </Modal>
    </>
  );
}
