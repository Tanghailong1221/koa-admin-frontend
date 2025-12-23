/**
 * v-sanitize 指令
 * 自动清理元素内容，防止 XSS 攻击
 */

import type { Directive, DirectiveBinding } from 'vue'
import { sanitizeHtml, type XSSSanitizerConfig } from '@/utils/xss-sanitizer'

/**
 * v-sanitize 指令配置
 */
interface SanitizeDirectiveValue {
    /**
     * 要清理的 HTML 内容
     */
    html: string

    /**
     * XSS 清理配置
     */
    config?: XSSSanitizerConfig
}

/**
 * 更新元素内容
 */
function updateElement(el: HTMLElement, binding: DirectiveBinding<string | SanitizeDirectiveValue>) {
    let html: string
    let config: XSSSanitizerConfig | undefined

    // 解析绑定值
    if (typeof binding.value === 'string') {
        html = binding.value
    } else if (binding.value && typeof binding.value === 'object') {
        html = binding.value.html
        config = binding.value.config
    } else {
        html = ''
    }

    // 清理 HTML
    const sanitized = sanitizeHtml(html, config)

    // 更新元素内容
    el.innerHTML = sanitized
}

/**
 * v-sanitize 指令
 *
 * @example
 * ```vue
 * <!-- 基础用法 -->
 * <div v-sanitize="userInput"></div>
 *
 * <!-- 自定义配置 -->
 * <div v-sanitize="{ html: userInput, config: { stripAllTags: true } }"></div>
 * ```
 */
export const vSanitize: Directive<HTMLElement, string | SanitizeDirectiveValue> = {
    mounted(el, binding) {
        updateElement(el, binding)
    },

    updated(el, binding) {
        updateElement(el, binding)
    }
}

export default vSanitize
