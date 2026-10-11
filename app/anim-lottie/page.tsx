// ───────────────────────────────────────────────────────────
// 从 Vue 转 React（动画·Lottie 篇）· 矢量 JSON 动画
// · Vue2/Vue3 对照：vue3-lottie 同样是包一层 lottie-web；React 用 lottie-react，API 都是「喂 animationData + 控制 play/pause/stop」。
// · React 对照：<Lottie animationData={data} lottieRef={ref} />，ref 拿到 play()/pause()/stop()（本例）。
// 📌 实战定位：品牌/运营矢量动效【了解即可·进阶】；直接导入 AE 导出的 Lottie JSON，体积小、与设计师无缝衔接，是品牌官网首选。
// 🧭 学习模式：🔧固定写法=import Lottie from 'lottie-react'; <Lottie animationData loop autoplay/>；lottieRef 控播放；👉=练习点已填；文末对照。
// ───────────────────────────────────────────────────────────
'use client'

import { useRef } from 'react'
import Lottie, { type LottieRefCurrentProps } from 'lottie-react'
import animationData from './animation.json'
// 练习前在本分支运行：pnpm add lottie-react
// 实战中把 animation.json 换成设计师从 After Effects 导出的 .json / .lottie 即可

export default function LottiePage() {
  const lottieRef = useRef<LottieRefCurrentProps>(null)

  return (
    <main style={{ padding: 40, fontFamily: 'system-ui' }}>
      <h1>Lottie：矢量 JSON 动画</h1>
      <p>下方是内联的最小 Lottie（旋转蓝圆）。实战把 animation.json 换成 AE 导出的品牌动效即可。</p>
      <Lottie
        lottieRef={lottieRef}
        animationData={animationData}
        loop
        autoplay
        style={{ width: 240, height: 240 }}
      />
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        {/* 👉 用 ref 控制播放时机：这正是「Lottie + GSAP/其他元素」联动时序的入口 */}
        <button onClick={() => lottieRef.current?.play()}>播放</button>
        <button onClick={() => lottieRef.current?.pause()}>暂停</button>
        <button onClick={() => lottieRef.current?.stop()}>停止</button>
      </div>
      <details className="mt-6 rounded border p-3 text-sm">
        <summary className="cursor-pointer font-semibold">📚 Vue2 / Vue3 / React 三向对照 & 小结</summary>
        <table className="mt-2 w-full border-collapse text-left">
          <thead>
            <tr className="border-b"><th className="px-2 py-1">维度</th><th className="px-2 py-1">Vue3</th><th className="px-2 py-1">React</th></tr>
          </thead>
          <tbody>
            <tr className="border-b"><td className="px-2 py-1">库</td><td className="px-2 py-1">vue3-lottie</td><td className="px-2 py-1">lottie-react</td></tr>
            <tr className="border-b"><td className="px-2 py-1">数据</td><td className="px-2 py-1">animationData / path</td><td className="px-2 py-1">animationData / path（一致）</td></tr>
            <tr className="border-b"><td className="px-2 py-1">控制</td><td className="px-2 py-1">组件 ref</td><td className="px-2 py-1">lottieRef（play/pause/stop）</td></tr>
          </tbody>
        </table>
        <p className="mt-2 text-gray-500">📝 小结：Lottie 解决「设计师产出 ↔ 前端还原」断层；配合 GSAP 可补 Lottie 自身交互弱的短板（控制播放时序）。</p>
      </details>
    </main>
  )
}
