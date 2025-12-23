/**
 * 国际化 Composable
 * 
 * 功能：
 * - 提供响应式的语言状态
 * - 提供翻译函数
 * - 提供语言切换方法
 * - 集成 Element Plus locale
 * - 支持懒加载语言文件
 * - 支持缺失翻译键查询
 */

import { computed, ref } from 'vue'
import {
    setLocale,
    t as translate,
    locale as currentLocale,
    LOCALE_LIST,
    getMissingKeys,
    clearMissingKeys,
    hasKey,
    type SupportLocale,
    type LocaleInfo
} from '@/locales'
import { getCurrentElementLocale } from '@/locales/element-plus'
import {
    loadLocale,
    preloadLocales,
    isLocaleLoaded,
    clearLocaleCache,
    getLoadedLocales
} from '@/locales/lazy-loader'

export function useI18n() {
    /**
     * 当前语言
     */
    const locale = computed(() => currentLocale.value)

    /**
     * 语言列表
     */
    const localeList = computed(() => LOCALE_LIST)

    /**
     * Element Plus 语言包
     */
    const elementLocale = computed(() => getCurrentElementLocale(locale.value))

    /**
     * 加载状态
     */
    const loading = ref(false)

    /**
     * 翻译函数
     */
    const t = (key: string, params?: Record<string, any>): string => {
        return translate(key, params)
    }

    /**
     * 切换语言
     */
    const changeLocale = (newLocale: SupportLocale): void => {
        setLocale(newLocale)
    }

    /**
     * 切换语言（懒加载版本）
     * 
     * @param newLocale - 新语言
     * @returns Promise
     */
    const changeLocaleAsync = async (newLocale: SupportLocale): Promise<void> => {
        try {
            loading.value = true

            // 如果语言文件未加载，先加载
            if (!isLocaleLoaded(newLocale)) {
                await loadLocale(newLocale)
            }

            // 切换语言
            setLocale(newLocale)
        } catch (error) {
            console.error('[i18n] 切换语言失败:', error)
            throw error
        } finally {
            loading.value = false
        }
    }

    /**
     * 预加载语言文件
     * 
     * @param locales - 语言代码数组
     */
    const preload = async (locales: SupportLocale[]): Promise<void> => {
        try {
            loading.value = true
            await preloadLocales(locales)
        } catch (error) {
            console.error('[i18n] 预加载语言文件失败:', error)
            throw error
        } finally {
            loading.value = false
        }
    }

    /**
     * 获取当前语言信息
     */
    const currentLocaleInfo = computed((): LocaleInfo | undefined => {
        return LOCALE_LIST.find(item => item.locale === locale.value)
    })

    /**
     * 获取缺失的翻译键
     */
    const missingKeys = computed(() => getMissingKeys())

    /**
     * 清除缺失的翻译键记录
     */
    const clearMissing = (): void => {
        clearMissingKeys()
    }

    /**
     * 检查翻译键是否存在
     */
    const has = (key: string, targetLocale?: SupportLocale): boolean => {
        return hasKey(key, targetLocale)
    }

    /**
     * 检查语言文件是否已加载
     */
    const isLoaded = (targetLocale: SupportLocale): boolean => {
        return isLocaleLoaded(targetLocale)
    }

    /**
     * 获取已加载的语言列表
     */
    const loadedLocales = computed(() => getLoadedLocales())

    /**
     * 清除语言文件缓存
     */
    const clearCache = (targetLocale?: SupportLocale): void => {
        clearLocaleCache(targetLocale)
    }

    return {
        // 基础功能
        locale,
        localeList,
        currentLocaleInfo,
        elementLocale,
        t,
        changeLocale,

        // 懒加载功能
        loading,
        changeLocaleAsync,
        preload,
        isLoaded,
        loadedLocales,
        clearCache,

        // 调试功能
        missingKeys,
        clearMissing,
        has
    }
}

