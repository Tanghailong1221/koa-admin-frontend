/**
 * 键盘快捷键 Composable
 *
 * 提供在组件中注册和管理快捷键的方法
 */

import { onMounted, onUnmounted } from 'vue'
import { keyboardShortcutManager } from '@/utils/keyboard-shortcuts'
import type { ShortcutConfig } from '@/utils/keyboard-shortcuts'

/**
 * 使用键盘快捷键
 */
export function useKeyboardShortcut() {
    const registeredIds: string[] = []

    /**
     * 注册快捷键
     */
    function register(id: string, config: ShortcutConfig): void {
        keyboardShortcutManager.register(id, config)
        registeredIds.push(id)
    }

    /**
     * 注销快捷键
     */
    function unregister(id: string): void {
        keyboardShortcutManager.unregister(id)
        const index = registeredIds.indexOf(id)
        if (index > -1) {
            registeredIds.splice(index, 1)
        }
    }

    /**
     * 启用快捷键
     */
    function enable(id: string): void {
        keyboardShortcutManager.enable(id)
    }

    /**
     * 禁用快捷键
     */
    function disable(id: string): void {
        keyboardShortcutManager.disable(id)
    }

    /**
     * 获取所有快捷键
     */
    function getAll() {
        return keyboardShortcutManager.getAll()
    }

    /**
     * 按分类获取快捷键
     */
    function getByCategory(category: string) {
        return keyboardShortcutManager.getByCategory(category)
    }

    /**
     * 组件卸载时自动注销快捷键
     */
    onUnmounted(() => {
        registeredIds.forEach(id => {
            keyboardShortcutManager.unregister(id)
        })
    })

    return {
        register,
        unregister,
        enable,
        disable,
        getAll,
        getByCategory
    }
}

/**
 * 使用单个快捷键（简化版）
 */
export function useShortcut(
    keys: string | string[],
    callback: (e: KeyboardEvent) => void | boolean,
    options?: {
        description?: string
        category?: string
        disabled?: boolean
    }
): void {
    const id = `shortcut-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

    onMounted(() => {
        keyboardShortcutManager.register(id, {
            keys,
            description: options?.description || '',
            callback,
            category: options?.category,
            disabled: options?.disabled
        })
    })

    onUnmounted(() => {
        keyboardShortcutManager.unregister(id)
    })
}
