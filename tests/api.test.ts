import { readFileSync } from 'node:fs'
import path from 'node:path'

const BASE = process.env.TEST_BASE as string
const RES = 'todo' // 在隔离 DATA_DIR 下测试，不污染真实数据

type ApiRes = { res: Response; json: any; text: string; ok: boolean; status: number }

async function api(p: string, init?: RequestInit): Promise<ApiRes> {
  const res = await fetch(`${BASE}${p}`, init)
  const text = await res.text()
  let json: any = null
  try {
    json = text ? JSON.parse(text) : null
  } catch {
    json = null
  }
  return { res, json, text, ok: res.ok, status: res.status }
}

const j = (body: unknown, method = 'POST') =>
  ({
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }) as RequestInit

// 上传一个最小 PNG（1x1 透明）
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64',
)

beforeAll(async () => {
  // 清空隔离环境下的 todo 集合，保证断言可复现
  await api(`/api/${RES}?confirm=1`, { method: 'DELETE' })
})

afterAll(async () => {
  await api(`/api/${RES}?confirm=1`, { method: 'DELETE' })
})

describe('基础 / health / collections', () => {
  it('GET /api/health 返回环境信息', async () => {
    const r = await api('/api/health')
    expect(r.ok).toBe(true)
    expect(r.json.code).toBe(0)
    expect(r.json.data).toHaveProperty('collections')
  })

  it('GET /api/collections 列出集合（含 todo）', async () => {
    const r = await api('/api/collections')
    expect(r.ok).toBe(true)
    expect(Array.isArray(r.json.data)).toBe(true)
    expect(r.json.data.some((c: any) => c.name === RES)).toBe(true)
  })

  it('GET /api/collections/:name 返回 schema 推断', async () => {
    await api(`/api/${RES}`, j({ title: 'schema-seed', parentId: 0 }))
    const r = await api(`/api/collections/${RES}`)
    expect(r.ok).toBe(true)
    expect(r.json.data.name).toBe(RES)
    expect(Array.isArray(r.json.data.schema)).toBe(true)
    expect(r.json.data.schema.some((f: any) => f.field === 'title')).toBe(true)
  })
})

describe('资源 CRUD（核心）', () => {
  it('POST /api/:resource 新增单条', async () => {
    const r = await api(`/api/${RES}`, j({ title: '任务A', parentId: 0, done: false }))
    expect(r.status).toBe(201)
    expect(r.json.data.title).toBe('任务A')
    expect(r.json.data.id).toBeDefined()
    expect(r.json.data.parentId).toBe(0)
  })

  it('POST /api/:resource 数组=批量新增', async () => {
    const r = await api(`/api/${RES}`, j([{ title: '批量1' }, { title: '批量2' }]))
    expect(r.status).toBe(201)
    expect(Array.isArray(r.json.data)).toBe(true)
    expect(r.json.data.length).toBe(2)
  })

  it('GET /api/:resource 列表 + 分页 + 排序', async () => {
    const r = await api(`/api/${RES}?page=1&pageSize=3&sort=-id`)
    expect(r.ok).toBe(true)
    expect(Array.isArray(r.json.data)).toBe(true)
    expect(r.json.total).toBeGreaterThanOrEqual(3)
    expect(r.json.pageSize).toBe(3)
  })

  it('GET /api/:resource/:id 详情', async () => {
    const created = await api(`/api/${RES}`, j({ title: '详情目标' }))
    const id = created.json.data.id
    const r = await api(`/api/${RES}/${id}`)
    expect(r.ok).toBe(true)
    expect(r.json.data.id).toBe(id)
    expect(r.json.data.title).toBe('详情目标')
  })

  it('GET /api/:resource/:id 不存在 -> 404', async () => {
    const r = await api(`/api/${RES}/999999999`)
    expect(r.status).toBe(404)
    expect(r.json.code).toBe(40004)
  })

  it('PATCH /api/:resource/:id 增量修改（保留 done）', async () => {
    const created = await api(`/api/${RES}`, j({ title: '改前', parentId: 0, done: true }))
    const id = created.json.data.id
    const r = await api(`/api/${RES}/${id}`, j({ title: '改后', parentId: 5 }, 'PATCH'))
    expect(r.ok).toBe(true)
    expect(r.json.data.title).toBe('改后')
    expect(r.json.data.parentId).toBe(5)
    expect(r.json.data.done).toBe(true) // 增量合并保留
  })

  it('PUT /api/:resource/:id 全量替换', async () => {
    const created = await api(`/api/${RES}`, j({ title: '原', parentId: 0, done: true }))
    const id = created.json.data.id
    const r = await api(`/api/${RES}/${id}`, j({ title: '整条', parentId: 9 }, 'PUT'))
    expect(r.ok).toBe(true)
    expect(r.json.data.title).toBe('整条')
    expect(r.json.data.parentId).toBe(9)
    expect(r.json.data.done).toBeUndefined() // 全量替换清掉未传字段
  })

  it('DELETE /api/:resource/:id 删除单条', async () => {
    const created = await api(`/api/${RES}`, j({ title: '待删' }))
    const id = created.json.data.id
    const del = await api(`/api/${RES}/${id}`, { method: 'DELETE' })
    expect(del.ok).toBe(true)
    const get = await api(`/api/${RES}/${id}`)
    expect(get.status).toBe(404)
  })

  it('GET /api/:resource/count 统计', async () => {
    const r = await api(`/api/${RES}/count`)
    expect(r.ok).toBe(true)
    expect(typeof r.json.data.total).toBe('number')
  })

  it('GET /api/:resource?tree=1 树形嵌套', async () => {
    // 建根 + 子，验证 parentId 转 children
    const root = await api(`/api/${RES}`, j({ title: '根', parentId: 0 }))
    const rootId = root.json.data.id
    await api(`/api/${RES}`, j({ title: '子', parentId: rootId }))
    const r = await api(`/api/${RES}?tree=1`)
    expect(r.ok).toBe(true)
    const rootNode = r.json.data.find((n: any) => n.id === rootId)
    expect(rootNode).toBeDefined()
    expect(Array.isArray(rootNode.children)).toBe(true)
    expect(rootNode.children.some((c: any) => c.title === '子')).toBe(true)
  })
})

describe('批量 / 聚合 / 导入导出', () => {
  it('POST /api/:resource/batch-create', async () => {
    const r = await api(`/api/${RES}/batch-create`, j([{ title: 'bc1' }, { title: 'bc2' }]))
    expect(r.ok).toBe(true)
    expect(r.json.data.length).toBe(2)
  })

  it('POST /api/:resource/batch-update', async () => {
    const made = await api(`/api/${RES}/batch-create`, j([{ title: 'bu1' }, { title: 'bu2' }]))
    const ids = made.json.data.map((x: any) => x.id)
    const r = await api(`/api/${RES}/batch-update`, j(ids.map((id: any) => ({ id, title: '已批量改' }))))
    expect(r.ok).toBe(true)
    expect(r.json.data.every((x: any) => x.title === '已批量改')).toBe(true)
  })

  it('POST /api/:resource/batch-delete（body.ids 数组）', async () => {
    const made = await api(`/api/${RES}/batch-create`, j([{ title: 'bd1' }, { title: 'bd2' }]))
    const ids = made.json.data.map((x: any) => x.id)
    const r = await api(`/api/${RES}/batch-delete`, j({ ids }))
    expect(r.ok).toBe(true)
    expect(r.json.data.deleted).toBe(2)
  })

  it('POST /api/:resource/batch-delete（?ids= 查询串）', async () => {
    const made = await api(`/api/${RES}/batch-create`, j([{ title: 'bd3' }]))
    const id = made.json.data[0].id
    const r = await api(`/api/${RES}/batch-delete?ids=${id}`, { method: 'POST' })
    expect(r.ok).toBe(true)
    expect(r.json.data.deleted).toBe(1)
  })

  it('GET /api/:resource/aggregate 分组聚合', async () => {
    await api(`/api/${RES}/batch-create`, j([
      { title: 'a', status: 'x', amount: 10 },
      { title: 'b', status: 'x', amount: 20 },
      { title: 'c', status: 'y', amount: 5 },
    ]))
    const r = await api(`/api/${RES}/aggregate?groupBy=status&sum=amount`)
    expect(r.ok).toBe(true)
    expect(Array.isArray(r.json.data)).toBe(true)
    const x = r.json.data.find((g: any) => g.status === 'x')
    expect(x.sum_amount).toBe(30)
  })

  it('POST /api/:resource/import（JSON 数组）', async () => {
    const r = await api(`/api/${RES}/import`, j([{ title: 'imp1' }, { title: 'imp2' }]))
    expect(r.ok).toBe(true)
    expect(r.json.data.length).toBe(2)
  })

  it('POST /api/:resource/import（CSV 文件）', async () => {
    const csv = 'title,parentId\ncsv1,0\ncsv2,0'
    const fd = new FormData()
    fd.append('file', new File([csv], 'data.csv', { type: 'text/csv' }))
    const r = await api(`/api/${RES}/import?format=csv`, { method: 'POST', body: fd })
    expect(r.ok).toBe(true)
    expect(r.json.data.length).toBe(2)
  })

  it('GET /api/:resource/export（json）', async () => {
    const r = await api(`/api/${RES}/export?format=json`)
    expect(r.ok).toBe(true)
    expect(r.res.headers.get('content-type')).toContain('application/json')
  })

  it('GET /api/:resource/export（csv）', async () => {
    const r = await api(`/api/${RES}/export?format=csv`)
    expect(r.ok).toBe(true)
    expect(r.res.headers.get('content-type')).toContain('text/csv')
  })
})

describe('图片接口 /image', () => {
  it('POST /api/image/upload 上传', async () => {
    const fd = new FormData()
    fd.append('file', new File([PNG], 'u.png', { type: 'image/png' }))
    const r = await api('/api/image/upload', { method: 'POST', body: fd })
    expect(r.status).toBe(201)
    expect(r.json.data.name).toMatch(/\.png$/)
    expect(r.json.data.url).toContain('/img/')
  })

  it('GET /api/image/list 列表', async () => {
    const r = await api('/api/image/list?pageSize=50')
    expect(r.ok).toBe(true)
    expect(Array.isArray(r.json.data)).toBe(true)
  })

  it('GET /img/:name 直接访问图片二进制', async () => {
    const up = await api('/api/image/upload', {
      method: 'POST',
      body: (() => {
        const fd = new FormData()
        fd.append('file', new File([PNG], 'raw.png', { type: 'image/png' }))
        return fd
      })(),
    })
    const name = up.json.data.name
    const r = await api(`/img/${encodeURIComponent(name)}`)
    expect(r.ok).toBe(true)
    expect(r.res.headers.get('content-type')).toContain('image/')
  })

  it('GET /api/image/info/:name 信息', async () => {
    const up = await api('/api/image/upload', {
      method: 'POST',
      body: (() => {
        const fd = new FormData()
        fd.append('file', new File([PNG], 'info.png', { type: 'image/png' }))
        return fd
      })(),
    })
    const name = up.json.data.name
    const r = await api(`/api/image/info/${encodeURIComponent(name)}`)
    expect(r.ok).toBe(true)
    expect(r.json.data.name).toBe(name)
  })

  it('GET /api/image/placeholder/300x200 占位图', async () => {
    const r = await api('/api/image/placeholder/300x200')
    expect(r.ok).toBe(true)
    expect(r.res.headers.get('content-type')).toContain('image/svg+xml')
    expect(r.text).toContain('<svg')
  })
})

describe('验证码 /captcha', () => {
  it('GET /api/captcha 生成（返回 data URI）', async () => {
    const r = await api('/api/captcha')
    expect(r.ok).toBe(true)
    expect(r.json.data.captchaId).toBeTruthy()
    expect(r.json.data.image).toMatch(/^data:image\/svg\+xml/)
  })

  it('POST /api/captcha/verify 正确码 -> success:true', async () => {
    const g = await api('/api/captcha')
    const { captchaId } = g.json.data
    // code 落盘在 data/captcha/<id>.json（captcha 模块写死 data/，不随 DATA_DIR 隔离）
    const file = path.join(process.cwd(), 'data', 'captcha', `${captchaId}.json`)
    const code = JSON.parse(readFileSync(file, 'utf8')).code
    const r = await api('/api/captcha/verify', j({ captchaId, code }))
    expect(r.ok).toBe(true)
    expect(r.json.data.success).toBe(true)
  })

  it('POST /api/captcha/verify 错误码 -> success:false', async () => {
    const g = await api('/api/captcha')
    const { captchaId } = g.json.data
    const r = await api('/api/captcha/verify', j({ captchaId, code: 'ZZZZ' }))
    expect(r.ok).toBe(true)
    expect(r.json.data.success).toBe(false)
  })

  it('POST /api/captcha/verify 不存在 id -> false', async () => {
    const r = await api('/api/captcha/verify', j({ captchaId: '00000000-0000-0000-0000-000000000000', code: 'ABCD' }))
    expect(r.ok).toBe(true)
    expect(r.json.data.success).toBe(false)
  })
})

describe('文件接口 /file', () => {
  it('POST /api/file/upload 任意文件', async () => {
    const fd = new FormData()
    fd.append('file', new File([Buffer.from('hello agent-browser')], 'note.txt', { type: 'text/plain' }))
    const r = await api('/api/file/upload', { method: 'POST', body: fd })
    expect(r.status).toBe(201)
    expect(r.json.data.url).toContain('/uploads/')
  })

  it('GET /api/file/list 列表', async () => {
    const r = await api('/api/file/list?pageSize=50')
    expect(r.ok).toBe(true)
    expect(Array.isArray(r.json.data)).toBe(true)
  })

  it('GET /uploads/:name 直接访问（public 静态）', async () => {
    const up = await api('/api/file/upload', {
      method: 'POST',
      body: (() => {
        const fd = new FormData()
        fd.append('file', new File([Buffer.from('public file')], 'pub.txt', { type: 'text/plain' }))
        return fd
      })(),
    })
    const name = up.json.data.name
    const r = await api(`/uploads/${encodeURIComponent(name)}`)
    expect(r.ok).toBe(true)
    expect(r.text).toBe('public file')
  })

  it('GET /api/file/info/:name 信息', async () => {
    const up = await api('/api/file/upload', {
      method: 'POST',
      body: (() => {
        const fd = new FormData()
        fd.append('file', new File([Buffer.from('x')], 'inf.txt', { type: 'text/plain' }))
        return fd
      })(),
    })
    const name = up.json.data.name
    const r = await api(`/api/file/info/${encodeURIComponent(name)}`)
    expect(r.ok).toBe(true)
    expect(r.json.data.name).toBe(name)
  })

  it('DELETE /api/file/:name 删除', async () => {
    const up = await api('/api/file/upload', {
      method: 'POST',
      body: (() => {
        const fd = new FormData()
        fd.append('file', new File([Buffer.from('d')], 'del.txt', { type: 'text/plain' }))
        return fd
      })(),
    })
    const name = up.json.data.name
    const r = await api(`/api/file/${encodeURIComponent(name)}`, { method: 'DELETE' })
    expect(r.ok).toBe(true)
  })
})

describe('集合删除 /collections/:name', () => {
  it('DELETE 删除一个临时集合', async () => {
    await api('/api/droptest', j({ title: 'x' }))
    const r = await api('/api/collections/droptest', { method: 'DELETE' })
    expect(r.ok).toBe(true)
    const list = await api('/api/collections')
    expect(list.json.data.some((c: any) => c.name === 'droptest')).toBe(false)
  })

  it('非法集合名 -> 400', async () => {
    const r = await api('/api/123bad', j({ title: 'x' }))
    expect(r.status).toBe(400)
  })
})
