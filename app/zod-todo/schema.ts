import { z } from 'zod'

// 👉 在这里设计校验规则：文本必填、长度限制等
export const todoSchema = z.object({
  text: z.string().min(1, '不能为空').max(50, '最多 50 字'),
})

export type TodoForm = z.infer<typeof todoSchema>
