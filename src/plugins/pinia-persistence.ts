/**
 * Pinia 持久化插件
 * 集成 CacheManager 实现状态持久化和加密存储
 */
import type { PiniaPluginContext } from 'pinia'
import { getCacheManager, getSecureCacheManager } from '@/utils/cache'

export interface PersistOptions {
    /** 存储键名 */
    key?: string
    /** 需要持久化的路径（支持点号路径，如 'user.name'） */
    paths?: string[]
    /** 是否启用加密 */
    encrypted?: boolean
    /** 缓存过期时间（毫秒），默认 7 天 */
    ttl?: number
}

/**
 * 从对象中根据路径获取值
 */
function getValueByPath(obj: any, path: string): any {
    return path.split('.').reduce((acc, part) => acc?.[part], obj)
}

/**
 * 从对象中根据路径设置值
 */
function setValueByPath(obj: any, path: string, value: any): void {
    const parts = path.split('.')
    const last = parts.pop()!
    const target = parts.reduce((acc, part) => {
        if (!(part in acc)) acc[part] = {}
        return acc[part]
    }, obj)
    target[last] = value
}

/**
 * 创建 Pinia 持久化插件
 */
export function createPiniaPersistence() {
    return (context: PiniaPluginContext) => {
        const { store, options } = context

        // 检查是否配置了持久化选项
        const persistOptions = (options as any).persist as PersistOptions | undefined
        if (!persistOptions) return

        const {
            key = `pinia_${store.$id}`,
            paths,
            encrypted = false,
            ttl = 7 * 24 * 60 * 60 * 1000, // 默认 7 天
        } = persistOptions

        // 选择合适的缓存管理器
        const cacheManager = encrypted
            ? getSecureCacheManager()
            : getCacheManager()

        /**
         * 从缓存恢复状态
         */
        function restoreState() {
            try {
                const cached = cacheManager.get(key)
                if (!cached) return

                // 如果指定了 paths，只恢复指定的字段
                if (paths && paths.length > 0) {
                    paths.forEach(path => {
                        const value = getValueByPath(cached, path)
                        if (value !== undefined) {
                            setValueByPath(store.$state, path, value)
                        }
                    })
                } else {
                    // 恢复整个状态
                    store.$patch(cached)
                }
            } catch (error) {
                console.error(`[Pinia Persistence] 恢复状态失败 (${key}):`, error)
            }
        }

        /**
         * 保存状态到缓存
         */
        function saveState() {
            try {
                let stateToSave: any

                // 如果指定了 paths，只保存指定的字段
                if (paths && paths.length > 0) {
                    stateToSave = {}
                    paths.forEach(path => {
                        const value = getValueByPath(store.$state, path)
                        if (value !== undefined) {
                            setValueByPath(stateToSave, path, value)
                        }
                    })
                } else {
                    // 保存整个状态
                    stateToSave = store.$state
                }

                cacheManager.set(key, stateToSave, ttl)
            } catch (error) {
                console.error(`[Pinia Persistence] 保存状态失败 (${key}):`, error)
            }
        }

        /**
         * 清除持久化状态
         */
        function clearPersistedState() {
            try {
                cacheManager.remove(key)
            } catch (error) {
                console.error(`[Pinia Persistence] 清除状态失败 (${key}):`, error)
            }
        }

        // 初始化时恢复状态
        restoreState()

        // 监听状态变化并保存
        store.$subscribe(() => {
            saveState()
        }, { detached: true })

        // 暴露清除方法到 store
        store.$clearPersisted = clearPersistedState

        return {
            $clearPersisted: clearPersistedState,
        }
    }
}

// 扩展 Pinia Store 类型
declare module 'pinia' {
    export interface DefineStoreOptionsBase<S, Store> {
        persist?: PersistOptions
    }

    export interface PiniaCustomProperties {
        $clearPersisted: () => void
    }
}
