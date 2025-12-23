/**
 * 权限指令
 *
 * 支持权限动态刷新
 */

import type { Directive, DirectiveBinding } from 'vue'
import { permissionManager } from '@/utils/permission-manager'
import type { PermissionModeType } from '@/utils/permission-manager'

export type PermissionValue =
    | string
    | string[]
    | {
        permissions: string | string[]
        mode?: PermissionModeType
    }

function checkPermission(value: PermissionValue): boolean {
    if (typeof value === 'string') {
        return permissionManager.hasPermission(value)
    }
    if (Array.isArray(value)) {
        return permissionManager.hasAnyPermission(value)
    }
    if (typeof value === 'object' && value.permissions) {
        return permissionManager.checkPermissions(value.permissions, value.mode)
    }
    return false
}

/**
 * 更新元素显示状态
 */
function updateElementVisibility(el: HTMLElement, hasPermission: boolean): void {
    if (hasPermission) {
        el.style.display = ''
        el.removeAttribute('data-no-permission')
    } else {
        el.style.display = 'none'
        el.setAttribute('data-no-permission', 'true')
    }
}

/**
 * 权限刷新处理器
 */
function createPermissionRefreshHandler(el: HTMLElement, value: PermissionValue) {
    return () => {
        const hasPermission = checkPermission(value)
        updateElementVisibility(el, hasPermission)
    }
}

export const vPerm: Directive<HTMLElement, PermissionValue> = {
    mounted(el: HTMLElement, binding: DirectiveBinding<PermissionValue>) {
        const { value } = binding
        if (!value) return

        // 检查权限
        const hasPermission = checkPermission(value)
        updateElementVisibility(el, hasPermission)

        // 监听权限刷新事件
        const handler = createPermissionRefreshHandler(el, value)
        window.addEventListener('permission-refresh', handler)
            // 保存处理器，以便后续移除
            ; (el as any).__permissionRefreshHandler__ = handler
    },
    updated(el: HTMLElement, binding: DirectiveBinding<PermissionValue>) {
        const { value, oldValue } = binding
        if (value === oldValue) return
        if (!value) return

        // 重新检查权限
        const hasPermission = checkPermission(value)
        updateElementVisibility(el, hasPermission)

        // 移除旧的事件监听器
        const oldHandler = (el as any).__permissionRefreshHandler__
        if (oldHandler) {
            window.removeEventListener('permission-refresh', oldHandler)
        }

        // 添加新的事件监听器
        const handler = createPermissionRefreshHandler(el, value)
        window.addEventListener('permission-refresh', handler)
            ; (el as any).__permissionRefreshHandler__ = handler
    },
    unmounted(el: HTMLElement) {
        // 移除事件监听器
        const handler = (el as any).__permissionRefreshHandler__
        if (handler) {
            window.removeEventListener('permission-refresh', handler)
            delete (el as any).__permissionRefreshHandler__
        }
    }
}

export type RoleValue =
    | string
    | string[]
    | {
        roles: string | string[]
        mode?: PermissionModeType
    }

function checkRole(value: RoleValue): boolean {
    if (typeof value === 'string') {
        return permissionManager.hasRole(value)
    }
    if (Array.isArray(value)) {
        return permissionManager.hasAnyRole(value)
    }
    if (typeof value === 'object' && value.roles) {
        return permissionManager.checkRoles(value.roles, value.mode)
    }
    return false
}

/**
 * 角色刷新处理器
 */
function createRoleRefreshHandler(el: HTMLElement, value: RoleValue) {
    return () => {
        const hasRole = checkRole(value)
        updateElementVisibility(el, hasRole)
    }
}

export const vRole: Directive<HTMLElement, RoleValue> = {
    mounted(el: HTMLElement, binding: DirectiveBinding<RoleValue>) {
        const { value } = binding
        if (!value) return

        // 检查角色
        const hasRole = checkRole(value)
        updateElementVisibility(el, hasRole)

        // 监听权限刷新事件
        const handler = createRoleRefreshHandler(el, value)
        window.addEventListener('permission-refresh', handler)
            ; (el as any).__roleRefreshHandler__ = handler
    },
    updated(el: HTMLElement, binding: DirectiveBinding<RoleValue>) {
        const { value, oldValue } = binding
        if (value === oldValue) return
        if (!value) return

        // 重新检查角色
        const hasRole = checkRole(value)
        updateElementVisibility(el, hasRole)

        // 移除旧的事件监听器
        const oldHandler = (el as any).__roleRefreshHandler__
        if (oldHandler) {
            window.removeEventListener('permission-refresh', oldHandler)
        }

        // 添加新的事件监听器
        const handler = createRoleRefreshHandler(el, value)
        window.addEventListener('permission-refresh', handler)
            ; (el as any).__roleRefreshHandler__ = handler
    },
    unmounted(el: HTMLElement) {
        // 移除事件监听器
        const handler = (el as any).__roleRefreshHandler__
        if (handler) {
            window.removeEventListener('permission-refresh', handler)
            delete (el as any).__roleRefreshHandler__
        }
    }
}
