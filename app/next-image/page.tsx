// 【next-image · next/image 图片优化】app/next-image/page.tsx
// 从 Vue 转 React（生态篇）：
//   Vue 本身没有内置图片优化组件；Nuxt 生态里有官方模块 <strong>@nuxt/image</strong> 的
//   <NuxtImg> / <NuxtPicture>（自动瘦身、自动 WebP、自动响应式 sizes）。
//   Next.js 的对位就是内置组件 <strong>next/image</strong> —— 不用装任何东西，开箱即用。
// 实战定位：<img> 换成 next/image，白拿四件事：
//   ① 自动压缩 + 转 WebP/AVIF；② 按屏幕生成多尺寸（srcset）；
//   ③ 懒加载（进入视口才加载）；④ 预留宽高避免布局抖动（CLS）。
// 学习模式：🔧 固定写法 = 本地图给 width/height；撑满容器用 fill + sizes；
//          首屏大图加 priority；👉 练习点 = 在 next.config 里配一个远程域名并用远程图。
import Image from 'next/image'

export default function NextImagePage() {
  return (
    <main className="mx-auto max-w-3xl space-y-6 p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">next/image 图片优化 · /next-image</h1>
        <p className="text-sm text-gray-500">
          Vue 侧对照：Nuxt 用 <code>&lt;NuxtImg&gt;</code>（@nuxt/image 模块）；Next 用内置{' '}
          <code>next/image</code>。
        </p>
      </header>

      {/* ① 基础用法：给 width/height，框架预留占位 → 不会布局抖动（CLS） */}
      <section className="space-y-2">
        <h2 className="text-lg font-semibold">① 基础：给宽高（防抖动）</h2>
        <Image src="/logo.png" alt="站点 Logo" width={120} height={120} />
        <p className="text-xs text-gray-500">
          width/height 必填（或用 fill）—— 它让浏览器提前占位，图片到位时页面不会跳一下。
        </p>
      </section>

      {/* ② fill：撑满父容器（父元素必须 relative + 有高度） */}
      <section className="space-y-2">
        <h2 className="text-lg font-semibold">② fill：撑满容器（做 banner / 卡片封面）</h2>
        <div className="relative h-48 w-full overflow-hidden rounded border">
          <Image src="/avatar.png" alt="封面图" fill sizes="(max-width: 768px) 100vw, 768px" className="object-cover" />
        </div>
        <p className="text-xs text-gray-500">
          fill 时图片是绝对定位，父容器必须 <code>relative</code> 且有高度；配{' '}
          <code>sizes</code> 才能生成正确的响应式尺寸。
        </p>
      </section>

      {/* ③ priority：首屏大图（LCP）关掉懒加载 */}
      <section className="space-y-2">
        <h2 className="text-lg font-semibold">③ priority：首屏大图</h2>
        <Image src="/logo.png" alt="首屏大图" width={96} height={96} priority quality={90} />
        <p className="text-xs text-gray-500">
          默认懒加载（滚动到才加载）。首屏那张最大的图要加 <code>priority</code>，
          否则它会晚一步加载，拖慢 LCP 指标。
        </p>
      </section>

      {/* ④ placeholder 模糊占位 + quality 质量 */}
      <section className="space-y-2">
        <h2 className="text-lg font-semibold">④ placeholder 模糊占位 + quality</h2>
        <Image
          src="/avatar.png"
          alt="带模糊占位的图"
          width={96}
          height={96}
          quality={75}
          placeholder="blur"
          // blurDataURL：静态 import 的图会自动生成，用 public 路径时必须自己给一个极小的占位图
          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
        />
        <p className="text-xs text-gray-500">
          <code>placeholder=&quot;blur&quot;</code> 会在图加载完成前先显示一张模糊小图，体验更平滑；
          <code>quality</code>（1–100，默认 75）控制压缩质量，数字越小文件越小。
        </p>
      </section>

      {/* ⑤ 配置进阶：这些都在 next.config 里，光写组件属性没用 */}
      <section className="space-y-2 rounded border bg-amber-50 p-4">
        <h2 className="text-lg font-semibold">⑤ 配置进阶（在 next.config.mjs 里）</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
          <li>
            <strong>前提坑</strong>：基座默认有 <code>images.unoptimized = true</code>（原图直出）。
            只要它还开着，下面所有优化配置<strong>全部不生效</strong> —— 本分支已把它去掉。
          </li>
          <li>
            <code>remotePatterns</code>：远程图域名白名单。没登记就用外链图 → <strong>直接报错</strong>。
            这是 next/image 最高频的报错来源。
          </li>
          <li>
            <code>formats</code>：输出格式，通常 <code>{'['}&apos;image/avif&apos;, &apos;image/webp&apos;{']'}</code>。
            AVIF 更小但编码慢。
          </li>
          <li>
            <code>deviceSizes</code>：生成哪些「整屏宽度」档位（配合 <code>sizes</code> 做响应式）。
          </li>
          <li>
            <code>imageSizes</code>：生成哪些「小图」档位（头像/缩略图）。
          </li>
        </ul>
        <p className="text-xs text-gray-500">
          看效果：查看图片的实际 <code>src</code>，会是{' '}
          <code>/_next/image?url=...&amp;w=...&amp;q=75</code> 这种形式，
          说明走了优化管线（若还是 <code>/avatar.png</code> 原路径，说明 unoptimized 仍开着）。
        </p>
      </section>

      <details className="rounded border p-4 text-sm">
        <summary className="cursor-pointer font-semibold">Vue / Nuxt / React 三向对照 + 总结</summary>
        <table className="mt-3 w-full border-collapse text-left">
          <thead>
            <tr className="border-b">
              <th className="px-2 py-1">能力</th>
              <th className="px-2 py-1">Nuxt（@nuxt/image）</th>
              <th className="px-2 py-1">Next.js</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="px-2 py-1">组件</td>
              <td className="px-2 py-1">&lt;NuxtImg&gt;</td>
              <td className="px-2 py-1">&lt;Image&gt;（next/image）</td>
            </tr>
            <tr className="border-b">
              <td className="px-2 py-1">响应式尺寸</td>
              <td className="px-2 py-1">sizes 属性</td>
              <td className="px-2 py-1">sizes 属性</td>
            </tr>
            <tr className="border-b">
              <td className="px-2 py-1">撑满容器</td>
              <td className="px-2 py-1">fill</td>
              <td className="px-2 py-1">fill + 父级 relative</td>
            </tr>
            <tr>
              <td className="px-2 py-1">远程域名</td>
              <td className="px-2 py-1">nuxt.config image.domains</td>
              <td className="px-2 py-1">next.config images.remotePatterns</td>
            </tr>
          </tbody>
        </table>
        <p className="mt-3 text-gray-600">
          总结：记住四条 ——
          ① 本地图必须给 <code>width/height</code>；
          ② 撑满用 <code>fill</code>（父级 relative + sizes）；
          ③ 首屏大图加 <code>priority</code>；
          ④ 用<strong>远程图片</strong>前，必须在 <code>next.config</code> 的{' '}
          <code>images.remotePatterns</code> 白名单里登记域名，否则直接报错。
        </p>
      </details>
    </main>
  )
}
