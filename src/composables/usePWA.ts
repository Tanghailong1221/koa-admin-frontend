/**
 * PWA Composable
 * 提供 PWA 相关功能的响应式接口
 */

import { onMounted, onUnmounted } from 'vue'
import { pwaManager } from '@/utils/pwa'
import type { PWAUpdateInfo } from '@/utils/pwa'
import type { Ref } from 'vue'

export interface UsePWAReturn {
    // 更新信息
    updateInfo: Ref<PWAUpdateInfo>
    // 离线就绪状态
    offlineReady: Ref<boolean>
    // 在线状态
    isOnline: Ref<boolean>
    // 更新 Service Worker
    update: () => Promise<void>
    // 激活更新
    activateUpdate: () => Promise<void>
    // 卸载 Service Worker
    unregister: () => Promise<boolean>
}

/**
 * 使用 PWA 功能
 */
export function usePWA(): UsePWAReturn {
    const updateInfo = pwaManager.getUpdateInfo()
    const offlineReady = pwaManager.getOfflineReady()
    const isOnline = ref(pwaManager.isOnline())

    let cleanupNetworkListener: (() => void) | null = null

    onMounted(() => {
        // 监听网络状态变化
        cleanupNetworkListener = pwaManager.onNetworkChange((online) => {
            isOnline.value = online
        })
    })

    onUnmounted(() => {
        // 清理网络监听器
        if (cleanupNetworkListener) {
            cleanupNetworkListener()
        }
    })

    return {
        updateInfo,
        offlineReady,
        isOnline,
        update: () => pwaManager.update(),
        activateUpdate: () => pwaManager.activateUpdate(),
        unregister: () => pwaManager.unregister()
    }
}

/**
 * 显示 PWA 安装提示
 */
export function useInstallPrompt() {
    const deferredPrompt = ref<any>(null)
    const canInstall = ref(false)

    onMounted(() => {
        // 监听安装提示事件
        window.addEventListener('beforeinstallprompt', (e) => {
            // 阻止默认的安装提示
            e.preventDefault()
            // 保存事件以便稍后触发
            deferredPrompt.value = e
            canInstall.value = true
        })

        // 监听安装完成事件
        window.addEventListener('appinstalled', () => {
            deferredPrompt.value = null
            canInstall.value = false
            console.log('PWA was installed')
        })
    })

    /**
     * 显示安装提示
     */
    const promptInstall = async (): Promise<boolean> => {
        if (!deferredPrompt.value) {
            return false
        }

        // 显示安装提示
        deferredPrompt.value.prompt()

        // 等待用户响应
        const { outcome } = await deferredPrompt.value.userChoice

        // 清除保存的事件
        deferredPrompt.value = null
        canInstall.value = false

        return outcome === 'accepted'
    }

    return {
        canInstall,
        promptInstall
    }
}
