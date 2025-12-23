/**
 * HTTP 离线队列
 * 在离线时缓存请求，网络恢复后自动重放
 */
import type { AxiosRequestConfig, AxiosResponse } from 'axios'
import { getCacheManager } from '../cache'

/**
 * 离线队列配置
 */
export interface OfflineQueueOptions {
    /** 是否启用离线队列，默认 true */
    enabled?: boolean
    /** 队列最大大小，默认 50 */
    maxQueueSize?: number
    /** 是否持久化队列，默认 true */
    persist?: boolean
    /** 持久化键名 */
    persistKey?: string
    /** 网络恢复时的回调 */
    onOnline?: () => void
    /** 网络离线时的回调 */
    onOffline?: () => void
    /** 请求重放成功的回调 */
    onReplaySuccess?: (config: AxiosRequestConfig, response: AxiosResponse) => void
    /** 请求重放失败的回调 */
    onReplayError?: (config: AxiosRequestConfig, error: any) => void
}

/**
 * 队列中的请求项
 */
export interface QueuedRequest {
    /** 请求配置 */
    config: AxiosRequestConfig
    /** 创建时间 */
    timestamp: number
    /** 重试次数 */
    retryCount: number
}

/**
 * 离线队列管理器
 */
export class OfflineQueue {
    private queue: QueuedRequest[] = []
    private enabled: boolean
    private maxQueueSize: number
    private persist: boolean
    private persistKey: string
    private isOnline: boolean
    private cacheManager = getCacheManager()
    private onOnline?: () => void
    private onOffline?: () => void
    private onReplaySuccess?: (config: AxiosRequestConfig, response: AxiosResponse) => void
    private onReplayError?: (config: AxiosRequestConfig, error: any) => void
    private replayFunction?: (config: AxiosRequestConfig) => Promise<AxiosResponse>

    constructor(options: OfflineQueueOptions = {}) {
        this.enabled = options.enabled ?? true
        this.maxQueueSize = options.maxQueueSize ?? 50
        this.persist = options.persist ?? true
        this.persistKey = options.persistKey ?? 'offline_queue'
        this.isOnline = navigator.onLine
        this.onOnline = options.onOnline
        this.onOffline = options.onOffline
        this.onReplaySuccess = options.onReplaySuccess
        this.onReplayError = options.onReplayError

        // 从缓存恢复队列
        if (this.persist) {
            this.loadQueue()
        }

        // 监听网络状态变化
        this.setupNetworkListeners()
    }

    /**
     * 设置网络状态监听器
     */
    private setupNetworkListeners(): void {
        window.addEventListener('online', this.handleOnline.bind(this))
        window.addEventListener('offline', this.handleOffline.bind(this))
    }

    /**
     * 处理网络恢复
     */
    private async handleOnline(): Promise<void> {
        console.log('[OfflineQueue] 网络已恢复')
        this.isOnline = true

        if (this.onOnline) {
            this.onOnline()
        }

        // 自动重放队列中的请求
        await this.replayQueue()
    }

    /**
     * 处理网络离线
     */
    private handleOffline(): void {
        console.log('[OfflineQueue] 网络已离线')
        this.isOnline = false

        if (this.onOffline) {
            this.onOffline()
        }
    }

    /**
     * 设置请求重放函数
     */
    setReplayFunction(fn: (config: AxiosRequestConfig) => Promise<AxiosResponse>): void {
        this.replayFunction = fn
    }

    /**
     * 添加请求到队列
     */
    enqueue(config: AxiosRequestConfig): boolean {
        if (!this.enabled) {
            return false
        }

        // 检查是否标记为不缓存
        if (this.isMarkedAsNoCache(config)) {
            return false
        }

        // 只缓存变更操作（POST、PUT、DELETE、PATCH）
        const method = config.method?.toUpperCase()
        if (!method || !['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
            return false
        }

        // 检查队列大小
        if (this.queue.length >= this.maxQueueSize) {
            console.warn('[OfflineQueue] 队列已满，无法添加新请求')
            return false
        }

        // 添加到队列
        const queuedRequest: QueuedRequest = {
            config: this.sanitizeConfig(config),
            timestamp: Date.now(),
            retryCount: 0,
        }

        this.queue.push(queuedRequest)
        console.log('[OfflineQueue] 请求已加入队列:', config.url, `(${this.queue.length}/${this.maxQueueSize})`)

        // 持久化队列
        if (this.persist) {
            this.saveQueue()
        }

        return true
    }

    /**
     * 清理请求配置（移除不可序列化的属性）
     */
    private sanitizeConfig(config: AxiosRequestConfig): AxiosRequestConfig {
        const sanitized = { ...config }

        // 移除不可序列化的属性
        delete sanitized.cancelToken
        delete sanitized.signal
        delete (sanitized as any).adapter
        delete (sanitized as any).transformRequest
        delete (sanitized as any).transformResponse
        delete (sanitized as any).validateStatus

        return sanitized
    }

    /**
     * 重放队列中的所有请求
     */
    async replayQueue(): Promise<void> {
        if (!this.replayFunction) {
            console.warn('[OfflineQueue] 未设置重放函数，无法重放请求')
            return
        }

        if (this.queue.length === 0) {
            console.log('[OfflineQueue] 队列为空，无需重放')
            return
        }

        console.log(`[OfflineQueue] 开始重放 ${this.queue.length} 个请求`)

        // 复制队列，避免在重放过程中修改原队列
        const queueCopy = [...this.queue]
        this.queue = []

        for (const item of queueCopy) {
            try {
                const response = await this.replayFunction(item.config)
                console.log('[OfflineQueue] 请求重放成功:', item.config.url)

                if (this.onReplaySuccess) {
                    this.onReplaySuccess(item.config, response)
                }
            } catch (error) {
                console.error('[OfflineQueue] 请求重放失败:', item.config.url, error)

                // 增加重试次数
                item.retryCount++

                // 如果重试次数未超过限制，重新加入队列
                if (item.retryCount < 3) {
                    this.queue.push(item)
                } else {
                    console.warn('[OfflineQueue] 请求重试次数已达上限，已丢弃:', item.config.url)
                }

                if (this.onReplayError) {
                    this.onReplayError(item.config, error)
                }
            }
        }

        // 持久化更新后的队列
        if (this.persist) {
            this.saveQueue()
        }

        console.log(`[OfflineQueue] 重放完成，剩余 ${this.queue.length} 个请求`)
    }

    /**
     * 保存队列到缓存
     */
    private saveQueue(): void {
        try {
            this.cacheManager.set(this.persistKey, this.queue, 7 * 24 * 60 * 60 * 1000) // 7 天
        } catch (error) {
            console.error('[OfflineQueue] 保存队列失败:', error)
        }
    }

    /**
     * 从缓存加载队列
     */
    private loadQueue(): void {
        try {
            const cached = this.cacheManager.get<QueuedRequest[]>(this.persistKey)
            if (cached && Array.isArray(cached)) {
                this.queue = cached
                console.log(`[OfflineQueue] 从缓存恢复了 ${this.queue.length} 个请求`)
            }
        } catch (error) {
            console.error('[OfflineQueue] 加载队列失败:', error)
        }
    }

    /**
     * 清空队列
     */
    clear(): void {
        this.queue = []
        if (this.persist) {
            this.cacheManager.remove(this.persistKey)
        }
        console.log('[OfflineQueue] 队列已清空')
    }

    /**
     * 获取队列大小
     */
    getQueueSize(): number {
        return this.queue.length
    }

    /**
     * 获取队列中的所有请求
     */
    getQueue(): QueuedRequest[] {
        return [...this.queue]
    }

    /**
     * 检查是否在线
     */
    isNetworkOnline(): boolean {
        return this.isOnline
    }

    /**
     * 启用离线队列
     */
    enable(): void {
        this.enabled = true
    }

    /**
     * 禁用离线队列
     */
    disable(): void {
        this.enabled = false
    }

    /**
     * 检查是否启用
     */
    isEnabled(): boolean {
        return this.enabled
    }

    /**
     * 标记请求为不缓存
     */
    static markAsNoCache(config: AxiosRequestConfig): void {
        (config as any).__noCache = true
    }

    /**
     * 检查请求是否标记为不缓存
     */
    private isMarkedAsNoCache(config: AxiosRequestConfig): boolean {
        return (config as any).__noCache === true
    }

    /**
     * 销毁离线队列（移除事件监听器）
     */
    destroy(): void {
        window.removeEventListener('online', this.handleOnline.bind(this))
        window.removeEventListener('offline', this.handleOffline.bind(this))
    }
}

/**
 * 创建离线队列管理器实例
 */
export function createOfflineQueue(options?: OfflineQueueOptions): OfflineQueue {
    return new OfflineQueue(options)
}

/**
 * 扩展 Axios 请求配置类型
 */
declare module 'axios' {
    export interface AxiosRequestConfig {
        __noCache?: boolean
    }
}
