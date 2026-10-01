// ============================================================================
// 内存「假数据库」—— 学习骨架专用
// ----------------------------------------------------------------------------
// 目的：让你把注意力放在「前端 UI 库怎么用」上，先用内存数组顶替后端。
// 真实项目里这一层要换成 fetch('/api/users')（参见 learn/advanced-architecture）。
//
// 注意（重要）：
//   - 这个模块是纯 TS，前后端都能 import。
//   - 在浏览器端（'use client' 组件）import 时，数组只存在于“当前页面内存”，
//     刷新页面会重置 —— 这是骨架的简化，别当成 bug。
//   - 想要跨页面/跨请求共享数据，就得走服务端 API（路由处理器 / Server Actions）。
// ============================================================================

export type User = {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  status: 'active' | 'disabled';
};

// 种子数据：真实项目里来自数据库
const users: User[] = [
  { id: 1, name: '张三', email: 'zhang@x.com', role: 'admin', status: 'active' },
  { id: 2, name: '李四', email: 'li@x.com', role: 'editor', status: 'active' },
  { id: 3, name: '王五', email: 'wang@x.com', role: 'viewer', status: 'disabled' },
];

// 自增 ID 游标。模块级变量在 dev 单进程里会一直存活。
let nextId = users.length + 1;

// —— 下面 5 个函数就是“增删改查”的雏形，每个分支都会反复见到 ——

/** 查：列表 */
export function listUsers(): User[] {
  return users;
}

/** 查：单个 */
export function getUser(id: number): User | undefined {
  return users.find((u) => u.id === id);
}

/** 增：返回新建的实体（自动补 id） */
export function createUser(input: Omit<User, 'id'>): User {
  const user: User = { id: nextId++, ...input };
  users.push(user);
  return user;
}

/** 改：按 id 局部更新 */
export function updateUser(id: number, patch: Partial<Omit<User, 'id'>>): User | undefined {
  const user = users.find((u) => u.id === id);
  if (!user) return undefined;
  Object.assign(user, patch);
  return user;
}

/** 删：按 id 删除，返回是否成功 */
export function deleteUser(id: number): boolean {
  const i = users.findIndex((u) => u.id === id);
  if (i === -1) return false;
  users.splice(i, 1);
  return true;
}
