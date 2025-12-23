/**
 * 国际化懒加载器
 * 按需加载语言文件，减少初始包大小
 */

import type { SupportLocale } from './index'

// 语言文件加载器映射
const localeLoaders: Record<SupportLocale, () => Promise<any>> = {
    'zh-CN': () => import('./zh-CN'),
    'en-US': () => import('./en-US')
}

// 已加载的语言文件缓存
const loadedLocales = new Map<SupportLocale, any>()

// 加载中的 Promise 缓存（避免重复加载）
const loadingPromises = new Map<SupportLocale, Promise<any>>()

/**
 * 懒加载语言文件
 * 
 * @param locale - 语言代码
 * @returns 语言文件内容
 * 
 * @example
 * ```typescript
 * const messages = await loadLocale('en-US')
 * ```
 */
export async function loadLocale(locale: SupportLocale): Promise<any> {
    // 如果已经加载，直接返回缓存
    if (loadedLocales.has(locale)) {
        return loadedLocales.get(locale)
    }

    // 如果正在加载，返回加载中的 Promise
    if (loadingPromises.has(locale)) {
        return loadingPromises.get(locale)
    }

    // 检查是否有对应的加载器
    const loader = localeLoaders[locale]
    if (!loader) {
        throw new Error(`[i18n] 不支持的语言: ${locale}`)
    }

    // 开始加载
    const loadingPromise = loader()
        .then(module => {
            const messages = module.default || module
            loadedLocales.set(locale, messages)
            loadingPromises.delete(locale)
            console.log(`[i18n] 语言文件已加载: ${locale}`)
            return messages
        })
        .catch(error => {
            loadingPromises.delete(locale)
            console.error(`[i18n] 语言文件加载失败: ${locale}`, error)
            throw error
        })

    loadingPromises.set(locale, loadingPromise)
    return loadingPromise
}

/**
 * 预加载语言文件
 * 
 * @param locales - 语言代码数组
 * 
 * @example
 * ```typescript
 * // 预加载所有语言
 * await preloadLocales(['zh-CN', 'en-US'])
 * ```
 */
export async function preloadLocales(locales: SupportLocale[]): Promise<void> {
    await Promise.all(locales.map(locale => loadLocale(locale)))
}

/**
 * 检查语言文件是否已加载
 * 
 * @param locale - 语言代码
 * @returns 是否已加载
 */
export function isLocaleLoaded(locale: SupportLocale): boolean {
    return loadedLocales.has(locale)
}

/**
 * 获取已加载的语言文件
 * 
 * @param locale - 语言代码
 * @returns 语言文件内容，如果未加载则返回 undefined
 */
export function getLoadedLocale(locale: SupportLocale): any | undefined {
    return loadedLocales.get(locale)
}

/**
 * 清除语言文件缓存
 * 
 * @param locale - 语言代码，如果不传则清除所有缓存
 */
export function clearLocaleCache(locale?: SupportLocale): void {
    if (locale) {
        loadedLocales.delete(locale)
        loadingPromises.delete(locale)
        console.log(`[i18n] 已清除语言文件缓存: ${locale}`)
    } else {
        loadedLocales.clear()
        loadingPromises.clear()
        console.log('[i18n] 已清除所有语言文件缓存')
    }
}

/**
 * 获取所有已加载的语言
 * 
 * @returns 已加载的语言代码数组
 */
export function getLoadedLocales(): SupportLocale[] {
    return Array.from(loadedLocales.keys())
}
