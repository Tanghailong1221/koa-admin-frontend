/**
 * 权限刷新 Composable
 *
 * 提供权限刷新相关的响应式状态和方法
 */

import { ref, computed } from 'vue'
import { getPermissionRefreshManager, refreshPermission } from '@/utils/permission-refresh'

/**
 * 使用权限刷新
 */
export function usePermissionRefresh() {
    const manager = getPermissionRefreshManager()
    const isRefreshing = ref(false)

    /**
     * 刷新权限
     */
    async function refresh(): Promise<void> {
        if (!manager) {
            console.warn('[usePermissionRefresh] 权限刷新管理器未初始化')
            return
        }

        isRefreshing.value = true
        try {
            await refreshPermission()
        } finally {
            isRefreshing.value = false
        }
    }

    /**
     * 是否可以刷新
     */
    const canRefresh = computed(() => {
        return manager !== null && !isRefreshing.value
    })

    return {
        /** 是否正在刷新 */
        isRefreshing,
        /** 是否可以刷新 */
        canRefresh,
        /** 刷新权限 */
        refresh
    }
}
