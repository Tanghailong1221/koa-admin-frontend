/**
 * PWA 工具类
 * 管理 Service Worker 注册、更新和离线状态
 */

import { ref } from 'vue'
import type { Ref } from 'vue'

export interface PWAUpdateInfo {
    needRefresh: boolean
    updateAvailable: boolean
    registration?: ServiceWorkerRegistration
}

class PWAManager {
    private updateInfo: Ref<PWAUpdateInfo>
    private offlineReady: Ref<boolean>
    private registration: ServiceWorkerRegistration | null = null

    constructor() {
        this.updateInfo = ref({
            needRefresh: false,
            updateAvailable: false
        })
        this.offlineReady = ref(false)
    }

    /**
     * 初始化 PWA
     */
    async init(): Promise<void> {
        // 检查浏览器是否支持 Service Worker
        if (!('serviceWorker' in navigator)) {
            console.warn('Service Worker is not supported in this browser')
            return
        }

        try {
            // 注册 Service Worker
            this.registration = await navigator.serviceWorker.register('/sw.js', {
                scope: '/'
            })

            console.log('Service Worker registered successfully')

            // 监听更新
            this.registration.addEventListener('updatefound', () => {
                const newWorker = this.registration?.installing
                if (!newWorker) return

                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        // 新的 Service Worker 已安装，但旧的仍在控制页面
                        this.updateInfo.value = {
                            needRefresh: true,
                            updateAvailable: true,
                            registration: this.registration!
                        }
                    }
                })
            })

            // 监听控制器变化
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                // Service Worker 已更新，重新加载页面
                window.location.reload()
            })

            // 检查是否有等待的 Service Worker
            if (this.registration.waiting) {
                this.updateInfo.value = {
                    needRefresh: true,
                    updateAvailable: true,
                    registration: this.registration
                }
            }

            // 标记离线就绪
            if (this.registration.active) {
                this.offlineReady.value = true
            }
        } catch (error) {
            console.error('Service Worker registration failed:', error)
        }
    }

    /**
     * 更新 Service Worker
     */
    async update(): Promise<void> {
        if (!this.registration) {
            console.warn('No Service Worker registration found')
            return
        }

        try {
            await this.registration.update()
        } catch (error) {
            console.error('Service Worker update failed:', error)
        }
    }

    /**
     * 激活等待中的 Service Worker
     */
    async activateUpdate(): Promise<void> {
        const waiting = this.registration?.waiting
        if (!waiting) {
            console.warn('No waiting Service Worker found')
            return
        }

        // 发送消息让等待的 Service Worker 跳过等待
        waiting.postMessage({ type: 'SKIP_WAITING' })
    }

    /**
     * 卸载 Service Worker
     */
    async unregister(): Promise<boolean> {
        if (!this.registration) {
            return false
        }

        try {
            const result = await this.registration.unregister()
            console.log('Service Worker unregistered:', result)
            return result
        } catch (error) {
            console.error('Service Worker unregister failed:', error)
            return false
        }
    }

    /**
     * 获取更新信息
     */
    getUpdateInfo(): Ref<PWAUpdateInfo> {
        return this.updateInfo
    }

    /**
     * 获取离线就绪状态
     */
    getOfflineReady(): Ref<boolean> {
        return this.offlineReady
    }

    /**
     * 检查是否在线
     */
    isOnline(): boolean {
        return navigator.onLine
    }

    /**
     * 监听在线/离线状态变化
     */
    onNetworkChange(callback: (online: boolean) => void): () => void {
        const onlineHandler = () => callback(true)
        const offlineHandler = () => callback(false)

        window.addEventListener('online', onlineHandler)
        window.addEventListener('offline', offlineHandler)

        // 返回清理函数
        return () => {
            window.removeEventListener('online', onlineHandler)
            window.removeEventListener('offline', offlineHandler)
        }
    }
}

// 导出单例
export const pwaManager = new PWAManager()

// 导出类型
export type { PWAManager }
