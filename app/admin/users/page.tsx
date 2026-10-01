// ============================================================================
// 用户管理页：Mantine Table + Modal 做 CRUD
// ----------------------------------------------------------------------------
// 和 antd/shadcn 分支结构一致，只是把组件换成 Mantine 的 Table / Modal / TextInput / Select。
// 注意 Mantine 的表单这里用“受控 state”逐字段管理，没接校验库；
// 想做校验看 learn/rhf-zod-crud（react-hook-form + zod）。
// ============================================================================
'use client';

import { useState } from 'react';
import {
  Table,
  Button,
  Modal,
  TextInput,
  Select,
  Group,
} from '@mantine/core';
import { listUsers, createUser, updateUser, deleteUser, type User } from '../../../lib/users-store';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(() => listUsers());
  const [opened, setOpened] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<string | null>('viewer');
  const [status, setStatus] = useState<string | null>('active');

  function refresh() {
    setUsers(listUsers());
  }
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
  function save() {
    const payload = {
      name,
      email,
      role: (role ?? 'viewer') as User['role'],
      status: (status ?? 'active') as User['status'],
    };
    if (editing) updateUser(editing.id, payload);
    else createUser(payload);
    setOpened(false);
    refresh();
  }
  function remove(id: number) {
    deleteUser(id);
    refresh();
  }

  return (
    <>
      <Group justify="flex-end" mb="md">
        <Button onClick={openCreate}>新建用户</Button>
      </Group>

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
