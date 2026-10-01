// 内存「假数据库」—— 与 admin-antd / admin-shadcn / admin-mantine 同构，四库横向对比。
// 详情见 admin-antd 分支同名文件的注释。
export type User = {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  status: 'active' | 'disabled';
};

const users: User[] = [
  { id: 1, name: '张三', email: 'zhang@x.com', role: 'admin', status: 'active' },
  { id: 2, name: '李四', email: 'li@x.com', role: 'editor', status: 'active' },
  { id: 3, name: '王五', email: 'wang@x.com', role: 'viewer', status: 'disabled' },
];

let nextId = users.length + 1;

export function listUsers(): User[] {
  return users;
}
export function getUser(id: number): User | undefined {
  return users.find((u) => u.id === id);
}
export function createUser(input: Omit<User, 'id'>): User {
  const user: User = { id: nextId++, ...input };
  users.push(user);
  return user;
}
export function updateUser(id: number, patch: Partial<Omit<User, 'id'>>): User | undefined {
  const user = users.find((u) => u.id === id);
  if (!user) return undefined;
  Object.assign(user, patch);
  return user;
}
export function deleteUser(id: number): boolean {
  const i = users.findIndex((u) => u.id === id);
  if (i === -1) return false;
  users.splice(i, 1);
  return true;
}
