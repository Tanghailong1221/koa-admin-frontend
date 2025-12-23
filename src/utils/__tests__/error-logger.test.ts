/**
 * 错误日志记录器测试
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
    ErrorLogger,
    createErrorLogger,
    getErrorLogger,
    ErrorLevel,
    ErrorType,
} from '../error-logger'

describe('ErrorLogger', () => {
    let logger: ErrorLogger

    beforeEach(() => {
        logger = new ErrorLogger({
            consoleOutput: false, // 测试时禁用控制台输出
        })
    })

    describe('log', () => {
        it('应该记录错误', () => {
            const entry = logger.log(
                ErrorLevel.ERROR,
                ErrorType.JS_ERROR,
                '测试错误',
                new Error('Test error')
            )

            expect(entry.id).toBeTruthy()
            expect(entry.level).toBe(ErrorLevel.ERROR)
            expect(entry.type).toBe(ErrorType.JS_ERROR)
            expect(entry.message).toBe('测试错误')
            expect(entry.stack).toBeTruthy()
            expect(entry.timestamp).toBeGreaterThan(0)
            expect(entry.reported).toBe(false)
        })

        it('应该收集错误上下文', () => {
            const entry = logger.log(
                ErrorLevel.ERROR,
                ErrorType.JS_ERROR,
                '测试错误',
                undefined,
                { customData: 'test' }
            )

            expect(entry.context.page).toBeDefined()
            expect(entry.context.browser).toBeDefined()
            expect(entry.context.app).toBeDefined()
            expect(entry.context.extra).toEqual({ customData: 'test' })
        })

        it('应该限制日志数量', () => {
            const smallLogger = new ErrorLogger({
                maxLogs: 3,
                consoleOutput: false,
            })

            smallLogger.log(ErrorLevel.ERROR, ErrorType.JS_ERROR, '错误 1')
            smallLogger.log(ErrorLevel.ERROR, ErrorType.JS_ERROR, '错误 2')
            smallLogger.log(ErrorLevel.ERROR, ErrorType.JS_ERROR, '错误 3')
            smallLogger.log(ErrorLevel.ERROR, ErrorType.JS_ERROR, '错误 4')

            const logs = smallLogger.getLogs()
            expect(logs).toHaveLength(3)
            expect(logs[0].message).toBe('错误 2') // 第一个被移除
        })

        it('应该支持采样率', () => {
            const sampledLogger = new ErrorLogger({
                sampleRate: 0, // 0% 采样率
                consoleOutput: false,
            })

            sampledLogger.log(ErrorLevel.ERROR, ErrorType.JS_ERROR, '测试错误')

            expect(sampledLogger.getLogs()).toHaveLength(0)
        })
    })

    describe('便捷方法', () => {
        it('应该记录调试信息', () => {
            const entry = logger.debug('调试信息')

            expect(entry.level).toBe(ErrorLevel.DEBUG)
            expect(entry.message).toBe('调试信息')
        })

        it('应该记录一般信息', () => {
            const entry = logger.info('一般信息')

            expect(entry.level).toBe(ErrorLevel.INFO)
            expect(entry.message).toBe('一般信息')
        })

        it('应该记录警告', () => {
            const entry = logger.warning('警告信息')

            expect(entry.level).toBe(ErrorLevel.WARNING)
            expect(entry.message).toBe('警告信息')
        })

        it('应该记录错误', () => {
            const entry = logger.error(ErrorType.JS_ERROR, '错误信息')

            expect(entry.level).toBe(ErrorLevel.ERROR)
            expect(entry.type).toBe(ErrorType.JS_ERROR)
            expect(entry.message).toBe('错误信息')
        })

        it('应该记录严重错误', () => {
            const entry = logger.fatal(ErrorType.JS_ERROR, '严重错误')

            expect(entry.level).toBe(ErrorLevel.FATAL)
            expect(entry.type).toBe(ErrorType.JS_ERROR)
            expect(entry.message).toBe('严重错误')
        })
    })

    describe('report', () => {
        it('应该上报错误', async () => {
            const reportFn = vi.fn().mockResolvedValue(undefined)
            const logger = new ErrorLogger({
                reportFunction: reportFn,
                consoleOutput: false,
            })

            const entry = logger.error(ErrorType.JS_ERROR, '测试错误')
            await logger.report(entry)

            expect(reportFn).toHaveBeenCalledWith(entry)
            expect(entry.reported).toBe(true)
        })

        it('应该处理上报失败', async () => {
            const reportFn = vi.fn().mockRejectedValue(new Error('上报失败'))
            const logger = new ErrorLogger({
                reportFunction: reportFn,
                consoleOutput: false,
            })

            const entry = logger.error(ErrorType.JS_ERROR, '测试错误')
            await logger.report(entry)

            expect(entry.reported).toBe(false)
        })

        it('应该自动上报', () => {
            const reportFn = vi.fn().mockResolvedValue(undefined)
            const logger = new ErrorLogger({
                autoReport: true,
                reportFunction: reportFn,
                consoleOutput: false,
            })

            logger.error(ErrorType.JS_ERROR, '测试错误')

            expect(reportFn).toHaveBeenCalled()
        })
    })

    describe('reportAll', () => {
        it('应该批量上报未上报的错误', async () => {
            const reportFn = vi.fn().mockResolvedValue(undefined)
            const logger = new ErrorLogger({
                reportFunction: reportFn,
                consoleOutput: false,
            })

            logger.error(ErrorType.JS_ERROR, '错误 1')
            logger.error(ErrorType.JS_ERROR, '错误 2')
            logger.error(ErrorType.JS_ERROR, '错误 3')

            await logger.reportAll()

            expect(reportFn).toHaveBeenCalledTimes(3)
        })

        it('不应该重复上报已上报的错误', async () => {
            const reportFn = vi.fn().mockResolvedValue(undefined)
            const logger = new ErrorLogger({
                reportFunction: reportFn,
                consoleOutput: false,
            })

            const entry = logger.error(ErrorType.JS_ERROR, '测试错误')
            await logger.report(entry)

            reportFn.mockClear()
            await logger.reportAll()

            expect(reportFn).not.toHaveBeenCalled()
        })
    })

    describe('getLogs', () => {
        it('应该获取所有日志', () => {
            logger.error(ErrorType.JS_ERROR, '错误 1')
            logger.error(ErrorType.JS_ERROR, '错误 2')

            const logs = logger.getLogs()

            expect(logs).toHaveLength(2)
        })

        it('应该按级别获取日志', () => {
            logger.debug('调试')
            logger.info('信息')
            logger.error(ErrorType.JS_ERROR, '错误')

            const errorLogs = logger.getLogsByLevel(ErrorLevel.ERROR)

            expect(errorLogs).toHaveLength(1)
            expect(errorLogs[0].message).toBe('错误')
        })

        it('应该按类型获取日志', () => {
            logger.error(ErrorType.JS_ERROR, 'JS 错误')
            logger.error(ErrorType.NETWORK_ERROR, '网络错误')
            logger.error(ErrorType.JS_ERROR, '另一个 JS 错误')

            const jsErrors = logger.getLogsByType(ErrorType.JS_ERROR)

            expect(jsErrors).toHaveLength(2)
        })
    })

    describe('clear', () => {
        it('应该清空所有日志', () => {
            logger.error(ErrorType.JS_ERROR, '错误 1')
            logger.error(ErrorType.JS_ERROR, '错误 2')

            expect(logger.getLogs()).toHaveLength(2)

            logger.clear()

            expect(logger.getLogs()).toHaveLength(0)
        })
    })

    describe('enable / disable', () => {
        it('应该可以禁用日志记录', () => {
            logger.disable()
            expect(logger.isEnabled()).toBe(false)

            logger.error(ErrorType.JS_ERROR, '测试错误')

            expect(logger.getLogs()).toHaveLength(0)
        })

        it('应该可以重新启用日志记录', () => {
            logger.disable()
            logger.enable()
            expect(logger.isEnabled()).toBe(true)

            logger.error(ErrorType.JS_ERROR, '测试错误')

            expect(logger.getLogs()).toHaveLength(1)
        })
    })
})

describe('createErrorLogger', () => {
    it('应该创建错误日志记录器实例', () => {
        const logger = createErrorLogger()
        expect(logger).toBeInstanceOf(ErrorLogger)
    })

    it('应该使用自定义选项创建', () => {
        const logger = createErrorLogger({
            enabled: false,
            maxLogs: 50,
        })
        expect(logger.isEnabled()).toBe(false)
    })
})

describe('getErrorLogger', () => {
    it('应该返回单例实例', () => {
        const logger1 = getErrorLogger()
        const logger2 = getErrorLogger()

        expect(logger1).toBe(logger2)
    })
})
