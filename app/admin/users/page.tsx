// ───────────────────────────────────────────────────────────
// 从 Vue 转 React（后台模板篇）· Ant Design 后台
// · Vue2 对照：element-ui 后台
// · Vue3 对照：element-plus 后台
// · React 对照：Ant Design（antd）后台模板：Layout + Table + Form + Modal 一套后台 CRUD
// 📌 实战定位：antd 后台模板属【常规业务常用】；你做过十几套后台，antd 是 React 后台最主流的 UI 库。
// 🧭 学习模式：🔧固定写法=Layout + Table(columns,dataSource) + Form + Modal；增删改走 /api/users；👉=练习点已填；文末对照。
// ───────────────────────────────────────────────────────────
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
      <details className="mt-6 rounded border p-3 text-sm">
        <summary className="cursor-pointer font-semibold">📚 Vue2 / Vue3 / React 三向对照 &amp; 本项目小结</summary>
        <table className="mt-2 w-full border-collapse text-left">
          <thead>
            <tr className="border-b">
              <th className="px-2 py-1">维度</th><th className="px-2 py-1">Vue2 (Options)</th><th className="px-2 py-1">Vue3 (Composition)</th><th className="px-2 py-1">React</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b"><td className="px-2 py-1">UI 库</td><td className="px-2 py-1">element-ui</td><td className="px-2 py-1">element-plus</td><td className="px-2 py-1">Ant Design（antd）</td></tr>
            <tr className="border-b"><td className="px-2 py-1">布局</td><td className="px-2 py-1">el-container</td><td className="px-2 py-1">el-container</td><td className="px-2 py-1">Layout（Sider/Header/Content）</td></tr>
            <tr className="border-b"><td className="px-2 py-1">表格</td><td className="px-2 py-1">el-table</td><td className="px-2 py-1">el-table</td><td className="px-2 py-1">Table（columns + dataSource）</td></tr>
            <tr className="border-b"><td className="px-2 py-1">CRUD</td><td className="px-2 py-1">axios + 手写</td><td className="px-2 py-1">axios + 手写</td><td className="px-2 py-1">antd Form + /api/users</td></tr>
          </tbody>
        </table>
        <p className="mt-2 text-gray-500">📝 小结：antd 后台 = Layout 框架 + Table 列表 + Form/Modal 编辑；本项目用户管理走 /api/users 真实接口，不与 element 体系混用。</p>
      </details>
    </>
  );
}
