/**
 * 主题 Composable
 * 
 * 功能：
 * - 封装主题管理器
 * - 提供响应式主题状态
 * - 主题切换和配置
 */

import { ref, computed, onMounted, onUnmounted } from 'vue'
import { getThemeManager, ThemeMode, THEME_PRESETS } from '@/utils/theme-manager'
import type { ThemeConfig, ThemeModeValue, ThemePreset } from '@/utils/theme-manager'

/**
 * 主题 Hook
 */
export function useTheme() {
    const themeManager = getThemeManager()

    // 响应式状态
    const config = ref<ThemeConfig>(themeManager.getConfig())
    const currentMode = ref<'light' | 'dark'>(themeManager.getCurrentMode())

    // 计算属性
    const isDark = computed(() => currentMode.value === 'dark')
    const isLight = computed(() => currentMode.value === 'light')
    const isAuto = computed(() => config.value.mode === ThemeMode.AUTO)

    // 主题预设
    const presets = ref<ThemePreset[]>(THEME_PRESETS)

    /**
     * 更新状态
     */
    const updateState = (newConfig: ThemeConfig) => {
        config.value = newConfig
        currentMode.value = themeManager.getCurrentMode()
    }

    /**
     * 设置主题模式
     */
    const setMode = (mode: ThemeModeValue) => {
        themeManager.setMode(mode)
        updateState(themeManager.getConfig())
    }

    /**
     * 切换主题模式
     */
    const toggleMode = () => {
        themeManager.toggleMode()
        updateState(themeManager.getConfig())
    }

    /**
     * 设置主色调
     */
    const setPrimaryColor = (color: string) => {
        themeManager.setPrimaryColor(color)
        updateState(themeManager.getConfig())
    }

    /**
     * 更新主题配置
     */
    const updateConfig = (newConfig: Partial<ThemeConfig>) => {
        themeManager.updateConfig(newConfig)
        updateState(themeManager.getConfig())
    }

    /**
     * 应用主题预设
     */
    const applyPreset = (presetName: string) => {
        const preset = presets.value.find(p => p.name === presetName)
        if (preset) {
            themeManager.updateConfig(preset.config)
            updateState(themeManager.getConfig())
        }
    }

    /**
     * 重置主题
     */
    const reset = () => {
        themeManager.reset()
        updateState(themeManager.getConfig())
    }

    // 监听主题变化
    let unsubscribe: (() => void) | null = null

    onMounted(() => {
        unsubscribe = themeManager.addListener(updateState)
    })

    onUnmounted(() => {
        if (unsubscribe) {
            unsubscribe()
        }
    })

    return {
        // 状态
        config,
        currentMode,
        isDark,
        isLight,
        isAuto,
        presets,

        // 方法
        setMode,
        toggleMode,
        setPrimaryColor,
        updateConfig,
        applyPreset,
        reset
    }
}
