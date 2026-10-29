// ───────────────────────────────────────────────────────────
// 资源类型定义（前端消费形状）—— 示例：内置 todo.json 集合
// 📌 这只是「内置集合」的一个样例。你自己定义 xxx.json 时，
//    照抄本文件建一份 types/xxx.ts 即可（或直接用 types/api.ts 的通用泛型），
//    后端完全不用配合 —— 引擎不校验 schema。
// 📌 只声明「本页真正用到的字段」，不追求与后端一一对应 ——
//    基座是 schema-less，后端字段随时可增删，这里跟着用到的字段加即可。
// 📌 统一用 [key: string]: unknown 兜住引擎的动态字段：
//    未声明的字段可以正常存在（不会报错），但读取时是 unknown 需先收窄。
// ───────────────────────────────────────────────────────────

/** 一条 todo 记录 */
export interface Todo {
  id: number
  title: string
  done?: boolean
  /** 父节点 id；根节点为 0 / 缺省。树形结构由 ?tree=1 在后端派生 */
  parentId?: number | null
  createdAt?: string
  updatedAt?: string
  /** 引擎允许动态字段：未声明字段一律 unknown（不是 any） */
  [key: string]: unknown
}

/**
 * 树形节点：todo + children
 * 📌 递归类型：children 里还是 TodoNode —— 引擎 ?tree=1 派生的就是这种结构
 */
export interface TodoNode extends Todo {
  children?: TodoNode[]
}

/** 图片集合记录（/api/image/list） */
export interface ImageItem {
  name: string
  url: string
  [key: string]: unknown
}

/** 图形验证码（/api/captcha） */
export interface Captcha {
  captchaId: string
  image: string
  [key: string]: unknown
}
