/**
 * 数据字典 Store
 * 
 * 功能：
 * - 获取字典数据
 * - 缓存字典数据
 * - 支持 TTL 过期
 * - 支持强制刷新
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * 字典项
 */
export interface DictItem {
    /**
     * 字典值
     */
    value: string | number

    /**
     * 字典标签
     */
    label: string

    /**
     * 字典类型
     */
    type?: string

    /**
     * 样式类型（用于标签颜色）
     */
    tagType?: 'success' | 'info' | 'warning' | 'danger' | 'primary'

    /**
     * 是否默认
     */
    isDefault?: boolean

    /**
     * 排序
     */
    sort?: number

    /**
     * 状态（0-禁用，1-启用）
     */
    status?: number

    /**
     * 备注
     */
    remark?: string

    /**
     * 额外数据
     */
    [key: string]: any
}

/**
 * 字典数据
 */
export interface DictData {
    /**
     * 字典类型
     */
    type: string

    /**
     * 字典项列表
     */
    items: DictItem[]

    /**
     * 缓存时间
     */
    timestamp: number
}

/**
 * 字典 Store 配置
 */
export interface DictStoreConfig {
    /**
     * 缓存 TTL（毫秒，默认 30 分钟）
     */
    ttl?: number

    /**
     * 是否启用缓存
     */
    enableCache?: boolean

    /**
     * 获取字典数据的函数
     */
    fetchDict?: (type: string) => Promise<DictItem[]>
}

/**
 * 默认配置
 */
const defaultConfig: Required<DictStoreConfig> = {
    ttl: 30 * 60 * 1000, // 30 分钟
    enableCache: true,
    fetchDict: async (type: string) => {
        // 默认实现：从 API 获取
        // 实际项目中需要替换为真实的 API 调用
        console.warn(`[DictStore] 使用默认 fetchDict，请配置真实的 API 调用`)
        return mockFetchDict(type)
    }
}

/**
 * 模拟获取字典数据
 */
async function mockFetchDict(type: string): Promise<DictItem[]> {
    // 模拟网络延迟
    await new Promise((resolve) => setTimeout(resolve, 300))

    // 模拟数据
    const mockData: Record<string, DictItem[]> = {
        user_status: [
            { value: 0, label: '禁用', tagType: 'danger' },
            { value: 1, label: '启用', tagType: 'success' }
        ],
        user_gender: [
            { value: 0, label: '未知', tagType: 'info' },
            { value: 1, label: '男', tagType: 'primary' },
            { value: 2, label: '女', tagType: 'danger' }
        ],
        user_role: [
            { value: 'admin', label: '管理员', tagType: 'danger' },
            { value: 'user', label: '普通用户', tagType: 'primary' },
            { value: 'guest', label: '访客', tagType: 'info' }
        ],
        order_status: [
            { value: 0, label: '待支付', tagType: 'warning' },
            { value: 1, label: '已支付', tagType: 'success' },
            { value: 2, label: '已取消', tagType: 'info' },
            { value: 3, label: '已退款', tagType: 'danger' }
        ]
    }

    return mockData[type] || []
}

/**
 * 数据字典 Store
 */
export const useDictStore = defineStore('dict', () => {
    // 配置
    const config = ref<Required<DictStoreConfig>>(defaultConfig)

    // 字典数据缓存
    const dictCache = ref<Map<string, DictData>>(new Map())

    /**
     * 配置 Store
     */
    function configure(options: DictStoreConfig) {
        config.value = { ...config.value, ...options }
    }

    /**
     * 检查缓存是否过期
     */
    function isCacheExpired(type: string): boolean {
        const cache = dictCache.value.get(type)
        if (!cache) {
            return true
        }

        const now = Date.now()
        return now - cache.timestamp > config.value.ttl
    }

    /**
     * 获取字典数据
     */
    async function getDict(type: string, forceRefresh = false): Promise<DictItem[]> {
        // 检查缓存
        if (config.value.enableCache && !forceRefresh && !isCacheExpired(type)) {
            const cache = dictCache.value.get(type)
            if (cache) {
                console.log(`[DictStore] 从缓存获取字典: ${type}`)
                return cache.items
            }
        }

        // 从 API 获取
        console.log(`[DictStore] 从 API 获取字典: ${type}`)
        try {
            const items = await config.value.fetchDict(type)

            // 缓存数据
            if (config.value.enableCache) {
                dictCache.value.set(type, {
                    type,
                    items,
                    timestamp: Date.now()
                })
            }

            return items
        } catch (error) {
            console.error(`[DictStore] 获取字典失败: ${type}`, error)
            throw error
        }
    }

    /**
     * 批量获取字典数据
     */
    async function getDicts(types: string[], forceRefresh = false): Promise<Record<string, DictItem[]>> {
        const result: Record<string, DictItem[]> = {}

        await Promise.all(
            types.map(async (type) => {
                result[type] = await getDict(type, forceRefresh)
            })
        )

        return result
    }

    /**
     * 根据值获取标签
     */
    function getLabel(type: string, value: string | number): string {
        const cache = dictCache.value.get(type)
        if (!cache) {
            return String(value)
        }

        const item = cache.items.find((item) => item.value === value)
        return item?.label || String(value)
    }

    /**
     * 根据标签获取值
     */
    function getValue(type: string, label: string): string | number | undefined {
        const cache = dictCache.value.get(type)
        if (!cache) {
            return undefined
        }

        const item = cache.items.find((item) => item.label === label)
        return item?.value
    }

    /**
     * 获取字典项
     */
    function getItem(type: string, value: string | number): DictItem | undefined {
        const cache = dictCache.value.get(type)
        if (!cache) {
            return undefined
        }

        return cache.items.find((item) => item.value === value)
    }

    /**
     * 清除指定字典缓存
     */
    function clearCache(type?: string) {
        if (type) {
            dictCache.value.delete(type)
            console.log(`[DictStore] 清除字典缓存: ${type}`)
        } else {
            dictCache.value.clear()
            console.log(`[DictStore] 清除所有字典缓存`)
        }
    }

    /**
     * 刷新字典
     */
    async function refresh(type: string): Promise<DictItem[]> {
        return await getDict(type, true)
    }

    /**
     * 批量刷新字典
     */
    async function refreshAll(types: string[]): Promise<Record<string, DictItem[]>> {
        return await getDicts(types, true)
    }

    return {
        // 状态
        dictCache,
        config,

        // 方法
        configure,
        getDict,
        getDicts,
        getLabel,
        getValue,
        getItem,
        clearCache,
        refresh,
        refreshAll
    }
})
