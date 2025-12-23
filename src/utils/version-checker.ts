/**
 * 版本检测工具
 * 用于检测应用版本更新，提示用户刷新页面
 */

export interface VersionCheckConfig {
    /**
     * 版本检测 URL
     * @default '/version.json'
     */
    url?: string

    /**
     * 检测间隔（毫秒）
     * @default 60000 (1 分钟)
     */
    interval?: number

    /**
     * 是否启用版本检测
     * @default true
     */
    enabled?: boolean

    /**
     * 版本不匹配时的回调
     */
    onVersionMismatch?: (currentVersion: string, latestVersion: string) => void

    /**
     * 检测失败时的回调
     */
    onError?: (error: Error) => void
}

export interface VersionInfo {
    /**
     * 版本号
     */
    version: string

    /**
     * 构建时间
     */
    buildTime?: string

    /**
     * Git commit hash
     */
    commitHash?: string
}

/**
 * 版本检测器
 */
export class VersionChecker {
    private config: Required<VersionCheckConfig>
    private currentVersion: string
    private timer: number | null = null
    private checking = false

    constructor(currentVersion: string, config: VersionCheckConfig = {}) {
        this.currentVersion = currentVersion
        this.config = {
            url: '/version.json',
            interval: 60000, // 1 分钟
            enabled: true,
            onVersionMismatch: () => { },
            onError: () => { },
            ...config
        }
    }

    /**
     * 开始版本检测
     */
    start(): void {
        if (!this.config.enabled) {
            console.log('[VersionChecker] 版本检测已禁用')
            return
        }

        if (this.timer) {
            console.warn('[VersionChecker] 版本检测已在运行')
            return
        }

        console.log('[VersionChecker] 开始版本检测')

        // 立即检测一次
        this.check()

        // 定时检测
        this.timer = window.setInterval(() => {
            this.check()
        }, this.config.interval)
    }

    /**
     * 停止版本检测
     */
    stop(): void {
        if (this.timer) {
            clearInterval(this.timer)
            this.timer = null
            console.log('[VersionChecker] 停止版本检测')
        }
    }

    /**
     * 检测版本
     */
    async check(): Promise<boolean> {
        if (this.checking) {
            return false
        }

        this.checking = true

        try {
            const versionInfo = await this.fetchVersion()

            if (versionInfo.version !== this.currentVersion) {
                console.warn(
                    `[VersionChecker] 检测到新版本: ${versionInfo.version} (当前: ${this.currentVersion})`
                )

                this.config.onVersionMismatch(this.currentVersion, versionInfo.version)
                return true
            }

            return false
        } catch (error: any) {
            console.error('[VersionChecker] 版本检测失败:', error)
            this.config.onError(error)
            return false
        } finally {
            this.checking = false
        }
    }

    /**
     * 获取版本信息
     */
    private async fetchVersion(): Promise<VersionInfo> {
        // 添加时间戳避免缓存
        const url = `${this.config.url}?t=${Date.now()}`

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Cache-Control': 'no-cache',
                Pragma: 'no-cache'
            }
        })

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        return await response.json()
    }

    /**
     * 更新当前版本
     */
    updateCurrentVersion(version: string): void {
        this.currentVersion = version
        console.log(`[VersionChecker] 更新当前版本: ${version}`)
    }

    /**
     * 获取当前版本
     */
    getCurrentVersion(): string {
        return this.currentVersion
    }

    /**
     * 是否正在检测
     */
    isChecking(): boolean {
        return this.checking
    }

    /**
     * 是否已启动
     */
    isRunning(): boolean {
        return this.timer !== null
    }
}

/**
 * 创建版本检测器
 */
export function createVersionChecker(
    currentVersion: string,
    config?: VersionCheckConfig
): VersionChecker {
    return new VersionChecker(currentVersion, config)
}

/**
 * 生成版本信息文件内容
 */
export function generateVersionInfo(
    version: string,
    buildTime?: string,
    commitHash?: string
): VersionInfo {
    return {
        version,
        buildTime: buildTime || new Date().toISOString(),
        commitHash: commitHash || ''
    }
}
