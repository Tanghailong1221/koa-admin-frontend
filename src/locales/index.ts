/**
 * 国际化配置（简化版，不依赖外部库）
 * 
 * 功能：
 * - 管理语言文件
 * - 提供语言切换
 * - 提供翻译函数
 * - 支持参数替换
 */

import { ref, computed } from 'vue'
import zhCN from './zh-CN'
import enUS from './en-US'

// 支持的语言列表
export const SUPPORT_LOCALES = ['zh-CN', 'en-US'] as const
export type SupportLocale = typeof SUPPORT_LOCALES[number]

// 默认语言
export const DEFAULT_LOCALE: SupportLocale = 'zh-CN'

// 语言信息
export interface LocaleInfo {
    locale: SupportLocale
    name: string
    icon?: string
}

// 语言列表
export const LOCALE_LIST: LocaleInfo[] = [
    { locale: 'zh-CN', name: '简体中文', icon: '🇨🇳' },
    { locale: 'en-US', name: 'English', icon: '🇺🇸' }
]

// 语言包
const messages: Record<SupportLocale, any> = {
    'zh-CN': zhCN,
    'en-US': enUS
}

// 当前语言
const currentLocale = ref<SupportLocale>(DEFAULT_LOCALE)

// 缺失的翻译键（用于开发环境调试）
const missingKeys = new Set<string>()

// 是否启用缺失键记录
const enableMissingKeyLog = import.meta.env.DEV

/**
 * 获取当前语言
 */
export function getLocale(): SupportLocale {
    return currentLocale.value
}

/**
 * 获取缺失的翻译键
 */
export function getMissingKeys(): string[] {
    return Array.from(missingKeys)
}

/**
 * 清除缺失的翻译键记录
 */
export function clearMissingKeys(): void {
    missingKeys.clear()
}

/**
 * 记录缺失的翻译键
 */
function logMissingKey(key: string, locale: SupportLocale): void {
    if (!enableMissingKeyLog) return

    const missingKey = `${locale}:${key}`
    if (!missingKeys.has(missingKey)) {
        missingKeys.add(missingKey)
        console.warn(`[i18n] 缺失翻译: ${missingKey}`)
    }
}

/**
 * 设置语言
 */
export function setLocale(locale: SupportLocale): void {
    if (!SUPPORT_LOCALES.includes(locale)) {
        console.warn(`[i18n] 不支持的语言: ${locale}`)
        return
    }

    currentLocale.value = locale

    // 更新 HTML lang 属性
    document.querySelector('html')?.setAttribute('lang', locale)

    // 保存到存储
    saveLocaleToStorage(locale)

    console.log(`[i18n] 语言已切换为: ${locale}`)
}

/**
 * 翻译函数
 */
export function t(key: string, params?: Record<string, any>): string {
    const keys = key.split('.')
    let value: any = messages[currentLocale.value]
    let found = true

    // 遍历键路径
    for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
            value = value[k]
        } else {
            found = false
            break
        }
    }

    // 如果找不到，尝试使用默认语言（回退机制）
    if (!found || typeof value !== 'string') {
        // 记录缺失的键
        logMissingKey(key, currentLocale.value)

        // 如果当前语言不是默认语言，尝试使用默认语言
        if (currentLocale.value !== DEFAULT_LOCALE) {
            value = messages[DEFAULT_LOCALE]
            for (const k of keys) {
                if (value && typeof value === 'object' && k in value) {
                    value = value[k]
                } else {
                    value = key
                    break
                }
            }

            // 如果默认语言也找不到，记录并返回键
            if (typeof value !== 'string') {
                logMissingKey(key, DEFAULT_LOCALE)
                return key
            }
        } else {
            // 当前就是默认语言，直接返回键
            return key
        }
    }

    // 替换参数
    if (params) {
        return value.replace(/\{(\w+)\}/g, (match, key) => {
            return params[key] !== undefined ? String(params[key]) : match
        })
    }

    return value
}

/**
 * 获取语言信息
 */
export function getLocaleInfo(locale: SupportLocale): LocaleInfo | undefined {
    return LOCALE_LIST.find(item => item.locale === locale)
}

/**
 * 检查是否支持该语言
 */
export function isSupportLocale(locale: string): locale is SupportLocale {
    return SUPPORT_LOCALES.includes(locale as SupportLocale)
}

/**
 * 从浏览器获取首选语言
 */
export function getBrowserLocale(): SupportLocale {
    const browserLang = navigator.language

    // 精确匹配
    if (isSupportLocale(browserLang)) {
        return browserLang
    }

    // 模糊匹配（如 zh-TW -> zh-CN）
    const langPrefix = browserLang.split('-')[0]
    const matchedLocale = SUPPORT_LOCALES.find(locale =>
        locale.startsWith(langPrefix)
    )

    return matchedLocale || DEFAULT_LOCALE
}

/**
 * 从存储中加载语言设置
 */
export function loadLocaleFromStorage(): SupportLocale {
    const stored = localStorage.getItem('locale')
    if (stored && isSupportLocale(stored)) {
        return stored
    }
    return getBrowserLocale()
}

/**
 * 保存语言设置到存储
 */
export function saveLocaleToStorage(locale: SupportLocale): void {
    localStorage.setItem('locale', locale)
}

/**
 * 初始化语言
 */
export function setupI18n(): void {
    // 从存储中加载语言设置
    const locale = loadLocaleFromStorage()
    setLocale(locale)

    console.log('[i18n] 国际化系统已初始化')
}

/**
 * 响应式当前语言
 */
export const locale = computed(() => currentLocale.value)

/**
 * 检查翻译键是否存在
 */
export function hasKey(key: string, locale?: SupportLocale): boolean {
    const targetLocale = locale || currentLocale.value
    const keys = key.split('.')
    let value: any = messages[targetLocale]

    for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
            value = value[k]
        } else {
            return false
        }
    }

    return typeof value === 'string'
}

// 导出默认对象
export default {
    locale,
    t,
    getLocale,
    setLocale,
    setupI18n,
    getMissingKeys,
    clearMissingKeys,
    hasKey
}
