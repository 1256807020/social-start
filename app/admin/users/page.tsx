// ============================================================================
// 用户管理页：MUI Table + Dialog 做 CRUD（走【真实 JSON 后端】）
// ----------------------------------------------------------------------------
// ⚠️ 实战定位：MUI 后台模板 = 常用（你 5-6 套生产系统基本都遇过）。
//   本分支和 antd/shadcn/mantine 是「同一需求换 UI 库」，重点认领组件写法差异，不深讲。
// 数据走真实接口（同 admin-antd，禁止假库/直读 json）：
//   GET    /api/users          列表
//   POST   /api/users          新增
//   PATCH  /api/users/:id      改（增量合并）
//   DELETE /api/users/:id      删
//   统一响应体 { code:0, data, msg, total }，取 data。
// 已学知识点点名：useState 受控表单 + Server/Client 边界('use client') + useEffect 拉数 + fetch CRUD 信封解包。
// 校验见 learn/rhf-zod-crud；主题见 components/admin/mui-theme.tsx。
// ============================================================================
'use client';

import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Box,
  Typography,
} from '@mui/material';

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
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<User['role']>('viewer');
  const [status, setStatus] = useState<User['status']>('active');

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
    setOpen(true);
  }
  function openEdit(u: User) {
    setEditing(u);
    setName(u.name);
    setEmail(u.email);
    setRole(u.role);
    setStatus(u.status);
    setOpen(true);
  }
  // 增 / 改：同一个 Dialog，靠 editing 区分
  async function save() {
    const payload = { name, email, role, status };
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
    setOpen(false);
    refresh();
  }
  // 删
  async function remove(id: number) {
    await fetch(`/api/users/${id}`, { method: 'DELETE' });
    refresh();
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="contained" onClick={openCreate}>
          新建用户
        </Button>
      </Box>

      {loading && <Typography color="text.secondary">加载中…</Typography>}

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>姓名</TableCell>
            <TableCell>邮箱</TableCell>
            <TableCell>角色</TableCell>
            <TableCell>状态</TableCell>
            <TableCell>操作</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((u) => (
            <TableRow key={u.id}>
              <TableCell>{u.id}</TableCell>
              <TableCell>{u.name}</TableCell>
              <TableCell>{u.email}</TableCell>
              <TableCell>{u.role}</TableCell>
              <TableCell>{u.status}</TableCell>
              <TableCell>
                <Button size="small" onClick={() => openEdit(u)}>
                  编辑
                </Button>
                <Button size="small" color="error" onClick={() => remove(u.id)}>
                  删除
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>{editing ? '编辑用户' : '新建用户'}</DialogTitle>
        <DialogContent>
          {/* MUI 表单用 TextField；select 模式里放 MenuItem 当选项 */}
          <TextField label="姓名" fullWidth margin="normal" value={name} onChange={(e) => setName(e.target.value)} />
          <TextField label="邮箱" fullWidth margin="normal" value={email} onChange={(e) => setEmail(e.target.value)} />
          <TextField
            select
            label="角色"
            fullWidth
            margin="normal"
            value={role}
            onChange={(e) => setRole(e.target.value as User['role'])}
          >
            <MenuItem value="admin">管理员</MenuItem>
            <MenuItem value="editor">编辑</MenuItem>
            <MenuItem value="viewer">访客</MenuItem>
          </TextField>
          <TextField
            select
            label="状态"
            fullWidth
            margin="normal"
            value={status}
            onChange={(e) => setStatus(e.target.value as User['status'])}
          >
            <MenuItem value="active">启用</MenuItem>
            <MenuItem value="disabled">停用</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>取消</Button>
          <Button variant="contained" onClick={save}>
            保存
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
