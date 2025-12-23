/**
 * 表单导航守卫 Composable
 * 
 * 功能：
 * - 检测表单是否有未保存的更改
 * - 在离开页面时显示确认对话框
 * - 提供保存草稿选项
 */

import { ref, watch, onBeforeUnmount } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import { ElMessageBox } from 'element-plus'

/**
 * 导航守卫配置
 */
export interface FormGuardOptions {
    /** 是否启用导航守卫 */
    enabled?: boolean
    /** 确认对话框标题 */
    title?: string
    /** 确认对话框消息 */
    message?: string
    /** 确认按钮文本 */
    confirmText?: string
    /** 取消按钮文本 */
    cancelText?: string
    /** 是否显示保存草稿按钮 */
    showSaveDraft?: boolean
    /** 保存草稿按钮文本 */
    saveDraftText?: string
    /** 保存草稿回调 */
    onSaveDraft?: () => void | Promise<void>
}

/**
 * 表单导航守卫 Hook
 */
export function useFormGuard<T extends Record<string, any>>(
    formData: { value: T },
    options: FormGuardOptions = {}
) {
    // 配置
    const config = {
        enabled: options.enabled ?? true,
        title: options.title ?? '提示',
        message: options.message ?? '表单有未保存的更改，确定要离开吗？',
        confirmText: options.confirmText ?? '离开',
        cancelText: options.cancelText ?? '取消',
        showSaveDraft: options.showSaveDraft ?? true,
        saveDraftText: options.saveDraftText ?? '保存草稿',
        onSaveDraft: options.onSaveDraft
    }

    // 状态
    const isDirty = ref(false)
    const isSubmitting = ref(false)
    const originalData = ref<T | null>(null)

    /**
     * 设置原始数据（用于比较是否有更改）
     */
    const setOriginalData = (data: T): void => {
        originalData.value = JSON.parse(JSON.stringify(data))
        isDirty.value = false
    }

    /**
     * 检查表单是否有更改
     */
    const checkDirty = (): boolean => {
        if (!originalData.value) {
            return false
        }

        const current = JSON.stringify(formData.value)
        const original = JSON.stringify(originalData.value)

        return current !== original
    }

    /**
     * 标记表单为已提交（不再提示）
     */
    const markAsSubmitted = (): void => {
        isSubmitting.value = true
        isDirty.value = false
    }

    /**
     * 重置守卫状态
     */
    const reset = (): void => {
        isDirty.value = false
        isSubmitting.value = false
        originalData.value = null
    }

    /**
     * 显示确认对话框
     */
    const showConfirmDialog = async (): Promise<boolean> => {
        try {
            if (config.showSaveDraft && config.onSaveDraft) {
                // 显示带保存草稿选项的对话框
                const result = await ElMessageBox.confirm(
                    config.message,
                    config.title,
                    {
                        distinguishCancelAndClose: true,
                        confirmButtonText: config.confirmText,
                        cancelButtonText: config.cancelText,
                        type: 'warning',
                        showClose: true
                    }
                )

                return result === 'confirm'
            } else {
                // 显示普通确认对话框
                await ElMessageBox.confirm(
                    config.message,
                    config.title,
                    {
                        confirmButtonText: config.confirmText,
                        cancelButtonText: config.cancelText,
                        type: 'warning'
                    }
                )

                return true
            }
        } catch (action) {
            // 用户点击取消或关闭
            if (action === 'close' && config.showSaveDraft && config.onSaveDraft) {
                // 用户点击关闭，可能想保存草稿
                try {
                    await ElMessageBox.confirm(
                        '是否保存草稿？',
                        '提示',
                        {
                            confirmButtonText: config.saveDraftText,
                            cancelButtonText: '不保存',
                            type: 'info'
                        }
                    )

                    // 保存草稿
                    await config.onSaveDraft()
                    return true
                } catch {
                    // 用户选择不保存
                    return false
                }
            }

            return false
        }
    }

    /**
     * 路由守卫
     */
    const beforeRouteLeave = async (): Promise<boolean> => {
        // 如果守卫未启用，直接放行
        if (!config.enabled) {
            return true
        }

        // 如果表单正在提交，直接放行
        if (isSubmitting.value) {
            return true
        }

        // 检查表单是否有更改
        isDirty.value = checkDirty()

        // 如果没有更改，直接放行
        if (!isDirty.value) {
            return true
        }

        // 显示确认对话框
        return await showConfirmDialog()
    }

    /**
     * 浏览器刷新/关闭守卫
     */
    const beforeUnload = (event: BeforeUnloadEvent): string | undefined => {
        // 如果守卫未启用，直接放行
        if (!config.enabled) {
            return undefined
        }

        // 如果表单正在提交，直接放行
        if (isSubmitting.value) {
            return undefined
        }

        // 检查表单是否有更改
        isDirty.value = checkDirty()

        // 如果有更改，显示浏览器默认提示
        if (isDirty.value) {
            const message = '表单有未保存的更改，确定要离开吗？'
            event.preventDefault()
            event.returnValue = message
            return message
        }

        return undefined
    }

    // 监听表单数据变化
    watch(
        () => formData.value,
        () => {
            if (originalData.value) {
                isDirty.value = checkDirty()
            }
        },
        { deep: true }
    )

    // 注册路由守卫
    onBeforeRouteLeave(beforeRouteLeave)

    // 注册浏览器刷新/关闭守卫
    if (typeof window !== 'undefined') {
        window.addEventListener('beforeunload', beforeUnload)

        onBeforeUnmount(() => {
            window.removeEventListener('beforeunload', beforeUnload)
        })
    }

    return {
        // 状态
        isDirty,
        isSubmitting,

        // 方法
        setOriginalData,
        checkDirty,
        markAsSubmitted,
        reset
    }
}
