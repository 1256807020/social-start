// ============================================================================
// 用户 CRUD 的「真实后端」客户端（替代 lib/users-store.ts 的内存假库）
// ----------------------------------------------------------------------------
// 后端是仓库通用的 JSON 引擎：/api/<resource> 一套 CRUD，这里 resource = 'users'。
// 信封统一为 { code, data, msg, total }，code === 0 才成功（见 lib/response.ts）。
//
// 对比 lib/users-store.ts（假库）：
//   • 假库：函数「同步、直接改内存数组」，刷新页面数据就没了（进程内存）。
//   • 本文件：函数「异步、发 fetch 到服务端」，数据落在 data/users.json，刷新不丢。
// 这是前端从「玩具」走向「真项目」的关键一跃——前端不再持有数据，只负责「拉 / 写」。
//
// ───── 从 Vue 转 React（数据请求篇）─────
//   • Vue3 + Pinia：actions 里写 `await axios.get('/api/users')` 再 `this.list = res.data`——
//     和这里的 listUsers() 几乎一致（都是「异步取数 + 塞进状态」）。Pinia 用 async action，
//     React 用 async 函数 + useState/useEffect。
//   • Vue2 + Vuex：actions 里 `commit('setUsers', res.data)`；这里没有 commit，直接 setUsers(...)。
//   共同点：都是「请求 → 拿到数据 → 更新界面状态」，数据流方向一模一样。
// ============================================================================
import type { User } from './users-store'; // 复用同一份 User 类型（保持假库/真库类型一致）
export type { User }; // 重新导出，方便页面直接从本文件取 User 类型

const RES = 'users';
const BASE = `/api/${RES}`;

// 🔧 固定写法：统一的「解包」函数——fetch 拿到响应后，先判 code，失败抛错，成功吐 data
//   所有接口都走它，组件侧就不必每次重复 if (json.code !== 0) 了
async function unwrap<T>(res: Response): Promise<T> {
  const json = await res.json();
  if (json.code !== 0) throw new Error(json.msg || '请求失败');
  return json.data as T;
}

// 🔧 固定写法：每个 CRUD 方法 = 一次 fetch + unwrap，方法名对应后端动作
export async function listUsers(): Promise<User[]> {
  return unwrap<User[]>(await fetch(BASE));
}

export async function createUser(input: Omit<User, 'id'>): Promise<User> {
  return unwrap<User>(
    await fetch(BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    }),
  );
}

// PUT = 全量替换（服务端会保留 id）；想只改部分字段可改用 PATCH
export async function updateUser(id: number, patch: Partial<Omit<User, 'id'>>): Promise<User> {
  return unwrap<User>(
    await fetch(`${BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    }),
  );
}

export async function deleteUser(id: number): Promise<void> {
  await unwrap<unknown>(
    await fetch(`${BASE}/${id}`, {
      method: 'DELETE',
    }),
  );
}
