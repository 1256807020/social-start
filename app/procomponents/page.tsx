'use client'

// 【Ant Design Pro 分支 · learn/procomponents】
// 演示：ProLayout（中后台框架布局）+ ProTable（自带分页/搜索/工具栏）+ ModalForm（弹窗表单）。
// 业务：复用 /api/todo 做增删改查。ProTable.request 对接我们的信封 { code, data, total }。
import { useState } from 'react'
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
  const [actionRef, setActionRef] = useState<any>(null)

  const reload = () => actionRef?.reload()

  return (
    <ProLayout
      title="Todo Admin"
      layout="mix"
      menu={{
        items: [{ key: 'todo', label: '待办管理' }],
      }}
      // 去掉真实跳转，纯演示
      menuItemRender={() => <span />}
    >
      <ProTable<Todo>
        headerTitle="待办列表（ProTable）"
        actionRef={(ref) => setActionRef(ref)}
        rowKey="id"
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
          const r = await fetch(`/api/todo?page=${page}&pageSize=${pageSize}&sort=-id`)
          const j = await r.json()
          return { data: j.data || [], success: true, total: j.total || 0 }
        }}
        columns={[
          { title: 'ID', dataIndex: 'id', width: 80 },
          { title: '标题', dataIndex: 'title' },
          {
            title: '状态',
            dataIndex: 'done',
            width: 100,
            render: (done: boolean) =>
              done ? <Tag color="green">已完成</Tag> : <Tag color="default">未完成</Tag>,
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
