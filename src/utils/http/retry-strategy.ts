/**
 * HTTP 请求重试策略
 * 支持指数退避和自定义重试条件
 */
import type { AxiosError, InternalAxiosRequestConfig } from 'axios'

/**
 * 重试配置选项
 */
export interface RetryOptions {
    /** 最大重试次数，默认 3 */
    maxRetries?: number
    /** 初始延迟时间（毫秒），默认 1000 */
    initialDelay?: number
    /** 最大延迟时间（毫秒），默认 30000 */
    maxDelay?: number
    /** 退避倍数，默认 2（指数退避） */
    backoffFactor?: number
    /** 是否应该重试的判断函数 */
    shouldRetry?: (error: AxiosError) => boolean
    /** 重试前的回调 */
    onRetry?: (error: AxiosError, retryCount: number, delay: number) => void
}

/**
 * 默认的重试条件判断
 * 只对网络错误、超时和 5xx 服务器错误进行重试
 */
export function defaultShouldRetry(error: AxiosError): boolean {
    // 没有响应（网络错误、超时等）
    if (!error.response) {
        return true
    }

    const status = error.response.status

    // 5xx 服务器错误
    if (status >= 500 && status < 600) {
        return true
    }

    // 429 Too Many Requests
    if (status === 429) {
        return true
    }

    // 408 Request Timeout
    if (status === 408) {
        return true
    }

    return false
}

/**
 * 请求重试策略类
 */
export class RetryStrategy {
    private maxRetries: number
    private initialDelay: number
    private maxDelay: number
    private backoffFactor: number
    private shouldRetry: (error: AxiosError) => boolean
    private onRetry?: (error: AxiosError, retryCount: number, delay: number) => void

    constructor(options: RetryOptions = {}) {
        this.maxRetries = options.maxRetries ?? 3
        this.initialDelay = options.initialDelay ?? 1000
        this.maxDelay = options.maxDelay ?? 30000
        this.backoffFactor = options.backoffFactor ?? 2
        this.shouldRetry = options.shouldRetry ?? defaultShouldRetry
        this.onRetry = options.onRetry
    }

    /**
     * 计算延迟时间（指数退避）
     * @param retryCount 当前重试次数（从 0 开始）
     */
    calculateDelay(retryCount: number): number {
        // 指数退避：delay = initialDelay * (backoffFactor ^ retryCount)
        const delay = this.initialDelay * Math.pow(this.backoffFactor, retryCount)

        // 添加随机抖动（±25%），避免多个请求同时重试
        const jitter = delay * 0.25 * (Math.random() * 2 - 1)

        // 限制在最大延迟时间内
        return Math.min(delay + jitter, this.maxDelay)
    }

    /**
     * 判断是否应该重试
     */
    canRetry(error: AxiosError, retryCount: number): boolean {
        // 检查重试次数
        if (retryCount >= this.maxRetries) {
            return false
        }

        // 检查是否是可重试的错误
        return this.shouldRetry(error)
    }

    /**
     * 执行延迟
     */
    async delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    /**
     * 执行重试
     */
    async executeRetry(
        error: AxiosError,
        retryCount: number
    ): Promise<void> {
        const delay = this.calculateDelay(retryCount)

        // 触发重试回调
        if (this.onRetry) {
            this.onRetry(error, retryCount, delay)
        }

        // 延迟后继续
        await this.delay(delay)
    }

    /**
     * 获取或初始化请求配置中的重试计数
     */
    getRetryCount(config: InternalAxiosRequestConfig): number {
        return (config as any).__retryCount ?? 0
    }

    /**
     * 设置请求配置中的重试计数
     */
    setRetryCount(config: InternalAxiosRequestConfig, count: number): void {
        (config as any).__retryCount = count
    }

    /**
     * 标记请求为不可重试
     */
    static markAsNoRetry(config: InternalAxiosRequestConfig): void {
        (config as any).__noRetry = true
    }

    /**
     * 检查请求是否标记为不可重试
     */
    static isMarkedAsNoRetry(config: InternalAxiosRequestConfig): boolean {
        return (config as any).__noRetry === true
    }
}

/**
 * 创建默认的重试策略实例
 */
export function createRetryStrategy(options?: RetryOptions): RetryStrategy {
    return new RetryStrategy(options)
}

/**
 * 扩展 Axios 请求配置类型
 */
declare module 'axios' {
    export interface InternalAxiosRequestConfig {
        __retryCount?: number
        __noRetry?: boolean
        retry?: RetryOptions | boolean
    }
}
