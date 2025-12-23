/**
 * 键盘快捷键管理器
 *
 * 基于 mousetrap 实现全局快捷键管理
 */

import Mousetrap from 'mousetrap'

/**
 * 快捷键配置
 */
export interface ShortcutConfig {
    /** 快捷键组合 */
    keys: string | string[]
    /** 描述 */
    description: string
    /** 回调函数 */
    callback: (e: KeyboardEvent) => void | boolean
    /** 分类 */
    category?: string
    /** 是否禁用 */
    disabled?: boolean
    /** 作用域（默认为全局） */
    scope?: 'global' | 'input' | 'textarea'
}

/**
 * 快捷键分类
 */
export const ShortcutCategory = {
    /** 通用 */
    GENERAL: 'general',
    /** 导航 */
    NAVIGATION: 'navigation',
    /** 编辑 */
    EDIT: 'edit',
    /** 视图 */
    VIEW: 'view',
    /** 其他 */
    OTHER: 'other'
} as const

/**
 * 键盘快捷键管理器类
 */
export class KeyboardShortcutManager {
    private shortcuts: Map<string, ShortcutConfig> = new Map()
    private mousetrap: typeof Mousetrap

    constructor() {
        this.mousetrap = Mousetrap
    }

    /**
     * 注册快捷键
     */
    register(id: string, config: ShortcutConfig): void {
        if (this.shortcuts.has(id)) {
            console.warn(`[KeyboardShortcut] 快捷键 ${id} 已存在，将被覆盖`)
            this.unregister(id)
        }

        // 保存配置
        this.shortcuts.set(id, config)

        // 如果未禁用，绑定快捷键
        if (!config.disabled) {
            this.bindShortcut(config)
        }

        console.log(`[KeyboardShortcut] 注册快捷键: ${id} (${this.getKeysString(config.keys)})`)
    }

    /**
     * 注销快捷键
     */
    unregister(id: string): void {
        const config = this.shortcuts.get(id)
        if (!config) {
            console.warn(`[KeyboardShortcut] 快捷键 ${id} 不存在`)
            return
        }

        // 解绑快捷键
        this.unbindShortcut(config)

        // 删除配置
        this.shortcuts.delete(id)

        console.log(`[KeyboardShortcut] 注销快捷键: ${id}`)
    }

    /**
     * 启用快捷键
     */
    enable(id: string): void {
        const config = this.shortcuts.get(id)
        if (!config) {
            console.warn(`[KeyboardShortcut] 快捷键 ${id} 不存在`)
            return
        }

        if (!config.disabled) {
            return
        }

        config.disabled = false
        this.bindShortcut(config)

        console.log(`[KeyboardShortcut] 启用快捷键: ${id}`)
    }

    /**
     * 禁用快捷键
     */
    disable(id: string): void {
        const config = this.shortcuts.get(id)
        if (!config) {
            console.warn(`[KeyboardShortcut] 快捷键 ${id} 不存在`)
            return
        }

        if (config.disabled) {
            return
        }

        config.disabled = true
        this.unbindShortcut(config)

        console.log(`[KeyboardShortcut] 禁用快捷键: ${id}`)
    }

    /**
     * 获取所有快捷键
     */
    getAll(): Map<string, ShortcutConfig> {
        return new Map(this.shortcuts)
    }

    /**
     * 按分类获取快捷键
     */
    getByCategory(category: string): ShortcutConfig[] {
        return Array.from(this.shortcuts.values()).filter(
            config => config.category === category
        )
    }

    /**
     * 清空所有快捷键
     */
    clear(): void {
        this.shortcuts.forEach((config) => {
            this.unbindShortcut(config)
        })
        this.shortcuts.clear()

        console.log('[KeyboardShortcut] 清空所有快捷键')
    }

    /**
     * 重置（解绑所有 mousetrap 绑定）
     */
    reset(): void {
        this.mousetrap.reset()
        console.log('[KeyboardShortcut] 重置 mousetrap')
    }

    /**
     * 绑定快捷键
     */
    private bindShortcut(config: ShortcutConfig): void {
        const keys = Array.isArray(config.keys) ? config.keys : [config.keys]

        keys.forEach(key => {
            this.mousetrap.bind(key, (e) => {
                // 检查作用域
                if (config.scope && !this.checkScope(e, config.scope)) {
                    return true
                }

                // 执行回调
                const result = config.callback(e)

                // 如果回调返回 false，阻止默认行为
                if (result === false) {
                    e.preventDefault()
                    return false
                }

                return true
            })
        })
    }

    /**
     * 解绑快捷键
     */
    private unbindShortcut(config: ShortcutConfig): void {
        const keys = Array.isArray(config.keys) ? config.keys : [config.keys]
        keys.forEach(key => {
            this.mousetrap.unbind(key)
        })
    }

    /**
     * 检查作用域
     */
    private checkScope(e: KeyboardEvent, scope: string): boolean {
        const target = e.target as HTMLElement
        const tagName = target.tagName.toLowerCase()

        if (scope === 'input') {
            return tagName === 'input'
        }

        if (scope === 'textarea') {
            return tagName === 'textarea'
        }

        // global: 不在输入框中
        return tagName !== 'input' && tagName !== 'textarea'
    }

    /**
     * 获取快捷键字符串
     */
    private getKeysString(keys: string | string[]): string {
        return Array.isArray(keys) ? keys.join(', ') : keys
    }
}

/**
 * 全局快捷键管理器实例
 */
export const keyboardShortcutManager = new KeyboardShortcutManager()

/**
 * 注册快捷键（快捷方法）
 */
export function registerShortcut(id: string, config: ShortcutConfig): void {
    keyboardShortcutManager.register(id, config)
}

/**
 * 注销快捷键（快捷方法）
 */
export function unregisterShortcut(id: string): void {
    keyboardShortcutManager.unregister(id)
}

/**
 * 格式化快捷键显示
 */
export function formatShortcutKey(key: string): string {
    return key
        .replace(/\+/g, ' + ')
        .replace(/ctrl/gi, 'Ctrl')
        .replace(/shift/gi, 'Shift')
        .replace(/alt/gi, 'Alt')
        .replace(/meta/gi, 'Meta')
        .replace(/mod/gi, navigator.platform.includes('Mac') ? 'Cmd' : 'Ctrl')
}
