/**
 * 离线缓存 Composable
 * 提供离线缓存管理的响应式接口
 */

import { ref, computed } from 'vue'
import type { Ref, ComputedRef } from 'vue'
import { offlineCacheManager } from '@/utils/offline-cache'

export interface UseOfflineCacheReturn {
    cacheStats: Ref<{
        count: number
        size: number
        oldestTimestamp: number | null
        newestTimestamp: number | null
    }>
    hasCache: ComputedRef<boolean>
    cacheSizeFormatted: ComputedRef<string>
    refreshStats: () => Promise<void>
    getCachedData: <T>(url: string, method?: string) => Promise<T | null>
    cacheData: <T>(url: string, method: string, data: T, ttl?: number) => Promise<void>
    removeCache: (url: string, method?: string) => Promise<void>
    clearAllCache: () => Promise<void>
    hasCachedData: (url: string, method?: string) => Promise<boolean>
}

export function useOfflineCache(): UseOfflineCacheReturn {
    const cacheStats = ref({
        count: 0,
        size: 0,
        oldestTimestamp: null as number | null,
        newestTimestamp: null as number | null
    })

    const hasCache = computed(() => cacheStats.value.count > 0)

    const cacheSizeFormatted = computed(() => {
        const size = cacheStats.value.size
        if (size < 1024) {
            return `${size} B`
        } else if (size < 1024 * 1024) {
            return `${(size / 1024).toFixed(2)} KB`
        } else {
            return `${(size / (1024 * 1024)).toFixed(2)} MB`
        }
    })

    const refreshStats = async () => {
        const stats = await offlineCacheManager.getCacheStats()
        cacheStats.value = stats
    }

    const getCachedData = async <T>(url: string, method: string = 'GET'): Promise<T | null> => {
        return await offlineCacheManager.getCachedResponse<T>(url, method)
    }

    const cacheData = async <T>(
        url: string,
        method: string,
        data: T,
        ttl?: number
    ): Promise<void> => {
        await offlineCacheManager.cacheResponse(url, method, data, ttl)
        await refreshStats()
    }

    const removeCache = async (url: string, method: string = 'GET'): Promise<void> => {
        await offlineCacheManager.removeCachedResponse(url, method)
        await refreshStats()
    }

    const clearAllCache = async (): Promise<void> => {
        await offlineCacheManager.clearAllCache()
        await refreshStats()
    }

    const hasCachedData = async (url: string, method: string = 'GET'): Promise<boolean> => {
        return await offlineCacheManager.hasCachedResponse(url, method)
    }

    refreshStats()

    return {
        cacheStats,
        hasCache,
        cacheSizeFormatted,
        refreshStats,
        getCachedData,
        cacheData,
        removeCache,
        clearAllCache,
        hasCachedData
    }
}
