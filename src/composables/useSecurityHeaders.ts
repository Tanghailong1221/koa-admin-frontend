/**
 * 安全头 Composable
 * 提供安全头配置和管理的方法
 */

import { ref, computed, type Ref } from 'vue'
import {
    SecurityHeaders,
    securityHeaders,
    getSecurityHeaders,
    applySecurityHeaders,
    generateCSP,
    generatePermissionsPolicy,
    type SecurityHeadersConfig,
    type CSPConfig
} from '@/utils/security-headers'

/**
 * useSecurityHeaders 返回值
 */
export interface UseSecurityHeadersReturn {
    /**
     * 当前配置（响应式）
     */
    config: Ref<Required<SecurityHeadersConfig>>

    /**
     * 是否启用（响应式）
     */
    enabled: Ref<boolean>

    /**
     * 获取所有安全头
     */
    getHeaders: () => Record<string, string>

    /**
     * 应用安全头到 meta 标签
     */
    applyHeaders: () => void

    /**
     * 生成 CSP 字符串
     */
    getCSP: () => string

    /**
     * 生成 Permissions-Policy 字符串
     */
    getPermissionsPolicy: () => string

    /**
     * 更新配置
     */
    updateConfig: (config: Partial<SecurityHeadersConfig>) => void

    /**
     * 启用安全头
     */
    enable: () => void

    /**
     * 禁用安全头
     */
    disable: () => void

    /**
     * 添加 CSP 源
     */
    addCSPSource: (directive: keyof CSPConfig, source: string) => void

    /**
     * 移除 CSP 源
     */
    removeCSPSource: (directive: keyof CSPConfig, source: string) => void

    /**
     * 重置为默认配置
     */
    reset: () => void
}

/**
 * 安全头 Composable
 *
 * @param initialConfig - 初始配置
 * @returns 安全头管理方法
 *
 * @example
 * ```typescript
 * const {
 *   config,
 *   enabled,
 *   applyHeaders,
 *   addCSPSource
 * } = useSecurityHeaders()
 *
 * // 应用安全头
 * applyHeaders()
 *
 * // 添加 CSP 源
 * addCSPSource('scriptSrc', 'https://cdn.example.com')
 * ```
 */
export function useSecurityHeaders(
    initialConfig?: SecurityHeadersConfig
): UseSecurityHeadersReturn {
    // 创建安全头实例
    const headers = initialConfig ? new SecurityHeaders(initialConfig) : securityHeaders

    // 响应式配置
    const config = ref(headers.getConfig())

    // 响应式启用状态
    const enabled = computed({
        get: () => config.value.enabled,
        set: (value: boolean) => {
            config.value.enabled = value
            headers.updateConfig({ enabled: value })
        }
    })

    /**
     * 获取所有安全头
     */
    function getHeadersWithUpdate(): Record<string, string> {
        return headers.getHeaders()
    }

    /**
     * 应用安全头到 meta 标签
     */
    function applyHeadersWithUpdate(): void {
        headers.applyToMetaTags()
    }

    /**
     * 生成 CSP 字符串
     */
    function getCSPWithUpdate(): string {
        return headers.generateCSP()
    }

    /**
     * 生成 Permissions-Policy 字符串
     */
    function getPermissionsPolicyWithUpdate(): string {
        return headers.generatePermissionsPolicy()
    }

    /**
     * 更新配置
     */
    function updateConfigWithUpdate(newConfig: Partial<SecurityHeadersConfig>): void {
        headers.updateConfig(newConfig)
        config.value = headers.getConfig()
    }

    /**
     * 启用安全头
     */
    function enableWithUpdate(): void {
        headers.enable()
        config.value = headers.getConfig()
    }

    /**
     * 禁用安全头
     */
    function disableWithUpdate(): void {
        headers.disable()
        config.value = headers.getConfig()
    }

    /**
     * 添加 CSP 源
     */
    function addCSPSourceWithUpdate(directive: keyof CSPConfig, source: string): void {
        headers.addCSPSource(directive, source)
        config.value = headers.getConfig()
    }

    /**
     * 移除 CSP 源
     */
    function removeCSPSourceWithUpdate(directive: keyof CSPConfig, source: string): void {
        headers.removeCSPSource(directive, source)
        config.value = headers.getConfig()
    }

    /**
     * 重置为默认配置
     */
    function reset(): void {
        const defaultHeaders = new SecurityHeaders()
        headers.updateConfig(defaultHeaders.getConfig())
        config.value = headers.getConfig()
    }

    return {
        config,
        enabled,
        getHeaders: getHeadersWithUpdate,
        applyHeaders: applyHeadersWithUpdate,
        getCSP: getCSPWithUpdate,
        getPermissionsPolicy: getPermissionsPolicyWithUpdate,
        updateConfig: updateConfigWithUpdate,
        enable: enableWithUpdate,
        disable: disableWithUpdate,
        addCSPSource: addCSPSourceWithUpdate,
        removeCSPSource: removeCSPSourceWithUpdate,
        reset
    }
}

export default useSecurityHeaders
