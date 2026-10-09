import { z } from 'zod'

// 👉 在这里设计校验规则：一条字段可以「链式」挂多条规则，全部通过才算合法
export const todoSchema = z.object({
  text: z
    .string()
    .min(4, '至少 4 个字符') // 规则1：最短 4（原 1 改成 4）
    .max(50, '最多 50 字') // 规则2：最长 50
    .regex(/^[^@#$%]+$/, '不能包含 @#$% 等特殊字符'), // 规则3：正则，禁止某些特殊字符
})

export type TodoForm = z.infer<typeof todoSchema>
