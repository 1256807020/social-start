// ───────────────────────────────────────────────────────────
// 从 Vue 转 React（动画·Swiper + GSAP 篇）· 滑动叙事
// · Vue2/Vue3 对照：vue-awesome-swiper / swiper/vue 同样用 <Swiper>；GSAP 绑定 slideChange 做内容动效，思路一致。
// · React 对照：swiper/react 的 <Swiper onSlideChange> 里用 gsap.fromTo 动当前 slide 内容（本例）。
// 📌 实战定位：滑动/轮播叙事【了解即可·进阶】；Swiper 提供成熟滑动切换，GSAP 把进度同步驱动页面内 DOM/SVG 动效，做沉浸式滑动故事。
// 🧭 学习模式：🔧固定写法=import {Swiper,SwiperSlide} from 'swiper/react'; onSlideChange 里 gsap.fromTo(swiper.slides[active],{…},{…})；👉=练习点已填；文末对照。
// ───────────────────────────────────────────────────────────
'use client'

import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import gsap from 'gsap'
// 练习前在本分支运行：pnpm add swiper gsap

const SLIDES = [
  { c: '#48f', t: '第一幕 · 开场' },
  { c: '#4f8', t: '第二幕 · 展开' },
  { c: '#f48', t: '第三幕 · 高潮' },
]

export default function SwiperPage() {
  // 👉 每次切到新 slide，用 GSAP 给它内容做一个进场动效
  const onSlideChange = (swiper: { slides: HTMLElement[]; activeIndex: number }) => {
    const el = swiper.slides[swiper.activeIndex]
    if (!el) return
    gsap.fromTo(
      el.querySelector('.sw-content'),
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }
    )
  }

  return (
    <main style={{ padding: 40, fontFamily: 'system-ui' }}>
      <h1>Swiper × GSAP：滑动叙事</h1>
      <Swiper
        modules={[Navigation, Pagination]}
        navigation
        pagination={{ clickable: true }}
        spaceBetween={20}
        slidesPerView={1}
        onSlideChange={onSlideChange}
        style={{ width: '100%', maxWidth: 520, marginTop: 12 }}
      >
        {SLIDES.map((s) => (
          <SwiperSlide key={s.t}>
            <div
              className="sw-content"
              style={{ height: 260, background: s.c, borderRadius: 12, display: 'grid', placeItems: 'center', color: '#fff', fontSize: 22 }}
            >
              {s.t}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      <details className="mt-6 rounded border p-3 text-sm">
        <summary className="cursor-pointer font-semibold">📚 Vue2 / Vue3 / React 三向对照 & 小结</summary>
        <table className="mt-2 w-full border-collapse text-left">
          <thead>
            <tr className="border-b"><th className="px-2 py-1">维度</th><th className="px-2 py-1">Vue3</th><th className="px-2 py-1">React</th></tr>
          </thead>
          <tbody>
            <tr className="border-b"><td className="px-2 py-1">组件</td><td className="px-2 py-1">&lt;swiper&gt; / &lt;swiper-slide&gt;</td><td className="px-2 py-1">&lt;Swiper&gt; / &lt;SwiperSlide&gt;</td></tr>
            <tr className="border-b"><td className="px-2 py-1">切页动效</td><td className="px-2 py-1">@slideChange + GSAP</td><td className="px-2 py-1">onSlideChange + GSAP（一致）</td></tr>
          </tbody>
        </table>
        <p className="mt-2 text-gray-500">📝 小结：Swiper 管「滑动切换」，GSAP 管「每页内容的编排时序」；二者组合是移动端/PC 沉浸式滑动故事的工业方案。</p>
      </details>
    </main>
  )
}
