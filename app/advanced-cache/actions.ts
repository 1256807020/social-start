'use server'

import { revalidatePath } from 'next/cache'

/**
 * 重新加载本页缓存 demo：revalidatePath 会让页面重新渲染，
 * 但各 fetch 的缓存（默认 / revalidate:10 / no-store）按各自策略独立生效，
 * 因此能直观看到「默认与定时刷新命中缓存、no-store 每次都重新拉取」的差异。
 */
export async function refreshCacheDemo() {
  revalidatePath('/advanced-cache')
}
