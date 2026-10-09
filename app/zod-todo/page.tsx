'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { todoSchema, TodoForm } from './schema'

/**
 * Zod + react-hook-form 是 React 表单校验的「标准组合」：
 *   • zod         = 纯 TS 的 schema 校验器（定义规则 + 用 z.infer 推导类型 TodoForm）
 *   • RHF         = 接管表单的 register/handleSubmit，避免受控组件每次按键都重渲染
 *   • zodResolver = 把 zod schema 接到 RHF 上，校验失败就拦在 onSubmit 门外
 *
 * ───── 从 Vue 转 React（表单校验篇）─────
 *   • Vue3 同款思路：vee-validate 的 useForm + toTypedSchema(todoSchema)，zod 规则直接复用。
 *       const { defineField, handleSubmit, errors } = useForm({ validationSchema: toTypedSchema(todoSchema) })
 *       提交也是 handleSubmit(fn)，失败同样进不来——心智和 RHF+zod 几乎一致。
 *   • Vue2 时代：多在 methods 里手写 if/else 校验，或 VeeValidate v2 用 <ValidationProvider> 包裹。
 *   共同点：都是「先声明式定义 schema → 提交时校验 → 失败显示 errors.message」。
 *   zod 的 z.infer 自动出类型，少写一份 interface（Vue 侧通常得自己再写个类型）。
 *
 * ───── 生产级复杂度扩展（知道复杂表单还差哪些常用例子）─────
 *   本例只覆盖了「单字段多规则」(✅)。生产表单的常见扩展与三框架对照：
 *   ┌──────────────────┬─────────────────────────────────┬──────────────────────────┬────────────┐
 *   │ 复杂度           │ RHF + Zod                        │ Element UI / Plus        │ 本例对应   │
 *   ├──────────────────┼─────────────────────────────────┼──────────────────────────┼────────────┤
 *   │ 单字段多规则     │ .min().max().regex() 链式        │ rules 数组多项           │ ✅ 已会   │
 *   │ 跨字段校验       │ .refine()/.superRefine()         │ validator 自定义函数     │ 下一步     │
 *   │ 异步校验(查重)   │ z.string().refine(async v=>...)  │ asyncValidator           │ 下一步     │
 *   │ 嵌套/数组字段    │ z.object({addr:z.object(...)})/   │ prop 嵌套 + el-form 嵌套 │ 下一步     │
 *   │                  │ z.array(...)                    │                          │            │
 *   └──────────────────┴─────────────────────────────────┴──────────────────────────┴────────────┘
 *   关键心智：生产表单 = 字段集 + 集中式规则集（规则可叠加），UI 只负责渲染报错。
 *   跨字段/异步在 Zod 里用 .refine() 兜底，≈ Element UI 的 validator / asyncValidator。
 *   想看完整 CRUD 加强版，参考同仓库 learn/rhf-zod-crud 分支。
 */
export default function ZodTodoPage() {
  // ── 固定模板：以下 useForm 解构 + resolver 是 RHF+Zod 的标准接法 ──
  const {
    register,        // 固定：把 input 绑到表单字段（不写规则，只按字段名连）
    handleSubmit,    // 固定：包装提交，校验通过才调 onSubmit
    reset,           // 固定：清空表单回初始态
    formState: { errors }, // 固定：校验失败的错误集，errors.<字段>.message
  } = useForm<TodoForm>({ // <TodoForm> 换成你的表单类型（来自 z.infer）
    // 👉 接上 zod 校验器（整行固定，只换 todoSchema 名）
    resolver: zodResolver(todoSchema),
  })

  const [todos, setTodos] = useState<{ id: number; text: string }[]>([])

  // 👉 提交：校验通过后把 data.text 加入列表，再 reset() 清空表单
  // 关键点：onSubmit 只在 zod 校验通过后的「干净 data」上跑——非法输入根本进不来
  const onSubmit = (data: TodoForm) => {
    setTodos((list) => [...list, { id: Date.now(), text: data.text }])
    reset() // 清空输入框，回到初始态
  }

  // 👉 删：setTodos 过滤掉 id（不可变写法；和 Vue 里 this.list = this.list.filter(...) 一个意思）
  const handleRemove = (id: number) => {
    setTodos((list) => list.filter((x) => x.id !== id))
  }

  return (
    <main style={{ maxWidth: 640, margin: '40px auto', fontFamily: 'system-ui' }}>
      <h1>
        Zod + react-hook-form Todo <small>（learn/zod-todo）</small>
      </h1>
      {/* input 打字 → register 收集值
      ↓ 点"添加" → handleSubmit 触发
      ↓ zodResolver 用 todoSchema 校验
      ├─ 失败 → errors.text 有值 → 页面显示红字，onSubmit 不跑
      └─ 通过 → onSubmit(data) 跑 → setTodos 加一项 + reset() 清空 */}

      {/* 固定模板：handleSubmit(函数) 包一层，校验通过才触发 onSubmit（函数名可换） */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <input
          // register('text') 不是写规则，只是"用字段名 'text' 把本 input 绑上表单"；
          // 规则在 schema.ts 的 todoSchema 里，由上面的 zodResolver 生效。
          // {...register('text')} 这一行固定，'text' 必须 = schema 的 key。
          {...register('text')}
          placeholder="👉 输入 todo（校验：4–50 字，不含 @#$% 等特殊字符）"
        />
        <button type="submit">添加</button>
      </form>

      {/* 固定模板：errors.<字段>.message 取报错文案；'text' 必须 = 字段名 */}
      {errors.text && <p style={{ color: 'red' }}>{errors.text.message}</p>}

      <ul>
        {todos.map((t) => (
          <li
            key={t.id}
            style={{ display: 'flex', gap: 8, alignItems: 'center', margin: '6px 0' }}
          >
            <span style={{ flex: 1 }}>{t.text}</span>
            <button onClick={() => handleRemove(t.id)}>删除</button>
          </li>
        ))}
      </ul>

      {todos.length === 0 && (
        <p>👉 列表空，添加一条试试（留空或超长会触发 zod 校验报错）</p>
      )}

      {/* ④ React↔Vue2/Vue3 表单校验对照速查（折叠，不打断练习） */}
      <details style={{ marginTop: 24, fontSize: 13 }}>
        <summary>④ React↔Vue2/Vue3 表单校验对照速查</summary>
        <table
          border={1}
          cellPadding={6}
          style={{ borderCollapse: 'collapse', marginTop: 8, width: '100%' }}
        >
          <thead>
            <tr>
              <th>维度</th>
              <th>React（RHF + Zod）</th>
              <th>Vue3（vee-validate + Zod）</th>
              <th>Vue2（手写 / VeeValidate v2）</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>定义规则</td>
              <td>{'z.object({ text: z.string().min(4).max(50).regex(/^[^@#$%]+$/) })'}</td>
              <td>同 zod schema（toTypedSchema 包一下）</td>
              <td>methods 里 if/else 或 rules</td>
            </tr>
            <tr>
              <td>类型推导</td>
              <td>z.infer&lt;typeof schema&gt;</td>
              <td>同 z.infer</td>
              <td>手写 interface</td>
            </tr>
            <tr>
              <td>接管表单</td>
              <td>register / useForm</td>
              <td>useForm + defineField</td>
              <td>v-model + ValidationProvider</td>
            </tr>
            <tr>
              <td>提交校验</td>
              <td>handleSubmit 拦在门外</td>
              <td>handleSubmit 同</td>
              <td>提交前手动 valid</td>
            </tr>
            <tr>
              <td>错误展示</td>
              <td>formState.errors.text.message</td>
              <td>errors.text</td>
              <td>各自 error 对象</td>
            </tr>
          </tbody>
        </table>
      </details>
    </main>
  )
}
