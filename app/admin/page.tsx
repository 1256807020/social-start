// 仪表盘页（Server Component，服务端 fetch 真实接口 /api/users）
// 与 /todos 范本同源：用 headers() 取真实 host 拼绝对 URL，cache:'no-store' 实时读，避免写死 localhost。
// ============================================================================
// ⚠️ 实战定位：MUI 后台仪表盘 = 常用（你 5-6 套生产系统基本都遇过）。
//   本分支和 antd/shadcn/mantine 是「同一需求换 UI 库」，重点认领 MUI 组件写法差异，不深讲。
// 数据走真实接口（同 admin-antd，禁止假库/直读 json）：
//   GET /api/users → 列表（统一信封 { code, data, total }，取 data）。
// 已学知识点点名：Server Component 服务端取数 + 同源 base URL（避免写死 localhost）+ 数组 filter 统计。
// 主题见 components/admin/mui-theme.tsx（ThemeProvider 包一层）；校验见 learn/rhf-zod-crud。
// ============================================================================
import { headers } from 'next/headers';
import { Grid, Card, CardContent, Typography, Button, Box } from '@mui/material';
import Link from 'next/link';

type DashUser = { id: number; status: 'active' | 'disabled' };

async function getUsers(): Promise<DashUser[]> {
  const h = await headers();
  const base = process.env.NEXT_PUBLIC_BASE_URL || `http://${h.get('host') || 'localhost'}`;
  const res = await fetch(`${base}/api/users`, { cache: 'no-store' });
  const json = await res.json();
  return json.data ?? [];
}

export default async function DashboardPage() {
  const users = await getUsers();
  const active = users.filter((u) => u.status === 'active').length;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">仪表盘</Typography>
        <Button component={Link} href="/admin/users" variant="contained">
          去用户管理
        </Button>
      </Box>

      {/* Grid v6+ 用 size={{ xs, md }} 控制每列占宽（替代旧版 item xs={4}） */}
      <Grid container spacing={2}>
        {[
          ['用户总数', users.length],
          ['启用中', active],
          ['今日新增', 0],
        ].map(([label, val]) => (
          <Grid size={{ xs: 12, md: 4 }} key={label as string}>
            <Card>
              <CardContent>
                <Typography color="text.secondary">{label as string}</Typography>
                <Typography variant="h4">{val as number}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 练习 TODO：接 recharts 趋势图。 */}
    </Box>
  );
}
