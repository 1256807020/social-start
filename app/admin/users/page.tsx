// ============================================================================
// 用户管理页：MUI Table + Dialog 做 CRUD
// ----------------------------------------------------------------------------
// 与 antd/shadcn/mantine 分支同一需求，组件换成 MUI：Table / Dialog / TextField。
// 这里用受控 state 管理表单（未接校验），校验见 learn/rhf-zod-crud。
// ============================================================================
'use client';

import { useState } from 'react';
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
} from '@mui/material';
import { listUsers, createUser, updateUser, deleteUser, type User } from '../../../lib/users-store';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(() => listUsers());
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<User['role']>('viewer');
  const [status, setStatus] = useState<User['status']>('active');

  function refresh() {
    setUsers(listUsers());
  }
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
  function save() {
    const payload = { name, email, role, status };
    if (editing) updateUser(editing.id, payload);
    else createUser(payload);
    setOpen(false);
    refresh();
  }
  function remove(id: number) {
    deleteUser(id);
    refresh();
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="contained" onClick={openCreate}>
          新建用户
        </Button>
      </Box>

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
