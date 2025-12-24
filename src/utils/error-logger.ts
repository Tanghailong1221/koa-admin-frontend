/**
 * 错误日志记录器
 * 收集错误上下文、分类错误、上报到监控服务
 */

import { captureSentryException, captureSentryMessage, addSentryBreadcrumb } from './sentry'

/**
 * 错误级别
 */
export const ErrorLevel = {
    DEBUG: 'debug',
    INFO: 'info',
    WARNING: 'warning',
    ERROR: 'error',
    FATAL: 'fatal',
} as const

export type ErrorLevel = (typeof ErrorLevel)[keyof typeof ErrorLevel]

/**
 * 错误类型
 */
export const ErrorType = {
    JS_ERROR: 'js_error',
    NETWORK_ERROR: 'network_error',
    RESOURCE_ERROR: 'resource_error',
    PROMISE_ERROR: 'promise_error',
    VUE_ERROR: 'vue_error',
    HTTP_ERROR: 'http_error',
    BUSINESS_ERROR: 'business_error',
    UNKNOWN_ERROR: 'unknown_error',
} as const

export type ErrorType = (typeof ErrorType)[keyof typeof ErrorType]

/**
 * 错误上下文信息
 */
export interface ErrorContext {
    user?: {
        id?: string | number
        username?: string
        email?: string
    }
    page?: {
        url: string
        title: string
        referrer: string
    }
    browser?: {
        userAgent: string
        language: string
        platform: string
        screenResolution: string
    }
    app?: {
        version: string
        environment: string
    }
    extra?: Record<string, any>
}

/**
 * 错误日志条目
 */
export interface ErrorLogEntry {
    id: string
    level: ErrorLevel
    type: ErrorType
    message: string
    stack?: string
    context: ErrorContext
    timestamp: number
    reported: boolean
}

/**
 * 错误日志配置
 */
export interface ErrorLoggerOptions {
    enabled?: boolean
    maxLogs?: number
    autoReport?: boolean
    reportFunction?: (entry: ErrorLogEntry) => Promise<void>
    consoleOutput?: boolean
    sampleRate?: number
}

/**
 * 错误日志记录器类
 */
export class ErrorLogger {
    private logs: ErrorLogEntry[] = []
    private enabled: boolean
    private maxLogs: number
    private autoReport: boolean
    private reportFunction?: (entry: ErrorLogEntry) => Promise<void>
    private consoleOutput: boolean
    private sampleRate: number

    constructor(options: ErrorLoggerOptions = {}) {
        this.enabled = options.enabled ?? true
        this.maxLogs = options.maxLogs ?? 100
        this.autoReport = options.autoReport ?? false
        this.reportFunction = options.reportFunction
        this.consoleOutput = options.consoleOutput ?? true
        this.sampleRate = options.sampleRate ?? 1.0
    }

    log(
        level: ErrorLevel,
        type: ErrorType,
        message: string,
        error?: Error,
        extra?: Record<string, any>
    ): ErrorLogEntry {
        if (!this.enabled) {
            return this.createEmptyEntry()
        }

        if (Math.random() > this.sampleRate) {
            return this.createEmptyEntry()
        }

        // 忽略 ResizeObserver 错误
        if (message && message.includes('ResizeObserver')) {
            return this.createEmptyEntry()
        }

        const entry: ErrorLogEntry = {
            id: this.generateId(),
            level,
            type,
            message,
            stack: error?.stack,
            context: this.collectContext(extra),
            timestamp: Date.now(),
            reported: false,
        }

        this.logs.push(entry)

        if (this.logs.length > this.maxLogs) {
            this.logs.shift()
        }

        if (this.consoleOutput) {
            this.outputToConsole(entry, error)
        }

        if (this.autoReport && this.reportFunction) {
            this.report(entry)
        }

        return entry
    }

    debug(message: string, extra?: Record<string, any>): ErrorLogEntry {
        return this.log(ErrorLevel.DEBUG, ErrorType.UNKNOWN_ERROR, message, undefined, extra)
    }

    info(message: string, extra?: Record<string, any>): ErrorLogEntry {
        return this.log(ErrorLevel.INFO, ErrorType.UNKNOWN_ERROR, message, undefined, extra)
    }

    warning(message: string, error?: Error, extra?: Record<string, any>): ErrorLogEntry {
        return this.log(ErrorLevel.WARNING, ErrorType.UNKNOWN_ERROR, message, error, extra)
    }

    error(
        type: ErrorType,
        message: string,
        error?: Error,
        extra?: Record<string, any>
    ): ErrorLogEntry {
        return this.log(ErrorLevel.ERROR, type, message, error, extra)
    }

    fatal(
        type: ErrorType,
        message: string,
        error?: Error,
        extra?: Record<string, any>
    ): ErrorLogEntry {
        return this.log(ErrorLevel.FATAL, type, message, error, extra)
    }

    async report(entry: ErrorLogEntry): Promise<void> {
        if (!this.reportFunction) {
            // 如果没有自定义上报函数，使用 Sentry
            try {
                // 添加面包屑
                addSentryBreadcrumb({
                    message: entry.message,
                    category: entry.type,
                    level: entry.level as any,
                    data: entry.context.extra
                })

                // 根据级别上报
                if (entry.level === ErrorLevel.ERROR || entry.level === ErrorLevel.FATAL) {
                    if (entry.stack) {
                        // 如果有堆栈信息，创建 Error 对象
                        const error = new Error(entry.message)
                        error.stack = entry.stack
                        captureSentryException(error, {
                            type: entry.type,
                            context: entry.context
                        })
                    } else {
                        captureSentryMessage(entry.message, entry.level as any)
                    }
                } else {
                    captureSentryMessage(entry.message, entry.level as any)
                }

                entry.reported = true
                console.log('[ErrorLogger] 错误已上报到 Sentry:', entry.id)
            } catch (error) {
                console.error('[ErrorLogger] Sentry 上报失败:', error)
            }
            return
        }

        try {
            await this.reportFunction(entry)
            entry.reported = true
            console.log('[ErrorLogger] 错误已上报:', entry.id)
        } catch (error) {
            console.error('[ErrorLogger] 错误上报失败:', error)
        }
    }

    async reportAll(): Promise<void> {
        const unreported = this.logs.filter(log => !log.reported)

        if (unreported.length === 0) {
            console.log('[ErrorLogger] 没有需要上报的错误')
            return
        }

        console.log(`[ErrorLogger] 开始批量上报 ${unreported.length} 个错误`)

        for (const entry of unreported) {
            await this.report(entry)
        }
    }

    getLogs(): ErrorLogEntry[] {
        return [...this.logs]
    }

    getLogsByLevel(level: ErrorLevel): ErrorLogEntry[] {
        return this.logs.filter(log => log.level === level)
    }

    getLogsByType(type: ErrorType): ErrorLogEntry[] {
        return this.logs.filter(log => log.type === type)
    }

    clear(): void {
        this.logs = []
        console.log('[ErrorLogger] 日志已清空')
    }

    private collectContext(extra?: Record<string, any>): ErrorContext {
        return {
            page: {
                url: window.location.href,
                title: document.title,
                referrer: document.referrer,
            },
            browser: {
                userAgent: navigator.userAgent,
                language: navigator.language,
                platform: navigator.platform,
                screenResolution: `${window.screen.width}x${window.screen.height}`,
            },
            app: {
                version: import.meta.env.VITE_APP_VERSION || '1.0.0',
                environment: import.meta.env.MODE,
            },
            extra,
        }
    }

    private outputToConsole(entry: ErrorLogEntry, error?: Error): void {
        const prefix = `[ErrorLogger][${entry.level.toUpperCase()}][${entry.type}]`
        const message = `${prefix} ${entry.message}`

        switch (entry.level) {
            case ErrorLevel.DEBUG:
                console.debug(message, entry)
                break
            case ErrorLevel.INFO:
                console.info(message, entry)
                break
            case ErrorLevel.WARNING:
                console.warn(message, entry)
                break
            case ErrorLevel.ERROR:
            case ErrorLevel.FATAL:
                console.error(message, entry)
                if (error) {
                    console.error(error)
                }
                break
        }
    }

    private generateId(): string {
        return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    }

    private createEmptyEntry(): ErrorLogEntry {
        return {
            id: '',
            level: ErrorLevel.INFO,
            type: ErrorType.UNKNOWN_ERROR,
            message: '',
            context: {} as ErrorContext,
            timestamp: 0,
            reported: false,
        }
    }

    enable(): void {
        this.enabled = true
    }

    disable(): void {
        this.enabled = false
    }

    isEnabled(): boolean {
        return this.enabled
    }
}

export function createErrorLogger(options?: ErrorLoggerOptions): ErrorLogger {
    return new ErrorLogger(options)
}

let _errorLogger: ErrorLogger | null = null

export function getErrorLogger(): ErrorLogger {
    if (!_errorLogger) {
        _errorLogger = createErrorLogger({
            enabled: true,
            maxLogs: 100,
            autoReport: false,
            consoleOutput: import.meta.env.DEV,
            sampleRate: import.meta.env.PROD ? 0.1 : 1.0,
        })
    }
    return _errorLogger
}
