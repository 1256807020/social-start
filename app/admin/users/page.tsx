// ============================================================================
// 用户管理页：表格 + 弹窗表单 + 删除（CRUD 核心练习）
// ----------------------------------------------------------------------------
// 这是后台最高频的页面形态：列表展示 + 新建/编辑（同一弹窗）+ 删除。
// 标了 'use client'，因为用了 useState / Form 等交互。
// ============================================================================
'use client';

import { useState } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Popconfirm,
  message,
} from 'antd';
import {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  type User,
} from '../../../lib/users-store';

export default function UsersPage() {
  // 用本地 state 镜像“假库”；每次增删改后 refresh() 重新拉一遍
  const [users, setUsers] = useState<User[]>(() => listUsers());
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null); // null = 新建，否则 = 编辑
  const [form] = Form.useForm();

  function refresh() {
    setUsers(listUsers());
  }

  function handleOpenCreate() {
    setEditing(null);
    form.resetFields();
    setOpen(true);
  }

  function handleOpenEdit(u: User) {
    setEditing(u);
    form.setFieldsValue(u); // 把行数据灌进表单
    setOpen(true);
  }

  async function handleOk() {
    const values = await form.validateFields(); // 触发表单校验
    if (editing) {
      updateUser(editing.id, values);
      message.success('已更新');
    } else {
      createUser(values);
      message.success('已创建');
    }
    setOpen(false);
    refresh();
  }

  function handleDelete(id: number) {
    deleteUser(id);
    message.success('已删除');
    refresh();
  }

  // antd Table 的列定义：dataIndex 对应数据字段，render 用来自定义单元格
  const columns = [
    { title: 'ID', dataIndex: 'id' as const },
    { title: '姓名', dataIndex: 'name' as const },
    { title: '邮箱', dataIndex: 'email' as const },
    { title: '角色', dataIndex: 'role' as const },
    { title: '状态', dataIndex: 'status' as const },
    {
      title: '操作',
      // render 接收 (当前行的值, 整行记录) —— 这里用不到第一个参数
      render: (_: unknown, record: User) => (
        <Space>
          <Button onClick={() => handleOpenEdit(record)}>编辑</Button>
          <Popconfirm title="确认删除?" onConfirm={() => handleDelete(record.id)}>
            <Button danger>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={handleOpenCreate}>
          新建用户
        </Button>
      </Space>

      <Table rowKey="id" dataSource={users} columns={columns} pagination={false} />

      <Modal
        title={editing ? '编辑用户' : '新建用户'}
        open={open}
        onOk={handleOk}
        onCancel={() => setOpen(false)}
        okText="保存"
        cancelText="取消"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ role: 'viewer', status: 'active' }}
        >
          <Form.Item name="name" label="姓名" rules={[{ required: true, message: '必填' }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[{ required: true, type: 'email', message: '邮箱格式不正确' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="role" label="角色">
            <Select
              options={[
                { value: 'admin', label: '管理员' },
                { value: 'editor', label: '编辑' },
                { value: 'viewer', label: '访客' },
              ]}
            />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select
              options={[
                { value: 'active', label: '启用' },
                { value: 'disabled', label: '停用' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
