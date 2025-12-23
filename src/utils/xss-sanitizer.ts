/**
 * XSS 防护工具
 * 用于清理用户输入，防止 XSS 攻击
 */

/**
 * HTML 实体编码映射
 */
const HTML_ENTITIES: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
}

/**
 * 危险的 HTML 标签
 */
const DANGEROUS_TAGS = [
    'script',
    'iframe',
    'object',
    'embed',
    'link',
    'style',
    'meta',
    'base',
    'form',
    'input',
    'button',
    'textarea',
    'select'
]

/**
 * 危险的 HTML 属性
 */
const DANGEROUS_ATTRS = [
    'onclick',
    'ondblclick',
    'onmousedown',
    'onmouseup',
    'onmouseover',
    'onmousemove',
    'onmouseout',
    'onmouseenter',
    'onmouseleave',
    'onload',
    'onerror',
    'onabort',
    'onblur',
    'onchange',
    'onfocus',
    'onreset',
    'onsubmit',
    'onkeydown',
    'onkeypress',
    'onkeyup',
    'javascript:',
    'vbscript:',
    'data:text/html'
]

/**
 * 允许的 HTML 标签（白名单）
 */
const ALLOWED_TAGS = [
    'p',
    'br',
    'span',
    'div',
    'strong',
    'em',
    'u',
    'i',
    'b',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'ul',
    'ol',
    'li',
    'a',
    'img',
    'table',
    'thead',
    'tbody',
    'tr',
    'th',
    'td',
    'blockquote',
    'code',
    'pre'
]

/**
 * 允许的 HTML 属性（白名单）
 */
const ALLOWED_ATTRS = ['href', 'src', 'alt', 'title', 'class', 'id', 'style', 'target', 'rel']

/**
 * XSS 清理配置
 */
export interface XSSSanitizerConfig {
    /**
     * 允许的标签（白名单）
     * @default ALLOWED_TAGS
     */
    allowedTags?: string[]

    /**
     * 允许的属性（白名单）
     * @default ALLOWED_ATTRS
     */
    allowedAttrs?: string[]

    /**
     * 是否允许 data 属性
     * @default false
     */
    allowDataAttrs?: boolean

    /**
     * 是否允许 aria 属性
     * @default true
     */
    allowAriaAttrs?: boolean

    /**
     * 是否移除所有标签（只保留文本）
     * @default false
     */
    stripAllTags?: boolean

    /**
     * 是否转义 HTML 实体
     * @default true
     */
    escapeHtml?: boolean
}

/**
 * XSS 清理器类
 */
export class XSSSanitizer {
    private config: Required<XSSSanitizerConfig>

    constructor(config: XSSSanitizerConfig = {}) {
        this.config = {
            allowedTags: config.allowedTags || ALLOWED_TAGS,
            allowedAttrs: config.allowedAttrs || ALLOWED_ATTRS,
            allowDataAttrs: config.allowDataAttrs ?? false,
            allowAriaAttrs: config.allowAriaAttrs ?? true,
            stripAllTags: config.stripAllTags ?? false,
            escapeHtml: config.escapeHtml ?? true
        }
    }

    /**
     * 清理 HTML 字符串
     */
    sanitize(html: string): string {
        if (!html || typeof html !== 'string') {
            return ''
        }

        // 如果配置为移除所有标签，直接返回纯文本
        if (this.config.stripAllTags) {
            return this.stripTags(html)
        }

        // 如果配置为转义 HTML，直接转义
        if (this.config.escapeHtml) {
            return this.escapeHtml(html)
        }

        // 创建临时 DOM 元素
        const div = document.createElement('div')
        div.innerHTML = html

        // 递归清理所有节点
        this.sanitizeNode(div)

        return div.innerHTML
    }

    /**
     * 清理单个节点
     */
    private sanitizeNode(node: Node): void {
        // 处理元素节点
        if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element
            const tagName = element.tagName.toLowerCase()

            // 检查标签是否在白名单中
            if (!this.config.allowedTags.includes(tagName)) {
                // 移除不允许的标签，但保留其子节点
                const parent = element.parentNode
                if (parent) {
                    while (element.firstChild) {
                        parent.insertBefore(element.firstChild, element)
                    }
                    parent.removeChild(element)
                }
                return
            }

            // 清理属性
            this.sanitizeAttributes(element)
        }

        // 递归处理子节点
        const children = Array.from(node.childNodes)
        children.forEach((child) => this.sanitizeNode(child))
    }

    /**
     * 清理元素属性
     */
    private sanitizeAttributes(element: Element): void {
        const attrs = Array.from(element.attributes)

        attrs.forEach((attr) => {
            const attrName = attr.name.toLowerCase()
            const attrValue = attr.value.toLowerCase()

            // 检查是否为危险属性
            const isDangerous = DANGEROUS_ATTRS.some((dangerous) => {
                return attrName.includes(dangerous) || attrValue.includes(dangerous)
            })

            if (isDangerous) {
                element.removeAttribute(attr.name)
                return
            }

            // 检查是否在白名单中
            const isAllowed =
                this.config.allowedAttrs.includes(attrName) ||
                (this.config.allowDataAttrs && attrName.startsWith('data-')) ||
                (this.config.allowAriaAttrs && attrName.startsWith('aria-'))

            if (!isAllowed) {
                element.removeAttribute(attr.name)
            }
        })
    }

    /**
     * 转义 HTML 实体
     */
    escapeHtml(text: string): string {
        return text.replace(/[&<>"'/]/g, (char) => HTML_ENTITIES[char] || char)
    }

    /**
     * 反转义 HTML 实体
     */
    unescapeHtml(text: string): string {
        const div = document.createElement('div')
        div.innerHTML = text
        return div.textContent || div.innerText || ''
    }

    /**
     * 移除所有 HTML 标签
     */
    stripTags(html: string): string {
        const div = document.createElement('div')
        div.innerHTML = html
        return div.textContent || div.innerText || ''
    }

    /**
     * 清理 URL
     */
    sanitizeUrl(url: string): string {
        if (!url || typeof url !== 'string') {
            return ''
        }

        // 移除危险的协议
        const dangerousProtocols = ['javascript:', 'vbscript:', 'data:text/html']
        const lowerUrl = url.toLowerCase().trim()

        for (const protocol of dangerousProtocols) {
            if (lowerUrl.startsWith(protocol)) {
                return ''
            }
        }

        return url
    }

    /**
     * 清理 CSS
     */
    sanitizeCss(css: string): string {
        if (!css || typeof css !== 'string') {
            return ''
        }

        // 移除危险的 CSS 属性
        const dangerousPatterns = [
            /expression\s*\(/gi, // IE expression
            /javascript:/gi,
            /vbscript:/gi,
            /import\s+/gi,
            /@import/gi,
            /behavior\s*:/gi // IE behavior
        ]

        let sanitized = css
        dangerousPatterns.forEach((pattern) => {
            sanitized = sanitized.replace(pattern, '')
        })

        return sanitized
    }
}

/**
 * 默认 XSS 清理器实例
 */
export const xssSanitizer = new XSSSanitizer()

/**
 * 清理 HTML（使用默认配置）
 */
export function sanitizeHtml(html: string, config?: XSSSanitizerConfig): string {
    if (config) {
        const sanitizer = new XSSSanitizer(config)
        return sanitizer.sanitize(html)
    }
    return xssSanitizer.sanitize(html)
}

/**
 * 转义 HTML 实体
 */
export function escapeHtml(text: string): string {
    return xssSanitizer.escapeHtml(text)
}

/**
 * 反转义 HTML 实体
 */
export function unescapeHtml(text: string): string {
    return xssSanitizer.unescapeHtml(text)
}

/**
 * 移除所有 HTML 标签
 */
export function stripTags(html: string): string {
    return xssSanitizer.stripTags(html)
}

/**
 * 清理 URL
 */
export function sanitizeUrl(url: string): string {
    return xssSanitizer.sanitizeUrl(url)
}

/**
 * 清理 CSS
 */
export function sanitizeCss(css: string): string {
    return xssSanitizer.sanitizeCss(css)
}
