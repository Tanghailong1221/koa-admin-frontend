/**
 * 数据级权限拦截器
 * 
 * 功能：
 * - 自动在请求中注入数据级权限过滤条件
 * - 支持组织过滤
 * - 支持角色过滤
 * - 支持自定义过滤规则
 * - 支持白名单（跳过权限注入）
 */

import type { AxiosRequestConfig } from 'axios'

/**
 * 数据权限类型
 */
export enum DataPermissionType {
    /** 全部数据 */
    ALL = 'all',
    /** 本部门数据 */
    DEPT = 'dept',
    /** 本部门及子部门数据 */
    DEPT_AND_CHILD = 'dept_and_child',
    /** 仅本人数据 */
    SELF = 'self',
    /** 自定义数据 */
    CUSTOM = 'custom'
}

/**
 * 数据权限配置
 */
export interface DataPermissionConfig {
    /** 用户 ID */
    userId?: string | number
    /** 用户名 */
    username?: string
    /** 部门 ID */
    deptId?: string | number
    /** 部门 ID 列表（包含子部门） */
    deptIds?: (string | number)[]
    /** 角色 ID 列表 */
    roleIds?: (string | number)[]
    /** 角色代码列表 */
    roleCodes?: string[]
    /** 数据权限类型 */
    dataPermissionType?: DataPermissionType
    /** 是否为超级管理员 */
    isSuperAdmin?: boolean
    /** 自定义过滤条件 */
    customFilters?: Record<string, any>
}

/**
 * 拦截器配置
 */
export interface DataPermissionInterceptorConfig {
    /** 是否启用 */
    enabled?: boolean
    /** 白名单 URL（不注入权限） */
    whitelist?: string[]
    /** 黑名单 URL（强制注入权限） */
    blacklist?: string[]
    /** 参数名称映射 */
    paramNames?: {
        userId?: string
        username?: string
        deptId?: string
        deptIds?: string
        roleIds?: string
        roleCodes?: string
        dataPermissionType?: string
    }
    /** 获取权限配置的函数 */
    getPermissionConfig?: () => DataPermissionConfig | null
    /** 自定义过滤器函数 */
    customFilter?: (config: AxiosRequestConfig, permissionConfig: DataPermissionConfig) => void
}

/**
 * 数据权限拦截器类
 */
export class DataPermissionInterceptor {
    private config: Required<DataPermissionInterceptorConfig>
    private permissionConfig: DataPermissionConfig | null = null

    constructor(config?: DataPermissionInterceptorConfig) {
        this.config = {
            enabled: config?.enabled ?? true,
            whitelist: config?.whitelist ?? [
                '/user/login',
                '/user/logout',
                '/user/refresh-token',
                '/captcha',
                '/public'
            ],
            blacklist: config?.blacklist ?? [],
            paramNames: {
                userId: 'userId',
                username: 'username',
                deptId: 'deptId',
                deptIds: 'deptIds',
                roleIds: 'roleIds',
                roleCodes: 'roleCodes',
                dataPermissionType: 'dataPermissionType',
                ...config?.paramNames
            },
            getPermissionConfig: config?.getPermissionConfig ?? (() => this.permissionConfig),
            customFilter: config?.customFilter ?? (() => { })
        }
    }

    /**
     * 设置权限配置
     */
    setPermissionConfig(config: DataPermissionConfig | null): void {
        this.permissionConfig = config
        console.log('[DataPermissionInterceptor] 权限配置已更新:', config)
    }

    /**
     * 启用拦截器
     */
    enable(): void {
        this.config.enabled = true
        console.log('[DataPermissionInterceptor] 拦截器已启用')
    }

    /**
     * 禁用拦截器
     */
    disable(): void {
        this.config.enabled = false
        console.log('[DataPermissionInterceptor] 拦截器已禁用')
    }

    /**
     * 检查 URL 是否在白名单中
     */
    private isWhitelisted(url: string): boolean {
        return this.config.whitelist.some(pattern => {
            if (pattern.includes('*')) {
                const regex = new RegExp(pattern.replace(/\*/g, '.*'))
                return regex.test(url)
            }
            return url.includes(pattern)
        })
    }

    /**
     * 检查 URL 是否在黑名单中
     */
    private isBlacklisted(url: string): boolean {
        return this.config.blacklist.some(pattern => {
            if (pattern.includes('*')) {
                const regex = new RegExp(pattern.replace(/\*/g, '.*'))
                return regex.test(url)
            }
            return url.includes(pattern)
        })
    }

    /**
     * 检查是否应该注入权限
     */
    private shouldInjectPermission(config: AxiosRequestConfig): boolean {
        if (!this.config.enabled) {
            return false
        }

        const url = config.url || ''

        // 黑名单优先级最高
        if (this.isBlacklisted(url)) {
            return true
        }

        // 白名单
        if (this.isWhitelisted(url)) {
            return false
        }

        // 只对 GET、POST、PUT、DELETE 请求注入权限
        const method = (config.method || 'get').toLowerCase()
        return ['get', 'post', 'put', 'delete'].includes(method)
    }

    /**
     * 注入权限参数
     */
    private injectPermissionParams(
        config: AxiosRequestConfig,
        permissionConfig: DataPermissionConfig
    ): void {
        // 超级管理员不注入权限过滤
        if (permissionConfig.isSuperAdmin) {
            console.log('[DataPermissionInterceptor] 超级管理员，跳过权限注入')
            return
        }

        const method = (config.method || 'get').toLowerCase()
        const paramNames = this.config.paramNames

        // 准备要注入的参数
        const permissionParams: Record<string, any> = {}

        // 注入用户 ID
        if (permissionConfig.userId !== undefined) {
            permissionParams[paramNames.userId!] = permissionConfig.userId
        }

        // 注入用户名
        if (permissionConfig.username !== undefined) {
            permissionParams[paramNames.username!] = permissionConfig.username
        }

        // 注入部门 ID
        if (permissionConfig.deptId !== undefined) {
            permissionParams[paramNames.deptId!] = permissionConfig.deptId
        }

        // 注入部门 ID 列表
        if (permissionConfig.deptIds !== undefined && permissionConfig.deptIds.length > 0) {
            permissionParams[paramNames.deptIds!] = permissionConfig.deptIds
        }

        // 注入角色 ID 列表
        if (permissionConfig.roleIds !== undefined && permissionConfig.roleIds.length > 0) {
            permissionParams[paramNames.roleIds!] = permissionConfig.roleIds
        }

        // 注入角色代码列表
        if (permissionConfig.roleCodes !== undefined && permissionConfig.roleCodes.length > 0) {
            permissionParams[paramNames.roleCodes!] = permissionConfig.roleCodes
        }

        // 注入数据权限类型
        if (permissionConfig.dataPermissionType !== undefined) {
            permissionParams[paramNames.dataPermissionType!] = permissionConfig.dataPermissionType
        }

        // 注入自定义过滤条件
        if (permissionConfig.customFilters) {
            Object.assign(permissionParams, permissionConfig.customFilters)
        }

        // 根据请求方法注入参数
        if (method === 'get') {
            // GET 请求：注入到 params
            config.params = {
                ...config.params,
                ...permissionParams
            }
        } else {
            // POST/PUT/DELETE 请求：注入到 data
            if (config.data instanceof FormData) {
                // FormData 类型
                Object.entries(permissionParams).forEach(([key, value]) => {
                    if (Array.isArray(value)) {
                        value.forEach(v => (config.data as FormData).append(key, String(v)))
                    } else {
                        (config.data as FormData).append(key, String(value))
                    }
                })
            } else {
                // JSON 类型
                config.data = {
                    ...config.data,
                    ...permissionParams
                }
            }
        }

        console.log('[DataPermissionInterceptor] 已注入权限参数:', permissionParams)
    }

    /**
     * 拦截请求
     */
    intercept(config: AxiosRequestConfig): AxiosRequestConfig {
        // 检查是否应该注入权限
        if (!this.shouldInjectPermission(config)) {
            return config
        }

        // 获取权限配置
        const permissionConfig = this.config.getPermissionConfig()
        if (!permissionConfig) {
            console.warn('[DataPermissionInterceptor] 权限配置为空，跳过权限注入')
            return config
        }

        // 注入权限参数
        this.injectPermissionParams(config, permissionConfig)

        // 执行自定义过滤器
        this.config.customFilter(config, permissionConfig)

        return config
    }

    /**
     * 添加白名单 URL
     */
    addWhitelist(url: string | string[]): void {
        const urls = Array.isArray(url) ? url : [url]
        this.config.whitelist.push(...urls)
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
     * 添加黑名单 URL
     */
    addBlacklist(url: string | string[]): void {
        const urls = Array.isArray(url) ? url : [url]
        this.config.blacklist.push(...urls)
    }

    /**
     * 移除黑名单 URL
     */
    removeBlacklist(url: string): void {
        const index = this.config.blacklist.indexOf(url)
        if (index > -1) {
            this.config.blacklist.splice(index, 1)
        }
    }

    /**
     * 获取配置
     */
    getConfig(): Required<DataPermissionInterceptorConfig> {
        return { ...this.config }
    }
}

/**
 * 创建数据权限拦截器实例
 */
export function createDataPermissionInterceptor(
    config?: DataPermissionInterceptorConfig
): DataPermissionInterceptor {
    return new DataPermissionInterceptor(config)
}
