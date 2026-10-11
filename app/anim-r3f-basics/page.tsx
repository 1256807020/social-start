// ───────────────────────────────────────────────────────────
// 从 Vue 转 React（动画·3D 篇）· React Three Fiber (Three.js)
// · Vue2/Vue3 对照：TresJS（Vue3 声明式 Three.js），写法同为「组件即场景图」；R3F 是 React 的等价物。
// · React 对照：<Canvas> 内用 <mesh>/<boxGeometry> 等 JSX 标签描述场景；useFrame 做逐帧动画（本例）。
// 📌 实战定位：Web 3D【了解即可·进阶】；Three.js 是 Web 3D 入门首选（2026 r159 默认 WebGPU），R3F 让它像写 React 组件一样搭 3D。
// 🧭 学习模式：🔧固定写法=<Canvas><mesh><boxGeometry/><meshStandardMaterial/></mesh></Canvas> + useFrame 旋转；👉=练习点已填；文末对照。
// ───────────────────────────────────────────────────────────
'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useRef } from 'react'
import type { Mesh } from 'three'
// 练习前在本分支运行：pnpm add three @react-three/fiber @react-three/drei

function SpinningBox() {
  const ref = useRef<Mesh>(null)
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.6 // 👉 逐帧绕 Y 轴旋转
  })
  return (
    <mesh ref={ref}>
      <boxGeometry args={[1.5, 1.5, 1.5]} />
      <meshStandardMaterial color="#4f8" />
    </mesh>
  )
}

export default function R3FBasicsPage() {
  return (
    <main style={{ padding: 24, fontFamily: 'system-ui' }}>
      <h1>React Three Fiber 基础 3D</h1>
      <p>用声明式 JSX 搭 Three.js 场景，鼠标拖拽可旋转视角、滚轮缩放。</p>
      <div style={{ width: '100%', height: 420, background: '#0b1020', borderRadius: 8 }}>
        <Canvas camera={{ position: [3, 3, 3], fov: 50 }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <SpinningBox />
          <OrbitControls /> {/* 👉 拖拽旋转 / 滚轮缩放 */}
        </Canvas>
      </div>
      <details className="mt-6 rounded border p-3 text-sm">
        <summary className="cursor-pointer font-semibold">📚 Vue2 / Vue3 / React 三向对照 & 小结</summary>
        <table className="mt-2 w-full border-collapse text-left">
          <thead>
            <tr className="border-b"><th className="px-2 py-1">维度</th><th className="px-2 py-1">Vue3</th><th className="px-2 py-1">React</th></tr>
          </thead>
          <tbody>
            <tr className="border-b"><td className="px-2 py-1">3D 库</td><td className="px-2 py-1">TresJS</td><td className="px-2 py-1">React Three Fiber</td></tr>
            <tr className="border-b"><td className="px-2 py-1">场景描述</td><td className="px-2 py-1">&lt;TresMesh&gt;…&lt;/TresMesh&gt;</td><td className="px-2 py-1">&lt;mesh&gt;…&lt;/mesh&gt;</td></tr>
            <tr className="border-b"><td className="px-2 py-1">逐帧</td><td className="px-2 py-1">useRenderLoop</td><td className="px-2 py-1">useFrame</td></tr>
            <tr className="border-b"><td className="px-2 py-1">控制器</td><td className="px-2 py-1">TresOrbitControls</td><td className="px-2 py-1">drei OrbitControls</td></tr>
          </tbody>
        </table>
        <p className="mt-2 text-gray-500">📝 小结：R3F 把 Three.js 场景图变成 React 组件树，状态/复用/组合都走 React 心智；底层仍是 Three.js。</p>
      </details>
    </main>
  )
}
