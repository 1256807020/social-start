// Auth.js 入口：承接 /api/auth/*（signin、session、callback 等）
import { handlers } from '../../../../lib/auth'

export const { GET, POST } = handlers
