/**
 * 全局错误处理器设置
 * 捕获 Vue 应用中的所有未处理错误
 */
import type { App } from 'vue'
import { ElMessage, ElNotification } from 'element-plus'
import { getErrorLogger, ErrorType } from './error-logger'

const errorLogger = getErrorLogger()

/**
 * 设置 Vue 全局错误处理器
 */
export function setupErrorHandler(app: App) {
    // Vue 错误处理器
    app.config.errorHandler = (err, instance, info) => {
        console.error('[Global Error Handler] Vue 错误:', err)
        console.error('[Global Error Handler] 组件实例:', instance)
        console.error('[Global Error Handler] 错误信息:', info)

        // 记录到 ErrorLogger
        errorLogger.error(
            ErrorType.VUE_ERROR,
            err instanceof Error ? err.message : String(err),
            err instanceof Error ? err : undefined,
            {
                componentName: instance?.$options?.name || instance?.$options?.__name,
                errorInfo: info,
            }
        )

        // 显示用户友好的错误提示
        showUserFriendlyError(err, 'Vue 组件错误')
    }

    // Vue 警告处理器（仅开发环境）
    if (import.meta.env.DEV) {
        app.config.warnHandler = (msg, instance, trace) => {
            console.warn('[Global Warn Handler] Vue 警告:', msg)
            console.warn('[Global Warn Handler] 组件追踪:', trace)

            // 记录警告
            errorLogger.warning(msg, undefined, {
                componentName: instance?.$options?.name || instance?.$options?.__name,
                trace,
            })
        }
    }

    // 全局未捕获的 Promise 错误
    window.addEventListener('unhandledrejection', (event) => {
        console.error('[Global Error Handler] 未捕获的 Promise 错误:', event.reason)

        // 记录到 ErrorLogger
        errorLogger.error(
            ErrorType.PROMISE_ERROR,
            event.reason instanceof Error ? event.reason.message : String(event.reason),
            event.reason instanceof Error ? event.reason : undefined,
            {
                promise: event.promise,
            }
        )

        // 显示用户友好的错误提示
        showUserFriendlyError(event.reason, 'Promise 错误')

        // 阻止默认的控制台错误输出
        event.preventDefault()
    })

    // 全局 JavaScript 错误
    window.addEventListener('error', (event) => {
        // 忽略资源加载错误（如图片、脚本加载失败）
        if (event.target && event.target !== window) {
            console.error('[Global Error Handler] 资源加载错误:', event.target)

            errorLogger.error(
                ErrorType.RESOURCE_ERROR,
                `资源加载失败: ${(event.target as any).src || (event.target as any).href}`,
                undefined,
                {
                    tagName: (event.target as any).tagName,
                    src: (event.target as any).src,
                    href: (event.target as any).href,
                }
            )

            // 资源加载错误不显示给用户
            return
        }

        console.error('[Global Error Handler] JavaScript 错误:', event.error)

        // 记录到 ErrorLogger
        errorLogger.error(
            ErrorType.JS_ERROR,
            event.message,
            event.error,
            {
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
            }
        )

        // 显示用户友好的错误提示
        showUserFriendlyError(event.error, 'JavaScript 错误')
    })

    console.log('[Global Error Handler] 全局错误处理器已设置')
}

/**
 * 显示用户友好的错误提示
 */
function showUserFriendlyError(error: any, _type: string) {
    const errorMessage = error instanceof Error ? error.message : String(error)

    // 根据错误类型决定显示方式
    if (shouldShowNotification(error)) {
        // 重要错误使用通知
        ElNotification({
            title: '发生错误',
            message: getUserFriendlyMessage(errorMessage),
            type: 'error',
            duration: 5000,
            position: 'top-right',
        })
    } else {
        // 一般错误使用消息提示
        ElMessage({
            message: getUserFriendlyMessage(errorMessage),
            type: 'error',
            duration: 3000,
            showClose: true,
        })
    }
}

/**
 * 判断是否应该显示通知（而不是消息提示）
 */
function shouldShowNotification(error: any): boolean {
    // 网络错误、严重错误使用通知
    if (error instanceof Error) {
        const message = error.message.toLowerCase()
        return (
            message.includes('network') ||
            message.includes('timeout') ||
            message.includes('failed to fetch') ||
            message.includes('chunk')
        )
    }
    return false
}

/**
 * 获取用户友好的错误消息
 */
function getUserFriendlyMessage(errorMessage: string): string {
    const message = errorMessage.toLowerCase()

    // 网络相关错误
    if (message.includes('network') || message.includes('failed to fetch')) {
        return '网络连接失败，请检查您的网络连接'
    }

    // 超时错误
    if (message.includes('timeout')) {
        return '请求超时，请稍后重试'
    }

    // 代码分割加载失败
    if (message.includes('chunk') || message.includes('loading')) {
        return '页面资源加载失败，请刷新页面重试'
    }

    // 权限错误
    if (message.includes('permission') || message.includes('unauthorized')) {
        return '您没有权限执行此操作'
    }

    // 数据验证错误
    if (message.includes('validation') || message.includes('invalid')) {
        return '数据验证失败，请检查输入'
    }

    // 默认消息
    if (import.meta.env.DEV) {
        // 开发环境显示详细错误
        return errorMessage
    } else {
        // 生产环境显示通用错误
        return '操作失败，请稍后重试'
    }
}

/**
 * 手动报告错误
 */
export function reportError(error: Error, context?: Record<string, any>) {
    errorLogger.error(ErrorType.BUSINESS_ERROR, error.message, error, context)
    showUserFriendlyError(error, '业务错误')
}

/**
 * 手动报告警告
 */
export function reportWarning(message: string, context?: Record<string, any>) {
    errorLogger.warning(message, undefined, context)
    ElMessage.warning(message)
}

/**
 * 手动报告信息
 */
export function reportInfo(message: string, context?: Record<string, any>) {
    errorLogger.info(message, context)
}
