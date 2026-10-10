// ============================================================================
// 用户管理页：表格 + 弹窗表单 + 删除（CRUD 核心练习）
// ----------------------------------------------------------------------------
// 这是后台最高频的页面形态：列表展示 + 新建/编辑（同一弹窗）+ 删除。
// 标了 'use client'，因为用了 useState / Form 等交互。
//
// 数据走【真实 JSON 后端】（和 /todo-client 同一套，不再用内存假库）：
//   集合文件：data/users.json
//   通用 CRUD：app/api/[resource]
//     GET    /api/users          列表（分页 / 过滤 / 排序 / 关键字）
//     POST   /api/users          新增
//     PATCH  /api/users/:id      改（增量合并）
//     DELETE /api/users/:id      删
//   统一响应体：{ code:0, data, msg, total, page, pageSize }，code!==0 即失败。
//   数据落在 json 文件，刷新页面不丢 —— 这才是真实项目里的前后端分离写法。
// ============================================================================
'use client';

import { useEffect, useState } from 'react';
import {
  App,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Popconfirm,
} from 'antd';

// 实体类型：对应 data/users.json 字段（只取前端用到的，不依赖假库）
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
  // 本地 state 镜像接口返回；每次增删改后 refresh() 重新拉一遍（走真实接口）
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null); // null = 新建，否则 = 编辑
  const [form] = Form.useForm();
  // 用 App.useApp() 取“带主题上下文”的 message（antd v6 推荐，避免静态 message 告警）
  const { message } = App.useApp();

  // 查：打真实接口。pageSize 拉大一点，本示例不分页（演示用）
  async function refresh() {
    setLoading(true);
    try {
      const res = await fetch('/api/users?pageSize=1000');
      const json = await res.json();
      setUsers(json.data ?? []);
    } finally {
      setLoading(false);
    }
  }

  // 首屏拉一次
  useEffect(() => {
    refresh();
  }, []);

  function handleOpenCreate() {
    setEditing(null);
    form.resetFields();
    setOpen(true);
  }

  function handleOpenEdit(u: User) {
    setEditing(u);
    form.setFieldsValue(u); // 把行数据灌进表单（id/时间字段虽无 Form.Item，但不影响提交）
    setOpen(true);
  }

  async function handleOk() {
    const values = await form.validateFields(); // 触发表单校验，只回传已注册的字段
    if (editing) {
      // 改：PATCH /api/users/:id，增量合并（只传被改的字段）
      await fetch(`/api/users/${editing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      message.success('已更新');
    } else {
      // 增：POST /api/users，后端自动补 id / createdAt / updatedAt
      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      message.success('已创建');
    }
    setOpen(false);
    refresh();
  }

  async function handleDelete(id: number) {
    // 删：DELETE /api/users/:id
    await fetch(`/api/users/${id}`, { method: 'DELETE' });
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

      <Table rowKey="id" dataSource={users} columns={columns} loading={loading} pagination={false} />

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
