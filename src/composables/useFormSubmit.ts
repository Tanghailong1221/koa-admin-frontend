/**
 * 表单提交 Composable
 * 
 * 功能：
 * - 封装表单提交逻辑
 * - 加载状态管理
 * - 错误处理
 * - 成功处理
 * - 防止重复提交
 */

import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'

/**
 * 提交配置
 */
export interface FormSubmitOptions<T = any> {
    /** 提交函数 */
    onSubmit: (data: T) => Promise<any>
    /** 提交前验证 */
    validate?: boolean
    /** 提交成功回调 */
    onSuccess?: (result: any) => void
    /** 提交失败回调 */
    onError?: (error: any) => void
    /** 成功提示消息 */
    successMessage?: string
    /** 是否显示成功提示 */
    showSuccessMessage?: boolean
    /** 是否显示错误提示 */
    showErrorMessage?: boolean
    /** 防止重复提交 */
    preventDuplicate?: boolean
}

/**
 * 表单提交 Hook
 */
export function useFormSubmit<T extends Record<string, any>>(
    formRef: { value: FormInstance | undefined },
    formData: { value: T },
    options: FormSubmitOptions<T>
) {
    // 配置
    const config = {
        validate: options.validate ?? true,
        successMessage: options.successMessage ?? '提交成功',
        showSuccessMessage: options.showSuccessMessage ?? true,
        showErrorMessage: options.showErrorMessage ?? true,
        preventDuplicate: options.preventDuplicate ?? true,
        onSubmit: options.onSubmit,
        onSuccess: options.onSuccess,
        onError: options.onError
    }

    // 状态
    const isSubmitting = ref(false)
    const submitError = ref<Error | null>(null)
    const submitResult = ref<any>(null)

    /**
     * 提交表单
     */
    const submit = async (): Promise<boolean> => {
        // 防止重复提交
        if (config.preventDuplicate && isSubmitting.value) {
            console.warn('[FormSubmit] 表单正在提交中，请勿重复提交')
            return false
        }

        try {
            isSubmitting.value = true
            submitError.value = null

            // 验证表单
            if (config.validate && formRef.value) {
                try {
                    await formRef.value.validate()
                } catch (error) {
                    console.error('[FormSubmit] 表单验证失败:', error)
                    if (config.showErrorMessage) {
                        ElMessage.error('表单验证失败，请检查输入')
                    }
                    return false
                }
            }

            // 提交表单
            const result = await config.onSubmit(formData.value)
            submitResult.value = result

            // 成功回调
            config.onSuccess?.(result)

            // 成功提示
            if (config.showSuccessMessage) {
                ElMessage.success(config.successMessage)
            }

            console.log('[FormSubmit] 提交成功:', result)
            return true
        } catch (error: any) {
            submitError.value = error

            // 失败回调
            config.onError?.(error)

            // 错误提示
            if (config.showErrorMessage) {
                const message = error?.message || '提交失败，请稍后重试'
                ElMessage.error(message)
            }

            console.error('[FormSubmit] 提交失败:', error)
            return false
        } finally {
            isSubmitting.value = false
        }
    }

    /**
     * 重置提交状态
     */
    const reset = (): void => {
        isSubmitting.value = false
        submitError.value = null
        submitResult.value = null
    }

    return {
        // 状态
        isSubmitting,
        submitError,
        submitResult,

        // 方法
        submit,
        reset
    }
}
