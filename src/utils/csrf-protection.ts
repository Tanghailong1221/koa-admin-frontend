/**
 * CSRF 防护工具
 * 用于防止跨站请求伪造攻击
 */

import { v4 as uuidv4 } from 'uuid'

/**
 * CSRF Token 存储键
 */
const CSRF_TOKEN_KEY = 'csrf_token'
const CSRF_TOKEN_HEADER = 'X-CSRF-Token'
const CSRF_TOKEN_PARAM = '_csrf'

/**
 * CSRF 保护配置
 */
export interface CSRFProtectionConfig {
    /**
     * Token 存储位置
     * @default 'sessionStorage'
     */
    storage?: 'localStorage' | 'sessionStorage' | 'cookie'

    /**
     * Token 请求头名称
     * @default 'X-CSRF-Token'
     */
    headerName?: string

    /**
     * Token 参数名称（用于表单提交）
     * @default '_csrf'
     */
    paramName?: string

    /**
     * Token 过期时间（毫秒）
     * @default 3600000 (1 小时)
     */
    expireTime?: number

    /**
     * 是否在每次请求后刷新 Token
     * @default false
     */
    refreshOnRequest?: boolean

    /**
     * 需要 CSRF 保护的请求方法
     * @default ['POST', 'PUT', 'DELETE', 'PATCH']
     */
    protectedMethods?: string[]

    /**
     * 白名单 URL（不需要 CSRF 保护）
     */
    whitelist?: string[]

    /**
     * 是否启用 CSRF 保护
     * @default true
     */
    enabled?: boolean
}

/**
 * CSRF Token 信息
 */
interface CSRFTokenInfo {
    /**
     * Token 值
     */
    token: string

    /**
     * 创建时间
     */
    createdAt: number

    /**
     * 过期时间
     */
    expiresAt: number
}

/**
 * CSRF 保护管理器
 */
export class CSRFProtection {
    private config: Required<CSRFProtectionConfig>
    private tokenInfo: CSRFTokenInfo | null = null

    constructor(config: CSRFProtectionConfig = {}) {
        this.config = {
            storage: config.storage || 'sessionStorage',
            headerName: config.headerName || CSRF_TOKEN_HEADER,
            paramName: config.paramName || CSRF_TOKEN_PARAM,
            expireTime: config.expireTime || 3600000, // 1 小时
            refreshOnRequest: config.refreshOnRequest ?? false,
            protectedMethods: config.protectedMethods || ['POST', 'PUT', 'DELETE', 'PATCH'],
            whitelist: config.whitelist || [],
            enabled: config.enabled ?? true
        }

        // 初始化时加载已有的 Token
        this.loadToken()
    }

    /**
     * 生成新的 CSRF Token
     */
    generateToken(): string {
        const token = uuidv4()
        const now = Date.now()

        this.tokenInfo = {
            token,
            createdAt: now,
            expiresAt: now + this.config.expireTime
        }

        this.saveToken()
        return token
    }

    /**
     * 获取当前 Token
     */
    getToken(): string | null {
        if (!this.config.enabled) {
            return null
        }

        // 检查 Token 是否存在
        if (!this.tokenInfo) {
            return this.generateToken()
        }

        // 检查 Token 是否过期
        if (this.isTokenExpired()) {
            return this.generateToken()
        }

        return this.tokenInfo.token
    }

    /**
     * 刷新 Token
     */
    refreshToken(): string {
        return this.generateToken()
    }

    /**
     * 清除 Token
     */
    clearToken(): void {
        this.tokenInfo = null
        this.removeTokenFromStorage()
    }

    /**
     * 检查 Token 是否过期
     */
    isTokenExpired(): boolean {
        if (!this.tokenInfo) {
            return true
        }

        return Date.now() > this.tokenInfo.expiresAt
    }

    /**
     * 检查 URL 是否在白名单中
     */
    isWhitelisted(url: string): boolean {
        return this.config.whitelist.some((pattern) => {
            // 支持通配符
            if (pattern.includes('*')) {
                const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$')
                return regex.test(url)
            }
            return url.includes(pattern)
        })
    }

    /**
     * 检查请求方法是否需要 CSRF 保护
     */
    isProtectedMethod(method: string): boolean {
        return this.config.protectedMethods.includes(method.toUpperCase())
    }

    /**
     * 检查请求是否需要 CSRF 保护
     */
    needsProtection(method: string, url: string): boolean {
        if (!this.config.enabled) {
            return false
        }

        // 检查是否在白名单中
        if (this.isWhitelisted(url)) {
            return false
        }

        // 检查请求方法
        return this.isProtectedMethod(method)
    }

    /**
     * 获取 Token 请求头
     */
    getTokenHeader(): Record<string, string> {
        const token = this.getToken()
        if (!token) {
            return {}
        }

        return {
            [this.config.headerName]: token
        }
    }

    /**
     * 获取 Token 参数（用于表单提交）
     */
    getTokenParam(): Record<string, string> {
        const token = this.getToken()
        if (!token) {
            return {}
        }

        return {
            [this.config.paramName]: token
        }
    }

    /**
     * 验证 Token
     */
    validateToken(token: string): boolean {
        const currentToken = this.getToken()
        return currentToken === token
    }

    /**
     * 保存 Token 到存储
     */
    private saveToken(): void {
        if (!this.tokenInfo) {
            return
        }

        const data = JSON.stringify(this.tokenInfo)

        switch (this.config.storage) {
            case 'localStorage':
                localStorage.setItem(CSRF_TOKEN_KEY, data)
                break
            case 'sessionStorage':
                sessionStorage.setItem(CSRF_TOKEN_KEY, data)
                break
            case 'cookie':
                this.setCookie(CSRF_TOKEN_KEY, data, this.config.expireTime)
                break
        }
    }

    /**
     * 从存储加载 Token
     */
    private loadToken(): void {
        let data: string | null = null

        switch (this.config.storage) {
            case 'localStorage':
                data = localStorage.getItem(CSRF_TOKEN_KEY)
                break
            case 'sessionStorage':
                data = sessionStorage.getItem(CSRF_TOKEN_KEY)
                break
            case 'cookie':
                data = this.getCookie(CSRF_TOKEN_KEY)
                break
        }

        if (data) {
            try {
                this.tokenInfo = JSON.parse(data)
            } catch (error) {
                console.error('[CSRF] 加载 Token 失败:', error)
                this.tokenInfo = null
            }
        }
    }

    /**
     * 从存储移除 Token
     */
    private removeTokenFromStorage(): void {
        switch (this.config.storage) {
            case 'localStorage':
                localStorage.removeItem(CSRF_TOKEN_KEY)
                break
            case 'sessionStorage':
                sessionStorage.removeItem(CSRF_TOKEN_KEY)
                break
            case 'cookie':
                this.deleteCookie(CSRF_TOKEN_KEY)
                break
        }
    }

    /**
     * 设置 Cookie
     */
    private setCookie(name: string, value: string, maxAge: number): void {
        const expires = new Date(Date.now() + maxAge).toUTCString()
        document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Strict`
    }

    /**
     * 获取 Cookie
     */
    private getCookie(name: string): string | null {
        const matches = document.cookie.match(
            new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)')
        )
        return matches ? decodeURIComponent(matches[1]) : null
    }

    /**
     * 删除 Cookie
     */
    private deleteCookie(name: string): void {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
    }

    /**
     * 启用 CSRF 保护
     */
    enable(): void {
        this.config.enabled = true
    }

    /**
     * 禁用 CSRF 保护
     */
    disable(): void {
        this.config.enabled = false
    }

    /**
     * 添加白名单 URL
     */
    addWhitelist(url: string): void {
        if (!this.config.whitelist.includes(url)) {
            this.config.whitelist.push(url)
        }
    }

    /**
     * 移除白名单 URL
     */
    removeWhitelist(url: string): void {
        const index = this.config.whitelist.indexOf(url)
        if (index > -1) {
            this.config.whitelist.splice(index, 1)
        }
    }

    /**
     * 获取配置
     */
    getConfig(): Required<CSRFProtectionConfig> {
        return { ...this.config }
    }

    /**
     * 更新配置
     */
    updateConfig(config: Partial<CSRFProtectionConfig>): void {
        this.config = {
            ...this.config,
            ...config
        }
    }
}

/**
 * 默认 CSRF 保护实例
 */
export const csrfProtection = new CSRFProtection()

/**
 * 获取 CSRF Token
 */
export function getCSRFToken(): string | null {
    return csrfProtection.getToken()
}

/**
 * 刷新 CSRF Token
 */
export function refreshCSRFToken(): string {
    return csrfProtection.refreshToken()
}

/**
 * 清除 CSRF Token
 */
export function clearCSRFToken(): void {
    csrfProtection.clearToken()
}

/**
 * 获取 CSRF Token 请求头
 */
export function getCSRFTokenHeader(): Record<string, string> {
    return csrfProtection.getTokenHeader()
}

/**
 * 获取 CSRF Token 参数
 */
export function getCSRFTokenParam(): Record<string, string> {
    return csrfProtection.getTokenParam()
}

/**
 * 验证 CSRF Token
 */
export function validateCSRFToken(token: string): boolean {
    return csrfProtection.validateToken(token)
}
