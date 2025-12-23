/**
 * 性能监控工具
 * 
 * 功能：
 * - 收集 Web Vitals 性能指标（LCP、FID、CLS、FCP、TTFB）
 * - 收集自定义性能指标
 * - 上报性能数据到监控服务
 * - 性能数据本地存储和分析
 * 
 * 使用方式：
 * 1. 安装 web-vitals：npm install web-vitals
 * 2. 在 main.ts 中初始化：setupPerformanceMonitor()
 * 
 * @example
 * ```ts
 * import { setupPerformanceMonitor, reportMetric } from '@/utils/performance-monitor'
 * 
 * // 初始化性能监控
 * setupPerformanceMonitor({
 *   reportUrl: '/api/performance',
 *   sampleRate: 1.0,
 *   enableConsole: true
 * })
 * 
 * // 上报自定义指标
 * reportMetric({
 *   name: 'api-response-time',
 *   value: 150,
 *   unit: 'ms'
 * })
 * ```
 */

/**
 * 性能指标类型
 */
export interface PerformanceMetric {
    /**
     * 指标名称
     */
    name: string

    /**
     * 指标值
     */
    value: number

    /**
     * 单位
     */
    unit?: string

    /**
     * 评级（good、needs-improvement、poor）
     */
    rating?: 'good' | 'needs-improvement' | 'poor'

    /**
     * 时间戳
     */
    timestamp?: number

    /**
     * 额外信息
     */
    meta?: Record<string, any>
}

/**
 * 性能监控配置
 */
export interface PerformanceMonitorConfig {
    /**
     * 上报 URL
     */
    reportUrl?: string

    /**
     * 采样率（0-1）
     * @default 1.0
     */
    sampleRate?: number

    /**
     * 是否启用控制台输出
     * @default false
     */
    enableConsole?: boolean

    /**
     * 是否启用本地存储
     * @default true
     */
    enableStorage?: boolean

    /**
     * 本地存储的最大条数
     * @default 100
     */
    maxStorageSize?: number

    /**
     * 自定义上报函数
     */
    onReport?: (metric: PerformanceMetric) => void

    /**
     * 是否启用 Web Vitals
     * @default true
     */
    enableWebVitals?: boolean

    /**
     * 是否启用资源性能监控
     * @default true
     */
    enableResourceTiming?: boolean

    /**
     * 是否启用导航性能监控
     * @default true
     */
    enableNavigationTiming?: boolean
}

/**
 * 默认配置
 */
const defaultConfig: Required<Omit<PerformanceMonitorConfig, 'reportUrl' | 'onReport'>> = {
    sampleRate: 1.0,
    enableConsole: false,
    enableStorage: true,
    maxStorageSize: 100,
    enableWebVitals: true,
    enableResourceTiming: true,
    enableNavigationTiming: true
}

/**
 * 性能监控器类
 */
class PerformanceMonitor {
    private config: Required<Omit<PerformanceMonitorConfig, 'reportUrl' | 'onReport'>> & {
        reportUrl?: string
        onReport?: (metric: PerformanceMetric) => void
    }
    private metrics: PerformanceMetric[] = []
    private storageKey = 'performance-metrics'

    constructor(config: PerformanceMonitorConfig = {}) {
        this.config = { ...defaultConfig, ...config }
        this.loadMetrics()
    }

    /**
     * 初始化性能监控
     */
    init() {
        // 检查是否需要采样
        if (Math.random() > this.config.sampleRate) {
            console.log('[PerformanceMonitor] 跳过采样')
            return
        }

        // 监控 Web Vitals
        if (this.config.enableWebVitals) {
            this.monitorWebVitals()
        }

        // 监控导航性能
        if (this.config.enableNavigationTiming) {
            this.monitorNavigationTiming()
        }

        // 监控资源性能
        if (this.config.enableResourceTiming) {
            this.monitorResourceTiming()
        }

        console.log('[PerformanceMonitor] 性能监控已启动')
    }

    /**
     * 监控 Web Vitals
     * 
     * 需要安装 web-vitals：npm install web-vitals
     */
    private async monitorWebVitals() {
        try {
            // 动态导入 web-vitals（如果已安装）
            const { onCLS, onFID, onLCP, onFCP, onTTFB } = await import('web-vitals')

            // Cumulative Layout Shift (累积布局偏移)
            onCLS((metric) => {
                this.report({
                    name: 'CLS',
                    value: metric.value,
                    rating: metric.rating,
                    meta: { id: metric.id, navigationType: metric.navigationType }
                })
            })

            // First Input Delay (首次输入延迟)
            onFID((metric) => {
                this.report({
                    name: 'FID',
                    value: metric.value,
                    unit: 'ms',
                    rating: metric.rating,
                    meta: { id: metric.id, navigationType: metric.navigationType }
                })
            })

            // Largest Contentful Paint (最大内容绘制)
            onLCP((metric) => {
                this.report({
                    name: 'LCP',
                    value: metric.value,
                    unit: 'ms',
                    rating: metric.rating,
                    meta: { id: metric.id, navigationType: metric.navigationType }
                })
            })

            // First Contentful Paint (首次内容绘制)
            onFCP((metric) => {
                this.report({
                    name: 'FCP',
                    value: metric.value,
                    unit: 'ms',
                    rating: metric.rating,
                    meta: { id: metric.id, navigationType: metric.navigationType }
                })
            })

            // Time to First Byte (首字节时间)
            onTTFB((metric) => {
                this.report({
                    name: 'TTFB',
                    value: metric.value,
                    unit: 'ms',
                    rating: metric.rating,
                    meta: { id: metric.id, navigationType: metric.navigationType }
                })
            })

            console.log('[PerformanceMonitor] Web Vitals 监控已启动')
        } catch (error) {
            console.warn('[PerformanceMonitor] web-vitals 未安装，跳过 Web Vitals 监控')
            console.warn('[PerformanceMonitor] 请运行：npm install web-vitals')
        }
    }

    /**
     * 监控导航性能
     */
    private monitorNavigationTiming() {
        if (!window.performance || !window.performance.timing) {
            return
        }

        window.addEventListener('load', () => {
            setTimeout(() => {
                const timing = window.performance.timing
                const navigationStart = timing.navigationStart

                // DNS 查询时间
                const dnsTime = timing.domainLookupEnd - timing.domainLookupStart
                this.report({
                    name: 'DNS',
                    value: dnsTime,
                    unit: 'ms',
                    rating: dnsTime < 100 ? 'good' : dnsTime < 300 ? 'needs-improvement' : 'poor'
                })

                // TCP 连接时间
                const tcpTime = timing.connectEnd - timing.connectStart
                this.report({
                    name: 'TCP',
                    value: tcpTime,
                    unit: 'ms',
                    rating: tcpTime < 100 ? 'good' : tcpTime < 300 ? 'needs-improvement' : 'poor'
                })

                // 请求时间
                const requestTime = timing.responseStart - timing.requestStart
                this.report({
                    name: 'Request',
                    value: requestTime,
                    unit: 'ms',
                    rating: requestTime < 200 ? 'good' : requestTime < 500 ? 'needs-improvement' : 'poor'
                })

                // 响应时间
                const responseTime = timing.responseEnd - timing.responseStart
                this.report({
                    name: 'Response',
                    value: responseTime,
                    unit: 'ms',
                    rating: responseTime < 200 ? 'good' : responseTime < 500 ? 'needs-improvement' : 'poor'
                })

                // DOM 解析时间
                const domParseTime = timing.domInteractive - timing.domLoading
                this.report({
                    name: 'DOM Parse',
                    value: domParseTime,
                    unit: 'ms',
                    rating: domParseTime < 500 ? 'good' : domParseTime < 1500 ? 'needs-improvement' : 'poor'
                })

                // DOM 内容加载完成时间
                const domContentLoadedTime = timing.domContentLoadedEventEnd - navigationStart
                this.report({
                    name: 'DOM Content Loaded',
                    value: domContentLoadedTime,
                    unit: 'ms',
                    rating:
                        domContentLoadedTime < 1000
                            ? 'good'
                            : domContentLoadedTime < 2500
                                ? 'needs-improvement'
                                : 'poor'
                })

                // 页面完全加载时间
                const loadTime = timing.loadEventEnd - navigationStart
                this.report({
                    name: 'Load',
                    value: loadTime,
                    unit: 'ms',
                    rating: loadTime < 2000 ? 'good' : loadTime < 4000 ? 'needs-improvement' : 'poor'
                })

                console.log('[PerformanceMonitor] 导航性能监控完成')
            }, 0)
        })
    }

    /**
     * 监控资源性能
     */
    private monitorResourceTiming() {
        if (!window.performance || !window.performance.getEntriesByType) {
            return
        }

        window.addEventListener('load', () => {
            setTimeout(() => {
                const resources = window.performance.getEntriesByType('resource') as PerformanceResourceTiming[]

                // 统计各类资源的加载时间
                const resourceStats: Record<string, { count: number; totalTime: number }> = {}

                resources.forEach((resource) => {
                    const type = this.getResourceType(resource.name)
                    const duration = resource.duration

                    if (!resourceStats[type]) {
                        resourceStats[type] = { count: 0, totalTime: 0 }
                    }

                    resourceStats[type].count++
                    resourceStats[type].totalTime += duration
                })

                // 上报资源统计
                Object.entries(resourceStats).forEach(([type, stats]) => {
                    const avgTime = stats.totalTime / stats.count

                    this.report({
                        name: `Resource ${type}`,
                        value: avgTime,
                        unit: 'ms',
                        rating: avgTime < 100 ? 'good' : avgTime < 300 ? 'needs-improvement' : 'poor',
                        meta: {
                            count: stats.count,
                            totalTime: stats.totalTime
                        }
                    })
                })

                console.log('[PerformanceMonitor] 资源性能监控完成')
            }, 0)
        })
    }

    /**
     * 获取资源类型
     */
    private getResourceType(url: string): string {
        if (url.endsWith('.js')) return 'JS'
        if (url.endsWith('.css')) return 'CSS'
        if (url.match(/\.(png|jpg|jpeg|gif|svg|webp)$/)) return 'Image'
        if (url.match(/\.(woff|woff2|ttf|eot)$/)) return 'Font'
        if (url.includes('/api/')) return 'API'
        return 'Other'
    }

    /**
     * 上报性能指标
     */
    report(metric: Omit<PerformanceMetric, 'timestamp'>) {
        const fullMetric: PerformanceMetric = {
            ...metric,
            timestamp: Date.now()
        }

        // 添加到内存
        this.metrics.push(fullMetric)

        // 控制台输出
        if (this.config.enableConsole) {
            console.log('[PerformanceMonitor]', fullMetric)
        }

        // 本地存储
        if (this.config.enableStorage) {
            this.saveMetrics()
        }

        // 自定义上报
        if (this.config.onReport) {
            this.config.onReport(fullMetric)
        }

        // HTTP 上报
        if (this.config.reportUrl) {
            this.sendToServer(fullMetric)
        }
    }

    /**
     * 发送到服务器
     */
    private async sendToServer(metric: PerformanceMetric) {
        try {
            await fetch(this.config.reportUrl!, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...metric,
                    userAgent: navigator.userAgent,
                    url: window.location.href
                })
            })
        } catch (error) {
            console.error('[PerformanceMonitor] 上报失败:', error)
        }
    }

    /**
     * 保存指标到本地存储
     */
    private saveMetrics() {
        try {
            // 限制存储数量
            const metricsToSave = this.metrics.slice(-this.config.maxStorageSize)
            localStorage.setItem(this.storageKey, JSON.stringify(metricsToSave))
        } catch (error) {
            console.error('[PerformanceMonitor] 保存失败:', error)
        }
    }

    /**
     * 从本地存储加载指标
     */
    private loadMetrics() {
        try {
            const data = localStorage.getItem(this.storageKey)
            if (data) {
                this.metrics = JSON.parse(data)
            }
        } catch (error) {
            console.error('[PerformanceMonitor] 加载失败:', error)
        }
    }

    /**
     * 获取所有指标
     */
    getMetrics(): PerformanceMetric[] {
        return [...this.metrics]
    }

    /**
     * 获取指定名称的指标
     */
    getMetricsByName(name: string): PerformanceMetric[] {
        return this.metrics.filter((m) => m.name === name)
    }

    /**
     * 清空指标
     */
    clearMetrics() {
        this.metrics = []
        localStorage.removeItem(this.storageKey)
    }

    /**
     * 获取性能摘要
     */
    getSummary() {
        const summary: Record<string, { avg: number; min: number; max: number; count: number }> = {}

        this.metrics.forEach((metric) => {
            if (!summary[metric.name]) {
                summary[metric.name] = {
                    avg: 0,
                    min: Infinity,
                    max: -Infinity,
                    count: 0
                }
            }

            const stat = summary[metric.name]
            stat.count++
            stat.avg = (stat.avg * (stat.count - 1) + metric.value) / stat.count
            stat.min = Math.min(stat.min, metric.value)
            stat.max = Math.max(stat.max, metric.value)
        })

        return summary
    }
}

// 全局实例
let monitorInstance: PerformanceMonitor | null = null

/**
 * 设置性能监控
 */
export function setupPerformanceMonitor(config: PerformanceMonitorConfig = {}) {
    if (monitorInstance) {
        console.warn('[PerformanceMonitor] 已经初始化，跳过')
        return monitorInstance
    }

    monitorInstance = new PerformanceMonitor(config)
    monitorInstance.init()

    return monitorInstance
}

/**
 * 获取性能监控实例
 */
export function getPerformanceMonitor(): PerformanceMonitor | null {
    return monitorInstance
}

/**
 * 上报自定义指标
 */
export function reportMetric(metric: Omit<PerformanceMetric, 'timestamp'>) {
    if (!monitorInstance) {
        console.warn('[PerformanceMonitor] 未初始化，请先调用 setupPerformanceMonitor()')
        return
    }

    monitorInstance.report(metric)
}

/**
 * 测量函数执行时间
 */
export async function measureAsync<T>(
    name: string,
    fn: () => Promise<T>
): Promise<T> {
    const start = performance.now()
    try {
        return await fn()
    } finally {
        const duration = performance.now() - start
        reportMetric({
            name,
            value: duration,
            unit: 'ms',
            rating: duration < 100 ? 'good' : duration < 300 ? 'needs-improvement' : 'poor'
        })
    }
}

/**
 * 测量同步函数执行时间
 */
export function measure<T>(name: string, fn: () => T): T {
    const start = performance.now()
    try {
        return fn()
    } finally {
        const duration = performance.now() - start
        reportMetric({
            name,
            value: duration,
            unit: 'ms',
            rating: duration < 100 ? 'good' : duration < 300 ? 'needs-improvement' : 'poor'
        })
    }
}
