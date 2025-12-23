/**
 * 安全头配置工具
 * 用于配置 HTTP 安全头，提升应用安全性
 */

/**
 * 内容安全策略（CSP）配置
 */
export interface CSPConfig {
    /**
     * default-src 指令
     * @default "'self'"
     */
    defaultSrc?: string[]

    /**
     * script-src 指令
     * @default "'self'"
     */
    scriptSrc?: string[]

    /**
     * style-src 指令
     * @default "'self' 'unsafe-inline'"
     */
    styleSrc?: string[]

    /**
     * img-src 指令
     * @default "'self' data: https:"
     */
    imgSrc?: string[]

    /**
     * font-src 指令
     * @default "'self' data:"
     */
    fontSrc?: string[]

    /**
     * connect-src 指令
     * @default "'self'"
     */
    connectSrc?: string[]

    /**
     * frame-src 指令
     * @default "'none'"
     */
    frameSrc?: string[]

    /**
     * object-src 指令
     * @default "'none'"
     */
    objectSrc?: string[]

    /**
     * base-uri 指令
     * @default "'self'"
     */
    baseUri?: string[]

    /**
     * form-action 指令
     * @default "'self'"
     */
    formAction?: string[]

    /**
     * frame-ancestors 指令
     * @default "'none'"
     */
    frameAncestors?: string[]

    /**
     * upgrade-insecure-requests
     * @default true
     */
    upgradeInsecureRequests?: boolean

    /**
     * block-all-mixed-content
     * @default false
     */
    blockAllMixedContent?: boolean
}

/**
 * 安全头配置
 */
export interface SecurityHeadersConfig {
    /**
     * 内容安全策略（CSP）
     */
    csp?: CSPConfig

    /**
     * X-Frame-Options
     * @default 'DENY'
     */
    xFrameOptions?: 'DENY' | 'SAMEORIGIN' | string

    /**
     * X-Content-Type-Options
     * @default 'nosniff'
     */
    xContentTypeOptions?: 'nosniff'

    /**
     * X-XSS-Protection
     * @default '1; mode=block'
     */
    xXSSProtection?: string

    /**
     * Referrer-Policy
     * @default 'strict-origin-when-cross-origin'
     */
    referrerPolicy?:
    | 'no-referrer'
    | 'no-referrer-when-downgrade'
    | 'origin'
    | 'origin-when-cross-origin'
    | 'same-origin'
    | 'strict-origin'
    | 'strict-origin-when-cross-origin'
    | 'unsafe-url'

    /**
     * Permissions-Policy
     */
    permissionsPolicy?: Record<string, string[]>

    /**
     * Strict-Transport-Security (HSTS)
     * @default 'max-age=31536000; includeSubDomains'
     */
    strictTransportSecurity?: string

    /**
     * 是否启用安全头
     * @default true
     */
    enabled?: boolean
}

/**
 * 默认 CSP 配置
 */
const DEFAULT_CSP: Required<CSPConfig> = {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", 'data:', 'https:'],
    fontSrc: ["'self'", 'data:'],
    connectSrc: ["'self'"],
    frameSrc: ["'none'"],
    objectSrc: ["'none'"],
    baseUri: ["'self'"],
    formAction: ["'self'"],
    frameAncestors: ["'none'"],
    upgradeInsecureRequests: true,
    blockAllMixedContent: false
}

/**
 * 默认安全头配置
 */
const DEFAULT_SECURITY_HEADERS: Required<SecurityHeadersConfig> = {
    csp: DEFAULT_CSP,
    xFrameOptions: 'DENY',
    xContentTypeOptions: 'nosniff',
    xXSSProtection: '1; mode=block',
    referrerPolicy: 'strict-origin-when-cross-origin',
    permissionsPolicy: {
        camera: [],
        microphone: [],
        geolocation: [],
        'payment': []
    },
    strictTransportSecurity: 'max-age=31536000; includeSubDomains',
    enabled: true
}

/**
 * 安全头管理器
 */
export class SecurityHeaders {
    private config: Required<SecurityHeadersConfig>

    constructor(config: SecurityHeadersConfig = {}) {
        this.config = {
            ...DEFAULT_SECURITY_HEADERS,
            ...config,
            csp: {
                ...DEFAULT_CSP,
                ...config.csp
            },
            permissionsPolicy: {
                ...DEFAULT_SECURITY_HEADERS.permissionsPolicy,
                ...config.permissionsPolicy
            }
        }
    }

    /**
     * 生成 CSP 字符串
     */
    generateCSP(): string {
        const csp = this.config.csp
        const directives: string[] = []

        // 添加各个指令
        if (csp.defaultSrc && csp.defaultSrc.length > 0) {
            directives.push(`default-src ${csp.defaultSrc.join(' ')}`)
        }
        if (csp.scriptSrc && csp.scriptSrc.length > 0) {
            directives.push(`script-src ${csp.scriptSrc.join(' ')}`)
        }
        if (csp.styleSrc && csp.styleSrc.length > 0) {
            directives.push(`style-src ${csp.styleSrc.join(' ')}`)
        }
        if (csp.imgSrc && csp.imgSrc.length > 0) {
            directives.push(`img-src ${csp.imgSrc.join(' ')}`)
        }
        if (csp.fontSrc && csp.fontSrc.length > 0) {
            directives.push(`font-src ${csp.fontSrc.join(' ')}`)
        }
        if (csp.connectSrc && csp.connectSrc.length > 0) {
            directives.push(`connect-src ${csp.connectSrc.join(' ')}`)
        }
        if (csp.frameSrc && csp.frameSrc.length > 0) {
            directives.push(`frame-src ${csp.frameSrc.join(' ')}`)
        }
        if (csp.objectSrc && csp.objectSrc.length > 0) {
            directives.push(`object-src ${csp.objectSrc.join(' ')}`)
        }
        if (csp.baseUri && csp.baseUri.length > 0) {
            directives.push(`base-uri ${csp.baseUri.join(' ')}`)
        }
        if (csp.formAction && csp.formAction.length > 0) {
            directives.push(`form-action ${csp.formAction.join(' ')}`)
        }
        if (csp.frameAncestors && csp.frameAncestors.length > 0) {
            directives.push(`frame-ancestors ${csp.frameAncestors.join(' ')}`)
        }

        // 添加特殊指令
        if (csp.upgradeInsecureRequests) {
            directives.push('upgrade-insecure-requests')
        }
        if (csp.blockAllMixedContent) {
            directives.push('block-all-mixed-content')
        }

        return directives.join('; ')
    }

    /**
     * 生成 Permissions-Policy 字符串
     */
    generatePermissionsPolicy(): string {
        const policy = this.config.permissionsPolicy
        const directives: string[] = []

        for (const [feature, allowlist] of Object.entries(policy)) {
            if (allowlist.length === 0) {
                directives.push(`${feature}=()`)
            } else {
                directives.push(`${feature}=(${allowlist.join(' ')})`)
            }
        }

        return directives.join(', ')
    }

    /**
     * 获取所有安全头
     */
    getHeaders(): Record<string, string> {
        if (!this.config.enabled) {
            return {}
        }

        const headers: Record<string, string> = {}

        // CSP
        const csp = this.generateCSP()
        if (csp) {
            headers['Content-Security-Policy'] = csp
        }

        // X-Frame-Options
        headers['X-Frame-Options'] = this.config.xFrameOptions

        // X-Content-Type-Options
        headers['X-Content-Type-Options'] = this.config.xContentTypeOptions

        // X-XSS-Protection
        headers['X-XSS-Protection'] = this.config.xXSSProtection

        // Referrer-Policy
        headers['Referrer-Policy'] = this.config.referrerPolicy

        // Permissions-Policy
        const permissionsPolicy = this.generatePermissionsPolicy()
        if (permissionsPolicy) {
            headers['Permissions-Policy'] = permissionsPolicy
        }

        // Strict-Transport-Security (仅在 HTTPS 下)
        if (window.location.protocol === 'https:') {
            headers['Strict-Transport-Security'] = this.config.strictTransportSecurity
        }

        return headers
    }

    /**
     * 应用安全头到 meta 标签
     */
    applyToMetaTags(): void {
        if (!this.config.enabled) {
            return
        }

        // CSP
        const csp = this.generateCSP()
        if (csp) {
            this.setMetaTag('Content-Security-Policy', csp)
        }

        // X-Frame-Options
        this.setMetaTag('X-Frame-Options', this.config.xFrameOptions)

        // X-Content-Type-Options
        this.setMetaTag('X-Content-Type-Options', this.config.xContentTypeOptions)

        // X-XSS-Protection
        this.setMetaTag('X-XSS-Protection', this.config.xXSSProtection)

        // Referrer-Policy
        this.setMetaTag('Referrer-Policy', this.config.referrerPolicy)

        console.log('[SecurityHeaders] 安全头已应用到 meta 标签')
    }

    /**
     * 设置 meta 标签
     */
    private setMetaTag(name: string, content: string): void {
        let meta = document.querySelector(`meta[http-equiv="${name}"]`) as HTMLMetaElement

        if (!meta) {
            meta = document.createElement('meta')
            meta.httpEquiv = name
            document.head.appendChild(meta)
        }

        meta.content = content
    }

    /**
     * 获取配置
     */
    getConfig(): Required<SecurityHeadersConfig> {
        return { ...this.config }
    }

    /**
     * 更新配置
     */
    updateConfig(config: Partial<SecurityHeadersConfig>): void {
        this.config = {
            ...this.config,
            ...config,
            csp: {
                ...this.config.csp,
                ...config.csp
            },
            permissionsPolicy: {
                ...this.config.permissionsPolicy,
                ...config.permissionsPolicy
            }
        }
    }

    /**
     * 启用安全头
     */
    enable(): void {
        this.config.enabled = true
    }

    /**
     * 禁用安全头
     */
    disable(): void {
        this.config.enabled = false
    }

    /**
     * 添加 CSP 源
     */
    addCSPSource(directive: keyof CSPConfig, source: string): void {
        const cspDirective = this.config.csp[directive]
        if (Array.isArray(cspDirective) && !cspDirective.includes(source)) {
            cspDirective.push(source)
        }
    }

    /**
     * 移除 CSP 源
     */
    removeCSPSource(directive: keyof CSPConfig, source: string): void {
        const cspDirective = this.config.csp[directive]
        if (Array.isArray(cspDirective)) {
            const index = cspDirective.indexOf(source)
            if (index > -1) {
                cspDirective.splice(index, 1)
            }
        }
    }
}

/**
 * 默认安全头实例
 */
export const securityHeaders = new SecurityHeaders()

/**
 * 获取安全头
 */
export function getSecurityHeaders(): Record<string, string> {
    return securityHeaders.getHeaders()
}

/**
 * 应用安全头到 meta 标签
 */
export function applySecurityHeaders(): void {
    securityHeaders.applyToMetaTags()
}

/**
 * 生成 CSP 字符串
 */
export function generateCSP(config?: CSPConfig): string {
    const headers = new SecurityHeaders({ csp: config })
    return headers.generateCSP()
}

/**
 * 生成 Permissions-Policy 字符串
 */
export function generatePermissionsPolicy(policy?: Record<string, string[]>): string {
    const headers = new SecurityHeaders({ permissionsPolicy: policy })
    return headers.generatePermissionsPolicy()
}
