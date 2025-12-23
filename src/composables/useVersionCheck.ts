/**
 * 版本检测 Composable
 */

import { ref, onMounted, onUnmounted } from 'vue'
import { ElNotification } from 'element-plus'
import { createVersionChecker, type VersionCheckConfig } from '@/utils/version-checker'

export interface UseVersionCheckOptions extends VersionCheckConfig {
    /**
     * 是否自动开始检测
     * @default true
     */
    autoStart?: boolean

    /**
     * 是否显示更新提示
     * @default true
     */
    showNotification?: boolean

    /**
     * 提示标题
     * @default '发现新版本'
     */
    notificationTitle?: string

    /**
     * 提示消息
     * @default '检测到新版本，请刷新页面以获取最新功能'
     */
    notificationMessage?: string

    /**
     * 是否显示刷新按钮
     * @default true
     */
    showRefreshButton?: boolean

    /**
     * 刷新按钮文本
     * @default '立即刷新'
     */
    refreshButtonText?: string
}

/**
 * 版本检测 Composable
 */
export function useVersionCheck(
    currentVersion: string,
    options: UseVersionCheckOptions = {}
) {
    const {
        autoStart = true,
        showNotification = true,
        notificationTitle = '发现新版本',
        notificationMessage = '检测到新版本，请刷新页面以获取最新功能',
        showRefreshButton = true,
        refreshButtonText = '立即刷新',
        ...config
    } = options

    // 是否有新版本
    const hasNewVersion = ref(false)

    // 最新版本号
    const latestVersion = ref('')

    // 是否正在检测
    const checking = ref(false)

    // 创建版本检测器
    const checker = createVersionChecker(currentVersion, {
        ...config,
        onVersionMismatch: (current, latest) => {
            hasNewVersion.value = true
            latestVersion.value = latest

            // 显示通知
            if (showNotification) {
                showUpdateNotification(current, latest)
            }

            // 调用用户回调
            config.onVersionMismatch?.(current, latest)
        },
        onError: (error) => {
            console.error('[useVersionCheck] 版本检测失败:', error)
            config.onError?.(error)
        }
    })

    /**
     * 显示更新通知
     */
    function showUpdateNotification(current: string, latest: string) {
        ElNotification({
            title: notificationTitle,
            type: 'warning',
            duration: 0, // 不自动关闭
            position: 'top-right',
            showClose: true,
            dangerouslyUseHTMLString: showRefreshButton,
            message: showRefreshButton
                ? `
          <div>
            <p>${notificationMessage}</p>
            <p style="margin-top: 10px; color: #909399; font-size: 12px;">
              当前版本: ${current}<br/>
              最新版本: ${latest}
            </p>
            <button
              style="
                margin-top: 10px;
                padding: 8px 16px;
                background-color: #409eff;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
              "
              onclick="window.location.reload()"
            >
              ${refreshButtonText}
            </button>
          </div>
        `
                : notificationMessage
        })
    }

    /**
     * 开始检测
     */
    function start() {
        checker.start()
    }

    /**
     * 停止检测
     */
    function stop() {
        checker.stop()
    }

    /**
     * 手动检测
     */
    async function check() {
        checking.value = true
        try {
            const result = await checker.check()
            return result
        } finally {
            checking.value = false
        }
    }

    /**
     * 刷新页面
     */
    function refresh() {
        window.location.reload()
    }

    /**
     * 清除新版本标记
     */
    function clearNewVersion() {
        hasNewVersion.value = false
        latestVersion.value = ''
    }

    // 自动开始检测
    onMounted(() => {
        if (autoStart) {
            start()
        }
    })

    // 组件卸载时停止检测
    onUnmounted(() => {
        stop()
    })

    return {
        // 状态
        hasNewVersion,
        latestVersion,
        checking,
        currentVersion,

        // 方法
        start,
        stop,
        check,
        refresh,
        clearNewVersion
    }
}
