/**
 * 表单草稿 Composable
 * 
 * 功能：
 * - 自动保存表单草稿
 * - 加载已保存的草稿
 * - 清除草稿
 * - 防抖保存
 */

import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { CacheManager } from '@/utils/cache'
import { ElMessage } from 'element-plus'

/**
 * 草稿配置
 */
export interface FormDraftOptions {
    /** 草稿唯一标识（默认使用路由路径） */
    key?: string
    /** 是否启用自动保存 */
    autoSave?: boolean
    /** 自动保存延迟（毫秒） */
    autoSaveDelay?: number
    /** 草稿过期时间（毫秒，默认 7 天） */
    ttl?: number
    /** 是否在加载时提示用户 */
    showLoadTip?: boolean
    /** 是否在保存时提示用户 */
    showSaveTip?: boolean
    /** 排除的字段（不保存到草稿） */
    excludeFields?: string[]
}

/**
 * 草稿数据
 */
interface DraftData<T> {
    data: T
    timestamp: number
    version: number
}

const DRAFT_VERSION = 1
const DEFAULT_TTL = 7 * 24 * 60 * 60 * 1000 // 7 天

/**
 * 表单草稿 Hook
 */
export function useFormDraft<T extends Record<string, any>>(
    formData: { value: T },
    options: FormDraftOptions = {}
) {
    const route = useRoute()

    // 配置
    const config = {
        key: options.key || `form_draft_${route.path}`,
        autoSave: options.autoSave ?? true,
        autoSaveDelay: options.autoSaveDelay ?? 1000,
        ttl: options.ttl ?? DEFAULT_TTL,
        showLoadTip: options.showLoadTip ?? true,
        showSaveTip: options.showSaveTip ?? false,
        excludeFields: options.excludeFields ?? []
    }

    // 缓存管理器
    const cacheManager = new CacheManager({
        storage: localStorage,
        prefix: 'draft_'
    })

    // 状态
    const hasDraft = ref(false)
    const lastSaveTime = ref<number | null>(null)
    const isSaving = ref(false)

    // 自动保存定时器
    let autoSaveTimer: ReturnType<typeof setTimeout> | null = null

    /**
     * 过滤字段（排除不需要保存的字段）
     */
    const filterFields = (data: T): Partial<T> => {
        if (config.excludeFields.length === 0) {
            return data
        }

        const filtered: any = {}
        Object.keys(data).forEach(key => {
            if (!config.excludeFields.includes(key)) {
                filtered[key] = data[key]
            }
        })

        return filtered
    }

    /**
     * 保存草稿
     */
    const saveDraft = (showTip = config.showSaveTip): void => {
        try {
            isSaving.value = true

            const filteredData = filterFields(formData.value)
            const draftData: DraftData<Partial<T>> = {
                data: filteredData,
                timestamp: Date.now(),
                version: DRAFT_VERSION
            }

            cacheManager.set(config.key, draftData, config.ttl)

            hasDraft.value = true
            lastSaveTime.value = Date.now()

            if (showTip) {
                ElMessage.success('草稿已保存')
            }

            console.log('[FormDraft] 草稿已保存:', config.key)
        } catch (error) {
            console.error('[FormDraft] 保存草稿失败:', error)
            ElMessage.error('保存草稿失败')
        } finally {
            isSaving.value = false
        }
    }

    /**
     * 加载草稿
     */
    const loadDraft = (showTip = config.showLoadTip): boolean => {
        try {
            const draft = cacheManager.get<DraftData<Partial<T>>>(config.key)

            if (!draft) {
                hasDraft.value = false
                return false
            }

            // 检查版本
            if (draft.version !== DRAFT_VERSION) {
                console.warn('[FormDraft] 草稿版本不匹配，已忽略')
                clearDraft(false)
                return false
            }

            // 合并草稿数据到表单
            Object.assign(formData.value, draft.data)

            hasDraft.value = true
            lastSaveTime.value = draft.timestamp

            if (showTip) {
                const timeAgo = formatTimeAgo(draft.timestamp)
                ElMessage.info(`已加载 ${timeAgo} 的草稿`)
            }

            console.log('[FormDraft] 草稿已加载:', config.key)
            return true
        } catch (error) {
            console.error('[FormDraft] 加载草稿失败:', error)
            return false
        }
    }

    /**
     * 清除草稿
     */
    const clearDraft = (showTip = true): void => {
        try {
            cacheManager.remove(config.key)
            hasDraft.value = false
            lastSaveTime.value = null

            if (showTip) {
                ElMessage.success('草稿已清除')
            }

            console.log('[FormDraft] 草稿已清除:', config.key)
        } catch (error) {
            console.error('[FormDraft] 清除草稿失败:', error)
        }
    }

    /**
     * 检查是否有草稿
     */
    const checkDraft = (): boolean => {
        const draft = cacheManager.get<DraftData<Partial<T>>>(config.key)
        hasDraft.value = !!draft
        return hasDraft.value
    }

    /**
     * 获取草稿信息
     */
    const getDraftInfo = (): { timestamp: number; timeAgo: string } | null => {
        const draft = cacheManager.get<DraftData<Partial<T>>>(config.key)
        if (!draft) return null

        return {
            timestamp: draft.timestamp,
            timeAgo: formatTimeAgo(draft.timestamp)
        }
    }

    /**
     * 格式化时间差
     */
    const formatTimeAgo = (timestamp: number): string => {
        const now = Date.now()
        const diff = now - timestamp

        const seconds = Math.floor(diff / 1000)
        const minutes = Math.floor(seconds / 60)
        const hours = Math.floor(minutes / 60)
        const days = Math.floor(hours / 24)

        if (days > 0) return `${days} 天前`
        if (hours > 0) return `${hours} 小时前`
        if (minutes > 0) return `${minutes} 分钟前`
        return '刚刚'
    }

    /**
     * 防抖保存
     */
    const debouncedSave = (): void => {
        if (autoSaveTimer) {
            clearTimeout(autoSaveTimer)
        }

        autoSaveTimer = setTimeout(() => {
            saveDraft(false)
        }, config.autoSaveDelay)
    }

    /**
     * 启用自动保存
     */
    const enableAutoSave = (): void => {
        if (!config.autoSave) return

        // 监听表单数据变化
        const stopWatch = watch(
            () => formData.value,
            () => {
                debouncedSave()
            },
            { deep: true }
        )

        // 组件卸载时停止监听
        onUnmounted(() => {
            stopWatch()
            if (autoSaveTimer) {
                clearTimeout(autoSaveTimer)
            }
        })
    }

    // 初始化
    onMounted(() => {
        // 检查是否有草稿
        checkDraft()

        // 启用自动保存
        if (config.autoSave) {
            enableAutoSave()
        }
    })

    return {
        // 状态
        hasDraft,
        lastSaveTime,
        isSaving,

        // 方法
        saveDraft,
        loadDraft,
        clearDraft,
        checkDraft,
        getDraftInfo
    }
}
