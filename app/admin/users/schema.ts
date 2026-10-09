// ============================================================================
// 表单的数据契约：zod schema
// ----------------------------------------------------------------------------
// 关键点：zod schema 一份顶两份——既做「运行时校验」，又用 z.infer 推导出 TS 类型。
// 后台常见的“表单类型”和“校验规则”不再写两遍，改一处即可。
//
// ───── 从 Vue 转 React（表单校验篇）─────
//   • Vue3 + vee-validate：用 toTypedSchema(userSchema) 把同一份 zod 规则接到表单，
//     schema 完全复用，类型也是 z.infer —— 心智和 RHF+zod 一模一样。
//   • Vue2：多在 methods 里手写 if/else 校验，或 Element UI 的 rules 数组
//     （{ required, min, max, pattern }）—— 和下面的链式规则一一对应，但和 UI 模板耦合。
//   • 对比 React 的 zod：规则写在独立文件（解耦），且 z.infer 自动出类型（少写一份 interface）。
// ============================================================================
import { z } from 'zod';

// 🔧 固定写法：z.object({ 字段: 校验链 }) —— 一条校验链 = 一个字段的全部规则
export const userSchema = z.object({
  // .min(1, '报错文案')：必填；.max(20, ...) 限制长度
  name: z.string().min(1, '姓名必填').max(20, '最多 20 字'),
  // zod v4 推荐用顶层 z.email() 校验邮箱（旧版 z.string().email() 已弃用）
  email: z.email('邮箱格式不正确'),
  // z.enum 限定枚举值，类型自动变成联合类型
  role: z.enum(['admin', 'editor', 'viewer']),
  status: z.enum(['active', 'disabled']),
});

// 🔧 固定写法：z.infer<typeof schema> —— 由 schema 反推类型，表单初值/submit 参数都复用它，
//   保证「类型」和「校验」永远同步（改 schema 一处，类型自动跟着变）。
export type UserForm = z.infer<typeof userSchema>;
