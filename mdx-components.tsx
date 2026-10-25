// 【next-mdx · MDX 组件映射】mdx-components.tsx（必须放在项目根目录）
// 🔧 固定写法：@next/mdx 在 App Router 下要求根目录有这个文件，并导出 useMDXComponents。
//    作用：给 MDX 渲染出来的原生标签套上样式（否则就是光秃秃的浏览器默认样式）。
// 对照 Vue：相当于 Vue 里给 markdown-it / unplugin-vue-markdown 配的 renderer 规则，
//    或在 Nuxt 里用 @nuxtjs/mdx + prose 组件覆盖（@tailwindcss/typography 的 prose 也是同类思路）。
import type { ComponentPropsWithoutRef } from 'react'

export function useMDXComponents(components: Record<string, unknown>) {
  return {
    h1: (props: ComponentPropsWithoutRef<'h1'>) => (
      <h1 className="mb-3 mt-6 text-2xl font-bold" {...props} />
    ),
    h2: (props: ComponentPropsWithoutRef<'h2'>) => (
      <h2 className="mb-2 mt-5 text-lg font-semibold" {...props} />
    ),
    p: (props: ComponentPropsWithoutRef<'p'>) => (
      <p className="mb-3 text-sm text-gray-700" {...props} />
    ),
    ul: (props: ComponentPropsWithoutRef<'ul'>) => (
      <ul className="mb-3 list-disc space-y-1 pl-5 text-sm text-gray-700" {...props} />
    ),
    ol: (props: ComponentPropsWithoutRef<'ol'>) => (
      <ol className="mb-3 list-decimal space-y-1 pl-5 text-sm text-gray-700" {...props} />
    ),
    code: (props: ComponentPropsWithoutRef<'code'>) => (
      <code className="rounded bg-gray-100 px-1 font-mono text-xs" {...props} />
    ),
    blockquote: (props: ComponentPropsWithoutRef<'blockquote'>) => (
      <blockquote className="mb-3 border-l-4 border-gray-300 pl-3 text-sm text-gray-600" {...props} />
    ),
    // 最后展开传入的 components：允许单个 MDX 文件再覆盖/追加自己的组件
    ...components,
  }
}
