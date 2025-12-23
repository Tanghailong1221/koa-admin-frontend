/**
 * 权限动态刷新管理器
 *
 * 功能：
 * - 监听权限变化
 * - 重新生成动态路由
 * - 重新评估权限指令
 * - 刷新页面权限状态
 */

import type { Router, RouteRecordRaw } from 'vue-router'
import { permissionManager } from './permission-manager'

/**
 * 权限刷新配置
 */
export interface PermissionRefreshConfig {
    /** 路由实例 */
    router: Router
    /** 动态路由生成函数 */
    generateRoutes?: (permissions: string[], roles: string[]) => RouteRecordRaw[]
    /** 刷新前回调 */
    onBeforeRefresh?: () => void | Promise<void>
    /** 刷新后回调 */
    onAfterRefresh?: () => void | Promise<void>
    /** 是否自动重定向到首页 */
    redirectToHome?: boolean
    /** 首页路径 */
    homePath?: string
}

/**
 * 权限刷新管理器类
 */
export class PermissionRefreshManager {
    private router: Router
    private generateRoutes?: (permissions: string[], roles: string[]) => RouteRecordRaw[]
    private onBeforeRefresh?: () => void | Promise<void>
    private onAfterRefresh?: () => void | Promise<void>
    private redirectToHome: boolean
    private homePath: string
    private isRefreshing = false

    constructor(config: PermissionRefreshConfig) {
        this.router = config.router
        this.generateRoutes = config.generateRoutes
        this.onBeforeRefresh = config.onBeforeRefresh
        this.onAfterRefresh = config.onAfterRefresh
        this.redirectToHome = config.redirectToHome ?? false
        this.homePath = config.homePath ?? '/'
    }

    /**
     * 刷新权限
     */
    async refresh(): Promise<void> {
        if (this.isRefreshing) {
            console.warn('[PermissionRefresh] 权限刷新正在进行中，跳过本次刷新')
            return
        }

        this.isRefreshing = true

        try {
            console.log('[PermissionRefresh] 开始刷新权限...')

            // 执行刷新前回调
            if (this.onBeforeRefresh) {
                await this.onBeforeRefresh()
            }

            // 重新生成动态路由
            if (this.generateRoutes) {
                await this.refreshRoutes()
            }

            // 重新评估当前页面权限
            this.refreshCurrentPage()

            // 执行刷新后回调
            if (this.onAfterRefresh) {
                await this.onAfterRefresh()
            }

            console.log('[PermissionRefresh] 权限刷新完成')
        } catch (error) {
            console.error('[PermissionRefresh] 权限刷新失败:', error)
            throw error
        } finally {
            this.isRefreshing = false
        }
    }

    /**
     * 刷新路由
     */
    private async refreshRoutes(): Promise<void> {
        if (!this.generateRoutes) {
            return
        }

        console.log('[PermissionRefresh] 重新生成动态路由...')

        // 获取当前权限和角色
        const permissions = permissionManager.getPermissions()
        const roles = permissionManager.getRoles()

        // 生成新的动态路由
        const newRoutes = this.generateRoutes(permissions, roles)

        // 移除旧的动态路由
        this.removeOldDynamicRoutes()

        // 添加新的动态路由
        newRoutes.forEach(route => {
            this.router.addRoute(route)
        })

        console.log('[PermissionRefresh] 动态路由已更新，共 ' + newRoutes.length + ' 条')
    }

    /**
     * 移除旧的动态路由
     */
    private removeOldDynamicRoutes(): void {
        // 获取所有路由
        const routes = this.router.getRoutes()

        // 移除标记为动态的路由
        routes.forEach(route => {
            if (route.meta?.dynamic) {
                this.router.removeRoute(route.name!)
            }
        })
    }

    /**
     * 刷新当前页面权限
     */
    private refreshCurrentPage(): void {
        const currentRoute = this.router.currentRoute.value

        console.log('[PermissionRefresh] 检查当前页面权限:', currentRoute.path)

        // 检查当前页面是否有权限访问
        const hasPermission = this.checkRoutePermission(currentRoute.meta)

        if (!hasPermission) {
            console.warn('[PermissionRefresh] 当前页面无权限访问，重定向到首页')

            if (this.redirectToHome) {
                this.router.replace(this.homePath)
            }
        } else {
            // 触发页面重新渲染（通过强制刷新指令）
            this.refreshDirectives()
        }
    }

    /**
     * 检查路由权限
     */
    private checkRoutePermission(meta: any): boolean {
        // 如果路由没有权限要求，允许访问
        if (!meta?.permission && !meta?.role) {
            return true
        }

        // 检查权限
        if (meta.permission) {
            const permissions = Array.isArray(meta.permission) ? meta.permission : [meta.permission]
            if (!permissionManager.hasAnyPermission(permissions)) {
                return false
            }
        }

        // 检查角色
        if (meta.role) {
            const roles = Array.isArray(meta.role) ? meta.role : [meta.role]
            if (!permissionManager.hasAnyRole(roles)) {
                return false
            }
        }

        return true
    }

    /**
     * 刷新权限指令
     */
    private refreshDirectives(): void {
        console.log('[PermissionRefresh] 刷新权限指令...')

        // 触发自定义事件，通知指令重新评估
        window.dispatchEvent(new CustomEvent('permission-refresh'))
    }

    /**
     * 检查是否正在刷新
     */
    isRefreshingPermission(): boolean {
        return this.isRefreshing
    }
}

/**
 * 全局权限刷新管理器实例
 */
let permissionRefreshManager: PermissionRefreshManager | null = null

/**
 * 初始化权限刷新管理器
 */
export function setupPermissionRefresh(config: PermissionRefreshConfig): PermissionRefreshManager {
    permissionRefreshManager = new PermissionRefreshManager(config)
    console.log('[PermissionRefresh] 权限刷新管理器已初始化')
    return permissionRefreshManager
}

/**
 * 获取权限刷新管理器实例
 */
export function getPermissionRefreshManager(): PermissionRefreshManager | null {
    return permissionRefreshManager
}

/**
 * 刷新权限（快捷方法）
 */
export async function refreshPermission(): Promise<void> {
    if (!permissionRefreshManager) {
        console.warn('[PermissionRefresh] 权限刷新管理器未初始化')
        return
    }

    await permissionRefreshManager.refresh()
}
