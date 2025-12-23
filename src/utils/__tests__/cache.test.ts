/**
 * CacheManager 单元测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { CacheManager } from '../cache'

describe('CacheManager', () => {
    let cache: CacheManager

    beforeEach(() => {
        // 清空 localStorage
        localStorage.clear()
        // 创建新的 CacheManager 实例
        cache = new CacheManager({
            prefix: 'test',
            version: '1.0.0'
        })
    })

    describe('基础功能', () => {
        it('应该能够设置和获取缓存', () => {
            cache.set('key1', 'value1')
            expect(cache.get('key1')).toBe('value1')
        })

        it('应该能够删除缓存', () => {
            cache.set('key1', 'value1')
            cache.remove('key1')
            expect(cache.get('key1')).toBeNull()
        })

        it('应该能够清空所有缓存', () => {
            cache.set('key1', 'value1')
            cache.set('key2', 'value2')
            cache.clear()
            expect(cache.get('key1')).toBeNull()
            expect(cache.get('key2')).toBeNull()
        })

        it('应该能够检查缓存是否存在', () => {
            cache.set('key1', 'value1')
            expect(cache.has('key1')).toBe(true)
            expect(cache.has('key2')).toBe(false)
        })
    })

    describe('TTL 过期', () => {
        it('应该在 TTL 过期后返回 null', () => {
            vi.useFakeTimers()

            cache.set('key1', 'value1', 1000) // 1 秒过期
            expect(cache.get('key1')).toBe('value1')

            // 前进 1.5 秒
            vi.advanceTimersByTime(1500)
            expect(cache.get('key1')).toBeNull()

            vi.useRealTimers()
        })

        it('应该能够检测缓存是否过期', () => {
            vi.useFakeTimers()

            cache.set('key1', 'value1', 1000)
            expect(cache.isExpired('key1')).toBe(false)

            vi.advanceTimersByTime(1500)
            expect(cache.isExpired('key1')).toBe(true)

            vi.useRealTimers()
        })

        it('应该能够清除过期的缓存', () => {
            vi.useFakeTimers()

            cache.set('key1', 'value1', 1000)
            cache.set('key2', 'value2', 5000)

            vi.advanceTimersByTime(1500)
            cache.clearExpired()

            expect(cache.get('key1')).toBeNull()
            expect(cache.get('key2')).toBe('value2')

            vi.useRealTimers()
        })
    })

    describe('版本控制', () => {
        it('应该在版本不匹配时返回 null', () => {
            cache.set('key1', 'value1')

            // 创建新版本的 CacheManager
            const newCache = new CacheManager({
                prefix: 'test',
                version: '2.0.0'
            })

            expect(newCache.get('key1')).toBeNull()
        })

        it('应该能够清除旧版本的缓存', () => {
            cache.set('key1', 'value1')

            const newCache = new CacheManager({
                prefix: 'test',
                version: '2.0.0'
            })

            newCache.clearOldVersion()
            expect(cache.get('key1')).toBeNull()
        })
    })

    describe('加密存储', () => {
        it('应该能够加密存储数据', () => {
            const encryptedCache = new CacheManager({
                prefix: 'test',
                version: '1.0.0',
                encrypt: true,
                encryptKey: 'test-key'
            })

            encryptedCache.set('key1', 'sensitive-data')

            // 直接从 localStorage 读取，应该是加密的
            const rawValue = localStorage.getItem('test:key1')
            expect(rawValue).not.toContain('sensitive-data')

            // 通过 CacheManager 读取，应该是解密的
            expect(encryptedCache.get('key1')).toBe('sensitive-data')
        })
    })

    describe('工具方法', () => {
        it('应该能够获取所有缓存键', () => {
            cache.set('key1', 'value1')
            cache.set('key2', 'value2')

            const keys = cache.keys()
            expect(keys).toContain('key1')
            expect(keys).toContain('key2')
            expect(keys.length).toBe(2)
        })

        it('应该能够获取缓存大小', () => {
            cache.set('key1', 'value1')
            cache.set('key2', 'value2')

            expect(cache.size()).toBe(2)
        })
    })

    describe('错误处理', () => {
        it('应该在 localStorage 不可用时优雅降级', () => {
            // Mock localStorage 抛出错误
            const originalSetItem = localStorage.setItem
            localStorage.setItem = vi.fn(() => {
                throw new Error('QuotaExceededError')
            })

            // 不应该抛出错误
            expect(() => cache.set('key1', 'value1')).not.toThrow()

            // 恢复 localStorage
            localStorage.setItem = originalSetItem
        })

        it('应该在解析 JSON 失败时返回 null', () => {
            // 直接设置无效的 JSON
            localStorage.setItem('test:key1', 'invalid-json')

            expect(cache.get('key1')).toBeNull()
        })
    })
})
