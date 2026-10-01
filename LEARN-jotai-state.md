# learn/jotai-state —— Jotai 原子状态管理骨架

> 从 `basic` 分支切出。练 **Jotai**（原子化状态管理，2026 很火）。
> 目标：**带注释的学习骨架**。

## 跑起来
```bash
pnpm dev
# 访问 http://localhost:4000/jotai
```

## 这个分支练什么
1. **原子（atom）是最小状态单元** —— `lib/jotai-store.ts`：
   - 基元 atom：`inputAtom`
   - 源数据 atom：`todosAtom`
   - 派生 atom（只读）：`remainingAtom`（`(get) => ...` 自动随依赖重算）
   - 写原子（动作）：`addTodoAtom` / `toggleTodoAtom` / `removeTodoAtom`（`atom(null, (get, set, ...args)`）
2. **三种 hook** —— `app/jotai/page.tsx`：
   - `useAtom` 读写、`useAtomValue` 只读、`useSetAtom` 只写
3. **Provider 圈作用域** —— 在客户端组件外包 `<Provider>`，避免 SSR 下跨请求串状态（生产最佳实践）。

## 关键文件
| 文件 | 作用 |
|---|---|
| `lib/jotai-store.ts` | 所有 atom 定义（源数据 + 派生 + 写动作） |
| `app/jotai/page.tsx` | 客户端页：订阅原子 + 渲染 |

## 对比
- `zustand-todo` / `redux-todo` / `zod-todo` 是「单一大 store」思路；Jotai 是「原子化」，组件只订阅关心的原子，重渲染更精准。
- 表单校验场景可和 `learn/rhf-zod-crud` 搭配：Jotai 存业务状态，RHF 管表单临时状态。

## 练习 TODO
1. [ ] 加 `atomFamily` 给每个 todo 单独一个“可编辑文本”原子，体验“一原子一状态”。
2. [ ] 用 `useHydrateAtoms` 把服务端初始数据灌进原子（SEO/首屏场景）。
3. [ ] 加 `selectAtom` 只订阅某个字段，验证“其余字段变了也不重渲染”。
4. [ ] 把过滤条件（全部/未完成/已完成）做成原子，派生一个 `filteredTodosAtom` 练习组合派生。
