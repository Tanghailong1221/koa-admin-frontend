/**
 * Pinia 持久化插件测试
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, defineStore, setActivePinia } from 'pinia'
import { createPiniaPersistence } from '../pinia-persistence'

describe('Pinia 持久化插件', () => {
    beforeEach(() => {
        // 清理 localStorage
        localStorage.clear()
        // 创建新的 Pinia 实例
        const pinia = createPinia()
        pinia.use(createPiniaPersistence())
        setActivePinia(pinia)
    })

    it('应该持久化整个 store 状态', () => {
        const useTestStore = defineStore('test', {
            state: () => ({
                count: 0,
                name: 'test',
            }),
            persist: {
                key: 'test_store',
            },
        })

        const store = useTestStore()
        store.count = 10
        store.name = 'updated'

        // 创建新的 store 实例来验证持久化
        const pinia2 = createPinia()
        pinia2.use(createPiniaPersistence())
        setActivePinia(pinia2)
        const store2 = useTestStore()

        expect(store2.count).toBe(10)
        expect(store2.name).toBe('updated')
    })

    it('应该只持久化指定的路径', () => {
        const useTestStore = defineStore('test-paths', {
            state: () => ({
                count: 0,
                name: 'test',
                temp: 'temporary',
            }),
            persist: {
                key: 'test_paths_store',
                paths: ['count', 'name'],
            },
        })

        const store = useTestStore()
        store.count = 20
        store.name = 'persisted'
        store.temp = 'not-persisted'

        // 创建新的 store 实例
        const pinia2 = createPinia()
        pinia2.use(createPiniaPersistence())
        setActivePinia(pinia2)
        const store2 = useTestStore()

        expect(store2.count).toBe(20)
        expect(store2.name).toBe('persisted')
        expect(store2.temp).toBe('temporary') // 应该是默认值
    })

    it('应该支持嵌套路径', () => {
        const useTestStore = defineStore('test-nested', {
            state: () => ({
                user: {
                    name: 'test',
                    age: 0,
                },
                settings: {
                    theme: 'light',
                },
            }),
            persist: {
                key: 'test_nested_store',
                paths: ['user.name', 'settings.theme'],
            },
        })

        const store = useTestStore()
        store.user.name = 'John'
        store.user.age = 30
        store.settings.theme = 'dark'

        // 创建新的 store 实例
        const pinia2 = createPinia()
        pinia2.use(createPiniaPersistence())
        setActivePinia(pinia2)
        const store2 = useTestStore()

        expect(store2.user.name).toBe('John')
        expect(store2.user.age).toBe(0) // 未持久化
        expect(store2.settings.theme).toBe('dark')
    })

    it('应该支持清除持久化状态', () => {
        const useTestStore = defineStore('test-clear', {
            state: () => ({
                count: 0,
            }),
            persist: {
                key: 'test_clear_store',
            },
        })

        const store = useTestStore()
        store.count = 100

        // 验证已持久化
        expect(localStorage.getItem('app_cache_test_clear_store')).toBeTruthy()

        // 清除持久化
        store.$clearPersisted()

        // 验证已清除
        expect(localStorage.getItem('app_cache_test_clear_store')).toBeNull()
    })

    it('应该支持加密存储', () => {
        const useTestStore = defineStore('test-encrypted', {
            state: () => ({
                secret: 'sensitive-data',
            }),
            persist: {
                key: 'test_encrypted_store',
                encrypted: true,
            },
        })

        const store = useTestStore()
        store.secret = 'very-secret'

        // 验证存储的数据是加密的
        const stored = localStorage.getItem('app_secure_cache_test_encrypted_store')
        expect(stored).toBeTruthy()
        expect(stored).not.toContain('very-secret') // 不应该包含明文

        // 创建新的 store 实例验证可以解密
        const pinia2 = createPinia()
        pinia2.use(createPiniaPersistence())
        setActivePinia(pinia2)
        const store2 = useTestStore()

        expect(store2.secret).toBe('very-secret')
    })

    it('应该在没有持久化配置时不做任何操作', () => {
        const useTestStore = defineStore('test-no-persist', {
            state: () => ({
                count: 0,
            }),
        })

        const store = useTestStore()
        store.count = 50

        // 验证没有持久化
        expect(localStorage.getItem('app_cache_test-no-persist')).toBeNull()
    })

    it('应该处理持久化错误', () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { })

        const useTestStore = defineStore('test-error', {
            state: () => ({
                data: undefined as any,
            }),
            persist: {
                key: 'test_error_store',
            },
        })

        const store = useTestStore()

        // 创建循环引用导致 JSON.stringify 失败
        const circular: any = { a: 1 }
        circular.self = circular
        store.data = circular

        // 应该捕获错误而不是抛出
        expect(() => {
            store.data = circular
        }).not.toThrow()

        consoleSpy.mockRestore()
    })
})
