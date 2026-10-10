'use client'

// ============================================================================
// Ant Design Pro 演示页（ProLayout + ProTable + ModalForm，走真实 /api/todo）
// ----------------------------------------------------------------------------
// ⚠️ 实战定位：Ant Design Pro（ProComponents） = 常用（企业级中后台「开箱即用」脚手架，
//   你生产系统大概率会接触）。本分支重点认领 Pro 系组件写法差异，不深讲基础 antd。
// 数据走真实接口（框架铁律，禁止假库/直读）：
//   GET    /api/todo?page=&pageSize=&sort=-id  列表（ProTable.request 对接信封 {code,data,total}）
//   POST   /api/todo       新增
//   PATCH  /api/todo/:id   改（增量合并）
//   DELETE /api/todo/:id   删
//   ProTable 的 request 返回 { data, success, total }，Pro 自动接管分页/搜索/工具栏。
// 已学知识点点名：useState + 'use client' + ProTable.request 拉数信封解包 + ModalForm 受控弹窗。
// ⚠️ 本分支用 antd v5 + @ant-design/pro-components@2（Pro 稳定线只支持 antd v5，antd v6 仅 beta 支持）；
//   antd v5 在 React 19 下需打兼容补丁 @ant-design/v5-patch-for-react-19（否则静态方法报 warning）。
// ============================================================================
import { useEffect, useRef, useState } from 'react'
// antd v5 在 React 19 下需打兼容补丁（否则静态方法报 warning）
import '@ant-design/v5-patch-for-react-19'
import { ProLayout } from '@ant-design/pro-components'
import { ProTable, ModalForm, ProFormText, ProFormSwitch, ProFormDigit } from '@ant-design/pro-components'
import { Button, Popconfirm, Tag } from 'antd'
import { PlusOutlined } from '@ant-design/icons'

type Todo = { id: number; title: string; done: boolean }

export default function ProComponentsPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Todo | null>(null)
  // ProTable 的 actionRef 必须是稳定 ref 对象（不能用 state + 内联回调，否则无限重渲染）
  const actionRef = useRef<any>(null)
  // ProLayout/ProTable 的响应式布局（列宽/断点）在 SSR 与客户端计算不一致 → hydration mismatch；
  // 改为客户端挂载后再渲染，规避该警告（整页 admin 本就不依赖 SSR）
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  const reload = () => actionRef.current?.reload()

  return (
    <ProLayout
      title="Todo Admin"
      layout="mix"
      // 菜单数据走 route（ProLayout 由 route.routes 生成侧边菜单；其 menu prop 不接受 items，antd v5/v6 通用）
      route={{
        path: '/',
        routes: [{ path: '/todo', name: '待办管理' }],
      }}
      // 去掉真实跳转，纯演示：保留默认菜单项 dom 但不做路由跳转
      menuItemRender={(_, defaultDom) => defaultDom}
    >
      <ProTable<Todo>
        headerTitle="待办列表（ProTable）"
        actionRef={actionRef}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        toolBarRender={() => [
          <Button
            key="add"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditing(null)
              setModalOpen(true)
            }}
          >
            新建
          </Button>,
        ]}
        request={async (params: any) => {
          const page = params.current || 1
          const pageSize = params.pageSize || 10
          // 把搜索表单字段（title / done 等）原样转发给 /api/todo。
          // 后端 applyQuery 支持字段过滤 + 操作符（_like/_in/_gte…，见 lib/query.ts），这里是真·条件搜索。
          const qs = new URLSearchParams()
          qs.set('page', String(page))
          qs.set('pageSize', String(pageSize))
          qs.set('sort', '-id')
          if (params.title) qs.set('title_like', String(params.title)) // 标题走模糊匹配
          Object.entries(params).forEach(([k, v]) => {
            if (k === 'current' || k === 'pageSize' || k === 'title') return
            if (v === undefined || v === null || v === '') return
            qs.set(k, String(v))
          })
          const r = await fetch(`/api/todo?${qs.toString()}`)
          const j = await r.json()
          return { data: j.data || [], success: true, total: j.total || 0 }
        }}
        columns={[
          { title: 'ID', dataIndex: 'id', width: 80, search: false },
          { title: '标题', dataIndex: 'title' },
          {
            title: '状态',
            dataIndex: 'done',
            width: 100,
            // 列 render 签名：(value, record, index) => ReactNode；用 record 取业务字段，避免首参类型不匹配
            render: (_, row: Todo) =>
              row.done ? <Tag color="green">已完成</Tag> : <Tag color="default">未完成</Tag>,
          },
          {
            title: '操作',
            width: 160,
            valueType: 'option',
            render: (_: any, row: Todo) => [
              <a
                key="edit"
                onClick={() => {
                  setEditing(row)
                  setModalOpen(true)
                }}
              >
                编辑
              </a>,
              <Popconfirm
                key="del"
                title="确认删除？"
                onConfirm={async () => {
                  await fetch(`/api/todo/${row.id}`, { method: 'DELETE' })
                  reload()
                }}
              >
                <a>删除</a>
              </Popconfirm>,
            ],
          },
        ]}
      />

      <ModalForm<Todo>
        title={editing ? '编辑待办' : '新建待办'}
        open={modalOpen}
        initialValues={editing || { done: false }}
        onOpenChange={setModalOpen}
        onFinish={async (values) => {
          if (editing) {
            // 局部更新用 PATCH（增量合并，避免清掉其它字段）
            await fetch(`/api/todo/${editing.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(values),
            })
          } else {
            await fetch('/api/todo', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(values),
            })
          }
          reload()
          return true
        }}
      >
        <ProFormText name="title" label="标题" rules={[{ required: true }]} />
        <ProFormSwitch name="done" label="已完成" />
        {/* 编辑时展示 id（只读，便于对照）；新建时不传 */}
        {editing && <ProFormDigit name="id" label="ID" disabled initialValue={editing.id} />}
      </ModalForm>
    </ProLayout>
  )
}
