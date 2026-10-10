# learn/procomponents —— Ant Design Pro（ProComponents）中后台脚手架

> 从 `basic` 分支切出。ProComponents = antd 官方企业级组件集（ProLayout / ProTable / ModalForm…）。
> 目标：**带注释的学习骨架**。

## 跑起来
```bash
pnpm dev          # 访问 http://localhost:4000/procomponents
```

## 这个分支练什么
1. **ProLayout** —— 中后台框架布局（侧边栏 + 顶栏 + 混合布局 `layout="mix"`）开箱即用。
2. **ProTable** —— 自带分页/搜索/工具栏的表格，`request` 对接后端信封 `{ code, data, total }`。
3. **ModalForm** —— 弹窗表单，编辑/新建共用一个表单（`editing` 区分）。
4. **用 antd v5 + @ant-design/pro-components@2**（Pro 稳定线只支持 antd v5；antd v6 目前仅 Pro v3 beta 支持，故本分支用稳的 v5）。

## 关键文件
| 文件 | 作用 |
|---|---|
| `app/procomponents/page.tsx` | ProLayout + ProTable + ModalForm 做 `/api/todo` 增删改查（client） |

## 注意点（骨架特有的坑）
- 数据走真实接口 `/api/todo`（框架铁律，禁止假库/直读 json）。
- ProTable 的 `request` 必须返回 `{ data, success: true, total }`，Pro 才接管分页/搜索。
- 本分支用 **antd v5 + pro-components@2**（稳定线，文档齐全、零兼容坑）。antd v6 目前只有 ProComponents **v3 beta** 支持，不稳定，故不在此分支用。
- antd v5 在 React 19 下需 `import '@ant-design/v5-patch-for-react-19'`（见 page.tsx 顶部），否则静态 `message` 等报 warning。
- 表单校验 / 更多 Pro 组件见官方文档。

## 练习 TODO
1. [ ] 给 ProTable 加列搜索/筛选（valueType + search）。
2. [ ] 接真实接口做行内编辑（EditableProTable）。
3. [ ] 若见静态 message 警告，补 antd `<App>` 包裹修复。

## 对比
- `admin-antd`：基础 antd 组件手写 CRUD（灵活、可控）。
- `procomponents`：Pro 系「开箱即用」表格/表单，开发最快但定制受限。
