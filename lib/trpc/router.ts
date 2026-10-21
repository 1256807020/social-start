// ───────────────────────────────────────────────────────────
// 【tRPC 分支 · learn/trpc】服务端 router（类型安全的"后端契约"）
// ───────────────────────────────────────────────────────────
// 💡 一句话：tRPC 没有传统的「手写 API 路由 + 手写前后端共享类型」。
//    你在服务端用代码定义好"有哪些过程、入参什么形状、返回什么形状"，
//    tRPC 自动把这棵树的【类型】导出成 `AppRouter`，
//    前端 `import type { AppRouter }` 后，调用即带完整 TS 提示 + 编译期校验。
//    → 后端改了入参，前端没改 → 编译直接报错。这就是"端到端类型安全"。
//
// 🔧 固定写法（务必背，别背错）：
//    initTRPC.create()        → 拿到一个 trpc 实例（配置上下文/格式化器等）
//    t.router({...})          → 把多个 procedure 聚成一棵可调用树（= 整个 API）
//    t.procedure              → 一个可调用的"过程"（= 一个接口）
//      .input(zodSchema)      → 入参校验/推导类型（同时管运行时校验 + TS 类型）
//      .query(fn)             → 只读查询（对应 GET 语义）
//      .mutation(fn)          → 写操作（对应 POST/PUT/DELETE 语义）
//    export type AppRouter = typeof appRouter  → 把"树的类型"导出去给前端用
//
// 🧭 与本项目其它分支的关系：这里故意【不】走 REST（app/api/[resource]），
//    而是复用同一套存储引擎（lib/json-db + lib/query），只换"接口协议"为 tRPC。
//    所以你看到 read/transaction/genId/applyQuery 都是老熟人——tRPC 只是换了个门面。
// ───────────────────────────────────────────────────────────
import { initTRPC } from '@trpc/server'
import { z } from 'zod'
import { read, transaction, genId } from '../json-db'
import { applyQuery } from '../query'

// 创建一个 tRPC 实例。create() 可传 { ctx 工厂 / 错误处理 / transformer }，
// 这里用默认配置即可（无鉴权、JSON 序列化）。
const t = initTRPC.create()

// 把常用零件导出去，避免每个文件都 initTRPC 一遍。
export const router = t.router
export const publicProcedure = t.procedure // "public" = 无需登录即可调；
//                                           若加鉴权，会多一个 t.procedure.use(isAuthed) 的中间件版。

// 整棵 API 树。键名（todoList/todoAdd/...）= 前端调用的"过程名"。
export const appRouter = router({
  // ── ① 列表：query（只读）─────────────────────────────
  // .input 用 zod 同时做两件事：运行时校验 + 推导出 input 的 TS 类型。
  // 前端 trpc.todoList.useQuery({ page, pageSize, sort }) 的入参会被 TS 强制成这个形状。
  todoList: publicProcedure
    .input(z.object({
      page: z.number().int().min(1).default(1),            // 默认第 1 页
      pageSize: z.number().int().min(1).max(100).default(8), // 默认 8 条/页，上限 100 防滥用
      sort: z.string().optional(),                          // 可选排序，如 '-id' 表示按 id 倒序
    }))
    .query(async ({ input }) => {
      // read('todo')：从本项目 JSON 引擎读整个 todo 集合
      const list = await read('todo')
      // applyQuery：分页 + 排序（纯函数，与 REST 分支完全共用）
      return applyQuery(list, { page: input.page, pageSize: input.pageSize, sort: input.sort ?? '-id' })
    }),

  // ── ② 新增：mutation（写）────────────────────────────
  todoAdd: publicProcedure
    .input(z.object({
      title: z.string().min(1),                 // 标题非空
      done: z.boolean().default(false),          // 默认未完成
    }))
    .mutation(async ({ input }) => {
      // transaction：原子写（本项目 JSON 引擎的串行队列 + 原子落盘）
      return transaction('todo', (list) => {
        const id = genId(new Set(list.map((i) => String(i.id)))) // 生成不重复 id
        const item = { id, title: input.title, done: input.done, createdAt: new Date().toISOString() }
        list.unshift(item) // 新任务插到最前（配合默认 sort:'-id' 的"最新在上"预期）
        return item        // 这个返回值会自动成为前端 mutation 的 resolve 值
      })
    }),

  // ── ③ 局部更新：mutation（增量合并，等价于 REST 的 PATCH）──
  todoPatch: publicProcedure
    .input(z.object({
      id: z.number(),
      patch: z.record(z.any()), // 任意字段的子集，如 { done:true } 或 { title:'x' }
    }))
    .mutation(async ({ input }) => {
      return transaction('todo', (list) => {
        const i = list.findIndex((x) => String(x.id) === String(input.id))
        if (i === -1) return null
        list[i] = { ...list[i], ...input.patch } // 只合并 patch 里的字段，其余不动
        return list[i]
      })
    }),

  // ── ④ 删除：mutation ────────────────────────────────
  todoRemove: publicProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    return transaction('todo', (list) => {
      const i = list.findIndex((x) => String(x.id) === String(input.id))
      if (i !== -1) list.splice(i, 1)
      return { ok: true } // 简单成功标记
    })
  }),
})

// ⭐ 关键导出：把这棵树的【类型】导出去。
// 前端 createTRPCReact<AppRouter>() 拿到的 hooks（trpc.todoList.useQuery ...）
// 的入参/返回值类型，全部由这里推导。后端改了这里，前端类型自动跟着变。
export type AppRouter = typeof appRouter
