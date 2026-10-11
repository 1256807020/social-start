// ───────────────────────────────────────────────────────────
// 从 Vue 转 React（动画·3D 数据可视化篇）· R3F × D3
// · Vue2/Vue3 对照：Three.js + D3 组合与框架无关；Vue 里同样用 D3 的 scale 算高度/颜色，再喂给 Three 对象。
// · React 对照：d3.scaleLinear 把数据映射成柱体高度与颜色，R3F 把它渲染成 3D 柱状图（本例）。
// 📌 实战定位：三维数据可视化【了解即可·进阶】；Three.js 负责 3D 空间渲染，D3 负责数据映射/比例尺，是 3D 数据大屏的黄金组合。
// 🧭 学习模式：🔧固定写法=scaleLinear().domain().range() 算高度/颜色 → <mesh position={[x,h/2,0]}><boxGeometry args={[w,h,d]}/></mesh>；👉=练习点已填；文末对照。
// ───────────────────────────────────────────────────────────
'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useMemo } from 'react'
import * as d3 from 'd3'
// 练习前在本分支运行：pnpm add three @react-three/fiber @react-three/drei d3 @types/d3

type Row = { label: string; v: number }

const DATA: Row[] = [
  { label: 'Q1', v: 12 },
  { label: 'Q2', v: 28 },
  { label: 'Q3', v: 19 },
  { label: 'Q4', v: 35 },
  { label: 'Q5', v: 22 },
]

function Bars() {
  const { height, color, maxV } = useMemo(() => {
    const maxV = d3.max(DATA, (d) => d.v) ?? 1
    const height = d3.scaleLinear().domain([0, maxV]).range([0.3, 3]) // 👉 数据→柱高
    const color = d3.scaleLinear<string>().domain([0, maxV]).range(['#48f', '#f48']) // 👉 数据→颜色
    return { height, color, maxV }
  }, [])

  const n = DATA.length
  return (
    <group>
      {DATA.map((d, i) => {
        const h = height(d.v)
        const x = (i - (n - 1) / 2) * 1.1 // 👉 等距排布
        return (
          <mesh key={d.label} position={[x, h / 2, 0]}>
            <boxGeometry args={[0.7, h, 0.7]} />
            <meshStandardMaterial color={color(d.v)} />
          </mesh>
        )
      })}
      <gridHelper args={[8, 8, '#334', '#223']} />
      {/* 显式引用 maxV 避免未使用告警（也方便你改成动态数据） */}
      <mesh visible={false} position={[0, maxV, 0]} />
    </group>
  )
}

export default function R3FD3Page() {
  return (
    <main style={{ padding: 24, fontFamily: 'system-ui' }}>
      <h1>R3F × D3：三维数据柱状图</h1>
      <p>D3 的 scaleLinear 把数值映射成柱体高度与颜色，R3F 渲染成可旋转的 3D 图表。</p>
      <div style={{ width: '100%', height: 420, background: '#0b1020', borderRadius: 8 }}>
        <Canvas camera={{ position: [5, 4, 6], fov: 50 }}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[5, 8, 5]} intensity={1} />
          <Bars />
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
            <tr className="border-b"><td className="px-2 py-1">比例尺</td><td className="px-2 py-1">d3.scaleLinear</td><td className="px-2 py-1">d3.scaleLinear（一致）</td></tr>
            <tr className="border-b"><td className="px-2 py-1">渲染</td><td className="px-2 py-1">Three.js 命令式</td><td className="px-2 py-1">R3F 声明式 mesh</td></tr>
            <tr className="border-b"><td className="px-2 py-1">数据驱动</td><td className="px-2 py-1">computed 出数组</td><td className="px-2 py-1">useMemo 出数组</td></tr>
          </tbody>
        </table>
        <p className="mt-2 text-gray-500">📝 小结：D3 不管渲染，只做「数据→视觉属性」的映射；3D 渲染交给 R3F，二者职责清晰、可独立替换。</p>
      </details>
    </main>
  )
}
