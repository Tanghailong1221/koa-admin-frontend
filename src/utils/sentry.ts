/**
 * Sentry 错误追踪集成
 * 提供生产环境错误监控和性能追踪
 */

import * as Sentry from '@sentry/vue'
import type { App } from 'vue'
import type { Router } from 'vue-router'

export interface SentryConfig {
    dsn: string
    environment?: string
    release?: string
    tracesSampleRate?: number
    replaysSessionSampleRate?: number
    replaysOnErrorSampleRate?: number
    enabled?: boolean
}

/**
 * 初始化 Sentry
 */
export function initSentry(app: App, router: Router, config: SentryConfig) {
    // 只在生产环境且配置了 DSN 时启用
    if (!config.enabled || !config.dsn || import.meta.env.DEV) {
        console.log('[Sentry] 未启用或处于开发环境')
        return
    }

    try {
        Sentry.init({
            app,
            dsn: config.dsn,
            environment: config.environment || import.meta.env.MODE,
            release: config.release || import.meta.env.VITE_APP_VERSION,

            // 集成配置
            integrations: [
                // 浏览器追踪
                Sentry.browserTracingIntegration({ router }),
                // 会话重放
                Sentry.replayIntegration({
                    maskAllText: true,
                    blockAllMedia: true
                })
            ],

            // 性能监控采样率 (0.0 - 1.0)
            tracesSampleRate: config.tracesSampleRate ?? 0.1,

            // 会话重放采样率
            replaysSessionSampleRate: config.replaysSessionSampleRate ?? 0.1,
            replaysOnErrorSampleRate: config.replaysOnErrorSampleRate ?? 1.0,

            // 忽略特定错误
            ignoreErrors: [
                // 浏览器扩展错误
                'top.GLOBALS',
                'originalCreateNotification',
                'canvas.contentDocument',
                'MyApp_RemoveAllHighlights',
                'http://tt.epicplay.com',
                "Can't find variable: ZiteReader",
                'jigsaw is not defined',
                'ComboSearch is not defined',
                'http://loading.retry.widdit.com/',
                'atomicFindClose',
                // Facebook 相关
                'fb_xd_fragment',
                // ISP 优化
                'bmi_SafeAddOnload',
                'EBCallBackMessageReceived',
                // Chrome 扩展
                'conduitPage',
                // 网络错误
                'Network request failed',
                'NetworkError',
                'Failed to fetch',
                // 取消的请求
                'Request aborted',
                'AbortError'
            ],

            // 忽略特定 URL
            denyUrls: [
                // Chrome 扩展
                /extensions\//i,
                /^chrome:\/\//i,
                /^chrome-extension:\/\//i,
                // Firefox 扩展
                /^moz-extension:\/\//i,
                // 其他浏览器扩展
                /^safari-extension:\/\//i
            ],

            // 在发送前处理事件
            beforeSend(event, hint) {
                // 过滤敏感信息
                if (event.request) {
                    // 移除查询参数中的敏感信息
                    if (event.request.url) {
                        const url = new URL(event.request.url)
                        const sensitiveParams = ['token', 'password', 'secret', 'key', 'apiKey']
                        sensitiveParams.forEach((param) => {
                            if (url.searchParams.has(param)) {
                                url.searchParams.set(param, '[FILTERED]')
                            }
                        })
                        event.request.url = url.toString()
                    }

                    // 移除请求头中的敏感信息
                    if (event.request.headers) {
                        const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key']
                        sensitiveHeaders.forEach((header) => {
                            if (event.request!.headers![header]) {
                                event.request!.headers![header] = '[FILTERED]'
                            }
                        })
                    }
                }

                // 在开发环境打印错误信息
                if (import.meta.env.DEV) {
                    console.error('[Sentry]', hint.originalException || hint.syntheticException)
                    return null // 开发环境不发送
                }

                return event
            },

            // 在发送前处理面包屑
            beforeBreadcrumb(breadcrumb) {
                // 过滤敏感的面包屑数据
                if (breadcrumb.category === 'xhr' || breadcrumb.category === 'fetch') {
                    if (breadcrumb.data?.url) {
                        const url = new URL(breadcrumb.data.url, window.location.origin)
                        const sensitiveParams = ['token', 'password', 'secret', 'key']
                        sensitiveParams.forEach((param) => {
                            if (url.searchParams.has(param)) {
                                url.searchParams.set(param, '[FILTERED]')
                            }
                        })
                        breadcrumb.data.url = url.toString()
                    }
                }

                return breadcrumb
            }
        })

        console.log('[Sentry] 初始化成功')
    } catch (error) {
        console.error('[Sentry] 初始化失败:', error)
    }
}

/**
 * 设置用户上下文
 */
export function setSentryUser(user: {
    id: string
    username?: string
    email?: string
    [key: string]: any
}) {
    Sentry.setUser({
        id: user.id,
        username: user.username,
        email: user.email
    })
}

/**
 * 清除用户上下文
 */
export function clearSentryUser() {
    Sentry.setUser(null)
}

/**
 * 设置标签
 */
export function setSentryTag(key: string, value: string) {
    Sentry.setTag(key, value)
}

/**
 * 设置上下文
 */
export function setSentryContext(name: string, context: Record<string, any>) {
    Sentry.setContext(name, context)
}

/**
 * 手动捕获异常
 */
export function captureSentryException(error: Error, context?: Record<string, any>) {
    if (context) {
        Sentry.withScope((scope) => {
            Object.entries(context).forEach(([key, value]) => {
                scope.setExtra(key, value)
            })
            Sentry.captureException(error)
        })
    } else {
        Sentry.captureException(error)
    }
}

/**
 * 手动捕获消息
 */
export function captureSentryMessage(
    message: string,
    level: 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug' = 'info'
) {
    Sentry.captureMessage(message, level)
}

/**
 * 添加面包屑
 */
export function addSentryBreadcrumb(breadcrumb: {
    message: string
    category?: string
    level?: 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug'
    data?: Record<string, any>
}) {
    Sentry.addBreadcrumb(breadcrumb)
}

/**
 * 开始性能追踪
 */
export function startSentryTransaction(name: string, op: string) {
    // Sentry v8 使用 startSpan 替代 startTransaction
    // 记录追踪信息
    Sentry.setTag('transaction.name', name)
    Sentry.setTag('transaction.op', op)

    return {
        setStatus: (status: string) => {
            Sentry.setTag('transaction.status', status)
        },
        finish: () => {
            // 完成追踪
        }
    }
}

export default Sentry
