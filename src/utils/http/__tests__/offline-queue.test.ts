/**
 * 离线队列测试
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { OfflineQueue, createOfflineQueue } from '../offline-queue'
import type { AxiosRequestConfig } from 'axios'

describe('OfflineQueue', () => {
    let offlineQueue: OfflineQueue

    beforeEach(() => {
        // 清理 localStorage
        localStorage.clear()

        // 模拟在线状态
        vi.stubGlobal('navigator', { onLine: true })

        offlineQueue = new OfflineQueue({
            persist: false, // 测试时禁用持久化
        })
    })

    afterEach(() => {
        offlineQueue.destroy()
        vi.unstubAllGlobals()
    })

    describe('enqueue', () => {
        it('应该添加 POST 请求到队列', () => {
            const config: AxiosRequestConfig = {
                method: 'post',
                url: '/api/users',
                data: { name: 'John' },
            }

            const result = offlineQueue.enqueue(config)

            expect(result).toBe(true)
            expect(offlineQueue.getQueueSize()).toBe(1)
        })

        it('应该添加 PUT 请求到队列', () => {
            const config: AxiosRequestConfig = {
                method: 'put',
                url: '/api/users/1',
                data: { name: 'John' },
            }

            const result = offlineQueue.enqueue(config)

            expect(result).toBe(true)
            expect(offlineQueue.getQueueSize()).toBe(1)
        })

        it('应该添加 DELETE 请求到队列', () => {
            const config: AxiosRequestConfig = {
                method: 'delete',
                url: '/api/users/1',
            }

            const result = offlineQueue.enqueue(config)

            expect(result).toBe(true)
            expect(offlineQueue.getQueueSize()).toBe(1)
        })

        it('不应该添加 GET 请求到队列', () => {
            const config: AxiosRequestConfig = {
                method: 'get',
                url: '/api/users',
            }

            const result = offlineQueue.enqueue(config)

            expect(result).toBe(false)
            expect(offlineQueue.getQueueSize()).toBe(0)
        })

        it('不应该添加标记为不缓存的请求', () => {
            const config: AxiosRequestConfig = {
                method: 'post',
                url: '/api/users',
                data: { name: 'John' },
            }

            OfflineQueue.markAsNoCache(config)
            const result = offlineQueue.enqueue(config)

            expect(result).toBe(false)
            expect(offlineQueue.getQueueSize()).toBe(0)
        })

        it('应该限制队列大小', () => {
            const smallQueue = new OfflineQueue({
                maxQueueSize: 2,
                persist: false,
            })

            const config1: AxiosRequestConfig = {
                method: 'post',
                url: '/api/users',
                data: { name: 'User1' },
            }

            const config2: AxiosRequestConfig = {
                method: 'post',
                url: '/api/users',
                data: { name: 'User2' },
            }

            const config3: AxiosRequestConfig = {
                method: 'post',
                url: '/api/users',
                data: { name: 'User3' },
            }

            expect(smallQueue.enqueue(config1)).toBe(true)
            expect(smallQueue.enqueue(config2)).toBe(true)
            expect(smallQueue.enqueue(config3)).toBe(false) // 队列已满

            expect(smallQueue.getQueueSize()).toBe(2)

            smallQueue.destroy()
        })
    })

    describe('replayQueue', () => {
        it('应该重放队列中的所有请求', async () => {
            const config1: AxiosRequestConfig = {
                method: 'post',
                url: '/api/users',
                data: { name: 'User1' },
            }

            const config2: AxiosRequestConfig = {
                method: 'post',
                url: '/api/users',
                data: { name: 'User2' },
            }

            offlineQueue.enqueue(config1)
            offlineQueue.enqueue(config2)

            const mockReplay = vi.fn().mockResolvedValue({ data: 'success' })
            offlineQueue.setReplayFunction(mockReplay)

            await offlineQueue.replayQueue()

            expect(mockReplay).toHaveBeenCalledTimes(2)
            expect(offlineQueue.getQueueSize()).toBe(0)
        })

        it('应该在重放失败时重试', async () => {
            const config: AxiosRequestConfig = {
                method: 'post',
                url: '/api/users',
                data: { name: 'User1' },
            }

            offlineQueue.enqueue(config)

            const mockReplay = vi.fn().mockRejectedValue(new Error('Network error'))
            offlineQueue.setReplayFunction(mockReplay)

            await offlineQueue.replayQueue()

            expect(mockReplay).toHaveBeenCalledTimes(1)
            expect(offlineQueue.getQueueSize()).toBe(1) // 失败的请求仍在队列中
        })

        it('应该在重试次数达到上限后丢弃请求', async () => {
            const config: AxiosRequestConfig = {
                method: 'post',
                url: '/api/users',
                data: { name: 'User1' },
            }

            offlineQueue.enqueue(config)

            const mockReplay = vi.fn().mockRejectedValue(new Error('Network error'))
            offlineQueue.setReplayFunction(mockReplay)

            // 重放 3 次
            await offlineQueue.replayQueue()
            await offlineQueue.replayQueue()
            await offlineQueue.replayQueue()

            expect(offlineQueue.getQueueSize()).toBe(0) // 请求已被丢弃
        })

        it('应该触发成功回调', async () => {
            const onReplaySuccess = vi.fn()
            const queue = new OfflineQueue({
                persist: false,
                onReplaySuccess,
            })

            const config: AxiosRequestConfig = {
                method: 'post',
                url: '/api/users',
                data: { name: 'User1' },
            }

            queue.enqueue(config)

            const mockResponse = { data: 'success' }
            const mockReplay = vi.fn().mockResolvedValue(mockResponse)
            queue.setReplayFunction(mockReplay)

            await queue.replayQueue()

            expect(onReplaySuccess).toHaveBeenCalledWith(
                expect.objectContaining({ url: '/api/users' }),
                mockResponse
            )

            queue.destroy()
        })

        it('应该触发失败回调', async () => {
            const onReplayError = vi.fn()
            const queue = new OfflineQueue({
                persist: false,
                onReplayError,
            })

            const config: AxiosRequestConfig = {
                method: 'post',
                url: '/api/users',
                data: { name: 'User1' },
            }

            queue.enqueue(config)

            const mockError = new Error('Network error')
            const mockReplay = vi.fn().mockRejectedValue(mockError)
            queue.setReplayFunction(mockReplay)

            await queue.replayQueue()

            expect(onReplayError).toHaveBeenCalledWith(
                expect.objectContaining({ url: '/api/users' }),
                mockError
            )

            queue.destroy()
        })
    })

    describe('clear', () => {
        it('应该清空队列', () => {
            const config: AxiosRequestConfig = {
                method: 'post',
                url: '/api/users',
                data: { name: 'User1' },
            }

            offlineQueue.enqueue(config)
            expect(offlineQueue.getQueueSize()).toBe(1)

            offlineQueue.clear()
            expect(offlineQueue.getQueueSize()).toBe(0)
        })
    })

    describe('getQueue', () => {
        it('应该返回队列中的所有请求', () => {
            const config1: AxiosRequestConfig = {
                method: 'post',
                url: '/api/users',
                data: { name: 'User1' },
            }

            const config2: AxiosRequestConfig = {
                method: 'post',
                url: '/api/users',
                data: { name: 'User2' },
            }

            offlineQueue.enqueue(config1)
            offlineQueue.enqueue(config2)

            const queue = offlineQueue.getQueue()

            expect(queue).toHaveLength(2)
            expect(queue[0].config.url).toBe('/api/users')
            expect(queue[0].timestamp).toBeDefined()
            expect(queue[0].retryCount).toBe(0)
        })
    })

    describe('enable / disable', () => {
        it('应该可以禁用离线队列', () => {
            offlineQueue.disable()
            expect(offlineQueue.isEnabled()).toBe(false)

            const config: AxiosRequestConfig = {
                method: 'post',
                url: '/api/users',
                data: { name: 'User1' },
            }

            const result = offlineQueue.enqueue(config)

            expect(result).toBe(false)
            expect(offlineQueue.getQueueSize()).toBe(0)
        })

        it('应该可以重新启用离线队列', () => {
            offlineQueue.disable()
            offlineQueue.enable()
            expect(offlineQueue.isEnabled()).toBe(true)

            const config: AxiosRequestConfig = {
                method: 'post',
                url: '/api/users',
                data: { name: 'User1' },
            }

            const result = offlineQueue.enqueue(config)

            expect(result).toBe(true)
            expect(offlineQueue.getQueueSize()).toBe(1)
        })
    })

    describe('isNetworkOnline', () => {
        it('应该返回当前网络状态', () => {
            expect(offlineQueue.isNetworkOnline()).toBe(true)
        })
    })

    describe('持久化', () => {
        it('应该持久化队列到缓存', () => {
            const persistQueue = new OfflineQueue({
                persist: true,
                persistKey: 'test_offline_queue',
            })

            const config: AxiosRequestConfig = {
                method: 'post',
                url: '/api/users',
                data: { name: 'User1' },
            }

            persistQueue.enqueue(config)

            // 创建新实例，应该能恢复队列
            const newQueue = new OfflineQueue({
                persist: true,
                persistKey: 'test_offline_queue',
            })

            expect(newQueue.getQueueSize()).toBe(1)

            persistQueue.destroy()
            newQueue.destroy()
        })
    })
})

describe('createOfflineQueue', () => {
    it('应该创建离线队列实例', () => {
        const queue = createOfflineQueue()
        expect(queue).toBeInstanceOf(OfflineQueue)
        queue.destroy()
    })

    it('应该使用自定义选项创建', () => {
        const queue = createOfflineQueue({
            enabled: false,
            maxQueueSize: 10,
        })
        expect(queue.isEnabled()).toBe(false)
        queue.destroy()
    })
})
