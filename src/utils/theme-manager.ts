/**
 * 主题管理器
 * 
 * 功能：
 * - 主题配置管理
 * - CSS 变量应用
 * - 暗黑模式切换
 * - 主题持久化
 */

import { CacheManager } from './cache'

/**
 * 主题类型
 */
export const ThemeMode = {
    LIGHT: 'light',
    DARK: 'dark',
    AUTO: 'auto'
} as const

export type ThemeModeValue = typeof ThemeMode[keyof typeof ThemeMode]

/**
 * 主题配置
 */
export interface ThemeConfig {
    /** 主题模式 */
    mode: ThemeModeValue
    /** 主色调 */
    primaryColor?: string
    /** 成功色 */
    successColor?: string
    /** 警告色 */
    warningColor?: string
    /** 危险色 */
    dangerColor?: string
    /** 信息色 */
    infoColor?: string
    /** 字体大小 */
    fontSize?: string
    /** 圆角大小 */
    borderRadius?: string
    /** 自定义 CSS 变量 */
    customVars?: Record<string, string>
}

/**
 * 主题预设
 */
export interface ThemePreset {
    name: string
    label: string
    config: ThemeConfig
}

/**
 * 默认主题配置
 */
const DEFAULT_THEME_CONFIG: ThemeConfig = {
    mode: ThemeMode.LIGHT,
    primaryColor: '#409eff',
    successColor: '#67c23a',
    warningColor: '#e6a23c',
    dangerColor: '#f56c6c',
    infoColor: '#909399',
    fontSize: '14px',
    borderRadius: '4px'
}

/**
 * 主题管理器类
 */
export class ThemeManager {
    private config: ThemeConfig
    private cacheManager: CacheManager
    private mediaQuery: MediaQueryList | null = null
    private listeners: Set<(config: ThemeConfig) => void> = new Set()

    constructor(initialConfig?: Partial<ThemeConfig>) {
        this.config = { ...DEFAULT_THEME_CONFIG, ...initialConfig }
        this.cacheManager = new CacheManager({
            storage: localStorage,
            prefix: 'theme_'
        })

        // 加载持久化的主题配置
        this.loadPersistedConfig()

        // 监听系统主题变化
        this.setupMediaQueryListener()

        // 应用主题
        this.applyTheme()
    }

    /**
     * 加载持久化的主题配置
     */
    private loadPersistedConfig(): void {
        const persisted = this.cacheManager.get<ThemeConfig>('config')
        if (persisted) {
            this.config = { ...this.config, ...persisted }
            console.log('[ThemeManager] 加载持久化配置:', this.config)
        }
    }

    /**
     * 持久化主题配置
     */
    private persistConfig(): void {
        this.cacheManager.set('config', this.config)
        console.log('[ThemeManager] 持久化配置:', this.config)
    }

    /**
     * 设置媒体查询监听器
     */
    private setupMediaQueryListener(): void {
        if (typeof window === 'undefined') return

        this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

        const handleChange = () => {
            if (this.config.mode === ThemeMode.AUTO) {
                this.applyTheme()
                this.notifyListeners()
            }
        }

        // 现代浏览器
        if (this.mediaQuery.addEventListener) {
            this.mediaQuery.addEventListener('change', handleChange)
        } else {
            // 旧版浏览器
            this.mediaQuery.addListener(handleChange)
        }
    }

    /**
     * 获取当前实际主题模式（考虑 auto 模式）
     */
    private getActualMode(): 'light' | 'dark' {
        if (this.config.mode === ThemeMode.AUTO) {
            return this.mediaQuery?.matches ? 'dark' : 'light'
        }
        return this.config.mode as 'light' | 'dark'
    }

    /**
     * 应用主题
     */
    private applyTheme(): void {
        if (typeof document === 'undefined') return

        const actualMode = this.getActualMode()
        const root = document.documentElement

        // 设置主题模式类名
        root.classList.remove('light', 'dark')
        root.classList.add(actualMode)

        // 设置 data 属性（兼容 Element Plus）
        root.setAttribute('data-theme', actualMode)

        // 应用 CSS 变量
        this.applyCSSVariables()

        console.log('[ThemeManager] 应用主题:', actualMode)
    }

    /**
     * 应用 CSS 变量
     */
    private applyCSSVariables(): void {
        if (typeof document === 'undefined') return

        const root = document.documentElement

        // 应用颜色变量
        if (this.config.primaryColor) {
            root.style.setProperty('--el-color-primary', this.config.primaryColor)
        }
        if (this.config.successColor) {
            root.style.setProperty('--el-color-success', this.config.successColor)
        }
        if (this.config.warningColor) {
            root.style.setProperty('--el-color-warning', this.config.warningColor)
        }
        if (this.config.dangerColor) {
            root.style.setProperty('--el-color-danger', this.config.dangerColor)
        }
        if (this.config.infoColor) {
            root.style.setProperty('--el-color-info', this.config.infoColor)
        }

        // 应用字体大小
        if (this.config.fontSize) {
            root.style.setProperty('--el-font-size-base', this.config.fontSize)
        }

        // 应用圆角
        if (this.config.borderRadius) {
            root.style.setProperty('--el-border-radius-base', this.config.borderRadius)
        }

        // 应用自定义变量
        if (this.config.customVars) {
            Object.entries(this.config.customVars).forEach(([key, value]) => {
                root.style.setProperty(key, value)
            })
        }
    }

    /**
     * 通知监听器
     */
    private notifyListeners(): void {
        this.listeners.forEach(listener => {
            try {
                listener(this.config)
            } catch (error) {
                console.error('[ThemeManager] 监听器执行失败:', error)
            }
        })
    }

    /**
     * 获取当前主题配置
     */
    getConfig(): ThemeConfig {
        return { ...this.config }
    }

    /**
     * 获取当前实际主题模式
     */
    getCurrentMode(): 'light' | 'dark' {
        return this.getActualMode()
    }

    /**
     * 设置主题模式
     */
    setMode(mode: ThemeModeValue): void {
        this.config.mode = mode
        this.applyTheme()
        this.persistConfig()
        this.notifyListeners()
    }

    /**
     * 切换主题模式（light <-> dark）
     */
    toggleMode(): void {
        const currentMode = this.getActualMode()
        const newMode = currentMode === 'light' ? ThemeMode.DARK : ThemeMode.LIGHT
        this.setMode(newMode)
    }

    /**
     * 设置主色调
     */
    setPrimaryColor(color: string): void {
        this.config.primaryColor = color
        this.applyTheme()
        this.persistConfig()
        this.notifyListeners()
    }

    /**
     * 更新主题配置
     */
    updateConfig(config: Partial<ThemeConfig>): void {
        this.config = { ...this.config, ...config }
        this.applyTheme()
        this.persistConfig()
        this.notifyListeners()
    }

    /**
     * 重置主题配置
     */
    reset(): void {
        this.config = { ...DEFAULT_THEME_CONFIG }
        this.applyTheme()
        this.persistConfig()
        this.notifyListeners()
    }

    /**
     * 添加主题变化监听器
     */
    addListener(listener: (config: ThemeConfig) => void): () => void {
        this.listeners.add(listener)

        // 返回取消监听的函数
        return () => {
            this.listeners.delete(listener)
        }
    }

    /**
     * 移除主题变化监听器
     */
    removeListener(listener: (config: ThemeConfig) => void): void {
        this.listeners.delete(listener)
    }

    /**
     * 清除所有监听器
     */
    clearListeners(): void {
        this.listeners.clear()
    }

    /**
     * 销毁主题管理器
     */
    destroy(): void {
        this.clearListeners()

        // 移除媒体查询监听器
        if (this.mediaQuery) {
            if (this.mediaQuery.removeEventListener) {
                this.mediaQuery.removeEventListener('change', () => { })
            } else {
                this.mediaQuery.removeListener(() => { })
            }
        }
    }
}

/**
 * 主题预设
 */
export const THEME_PRESETS: ThemePreset[] = [
    {
        name: 'default',
        label: '默认主题',
        config: {
            mode: ThemeMode.LIGHT,
            primaryColor: '#409eff',
            successColor: '#67c23a',
            warningColor: '#e6a23c',
            dangerColor: '#f56c6c',
            infoColor: '#909399'
        }
    },
    {
        name: 'dark',
        label: '暗黑主题',
        config: {
            mode: ThemeMode.DARK,
            primaryColor: '#409eff',
            successColor: '#67c23a',
            warningColor: '#e6a23c',
            dangerColor: '#f56c6c',
            infoColor: '#909399'
        }
    },
    {
        name: 'blue',
        label: '蓝色主题',
        config: {
            mode: ThemeMode.LIGHT,
            primaryColor: '#1890ff',
            successColor: '#52c41a',
            warningColor: '#faad14',
            dangerColor: '#f5222d',
            infoColor: '#8c8c8c'
        }
    },
    {
        name: 'green',
        label: '绿色主题',
        config: {
            mode: ThemeMode.LIGHT,
            primaryColor: '#52c41a',
            successColor: '#52c41a',
            warningColor: '#faad14',
            dangerColor: '#f5222d',
            infoColor: '#8c8c8c'
        }
    },
    {
        name: 'purple',
        label: '紫色主题',
        config: {
            mode: ThemeMode.LIGHT,
            primaryColor: '#722ed1',
            successColor: '#52c41a',
            warningColor: '#faad14',
            dangerColor: '#f5222d',
            infoColor: '#8c8c8c'
        }
    }
]

// 导出单例实例
let themeManagerInstance: ThemeManager | null = null

export function getThemeManager(): ThemeManager {
    if (!themeManagerInstance) {
        themeManagerInstance = new ThemeManager()
    }
    return themeManagerInstance
}

export function createThemeManager(config?: Partial<ThemeConfig>): ThemeManager {
    themeManagerInstance = new ThemeManager(config)
    return themeManagerInstance
}
