/**
 * Element Plus 语言包集成
 * 
 * 功能：
 * - 根据当前语言返回对应的 Element Plus locale
 * - 支持动态切换
 */

import zhCn from 'element-plus/es/locale/lang/zh-cn'
import en from 'element-plus/es/locale/lang/en'
import type { Language } from 'element-plus/es/locale'
import type { SupportLocale } from './index'

// Element Plus 语言包映射
const elementLocales: Record<SupportLocale, Language> = {
    'zh-CN': zhCn,
    'en-US': en
}

/**
 * 获取 Element Plus 语言包
 */
export function getElementLocale(locale: SupportLocale): Language {
    return elementLocales[locale] || zhCn
}

/**
 * 获取当前 Element Plus 语言包
 */
export function getCurrentElementLocale(currentLocale: SupportLocale): Language {
    return getElementLocale(currentLocale)
}
