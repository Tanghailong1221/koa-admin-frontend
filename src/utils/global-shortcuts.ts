/**
 * 全局快捷键配置
 *
 * 定义应用级别的全局快捷键
 */

import { keyboardShortcutManager, ShortcutCategory } from './keyboard-shortcuts'
import type { Router } from 'vue-router'

/**
 * 设置全局快捷键
 */
export function setupGlobalShortcuts(router: Router) {
    // Ctrl+S / Cmd+S - 保存
    keyboardShortcutManager.register('global-save', {
        keys: ['ctrl+s', 'command+s'],
        description: '保存当前内容',
        category: ShortcutCategory.GENERAL,
        callback: () => {
            console.log('[Shortcut] 触发保存')
            // 触发自定义事件，让页面组件处理保存逻辑
            window.dispatchEvent(new CustomEvent('shortcut-save'))
            return false // 阻止默认行为
        }
    })

    // Esc - 关闭对话框/抽屉
    keyboardShortcutManager.register('global-escape', {
        keys: 'esc',
        description: '关闭对话框或抽屉',
        category: ShortcutCategory.GENERAL,
        callback: () => {
            console.log('[Shortcut] 触发关闭')
            // 触发自定义事件
            window.dispatchEvent(new CustomEvent('shortcut-escape'))
            return true
        }
    })

    // F5 - 刷新页面
    keyboardShortcutManager.register('global-refresh', {
        keys: 'f5',
        description: '刷新当前页面',
        category: ShortcutCategory.GENERAL,
        callback: () => {
            console.log('[Shortcut] 触发刷新')
            window.location.reload()
            return false
        }
    })

    // Ctrl+/ - 显示快捷键帮助
    keyboardShortcutManager.register('global-help', {
        keys: ['ctrl+/', 'command+/'],
        description: '显示快捷键帮助',
        category: ShortcutCategory.GENERAL,
        callback: () => {
            console.log('[Shortcut] 显示帮助')
            window.dispatchEvent(new CustomEvent('shortcut-help'))
            return false
        }
    })

    // Alt+Left - 后退
    keyboardShortcutManager.register('global-back', {
        keys: 'alt+left',
        description: '返回上一页',
        category: ShortcutCategory.NAVIGATION,
        callback: () => {
            console.log('[Shortcut] 后退')
            router.back()
            return false
        }
    })

    // Alt+Right - 前进
    keyboardShortcutManager.register('global-forward', {
        keys: 'alt+right',
        description: '前进到下一页',
        category: ShortcutCategory.NAVIGATION,
        callback: () => {
            console.log('[Shortcut] 前进')
            router.forward()
            return false
        }
    })

    // Ctrl+H - 返回首页
    keyboardShortcutManager.register('global-home', {
        keys: ['ctrl+h', 'command+h'],
        description: '返回首页',
        category: ShortcutCategory.NAVIGATION,
        callback: () => {
            console.log('[Shortcut] 返回首页')
            router.push('/')
            return false
        }
    })

    // Ctrl+K - 搜索
    keyboardShortcutManager.register('global-search', {
        keys: ['ctrl+k', 'command+k'],
        description: '打开搜索',
        category: ShortcutCategory.GENERAL,
        callback: () => {
            console.log('[Shortcut] 打开搜索')
            window.dispatchEvent(new CustomEvent('shortcut-search'))
            return false
        }
    })

    // Ctrl+B - 切换侧边栏
    keyboardShortcutManager.register('global-toggle-sidebar', {
        keys: ['ctrl+b', 'command+b'],
        description: '切换侧边栏',
        category: ShortcutCategory.VIEW,
        callback: () => {
            console.log('[Shortcut] 切换侧边栏')
            window.dispatchEvent(new CustomEvent('shortcut-toggle-sidebar'))
            return false
        }
    })

    // Ctrl+, - 打开设置
    keyboardShortcutManager.register('global-settings', {
        keys: ['ctrl+,', 'command+,'],
        description: '打开设置',
        category: ShortcutCategory.GENERAL,
        callback: () => {
            console.log('[Shortcut] 打开设置')
            window.dispatchEvent(new CustomEvent('shortcut-settings'))
            return false
        }
    })

    console.log('[GlobalShortcuts] 全局快捷键已设置')
}

/**
 * 清除全局快捷键
 */
export function clearGlobalShortcuts() {
    keyboardShortcutManager.clear()
    console.log('[GlobalShortcuts] 全局快捷键已清除')
}
