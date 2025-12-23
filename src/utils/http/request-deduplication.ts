/**
 * HTTP 请求去重机制
 * 防止重复发送相同的请求
 */
import type { AxiosRequestConfig, Canceler } from 'axios'
import axios from 'axios'

/**
 * 请求去重配置
 */
export interface DeduplicationOptions {
    /** 是否启用去重，默认 true */
    enabled?: boolean
    /** 生成请求唯一键的函数 */
    generateKey?: (config: AxiosRequestConfig) => string
}

/**
 * 待处理的请求信息
 */
interface PendingRequest {
    /** 请求的唯一键 */
    key: string
    /** 取消函数 */
    cancel: Canceler
    /** 请求配置 */
    config: AxiosRequestConfig
    /** 创建时间 */
    timestamp: number
}

/**
 * 默认的请求键生成函数
 * 基于 method + url + params + data 生成唯一键
 */
export function defaultGenerateKey(config: AxiosRequestConfig): string {
    const { method = 'get', url = '', params, data } = config

    // 序列化 params 和 data
    const paramsStr = params ? JSON.stringify(params) : ''
    const dataStr = data ? JSON.stringify(data) : ''

    return `${method.toUpperCase()}:${url}:${paramsStr}:${dataStr}`
}

/**
 * 请求去重管理器
 */
export class RequestDeduplication {
    private pendingRequests: Map<string, PendingRequest> = new Map()
    private enabled: boolean
    private generateKey: (config: AxiosRequestConfig) => string

    constructor(options: DeduplicationOptions = {}) {
        this.enabled = options.enabled ?? true
        this.generateKey = options.generateKey ?? defaultGenerateKey
    }

    /**
     * 添加请求到待处理队列
     * @returns 如果是重复请求返回 true，否则返回 false
     */
    addRequest(config: AxiosRequestConfig): boolean {
        if (!this.enabled) {
            return false
        }

        // 检查是否标记为允许重复
        if (this.isMarkedAsAllowDuplicate(config)) {
            return false
        }

        const key = this.generateKey(config)

        // 如果已存在相同的请求，取消新请求
        if (this.pendingRequests.has(key)) {
            console.log('[Deduplication] 检测到重复请求，已取消:', key)
            return true
        }

        // 创建取消令牌
        const cancelTokenSource = axios.CancelToken.source()
        config.cancelToken = cancelTokenSource.token

        // 添加到待处理队列
        this.pendingRequests.set(key, {
            key,
            cancel: cancelTokenSource.cancel,
            config,
            timestamp: Date.now(),
        })

        return false
    }

    /**
     * 从待处理队列中移除请求
     */
    removeRequest(config: AxiosRequestConfig): void {
        if (!this.enabled) {
            return
        }

        const key = this.generateKey(config)
        this.pendingRequests.delete(key)
    }

    /**
     * 取消指定的请求
     */
    cancelRequest(config: AxiosRequestConfig, reason?: string): void {
        const key = this.generateKey(config)
        const pending = this.pendingRequests.get(key)

        if (pending) {
            pending.cancel(reason || '请求已取消')
            this.pendingRequests.delete(key)
        }
    }

    /**
     * 取消所有待处理的请求
     */
    cancelAllRequests(reason?: string): void {
        this.pendingRequests.forEach(pending => {
            pending.cancel(reason || '所有请求已取消')
        })
        this.pendingRequests.clear()
    }

    /**
     * 获取待处理的请求数量
     */
    getPendingCount(): number {
        return this.pendingRequests.size
    }

    /**
     * 获取所有待处理的请求
     */
    getPendingRequests(): PendingRequest[] {
        return Array.from(this.pendingRequests.values())
    }

    /**
     * 清理超时的请求（可选，用于防止内存泄漏）
     */
    cleanupStaleRequests(timeout: number = 60000): void {
        const now = Date.now()
        const staleKeys: string[] = []

        this.pendingRequests.forEach((pending, key) => {
            if (now - pending.timestamp > timeout) {
                staleKeys.push(key)
            }
        })

        staleKeys.forEach(key => {
            const pending = this.pendingRequests.get(key)
            if (pending) {
                pending.cancel('请求超时清理')
                this.pendingRequests.delete(key)
            }
        })

        if (staleKeys.length > 0) {
            console.log(`[Deduplication] 清理了 ${staleKeys.length} 个超时请求`)
        }
    }

    /**
     * 标记请求为允许重复
     */
    static markAsAllowDuplicate(config: AxiosRequestConfig): void {
        (config as any).__allowDuplicate = true
    }

    /**
     * 检查请求是否标记为允许重复
     */
    private isMarkedAsAllowDuplicate(config: AxiosRequestConfig): boolean {
        return (config as any).__allowDuplicate === true
    }

    /**
     * 启用去重
     */
    enable(): void {
        this.enabled = true
    }

    /**
     * 禁用去重
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
}

/**
 * 创建请求去重管理器实例
 */
export function createRequestDeduplication(
    options?: DeduplicationOptions
): RequestDeduplication {
    return new RequestDeduplication(options)
}

/**
 * 扩展 Axios 请求配置类型
 */
declare module 'axios' {
    export interface AxiosRequestConfig {
        __allowDuplicate?: boolean
    }
}
