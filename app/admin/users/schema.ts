// ============================================================================
// 表单的数据契约：zod schema
// ----------------------------------------------------------------------------
// 关键点：zod schema 一份顶两份——既做「运行时校验」，又用 z.infer 推导出 TS 类型。
// 后台常见的“表单类型”和“校验规则”不再写两遍，改一处即可。
// ============================================================================
import { z } from 'zod';

export const userSchema = z.object({
  // .min(1, '报错文案')：必填；.max(20, ...) 限制长度
  name: z.string().min(1, '姓名必填').max(20, '最多 20 字'),
  // zod v4 推荐用顶层 z.email() 校验邮箱（旧版 z.string().email() 已弃用）
  email: z.email('邮箱格式不正确'),
  // z.enum 限定枚举值，类型自动变成联合类型
  role: z.enum(['admin', 'editor', 'viewer']),
  status: z.enum(['active', 'disabled']),
});

// 由 schema 反推类型：表单初值、submit 参数都复用它，保证类型与校验永远一致。
export type UserForm = z.infer<typeof userSchema>;
