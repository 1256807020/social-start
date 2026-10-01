// 仪表盘页（Server Component，直接读假库）
import { Grid, Card, CardContent, Typography, Button, Box } from '@mui/material';
import Link from 'next/link';
import { listUsers } from '../../lib/users-store';

export default function DashboardPage() {
  const users = listUsers();
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

      {/* 练习 TODO：接 recharts 趋势图；数字接真实接口 + loading 态。 */}
    </Box>
  );
}
