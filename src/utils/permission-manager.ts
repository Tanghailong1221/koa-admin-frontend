/**
 * 权限管理器
 * 
 * 功能：
 * - 权限检查
 * - 权限过滤
 * - 多权限逻辑（AND/OR）
 * - 角色权限映射
 */

/**
 * 权限检查模式
 */
export const PermissionMode = {
    /** 满足任一权限即可（OR） */
    SOME: 'some',
    /** 必须满足所有权限（AND） */
    EVERY: 'every'
} as const

export type PermissionModeType = typeof PermissionMode[keyof typeof PermissionMode]

/**
 * 权限配置
 */
export interface PermissionConfig {
    /** 用户权限列表 */
    permissions: string[]
    /** 用户角色列表 */
    roles: string[]
    /** 是否为超级管理员 */
    isSuperAdmin?: boolean
}

/**
 * 权限管理器类
 */
export class PermissionManager {
    private permissions: Set<string> = new Set()
    private roles: Set<string> = new Set()
    private isSuperAdmin = false

    /**
     * 构造函数
     */
    constructor(config?: PermissionConfig) {
        if (config) {
            this.setConfig(config)
        }
    }

    /**
     * 设置权限配置
     */
    setConfig(config: PermissionConfig): void {
        this.permissions = new Set(config.permissions || [])
        this.roles = new Set(config.roles || [])
        this.isSuperAdmin = config.isSuperAdmin || false

        console.log('[PermissionManager] 权限配置已更新:', {
            permissions: this.permissions.size,
            roles: this.roles.size,
            isSuperAdmin: this.isSuperAdmin
        })
    }

    /**
     * 清空权限配置
     */
    clearConfig(): void {
        this.permissions.clear()
        this.roles.clear()
        this.isSuperAdmin = false

        console.log('[PermissionManager] 权限配置已清空')
    }

    /**
     * 检查是否有指定权限
     */
    hasPermission(permission: string): boolean {
        if (this.isSuperAdmin) {
            return true
        }
        return this.permissions.has(permission)
    }

    /**
     * 检查是否有任一权限（OR）
     */
    hasAnyPermission(permissions: string[]): boolean {
        if (this.isSuperAdmin) {
            return true
        }
        if (permissions.length === 0) {
            return false
        }
        return permissions.some(permission => this.permissions.has(permission))
    }

    /**
     * 检查是否有所有权限（AND）
     */
    hasAllPermissions(permissions: string[]): boolean {
        if (this.isSuperAdmin) {
            return true
        }
        if (permissions.length === 0) {
            return true
        }
        return permissions.every(permission => this.permissions.has(permission))
    }

    /**
     * 检查权限（支持 AND/OR 模式）
     */
    checkPermissions(
        permissions: string | string[],
        mode: PermissionModeType = PermissionMode.SOME
    ): boolean {
        const permissionArray = Array.isArray(permissions) ? permissions : [permissions]
        if (mode === PermissionMode.EVERY) {
            return this.hasAllPermissions(permissionArray)
        } else {
            return this.hasAnyPermission(permissionArray)
        }
    }

    /**
     * 检查是否有指定角色
     */
    hasRole(role: string): boolean {
        if (this.isSuperAdmin) {
            return true
        }
        return this.roles.has(role)
    }

    /**
     * 检查是否有任一角色（OR）
     */
    hasAnyRole(roles: string[]): boolean {
        if (this.isSuperAdmin) {
            return true
        }
        if (roles.length === 0) {
            return false
        }
        return roles.some(role => this.roles.has(role))
    }

    /**
     * 检查是否有所有角色（AND）
     */
    hasAllRoles(roles: string[]): boolean {
        if (this.isSuperAdmin) {
            return true
        }
        if (roles.length === 0) {
            return true
        }
        return roles.every(role => this.roles.has(role))
    }

    /**
     * 检查角色（支持 AND/OR 模式）
     */
    checkRoles(
        roles: string | string[],
        mode: PermissionModeType = PermissionMode.SOME
    ): boolean {
        const roleArray = Array.isArray(roles) ? roles : [roles]
        if (mode === PermissionMode.EVERY) {
            return this.hasAllRoles(roleArray)
        } else {
            return this.hasAnyRole(roleArray)
        }
    }

    /**
     * 检查是否为超级管理员
     */
    isSuperAdminUser(): boolean {
        return this.isSuperAdmin
    }

    /**
     * 过滤有权限的项目
     */
    filterByPermission<T extends { permission?: string | string[] }>(
        items: T[],
        mode: PermissionModeType = PermissionMode.SOME
    ): T[] {
        return items.filter(item => {
            if (!item.permission) {
                return true
            }
            return this.checkPermissions(item.permission, mode)
        })
    }

    /**
     * 过滤有角色的项目
     */
    filterByRole<T extends { role?: string | string[] }>(
        items: T[],
        mode: PermissionModeType = PermissionMode.SOME
    ): T[] {
        return items.filter(item => {
            if (!item.role) {
                return true
            }
            return this.checkRoles(item.role, mode)
        })
    }

    /**
     * 获取所有权限
     */
    getPermissions(): string[] {
        return Array.from(this.permissions)
    }

    /**
     * 获取所有角色
     */
    getRoles(): string[] {
        return Array.from(this.roles)
    }

    /**
     * 添加权限
     */
    addPermission(permission: string): void {
        this.permissions.add(permission)
    }

    /**
     * 添加多个权限
     */
    addPermissions(permissions: string[]): void {
        permissions.forEach(permission => this.permissions.add(permission))
    }

    /**
     * 移除权限
     */
    removePermission(permission: string): void {
        this.permissions.delete(permission)
    }

    /**
     * 移除多个权限
     */
    removePermissions(permissions: string[]): void {
        permissions.forEach(permission => this.permissions.delete(permission))
    }

    /**
     * 添加角色
     */
    addRole(role: string): void {
        this.roles.add(role)
    }

    /**
     * 添加多个角色
     */
    addRoles(roles: string[]): void {
        roles.forEach(role => this.roles.add(role))
    }

    /**
     * 移除角色
     */
    removeRole(role: string): void {
        this.roles.delete(role)
    }

    /**
     * 移除多个角色
     */
    removeRoles(roles: string[]): void {
        roles.forEach(role => this.roles.delete(role))
    }
}

// 创建全局权限管理器实例
export const permissionManager = new PermissionManager()
