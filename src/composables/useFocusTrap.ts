/**
 * 焦点捕获 Composable
 */

import { onMounted, onUnmounted, ref, type Ref } from 'vue'
import { createFocusTrap, type FocusTrapOptions } from '@/utils/focus-trap'

/**
 * 焦点捕获 Composable
 */
export function useFocusTrap(
    elementRef: Ref<HTMLElement | undefined>,
    options: FocusTrapOptions = {}
) {
    const focusTrap = ref<ReturnType<typeof createFocusTrap>>()
    const isActive = ref(false)

    /**
     * 激活焦点捕获
     */
    function activate() {
        if (!elementRef.value) {
            console.warn('[useFocusTrap] 元素未找到')
            return
        }

        if (!focusTrap.value) {
            focusTrap.value = createFocusTrap(elementRef.value, options)
        }

        focusTrap.value.activate()
        isActive.value = true
    }

    /**
     * 停用焦点捕获
     */
    function deactivate() {
        if (focusTrap.value) {
            focusTrap.value.deactivate()
            isActive.value = false
        }
    }

    // 组件卸载时停用
    onUnmounted(() => {
        deactivate()
    })

    return {
        isActive,
        activate,
        deactivate
    }
}
