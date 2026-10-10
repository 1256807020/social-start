// ============================================================================
// 仪表盘页（Server Component）
// ----------------------------------------------------------------------------
// 这个页面没用任何 hooks，所以是 Server Component，但【数据仍走接口 /api/users】，
// 不直接读 data/users.json —— 整套框架的核心就是"一个 JSON + 通用接口层"，
// 无论服务端组件还是客户端组件，都通过 /api/* 取数（参考 /todos 范本）。
// 服务端 fetch 用 headers() 拿真实 host，cache:'no-store' 保证实时。
// ============================================================================
import { Card, Row, Col, Statistic } from 'antd';
import { headers } from 'next/headers';

export default async function DashboardPage() {
  // 服务端组件也走接口（不直读 json 文件），首屏带真实数据
  const h = await headers();
  const base = process.env.NEXT_PUBLIC_BASE_URL || `http://${h.get('host') || 'localhost'}`;
  const res = await fetch(`${base}/api/users?pageSize=1000`, { cache: 'no-store' });
  const json = await res.json();
  const users = (json.data ?? []) as { status: string }[];
  const active = users.filter((u) => u.status === 'active').length;

  return (
    <>
      <h2>仪表盘</h2>
      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Statistic title="用户总数" value={users.length} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="启用中" value={active} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            {/* TODO: 真实项目这里放趋势图，可接 @ant-design/charts / recharts */}
            <Statistic title="今日新增" value={0} />
          </Card>
        </Col>
      </Row>

      {/* 练习 TODO：
          1. 把 Statistic 换成真实图表；
          2. 加一个"最近操作"列表（接 /api/users 排序）；
          3. 给 Card 加 loading 态（模拟接口延迟用 useState + useEffect）。 */}
    </>
  );
}
