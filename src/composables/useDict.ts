/**
 * 字典 Composable
 * 
 * 功能：
 * - 获取字典数据
 * - 响应式字典状态
 * - 自动加载字典
 * - 强制刷新字典
 * 
 * @example
 * ```ts
 * const { dict, loading, getLabel, refresh } = useDict('user_status')
 * 
 * // 获取标签
 * const label = getLabel(1) // '启用'
 * 
 * // 刷新字典
 * await refresh()
 * ```
 */

import { ref, computed, onMounted, type Ref } from 'vue'
import { useDictStore, type DictItem } from '@/store/dict'
import { createDictRule, createDictRules, validateDictValue } from '@/utils/dict-validation'
import type { FormItemRule } from 'element-plus'

/**
 * 字典 Composable 配置
 */
export interface UseDictOptions {
    /**
     * 是否自动加载
     * @default true
     */
    autoLoad?: boolean

    /**
     * 是否强制刷新
     * @default false
     */
    forceRefresh?: boolean

    /**
     * 加载完成回调
     */
    onLoaded?: (items: DictItem[]) => void

    /**
     * 加载失败回调
     */
    onError?: (error: any) => void
}

/**
 * 字典 Composable
 */
export function useDict(type: string | Ref<string>, options: UseDictOptions = {}) {
    const dictStore = useDictStore()

    // 配置
    const config = {
        autoLoad: true,
        forceRefresh: false,
        ...options
    }

    // 字典类型（支持响应式）
    const dictType = computed(() => (typeof type === 'string' ? type : type.value))

    // 字典数据
    const dict = ref<DictItem[]>([])

    // 加载状态
    const loading = ref(false)

    // 错误信息
    const error = ref<Error | null>(null)

    /**
     * 加载字典
     */
    async function load(forceRefresh = config.forceRefresh) {
        if (!dictType.value) {
            return
        }

        loading.value = true
        error.value = null

        try {
            const items = await dictStore.getDict(dictType.value, forceRefresh)
            dict.value = items

            // 回调
            if (config.onLoaded) {
                config.onLoaded(items)
            }
        } catch (err) {
            error.value = err as Error
            console.error(`[useDict] 加载字典失败: ${dictType.value}`, err)

            // 回调
            if (config.onError) {
                config.onError(err)
            }
        } finally {
            loading.value = false
        }
    }

    /**
     * 刷新字典
     */
    async function refresh() {
        await load(true)
    }

    /**
     * 根据值获取标签
     */
    function getLabel(value: string | number): string {
        const item = dict.value.find((item) => item.value === value)
        return item?.label || String(value)
    }

    /**
     * 根据标签获取值
     */
    function getValue(label: string): string | number | undefined {
        const item = dict.value.find((item) => item.label === label)
        return item?.value
    }

    /**
     * 根据值获取字典项
     */
    function getItem(value: string | number): DictItem | undefined {
        return dict.value.find((item) => item.value === value)
    }

    /**
     * 根据值获取标签类型
     */
    function getTagType(value: string | number): string {
        const item = getItem(value)
        return item?.tagType || 'info'
    }

    /**
     * 过滤字典项
     */
    function filter(predicate: (item: DictItem) => boolean): DictItem[] {
        return dict.value.filter(predicate)
    }

    /**
     * 查找字典项
     */
    function find(predicate: (item: DictItem) => boolean): DictItem | undefined {
        return dict.value.find(predicate)
    }

    /**
     * 验证值是否在字典范围内
     */
    function validate(value: any): boolean {
        return validateDictValue(value, dict.value)
    }

    /**
     * 创建字典验证规则（用于 Element Plus 表单）
     */
    function createRule(required = false, message?: string): FormItemRule {
        return createDictRule({
            dictType: dictType.value,
            dictData: dict.value,
            required,
            message
        })
    }

    /**
     * 创建字典验证规则数组（用于 ProForm）
     */
    function createRules(required = false): FormItemRule[] {
        return createDictRules(dictType.value, dict.value, required)
    }

    // 自动加载
    if (config.autoLoad) {
        onMounted(() => {
            load()
        })
    }

    return {
        // 状态
        dict,
        loading,
        error,

        // 方法
        load,
        refresh,
        getLabel,
        getValue,
        getItem,
        getTagType,
        filter,
        find,

        // 验证方法
        validate,
        createRule,
        createRules
    }
}

/**
 * 批量字典 Composable
 */
export function useDicts(types: string[] | Ref<string[]>, options: UseDictOptions = {}) {
    const dictStore = useDictStore()

    // 配置
    const config = {
        autoLoad: true,
        forceRefresh: false,
        ...options
    }

    // 字典类型（支持响应式）
    const dictTypes = computed(() => (Array.isArray(types) ? types : types.value))

    // 字典数据
    const dicts = ref<Record<string, DictItem[]>>({})

    // 加载状态
    const loading = ref(false)

    // 错误信息
    const error = ref<Error | null>(null)

    /**
     * 加载字典
     */
    async function load(forceRefresh = config.forceRefresh) {
        if (!dictTypes.value || dictTypes.value.length === 0) {
            return
        }

        loading.value = true
        error.value = null

        try {
            const result = await dictStore.getDicts(dictTypes.value, forceRefresh)
            dicts.value = result

            // 回调
            if (config.onLoaded) {
                // 将所有字典项合并为一个数组
                const allItems = Object.values(result).flat()
                config.onLoaded(allItems)
            }
        } catch (err) {
            error.value = err as Error
            console.error(`[useDicts] 加载字典失败:`, err)

            // 回调
            if (config.onError) {
                config.onError(err)
            }
        } finally {
            loading.value = false
        }
    }

    /**
     * 刷新字典
     */
    async function refresh() {
        await load(true)
    }

    /**
     * 获取指定类型的字典
     */
    function getDict(type: string): DictItem[] {
        return dicts.value[type] || []
    }

    /**
     * 根据值获取标签
     */
    function getLabel(type: string, value: string | number): string {
        const dict = getDict(type)
        const item = dict.find((item) => item.value === value)
        return item?.label || String(value)
    }

    /**
     * 根据标签获取值
     */
    function getValue(type: string, label: string): string | number | undefined {
        const dict = getDict(type)
        const item = dict.find((item) => item.label === label)
        return item?.value
    }

    /**
     * 根据值获取字典项
     */
    function getItem(type: string, value: string | number): DictItem | undefined {
        const dict = getDict(type)
        return dict.find((item) => item.value === value)
    }

    /**
     * 根据值获取标签类型
     */
    function getTagType(type: string, value: string | number): string {
        const item = getItem(type, value)
        return item?.tagType || 'info'
    }

    // 自动加载
    if (config.autoLoad) {
        onMounted(() => {
            load()
        })
    }

    return {
        // 状态
        dicts,
        loading,
        error,

        // 方法
        load,
        refresh,
        getDict,
        getLabel,
        getValue,
        getItem,
        getTagType
    }
}
