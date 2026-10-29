// ───────────────────────────────────────────────────────────
// 递归树节点：渲染 todo 经 ?tree=1 派生的嵌套结构（parentId → children）
// 📌 【React 关键坑】组件必须定义在【模块作用域】、独立成文件。
//    如果把组件定义在页面组件的函数体里，每次 re-render 都会产生
//    一个【新的组件类型】，React 认为类型变了 → 卸载并重建整棵子树，
//    子树内部 state 全部丢失（页面还看不出问题，但这是个真 bug）。
// 📌 递归类型：node 用 TodoNode（children 里还是 TodoNode），不用 any。
// ───────────────────────────────────────────────────────────
import type { TodoNode } from '@/types/todo'

export function TreeNode({ node, depth = 0 }: { node: TodoNode; depth?: number }) {
  return (
    <li>
      <span style={{ paddingLeft: depth * 16 }} className="inline-block">
        <span className="text-gray-400">└</span> #{node.id} {node.title}
        {node.done ? ' ✅' : ''}
      </span>
      {node.children && node.children.length > 0 && (
        <ul>
          {node.children.map((c) => (
            <TreeNode key={c.id} node={c} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  )
}
