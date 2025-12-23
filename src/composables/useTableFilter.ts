/**
 * 表格过滤器 URL 同步 Composable
 * 
 * 功能：
 * - 监听过滤器变化，自动更新 URL 参数
 * - 从 URL 参数恢复过滤器状态
 * - 支持多种数据类型（字符串、数字、数组、日期）
 * - 支持自定义序列化/反序列化
 * - 支持防抖更新
 * 
 * @example
 * ```ts
 * const filters = ref({
 *   keyword: '',
 *   status: 1,
 *   tags: ['vue', 'react'],
 *   dateRange: [new Date(), new Date()]
 * })
 * 
 * const { syncToUrl, restoreFromUrl } = useTableFilter(filters, {
 *   debounce: true,
 *   debounceDelay: 500
 * })
 * 
 * // 初始化时恢复过滤器
 * onMounted(() => {
 *   restoreFromUrl()
 * })
 * ```
 */

import { ref, watch, type Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDebounceFn } from '@vueuse/core'

/**
 * 过滤器配置
 */
export interface TableFilterConfig {
    /**
     * 是否启用防抖
     * @default false
     */
    debounce?: boolean

    /**
     * 防抖延迟（毫秒）
     * @default 300
     */
    debounceDelay?: number

    /**
     * 是否在初始化时自动恢复过滤器
     * @default true
     */
    autoRestore?: boolean

    /**
     * 是否在过滤器变化时自动同步到 URL
     * @default true
     */
    autoSync?: boolean

    /**
     * 自定义序列化函数
     */
    serialize?: (value: any) => string

    /**
     * 自定义反序列化函数
     */
    deserialize?: (value: string) => any

    /**
     * 需要排除的字段（不同步到 URL）
     */
    exclude?: string[]
}

/**
 * 默认配置
 */
const defaultConfig: Required<Omit<TableFilterConfig, 'serialize' | 'deserialize' | 'exclude'>> = {
    debounce: false,
    debounceDelay: 300,
    autoRestore: true,
    autoSync: true
}

/**
 * 序列化值到 URL 参数
 */
function serializeValue(value: any): string {
    if (value === null || value === undefined || value === '') {
        return ''
    }

    // 数组
    if (Array.isArray(value)) {
        // 日期数组
        if (value.length > 0 && value[0] instanceof Date) {
            return value.map(d => d.toISOString()).join(',')
        }
        // 普通数组
        return value.join(',')
    }

    // 日期
    if (value instanceof Date) {
        return value.toISOString()
    }

    // 对象
    if (typeof value === 'object') {
        return JSON.stringify(value)
    }

    // 基本类型
    return String(value)
}

/**
 * 反序列化 URL 参数到值
 */
function deserializeValue(value: string, originalValue: any): any {
    if (!value) {
        return originalValue
    }

    // 数组
    if (Array.isArray(originalValue)) {
        const parts = value.split(',')

        // 日期数组
        if (originalValue.length > 0 && originalValue[0] instanceof Date) {
            return parts.map(p => new Date(p))
        }

        // 数字数组
        if (originalValue.length > 0 && typeof originalValue[0] === 'number') {
            return parts.map(p => Number(p))
        }

        // 字符串数组
        return parts
    }

    // 日期
    if (originalValue instanceof Date) {
        return new Date(value)
    }

    // 数字
    if (typeof originalValue === 'number') {
        return Number(value)
    }

    // 布尔值
    if (typeof originalValue === 'boolean') {
        return value === 'true'
    }

    // 对象
    if (typeof originalValue === 'object') {
        try {
            return JSON.parse(value)
        } catch {
            return originalValue
        }
    }

    // 字符串
    return value
}

/**
 * 表格过滤器 URL 同步 Composable
 */
export function useTableFilter<T extends Record<string, any>>(
    filters: Ref<T>,
    config: TableFilterConfig = {}
) {
    const route = useRoute()
    const router = useRouter()

    // 合并配置
    const options = { ...defaultConfig, ...config }

    // 是否正在恢复（避免触发 watch）
    const isRestoring = ref(false)

    /**
     * 同步过滤器到 URL
     */
    const syncToUrl = () => {
        if (isRestoring.value) {
            return
        }

        const query: Record<string, string> = { ...route.query as Record<string, string> }

        // 遍历过滤器
        Object.keys(filters.value).forEach(key => {
            // 排除的字段
            if (options.exclude?.includes(key)) {
                return
            }

            const value = (filters.value as Record<string, any>)[key]

            // 自定义序列化
            if (options.serialize) {
                query[key] = options.serialize(value)
            } else {
                const serialized = serializeValue(value)
                if (serialized) {
                    query[key] = serialized
                } else {
                    delete query[key]
                }
            }
        })

        // 更新 URL（不刷新页面）
        router.replace({ query })
    }

    /**
     * 从 URL 恢复过滤器
     */
    const restoreFromUrl = () => {
        isRestoring.value = true

        try {
            const query = route.query

            // 遍历过滤器
            Object.keys(filters.value).forEach(key => {
                // 排除的字段
                if (options.exclude?.includes(key)) {
                    return
                }

                const value = query[key]
                if (value !== undefined && value !== null) {
                    const filtersObj = filters.value as Record<string, any>
                    // 自定义反序列化
                    if (options.deserialize) {
                        filtersObj[key] = options.deserialize(value as string)
                    } else {
                        filtersObj[key] = deserializeValue(
                            value as string,
                            filtersObj[key]
                        )
                    }
                }
            })
        } finally {
            isRestoring.value = false
        }
    }

    /**
     * 清空过滤器和 URL 参数
     */
    const clearFilters = (defaultValues?: Partial<T>) => {
        isRestoring.value = true

        try {
            const filtersObj = filters.value as Record<string, any>
            const defaultsObj = defaultValues as Record<string, any> | undefined

            // 重置过滤器
            Object.keys(filters.value).forEach(key => {
                if (defaultsObj && key in defaultsObj) {
                    filtersObj[key] = defaultsObj[key]
                } else {
                    const value = filtersObj[key]
                    if (Array.isArray(value)) {
                        filtersObj[key] = []
                    } else if (typeof value === 'number') {
                        filtersObj[key] = 0
                    } else if (typeof value === 'boolean') {
                        filtersObj[key] = false
                    } else {
                        filtersObj[key] = ''
                    }
                }
            })

            // 清空 URL 参数
            const query: Record<string, string> = { ...route.query as Record<string, string> }
            Object.keys(filters.value).forEach(key => {
                if (!options.exclude?.includes(key)) {
                    delete query[key]
                }
            })
            router.replace({ query })
        } finally {
            isRestoring.value = false
        }
    }

    // 防抖同步
    const debouncedSync = useDebounceFn(syncToUrl, options.debounceDelay)

    // 监听过滤器变化
    if (options.autoSync) {
        watch(
            filters,
            () => {
                if (options.debounce) {
                    debouncedSync()
                } else {
                    syncToUrl()
                }
            },
            { deep: true }
        )
    }

    // 自动恢复
    if (options.autoRestore) {
        restoreFromUrl()
    }

    return {
        /**
         * 同步过滤器到 URL
         */
        syncToUrl,

        /**
         * 从 URL 恢复过滤器
         */
        restoreFromUrl,

        /**
         * 清空过滤器和 URL 参数
         */
        clearFilters
    }
}
