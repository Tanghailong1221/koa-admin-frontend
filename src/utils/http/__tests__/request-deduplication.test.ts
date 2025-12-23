/**
 * 请求去重测试
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
    RequestDeduplication,
    createRequestDeduplication,
    defaultGenerateKey,
} from '../request-deduplication'
import type { AxiosRequestConfig } from 'axios'

describe('RequestDeduplication', () => {
    describe('defaultGenerateKey', () => {
        it('应该基于 method + url 生成键', () => {
            const config: AxiosRequestConfig = {
                method: 'get',
                url: '/api/users',
            }

            const key = defaultGenerateKey(config)
            expect(key).toBe('GET:/api/users::')
        })

        it('应该包含 params', () => {
            const config: AxiosRequestConfig = {
                method: 'get',
                url: '/api/users',
                params: { page: 1, size: 10 },
            }

            const key = defaultGenerateKey(config)
            expect(key).toContain('{"page":1,"size":10}')
        })

        it('应该包含 data', () => {
            const config: AxiosRequestConfig = {
                method: 'post',
                url: '/api/users',
                data: { name: 'John' },
            }

            const key = defaultGenerateKey(config)
            expect(key).toContain('{"name":"John"}')
        })

        it('相同的请求应该生成相同的键', () => {
            const config1: AxiosRequestConfig = {
                method: 'get',
                url: '/api/users',
                params: { page: 1 },
            }

            const config2: AxiosRequestConfig = {
                method: 'get',
                url: '/api/users',
                params: { page: 1 },
            }

            expect(defaultGenerateKey(config1)).toBe(defaultGenerateKey(config2))
        })

        it('不同的请求应该生成不同的键', () => {
            const config1: AxiosRequestConfig = {
                method: 'get',
                url: '/api/users',
                params: { page: 1 },
            }

            const config2: AxiosRequestConfig = {
                method: 'get',
                url: '/api/users',
                params: { page: 2 },
            }

            expect(defaultGenerateKey(config1)).not.toBe(defaultGenerateKey(config2))
        })
    })

    describe('RequestDeduplication', () => {
        let deduplication: RequestDeduplication

        beforeEach(() => {
            deduplication = new RequestDeduplication()
        })

        describe('addRequest', () => {
            it('应该添加新请求', () => {
                const config: AxiosRequestConfig = {
                    method: 'get',
                    url: '/api/users',
                }

                const isDuplicate = deduplication.addRequest(config)

                expect(isDuplicate).toBe(false)
                expect(deduplication.getPendingCount()).toBe(1)
            })

            it('应该检测重复请求', () => {
                const config1: AxiosRequestConfig = {
                    method: 'get',
                    url: '/api/users',
                }

                const config2: AxiosRequestConfig = {
                    method: 'get',
                    url: '/api/users',
                }

                deduplication.addRequest(config1)
                const isDuplicate = deduplication.addRequest(config2)

                expect(isDuplicate).toBe(true)
                expect(deduplication.getPendingCount()).toBe(1)
            })

            it('应该允许不同的请求', () => {
                const config1: AxiosRequestConfig = {
                    method: 'get',
                    url: '/api/users',
                }

                const config2: AxiosRequestConfig = {
                    method: 'get',
                    url: '/api/posts',
                }

                deduplication.addRequest(config1)
                const isDuplicate = deduplication.addRequest(config2)

                expect(isDuplicate).toBe(false)
                expect(deduplication.getPendingCount()).toBe(2)
            })

            it('应该为请求添加 cancelToken', () => {
                const config: AxiosRequestConfig = {
                    method: 'get',
                    url: '/api/users',
                }

                deduplication.addRequest(config)

                expect(config.cancelToken).toBeDefined()
            })

            it('应该允许标记为允许重复的请求', () => {
                const config1: AxiosRequestConfig = {
                    method: 'get',
                    url: '/api/users',
                }

                const config2: AxiosRequestConfig = {
                    method: 'get',
                    url: '/api/users',
                }

                RequestDeduplication.markAsAllowDuplicate(config2)

                deduplication.addRequest(config1)
                const isDuplicate = deduplication.addRequest(config2)

                expect(isDuplicate).toBe(false)
                expect(deduplication.getPendingCount()).toBe(1)
            })
        })

        describe('removeRequest', () => {
            it('应该移除请求', () => {
                const config: AxiosRequestConfig = {
                    method: 'get',
                    url: '/api/users',
                }

                deduplication.addRequest(config)
                expect(deduplication.getPendingCount()).toBe(1)

                deduplication.removeRequest(config)
                expect(deduplication.getPendingCount()).toBe(0)
            })

            it('移除后应该允许相同的请求', () => {
                const config1: AxiosRequestConfig = {
                    method: 'get',
                    url: '/api/users',
                }

                const config2: AxiosRequestConfig = {
                    method: 'get',
                    url: '/api/users',
                }

                deduplication.addRequest(config1)
                deduplication.removeRequest(config1)
                const isDuplicate = deduplication.addRequest(config2)

                expect(isDuplicate).toBe(false)
            })
        })

        describe('cancelRequest', () => {
            it('应该取消指定的请求', () => {
                const config: AxiosRequestConfig = {
                    method: 'get',
                    url: '/api/users',
                }

                deduplication.addRequest(config)
                deduplication.cancelRequest(config, '测试取消')

                expect(deduplication.getPendingCount()).toBe(0)
            })
        })

        describe('cancelAllRequests', () => {
            it('应该取消所有请求', () => {
                const config1: AxiosRequestConfig = {
                    method: 'get',
                    url: '/api/users',
                }

                const config2: AxiosRequestConfig = {
                    method: 'get',
                    url: '/api/posts',
                }

                deduplication.addRequest(config1)
                deduplication.addRequest(config2)
                expect(deduplication.getPendingCount()).toBe(2)

                deduplication.cancelAllRequests('全部取消')
                expect(deduplication.getPendingCount()).toBe(0)
            })
        })

        describe('getPendingRequests', () => {
            it('应该返回所有待处理的请求', () => {
                const config1: AxiosRequestConfig = {
                    method: 'get',
                    url: '/api/users',
                }

                const config2: AxiosRequestConfig = {
                    method: 'get',
                    url: '/api/posts',
                }

                deduplication.addRequest(config1)
                deduplication.addRequest(config2)

                const pending = deduplication.getPendingRequests()
                expect(pending).toHaveLength(2)
                expect(pending[0].config).toBeDefined()
                expect(pending[0].timestamp).toBeDefined()
            })
        })

        describe('cleanupStaleRequests', () => {
            it('应该清理超时的请求', async () => {
                const config: AxiosRequestConfig = {
                    method: 'get',
                    url: '/api/users',
                }

                deduplication.addRequest(config)
                expect(deduplication.getPendingCount()).toBe(1)

                // 等待一小段时间
                await new Promise(resolve => setTimeout(resolve, 100))

                // 清理超过 50ms 的请求
                deduplication.cleanupStaleRequests(50)
                expect(deduplication.getPendingCount()).toBe(0)
            })

            it('不应该清理未超时的请求', () => {
                const config: AxiosRequestConfig = {
                    method: 'get',
                    url: '/api/users',
                }

                deduplication.addRequest(config)
                expect(deduplication.getPendingCount()).toBe(1)

                // 清理超过 1 小时的请求
                deduplication.cleanupStaleRequests(3600000)
                expect(deduplication.getPendingCount()).toBe(1)
            })
        })

        describe('enable / disable', () => {
            it('应该可以禁用去重', () => {
                deduplication.disable()
                expect(deduplication.isEnabled()).toBe(false)

                const config1: AxiosRequestConfig = {
                    method: 'get',
                    url: '/api/users',
                }

                const config2: AxiosRequestConfig = {
                    method: 'get',
                    url: '/api/users',
                }

                deduplication.addRequest(config1)
                const isDuplicate = deduplication.addRequest(config2)

                expect(isDuplicate).toBe(false)
                expect(deduplication.getPendingCount()).toBe(0)
            })

            it('应该可以重新启用去重', () => {
                deduplication.disable()
                deduplication.enable()
                expect(deduplication.isEnabled()).toBe(true)

                const config1: AxiosRequestConfig = {
                    method: 'get',
                    url: '/api/users',
                }

                const config2: AxiosRequestConfig = {
                    method: 'get',
                    url: '/api/users',
                }

                deduplication.addRequest(config1)
                const isDuplicate = deduplication.addRequest(config2)

                expect(isDuplicate).toBe(true)
            })
        })

        describe('自定义键生成函数', () => {
            it('应该使用自定义的键生成函数', () => {
                const customGenerateKey = vi.fn((config: AxiosRequestConfig) => {
                    return `custom:${config.url}`
                })

                const deduplication = new RequestDeduplication({
                    generateKey: customGenerateKey,
                })

                const config: AxiosRequestConfig = {
                    method: 'get',
                    url: '/api/users',
                }

                deduplication.addRequest(config)

                expect(customGenerateKey).toHaveBeenCalledWith(config)
            })
        })
    })

    describe('createRequestDeduplication', () => {
        it('应该创建去重管理器实例', () => {
            const deduplication = createRequestDeduplication()
            expect(deduplication).toBeInstanceOf(RequestDeduplication)
        })

        it('应该使用自定义选项创建', () => {
            const deduplication = createRequestDeduplication({
                enabled: false,
            })
            expect(deduplication.isEnabled()).toBe(false)
        })
    })
})
