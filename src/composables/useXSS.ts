/**
 * XSS 防护 Composable
 * 提供 XSS 防护相关的方法
 */

import { computed, type Ref } from 'vue'
import {
    XSSSanitizer,
    sanitizeHtml,
    escapeHtml,
    unescapeHtml,
    stripTags,
    sanitizeUrl,
    sanitizeCss,
    type XSSSanitizerConfig
} from '@/utils/xss-sanitizer'

/**
 * useXSS 返回值
 */
export interface UseXSSReturn {
    /**
     * 清理 HTML
     */
    sanitize: (html: string, config?: XSSSanitizerConfig) => string

    /**
     * 转义 HTML 实体
     */
    escape: (text: string) => string

    /**
     * 反转义 HTML 实体
     */
    unescape: (text: string) => string

    /**
     * 移除所有 HTML 标签
     */
    strip: (html: string) => string

    /**
     * 清理 URL
     */
    sanitizeUrl: (url: string) => string

    /**
     * 清理 CSS
     */
    sanitizeCss: (css: string) => string

    /**
     * 创建自定义清理器
     */
    createSanitizer: (config: XSSSanitizerConfig) => XSSSanitizer
}

/**
 * XSS 防护 Composable
 *
 * @example
 * ```typescript
 * const { sanitize, escape, strip } = useXSS()
 *
 * // 清理 HTML
 * const clean = sanitize(userInput)
 *
 * // 转义 HTML
 * const escaped = escape(userInput)
 *
 * // 移除标签
 * const text = strip(userInput)
 * ```
 */
export function useXSS(): UseXSSReturn {
    return {
        sanitize: sanitizeHtml,
        escape: escapeHtml,
        unescape: unescapeHtml,
        strip: stripTags,
        sanitizeUrl,
        sanitizeCss,
        createSanitizer: (config: XSSSanitizerConfig) => new XSSSanitizer(config)
    }
}

/**
 * 响应式 XSS 清理
 *
 * @param source - 源数据（响应式）
 * @param config - XSS 清理配置
 * @returns 清理后的数据（响应式）
 *
 * @example
 * ```typescript
 * const userInput = ref('<script>alert("xss")</script>')
 * const sanitized = useSanitizedHtml(userInput)
 *
 * console.log(sanitized.value) // 清理后的内容
 * ```
 */
export function useSanitizedHtml(
    source: Ref<string>,
    config?: XSSSanitizerConfig
): Ref<string> {
    return computed(() => sanitizeHtml(source.value, config))
}

/**
 * 响应式 HTML 转义
 *
 * @param source - 源数据（响应式）
 * @returns 转义后的数据（响应式）
 *
 * @example
 * ```typescript
 * const userInput = ref('<div>Hello</div>')
 * const escaped = useEscapedHtml(userInput)
 *
 * console.log(escaped.value) // &lt;div&gt;Hello&lt;/div&gt;
 * ```
 */
export function useEscapedHtml(source: Ref<string>): Ref<string> {
    return computed(() => escapeHtml(source.value))
}

/**
 * 响应式标签移除
 *
 * @param source - 源数据（响应式）
 * @returns 移除标签后的数据（响应式）
 *
 * @example
 * ```typescript
 * const userInput = ref('<div>Hello <strong>World</strong></div>')
 * const text = useStrippedHtml(userInput)
 *
 * console.log(text.value) // Hello World
 * ```
 */
export function useStrippedHtml(source: Ref<string>): Ref<string> {
    return computed(() => stripTags(source.value))
}

/**
 * 批量清理 HTML
 *
 * @param sources - 源数据数组（响应式）
 * @param config - XSS 清理配置
 * @returns 清理后的数据数组（响应式）
 *
 * @example
 * ```typescript
 * const inputs = ref(['<script>alert(1)</script>', '<img src=x onerror=alert(2)>'])
 * const sanitized = useBatchSanitize(inputs)
 *
 * console.log(sanitized.value) // 清理后的数组
 * ```
 */
export function useBatchSanitize(
    sources: Ref<string[]>,
    config?: XSSSanitizerConfig
): Ref<string[]> {
    return computed(() => sources.value.map((html) => sanitizeHtml(html, config)))
}

export default useXSS
