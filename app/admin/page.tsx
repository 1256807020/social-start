// ============================================================================
// 仪表盘页（Server Component）
// ----------------------------------------------------------------------------
// 这个页面没用任何 hooks，所以是 Server Component，可以直接读“假库”渲染。
// 这是 App Router 的优势：数据获取在服务端完成，首屏直接带数据。
// ============================================================================
import { Card, Row, Col, Statistic } from 'antd';
import { listUsers } from '../../lib/users-store';

export default function DashboardPage() {
  const users = listUsers();
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
          2. 加一个“最近操作”列表（接 listUsers 排序）；
          3. 给 Card 加 loading 态（模拟接口延迟用 useState + useEffect）。 */}
    </>
  );
}
