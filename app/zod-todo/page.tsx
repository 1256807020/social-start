'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { todoSchema, TodoForm } from './schema'

// ───────────────────────────────────────────────────────────
// 从 Vue 转 React（运行时校验篇）· Zod
// · Vue2 对照：手写 if / vee-validate
// · Vue3 对照：zod + vee-validate / 手写
// · React 对照：Zod 用 schema 声明校验，编译期拿类型、运行期校验数据（接口/表单通用）
// 📌 实战定位：Zod 属【常规业务常用】；前后端共享 schema，类型与校验一份搞定，是 TS 项目的标配。
// 🧭 学习模式：🔧固定写法=const S=z.object({title:z.string().min(1)}); S.parse(data) / type T=z.infer<typeof S>；👉=练习点已填；文末对照。
// ───────────────────────────────────────────────────────────
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
      <details className="mt-6 rounded border p-3 text-sm">
        <summary className="cursor-pointer font-semibold">📚 Vue2 / Vue3 / React 三向对照 &amp; 本项目小结</summary>
        <table className="mt-2 w-full border-collapse text-left">
          <thead>
            <tr className="border-b">
              <th className="px-2 py-1">维度</th><th className="px-2 py-1">Vue2 (Options)</th><th className="px-2 py-1">Vue3 (Composition)</th><th className="px-2 py-1">React</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b"><td className="px-2 py-1">校验声明</td><td className="px-2 py-1">手写 if</td><td className="px-2 py-1">zod / yup</td><td className="px-2 py-1">zod schema</td></tr>
            <tr className="border-b"><td className="px-2 py-1">类型推导</td><td className="px-2 py-1">手动 interface</td><td className="px-2 py-1">z.infer</td><td className="px-2 py-1">z.infer&lt;typeof S&gt;</td></tr>
            <tr className="border-b"><td className="px-2 py-1">运行期校验</td><td className="px-2 py-1">if 判断</td><td className="px-2 py-1">S.parse</td><td className="px-2 py-1">S.safeParse</td></tr>
            <tr className="border-b"><td className="px-2 py-1">使用场景</td><td className="px-2 py-1">表单</td><td className="px-2 py-1">表单/接口</td><td className="px-2 py-1">表单 + 接口响应校验</td></tr>
          </tbody>
        </table>
        <p className="mt-2 text-gray-500">📝 小结：Zod 一处声明、同时产出 TS 类型与运行期校验；配合表单（RHF）或校验接口返回都极顺手。</p>
      </details>
    </main>
  )
}
