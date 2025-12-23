/**
 * 离线缓存管理器
 * 管理 API 响应的缓存和离线数据提供
 */

export interface CachedResponse<T = any> {
    data: T
    timestamp: number
    url: string
    method: string
    headers?: Record<string, string>
}

export interface OfflineCacheOptions {
    // 缓存名称
    cacheName?: string
    // 默认过期时间（毫秒）
    defaultTTL?: number
    // 最大缓存数量
    maxEntries?: number
    // 是否在离线时提供陈旧数据
    serveStaleWhenOffline?: boolean
}

class OfflineCacheManager {
    private cacheName: string
    private defaultTTL: number
    private maxEntries: number
    private serveStaleWhenOffline: boolean

    constructor(options: OfflineCacheOptions = {}) {
        this.cacheName = options.cacheName || 'offline-api-cache'
        this.defaultTTL = options.defaultTTL || 24 * 60 * 60 * 1000 // 24 小时
        this.maxEntries = options.maxEntries || 100
        this.serveStaleWhenOffline = options.serveStaleWhenOffline !== false
    }

    /**
     * 生成缓存键
     */
    private generateKey(url: string, method: string = 'GET'): string {
        return `${method}:${url}`
    }

    /**
     * 缓存响应
     */
    async cacheResponse<T>(
        url: string,
        method: string,
        data: T,
        ttl?: number
    ): Promise<void> {
        try {
            const key = this.generateKey(url, method)
            const cachedData: CachedResponse<T> = {
                data,
                timestamp: Date.now(),
                url,
                method
            }

            // 使用 localStorage 存储（简单实现）
            const cacheKey = `${this.cacheName}:${key}`
            localStorage.setItem(cacheKey, JSON.stringify(cachedData))

            // 清理过期缓存
            await this.cleanupExpiredCache()
        } catch (error) {
            console.error('Failed to cache response:', error)
        }
    }

    /**
     * 获取缓存的响应
     */
    async getCachedResponse<T>(
        url: string,
        method: string = 'GET',
        ttl?: number
    ): Promise<T | null> {
        try {
            const key = this.generateKey(url, method)
            const cacheKey = `${this.cacheName}:${key}`
            const cached = localStorage.getItem(cacheKey)

            if (!cached) {
                return null
            }

            const cachedData: CachedResponse<T> = JSON.parse(cached)
            const age = Date.now() - cachedData.timestamp
            const maxAge = ttl || this.defaultTTL

            // 检查是否过期
            if (age > maxAge) {
                // 如果离线且允许提供陈旧数据
                if (!navigator.onLine && this.serveStaleWhenOffline) {
                    console.warn('Serving stale data while offline:', url)
                    return cachedData.data
                }

                // 删除过期缓存
                localStorage.removeItem(cacheKey)
                return null
            }

            return cachedData.data
        } catch (error) {
            console.error('Failed to get cached response:', error)
            return null
        }
    }

    /**
     * 检查是否有缓存
     */
    async hasCachedResponse(url: string, method: string = 'GET'): Promise<boolean> {
        const key = this.generateKey(url, method)
        const cacheKey = `${this.cacheName}:${key}`
        return localStorage.getItem(cacheKey) !== null
    }

    /**
     * 删除缓存
     */
    async removeCachedResponse(url: string, method: string = 'GET'): Promise<void> {
        const key = this.generateKey(url, method)
        const cacheKey = `${this.cacheName}:${key}`
        localStorage.removeItem(cacheKey)
    }

    /**
     * 清除所有缓存
     */
    async clearAllCache(): Promise<void> {
        try {
            const keys = Object.keys(localStorage)
            const cacheKeys = keys.filter((key) => key.startsWith(`${this.cacheName}:`))

            cacheKeys.forEach((key) => {
                localStorage.removeItem(key)
            })

            console.log(`Cleared ${cacheKeys.length} cached responses`)
        } catch (error) {
            console.error('Failed to clear cache:', error)
        }
    }

    /**
     * 清理过期缓存
     */
    private async cleanupExpiredCache(): Promise<void> {
        try {
            const keys = Object.keys(localStorage)
            const cacheKeys = keys.filter((key) => key.startsWith(`${this.cacheName}:`))

            // 检查缓存数量
            if (cacheKeys.length > this.maxEntries) {
                // 按时间戳排序，删除最旧的
                const entries = cacheKeys
                    .map((key) => {
                        try {
                            const cached = localStorage.getItem(key)
                            if (!cached) return null

                            const data: CachedResponse = JSON.parse(cached)
                            return { key, timestamp: data.timestamp }
                        } catch {
                            return null
                        }
                    })
                    .filter((entry): entry is { key: string; timestamp: number } => entry !== null)
                    .sort((a, b) => a.timestamp - b.timestamp)

                // 删除超出限制的旧缓存
                const toDelete = entries.slice(0, entries.length - this.maxEntries)
                toDelete.forEach((entry) => {
                    localStorage.removeItem(entry.key)
                })
            }

            // 删除过期缓存
            cacheKeys.forEach((key) => {
                try {
                    const cached = localStorage.getItem(key)
                    if (!cached) return

                    const data: CachedResponse = JSON.parse(cached)
                    const age = Date.now() - data.timestamp

                    if (age > this.defaultTTL) {
                        localStorage.removeItem(key)
                    }
                } catch {
                    // 删除无效缓存
                    localStorage.removeItem(key)
                }
            })
        } catch (error) {
            console.error('Failed to cleanup expired cache:', error)
        }
    }

    /**
     * 获取缓存统计信息
     */
    async getCacheStats(): Promise<{
        count: number
        size: number
        oldestTimestamp: number | null
        newestTimestamp: number | null
    }> {
        try {
            const keys = Object.keys(localStorage)
            const cacheKeys = keys.filter((key) => key.startsWith(`${this.cacheName}:`))

            let totalSize = 0
            let oldestTimestamp: number | null = null
            let newestTimestamp: number | null = null

            cacheKeys.forEach((key) => {
                try {
                    const cached = localStorage.getItem(key)
                    if (!cached) return

                    totalSize += cached.length
                    const data: CachedResponse = JSON.parse(cached)

                    if (oldestTimestamp === null || data.timestamp < oldestTimestamp) {
                        oldestTimestamp = data.timestamp
                    }
                    if (newestTimestamp === null || data.timestamp > newestTimestamp) {
                        newestTimestamp = data.timestamp
                    }
                } catch {
                    // 忽略无效缓存
                }
            })

            return {
                count: cacheKeys.length,
                size: totalSize,
                oldestTimestamp,
                newestTimestamp
            }
        } catch (error) {
            console.error('Failed to get cache stats:', error)
            return {
                count: 0,
                size: 0,
                oldestTimestamp: null,
                newestTimestamp: null
            }
        }
    }
}

// 导出单例
export const offlineCacheManager = new OfflineCacheManager()

// 导出类型
export type { OfflineCacheManager }
