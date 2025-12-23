/**
 * 焦点可见指令
 * 只在键盘导航时显示焦点样式
 */

import type { Directive } from 'vue'

let isUsingKeyboard = false

// 监听键盘事件
document.addEventListener('keydown', (event) => {
    if (event.key === 'Tab') {
        isUsingKeyboard = true
    }
})

// 监听鼠标事件
document.addEventListener('mousedown', () => {
    isUsingKeyboard = false
})

/**
 * 焦点可见指令
 */
export const vFocusVisible: Directive = {
    mounted(el: HTMLElement) {
        // 添加焦点事件监听
        el.addEventListener('focus', handleFocus)
        el.addEventListener('blur', handleBlur)
    },

    unmounted(el: HTMLElement) {
        // 移除事件监听
        el.removeEventListener('focus', handleFocus)
        el.removeEventListener('blur', handleBlur)
    }
}

/**
 * 处理焦点事件
 */
function handleFocus(event: FocusEvent) {
    const el = event.target as HTMLElement

    if (isUsingKeyboard) {
        el.classList.add('focus-visible')
    }
}

/**
 * 处理失焦事件
 */
function handleBlur(event: FocusEvent) {
    const el = event.target as HTMLElement
    el.classList.remove('focus-visible')
}

export default vFocusVisible
