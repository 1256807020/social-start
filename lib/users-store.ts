// ============================================================================
// 内存「假数据库」—— 学习骨架专用（与 admin-antd 分支同构，方便对比）
// ----------------------------------------------------------------------------
// 目的：让你把注意力放在「Tailwind + shadcn 怎么搭后台」上，先用内存数组顶替后端。
// 真实项目里换成 fetch('/api/users')（见 learn/advanced-architecture）。
//
// 注意：
//   - 纯 TS，前后端都能 import；浏览器端 import 时数据只活在“当前页面内存”，刷新会重置。
//   - 想要跨页面共享，走服务端 API（路由处理器 / Server Actions）。
// ============================================================================

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
