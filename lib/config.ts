/**
 * 运行时配置（移植自 BasicApi config.js 的查询相关项）
 * 可通过环境变量覆盖。
 */
export const config = {
  /** 分页默认每页条数 */
  pageSize: Number(process.env.PAGE_SIZE || 10),
  /** 分页每页上限 */
  maxPageSize: Number(process.env.MAX_PAGE_SIZE || 500),
  /** 是否自动维护 createdAt / updatedAt 时间戳 */
  autoTimestamp: process.env.AUTO_TIMESTAMP !== '0',
}
