// ───────────────────────────────────────────────────────────
// 从 Vue 转 React（动画·3D+GSAP 篇）· R3F × GSAP
// · Vue2/Vue3 对照：Three.js + GSAP 组合在 Vue 里同样用 onMounted 里 gsap.to(mesh.position,…)；R3F 只是把 mesh 换成 ref 拿到的对象。
// · React 对照：useRef 拿到 mesh 实例，useEffect 里 gsap.to(ref.current.position/rotation,…) 直接驱动 Three 对象属性（本例）。
// 📌 实战定位：滚动/时间轴驱动的 3D 动效【了解即可·进阶】；GSAP 时间轴精准控制模型位移、缩放、材质，是商业级 3D 叙事标配。
// 🧭 学习模式：🔧固定写法=useRef<Mesh> + useEffect→gsap.to(ref.current.position,{x,y,duration})；👉=练习点已填；文末对照。
// ───────────────────────────────────────────────────────────
'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import type { Mesh } from 'three'
// 练习前在本分支运行：pnpm add three @react-three/fiber @react-three/drei gsap

function GsapCube() {
  const ref = useRef<Mesh>(null)
  const spin = useRef(true)

  useEffect(() => {
    if (!ref.current) return
    // 👉 GSAP 直接驱动 Three 对象的 position / rotation / scale（它们都是带 x/y/z 的普通对象）
    const tl = gsap.timeline({ repeat: -1, yoyo: true })
    tl.to(ref.current.position, { x: 2, duration: 1.2, ease: 'power2.inOut' })
      .to(ref.current.scale, { x: 1.8, y: 1.8, z: 1.8, duration: 1.2 }, '<')
      .to(ref.current.rotation, { y: Math.PI, duration: 1.2 }, '<')
    return () => {
      tl.kill()
    }
  }, [])

  useFrame((_, delta) => {
    if (spin.current && ref.current) ref.current.rotation.x += delta * 0.3
  })

  return (
    <mesh ref={ref}>
      <boxGeometry args={[1.2, 1.2, 1.2]} />
      <meshStandardMaterial color="#48f" />
    </mesh>
  )
}

export default function R3FGsapPage() {
  return (
    <main style={{ padding: 24, fontFamily: 'system-ui' }}>
      <h1>R3F × GSAP：时间轴驱动 3D</h1>
      <p>GSAP 时间轴 yoyo 往复驱动立方体位移 / 缩放 / 旋转，叠加逐帧自转。</p>
      <div style={{ width: '100%', height: 420, background: '#0b1020', borderRadius: 8 }}>
        <Canvas camera={{ position: [4, 3, 5], fov: 50 }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <GsapCube />
          <OrbitControls />
        </Canvas>
      </div>
      <details className="mt-6 rounded border p-3 text-sm">
        <summary className="cursor-pointer font-semibold">📚 Vue2 / Vue3 / React 三向对照 & 小结</summary>
        <table className="mt-2 w-full border-collapse text-left">
          <thead>
            <tr className="border-b"><th className="px-2 py-1">维度</th><th className="px-2 py-1">Vue3</th><th className="px-2 py-1">React</th></tr>
          </thead>
          <tbody>
            <tr className="border-b"><td className="px-2 py-1">拿 3D 对象</td><td className="px-2 py-1">template ref</td><td className="px-2 py-1">useRef&lt;Mesh&gt;</td></tr>
            <tr className="border-b"><td className="px-2 py-1">驱动属性</td><td className="px-2 py-1">gsap.to(mesh.position,…)</td><td className="px-2 py-1">gsap.to(ref.current.position,…)</td></tr>
            <tr className="border-b"><td className="px-2 py-1">时间轴</td><td className="px-2 py-1">gsap.timeline()</td><td className="px-2 py-1">gsap.timeline()（一致）</td></tr>
          </tbody>
        </table>
        <p className="mt-2 text-gray-500">📝 小结：R3F 与 GSAP 配合 = 用 React 组件描述场景 + 用 GSAP 时间轴做工业级编排，二者只通过 mesh ref 耦合。</p>
      </details>
    </main>
  )
}
