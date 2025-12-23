/**
 * CSRF 防护 Composable
 * 提供 CSRF 防护相关的方法
 */

import { computed, ref, type Ref } from 'vue'
import {
    csrfProtection,
    getCSRFToken,
    refreshCSRFToken,
    clearCSRFToken,
    getCSRFTokenHeader,
    getCSRFTokenParam,
    validateCSRFToken,
    type CSRFProtectionConfig
} from '@/utils/csrf-protection'

/**
 * useCSRF 返回值
 */
export interface UseCSRFReturn {
    /**
     * 当前 CSRF Token（响应式）
     */
    token: Ref<string | null>

    /**
     * Token 是否过期（响应式）
     */
    isExpired: Ref<boolean>

    /**
     * 获取 Token
     */
    getToken: () => string | null

    /**
     * 刷新 Token
     */
    refreshToken: () => string

    /**
     * 清除 Token
     */
    clearToken: () => void

    /**
     * 获取 Token 请求头
     */
    getTokenHeader: () => Record<string, string>

    /**
     * 获取 Token 参数
     */
    getTokenParam: () => Record<string, string>

    /**
     * 验证 Token
     */
    validateToken: (token: string) => boolean

    /**
     * 启用 CSRF 保护
     */
    enable: () => void

    /**
     * 禁用 CSRF 保护
     */
    disable: () => void

    /**
     * 添加白名单
     */
    addWhitelist: (url: string) => void

    /**
     * 移除白名单
     */
    removeWhitelist: (url: string) => void

    /**
     * 更新配置
     */
    updateConfig: (config: Partial<CSRFProtectionConfig>) => void
}

/**
 * CSRF 防护 Composable
 *
 * @example
 * ```typescript
 * const { token, getToken, refreshToken } = useCSRF()
 *
 * // 获取 Token
 * const csrfToken = getToken()
 *
 * // 刷新 Token
 * refreshToken()
 * ```
 */
export function useCSRF(): UseCSRFReturn {
    // 响应式 Token
    const token = ref<string | null>(getCSRFToken())

    // 响应式过期状态
    const isExpired = computed(() => csrfProtection.isTokenExpired())

    /**
     * 获取 Token（更新响应式状态）
     */
    function getTokenWithUpdate(): string | null {
        const newToken = getCSRFToken()
        token.value = newToken
        return newToken
    }

    /**
     * 刷新 Token（更新响应式状态）
     */
    function refreshTokenWithUpdate(): string {
        const newToken = refreshCSRFToken()
        token.value = newToken
        return newToken
    }

    /**
     * 清除 Token（更新响应式状态）
     */
    function clearTokenWithUpdate(): void {
        clearCSRFToken()
        token.value = null
    }

    return {
        token,
        isExpired,
        getToken: getTokenWithUpdate,
        refreshToken: refreshTokenWithUpdate,
        clearToken: clearTokenWithUpdate,
        getTokenHeader: getCSRFTokenHeader,
        getTokenParam: getCSRFTokenParam,
        validateToken: validateCSRFToken,
        enable: () => csrfProtection.enable(),
        disable: () => csrfProtection.disable(),
        addWhitelist: (url: string) => csrfProtection.addWhitelist(url),
        removeWhitelist: (url: string) => csrfProtection.removeWhitelist(url),
        updateConfig: (config: Partial<CSRFProtectionConfig>) => csrfProtection.updateConfig(config)
    }
}

/**
 * 表单 CSRF 保护
 *
 * @param formData - 表单数据（响应式）
 * @returns 包含 CSRF Token 的表单数据（响应式）
 *
 * @example
 * ```typescript
 * const formData = ref({ username: '', password: '' })
 * const formDataWithCSRF = useFormCSRF(formData)
 *
 * // formDataWithCSRF.value 会自动包含 _csrf 字段
 * ```
 */
export function useFormCSRF<T extends Record<string, any>>(
    formData: Ref<T>
): Ref<T & Record<string, string>> {
    return computed(() => {
        const csrfParam = getCSRFTokenParam()
        return {
            ...formData.value,
            ...csrfParam
        }
    })
}

export default useCSRF
