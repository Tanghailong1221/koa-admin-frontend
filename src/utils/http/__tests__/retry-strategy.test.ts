/**
 * 重试策略测试
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { RetryStrategy, defaultShouldRetry, createRetryStrategy } from '../retry-strategy'
import type { AxiosError } from 'axios'

describe('RetryStrategy', () => {
    describe('defaultShouldRetry', () => {
        it('应该对网络错误重试', () => {
            const error = {
                response: undefined,
                message: 'Network Error',
            } as AxiosError

            expect(defaultShouldRetry(error)).toBe(true)
        })

        it('应该对 5xx 错误重试', () => {
            const error = {
                response: { status: 500 },
            } as AxiosError

            expect(defaultShouldRetry(error)).toBe(true)

            const error503 = {
                response: { status: 503 },
            } as AxiosError

            expect(defaultShouldRetry(error503)).toBe(true)
        })

        it('应该对 429 错误重试', () => {
            const error = {
                response: { status: 429 },
            } as AxiosError

            expect(defaultShouldRetry(error)).toBe(true)
        })

        it('应该对 408 错误重试', () => {
            const error = {
                response: { status: 408 },
            } as AxiosError

            expect(defaultShouldRetry(error)).toBe(true)
        })

        it('不应该对 4xx 客户端错误重试', () => {
            const error400 = {
                response: { status: 400 },
            } as AxiosError

            expect(defaultShouldRetry(error400)).toBe(false)

            const error404 = {
                response: { status: 404 },
            } as AxiosError

            expect(defaultShouldRetry(error404)).toBe(false)
        })

        it('不应该对 401 未授权错误重试', () => {
            const error = {
                response: { status: 401 },
            } as AxiosError

            expect(defaultShouldRetry(error)).toBe(false)
        })
    })

    describe('RetryStrategy', () => {
        let strategy: RetryStrategy

        beforeEach(() => {
            strategy = new RetryStrategy()
        })

        it('应该使用默认配置创建', () => {
            expect(strategy).toBeInstanceOf(RetryStrategy)
        })

        it('应该使用自定义配置创建', () => {
            const customStrategy = new RetryStrategy({
                maxRetries: 5,
                initialDelay: 500,
                maxDelay: 10000,
                backoffFactor: 3,
            })

            expect(customStrategy).toBeInstanceOf(RetryStrategy)
        })

        describe('calculateDelay', () => {
            it('应该计算指数退避延迟', () => {
                // 第一次重试：1000ms
                const delay0 = strategy.calculateDelay(0)
                expect(delay0).toBeGreaterThanOrEqual(750) // 1000 - 25%
                expect(delay0).toBeLessThanOrEqual(1250) // 1000 + 25%

                // 第二次重试：2000ms
                const delay1 = strategy.calculateDelay(1)
                expect(delay1).toBeGreaterThanOrEqual(1500)
                expect(delay1).toBeLessThanOrEqual(2500)

                // 第三次重试：4000ms
                const delay2 = strategy.calculateDelay(2)
                expect(delay2).toBeGreaterThanOrEqual(3000)
                expect(delay2).toBeLessThanOrEqual(5000)
            })

            it('应该限制最大延迟时间', () => {
                const strategy = new RetryStrategy({
                    initialDelay: 1000,
                    maxDelay: 5000,
                })

                // 第 10 次重试会超过 maxDelay
                const delay = strategy.calculateDelay(10)
                expect(delay).toBeLessThanOrEqual(5000)
            })
        })

        describe('canRetry', () => {
            it('应该在达到最大重试次数时返回 false', () => {
                const error = {
                    response: { status: 500 },
                } as AxiosError

                expect(strategy.canRetry(error, 0)).toBe(true)
                expect(strategy.canRetry(error, 1)).toBe(true)
                expect(strategy.canRetry(error, 2)).toBe(true)
                expect(strategy.canRetry(error, 3)).toBe(false) // 达到最大重试次数
            })

            it('应该对不可重试的错误返回 false', () => {
                const error = {
                    response: { status: 400 },
                } as AxiosError

                expect(strategy.canRetry(error, 0)).toBe(false)
            })

            it('应该使用自定义的 shouldRetry 函数', () => {
                const customStrategy = new RetryStrategy({
                    shouldRetry: (error) => error.response?.status === 400,
                })

                const error = {
                    response: { status: 400 },
                } as AxiosError

                expect(customStrategy.canRetry(error, 0)).toBe(true)
            })
        })

        describe('delay', () => {
            it('应该延迟指定的时间', async () => {
                const start = Date.now()
                await strategy.delay(100)
                const elapsed = Date.now() - start

                expect(elapsed).toBeGreaterThanOrEqual(90) // 允许一些误差
                expect(elapsed).toBeLessThan(150)
            })
        })

        describe('executeRetry', () => {
            it('应该执行延迟并触发回调', async () => {
                const onRetry = vi.fn()
                const strategy = new RetryStrategy({
                    initialDelay: 50,
                    onRetry,
                })

                const error = {
                    response: { status: 500 },
                } as AxiosError

                const start = Date.now()
                await strategy.executeRetry(error, 0)
                const elapsed = Date.now() - start

                expect(elapsed).toBeGreaterThanOrEqual(30)
                expect(onRetry).toHaveBeenCalledWith(error, 0, expect.any(Number))
            })
        })

        describe('getRetryCount / setRetryCount', () => {
            it('应该获取和设置重试计数', () => {
                const config = {} as any

                expect(strategy.getRetryCount(config)).toBe(0)

                strategy.setRetryCount(config, 2)
                expect(strategy.getRetryCount(config)).toBe(2)
            })
        })

        describe('markAsNoRetry / isMarkedAsNoRetry', () => {
            it('应该标记和检查不可重试', () => {
                const config = {} as any

                expect(RetryStrategy.isMarkedAsNoRetry(config)).toBe(false)

                RetryStrategy.markAsNoRetry(config)
                expect(RetryStrategy.isMarkedAsNoRetry(config)).toBe(true)
            })
        })
    })

    describe('createRetryStrategy', () => {
        it('应该创建重试策略实例', () => {
            const strategy = createRetryStrategy()
            expect(strategy).toBeInstanceOf(RetryStrategy)
        })

        it('应该使用自定义选项创建', () => {
            const strategy = createRetryStrategy({
                maxRetries: 5,
            })
            expect(strategy).toBeInstanceOf(RetryStrategy)
        })
    })
})
