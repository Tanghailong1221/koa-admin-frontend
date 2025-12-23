/**
 * 权限 Composable
 */

import { computed, ref } from 'vue'
import { permissionManager, PermissionMode } from '@/utils/permission-manager'
import type { PermissionConfig, PermissionModeType } from '@/utils/permission-manager'

export function usePermission() {
    const permissions = ref<string[]>(permissionManager.getPermissions())
    const roles = ref<string[]>(permissionManager.getRoles())
    const isSuperAdmin = ref<boolean>(permissionManager.isSuperAdminUser())

    const updateConfig = (config: PermissionConfig) => {
        permissionManager.setConfig(config)
        permissions.value = permissionManager.getPermissions()
        roles.value = permissionManager.getRoles()
        isSuperAdmin.value = permissionManager.isSuperAdminUser()
    }

    const clearConfig = () => {
        permissionManager.clearConfig()
        permissions.value = []
        roles.value = []
        isSuperAdmin.value = false
    }

    const hasPermission = (permission: string): boolean => {
        return permissionManager.hasPermission(permission)
    }

    const hasAnyPermission = (permissions: string[]): boolean => {
        return permissionManager.hasAnyPermission(permissions)
    }

    const hasAllPermissions = (permissions: string[]): boolean => {
        return permissionManager.hasAllPermissions(permissions)
    }

    const checkPermissions = (
        permissions: string | string[],
        mode: PermissionModeType = PermissionMode.SOME
    ): boolean => {
        return permissionManager.checkPermissions(permissions, mode)
    }

    const hasRole = (role: string): boolean => {
        return permissionManager.hasRole(role)
    }

    const hasAnyRole = (roles: string[]): boolean => {
        return permissionManager.hasAnyRole(roles)
    }

    const hasAllRoles = (roles: string[]): boolean => {
        return permissionManager.hasAllRoles(roles)
    }

    const checkRoles = (
        roles: string | string[],
        mode: PermissionModeType = PermissionMode.SOME
    ): boolean => {
        return permissionManager.checkRoles(roles, mode)
    }

    const filterByPermission = <T extends { permission?: string | string[] }>(
        items: T[],
        mode: PermissionModeType = PermissionMode.SOME
    ): T[] => {
        return permissionManager.filterByPermission(items, mode)
    }

    const filterByRole = <T extends { role?: string | string[] }>(
        items: T[],
        mode: PermissionModeType = PermissionMode.SOME
    ): T[] => {
        return permissionManager.filterByRole(items, mode)
    }

    const hasAnyPermissions = computed(() => permissions.value.length > 0)
    const hasAnyRoles = computed(() => roles.value.length > 0)

    return {
        permissions,
        roles,
        isSuperAdmin,
        hasAnyPermissions,
        hasAnyRoles,
        updateConfig,
        clearConfig,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        checkPermissions,
        hasRole,
        hasAnyRole,
        hasAllRoles,
        checkRoles,
        filterByPermission,
        filterByRole
    }
}
