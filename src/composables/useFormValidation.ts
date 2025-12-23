/**
 * 表单验证 Composable
 * 
 * 功能：
 * - 封装表单验证方法
 * - 字段级验证
 * - 防抖验证
 * - 清除验证
 * - 验证状态管理
 */

import { ref, computed } from 'vue'
import type { FormInstance, FormItemRule } from 'element-plus'

/**
 * 验证配置
 */
export interface FormValidationOptions {
    /** 是否启用防抖验证 */
    debounce?: boolean
    /** 防抖延迟（毫秒） */
    debounceDelay?: number
    /** 验证失败回调 */
    onValidateError?: (errors: Record<string, string[]>) => void
    /** 验证成功回调 */
    onValidateSuccess?: () => void
}

/**
 * 字段验证结果
 */
export interface FieldValidationResult {
    valid: boolean
    message?: string
}

/**
 * 表单验证结果
 */
export interface FormValidationResult {
    valid: boolean
    errors?: Record<string, string[]>
}

/**
 * 表单验证 Hook
 */
export function useFormValidation(
    formRef: { value: FormInstance | undefined },
    options: FormValidationOptions = {}
) {
    // 配置
    const config = {
        debounce: options.debounce ?? false,
        debounceDelay: options.debounceDelay ?? 300,
        onValidateError: options.onValidateError,
        onValidateSuccess: options.onValidateSuccess
    }

    // 状态
    const isValidating = ref(false)
    const validationErrors = ref<Record<string, string[]>>({})
    const fieldValidationStatus = ref<Record<string, boolean>>({})

    // 防抖定时器
    let debounceTimer: ReturnType<typeof setTimeout> | null = null

    /**
     * 验证整个表单
     */
    const validate = async (): Promise<FormValidationResult> => {
        if (!formRef.value) {
            return { valid: false, errors: { form: ['表单实例不存在'] } }
        }

        try {
            isValidating.value = true
            validationErrors.value = {}

            await formRef.value.validate()

            config.onValidateSuccess?.()

            return { valid: true }
        } catch (error: any) {
            // Element Plus 验证失败时会抛出错误对象
            const errors: Record<string, string[]> = {}

            if (error && typeof error === 'object') {
                Object.keys(error).forEach(field => {
                    const fieldErrors = error[field]
                    if (Array.isArray(fieldErrors)) {
                        errors[field] = fieldErrors.map((err: any) => err.message || '验证失败')
                    }
                })
            }

            validationErrors.value = errors
            config.onValidateError?.(errors)

            return { valid: false, errors }
        } finally {
            isValidating.value = false
        }
    }

    /**
     * 验证指定字段
     */
    const validateField = async (
        field: string | string[]
    ): Promise<FieldValidationResult> => {
        if (!formRef.value) {
            return { valid: false, message: '表单实例不存在' }
        }

        try {
            isValidating.value = true

            await formRef.value.validateField(field)

            // 更新字段验证状态
            const fields = Array.isArray(field) ? field : [field]
            fields.forEach(f => {
                fieldValidationStatus.value[f] = true
                delete validationErrors.value[f]
            })

            return { valid: true }
        } catch (error: any) {
            // 更新字段验证状态
            const fields = Array.isArray(field) ? field : [field]
            fields.forEach(f => {
                fieldValidationStatus.value[f] = false
            })

            const message = error?.message || '验证失败'
            return { valid: false, message }
        } finally {
            isValidating.value = false
        }
    }

    /**
     * 防抖验证字段
     */
    const validateFieldDebounced = (field: string | string[]): void => {
        if (!config.debounce) {
            validateField(field)
            return
        }

        if (debounceTimer) {
            clearTimeout(debounceTimer)
        }

        debounceTimer = setTimeout(() => {
            validateField(field)
        }, config.debounceDelay)
    }

    /**
     * 清除验证
     */
    const clearValidate = (field?: string | string[]): void => {
        if (!formRef.value) return

        formRef.value.clearValidate(field)

        if (field) {
            const fields = Array.isArray(field) ? field : [field]
            fields.forEach(f => {
                delete validationErrors.value[f]
                delete fieldValidationStatus.value[f]
            })
        } else {
            validationErrors.value = {}
            fieldValidationStatus.value = {}
        }
    }

    /**
     * 重置字段
     */
    const resetFields = (): void => {
        if (!formRef.value) return

        formRef.value.resetFields()
        validationErrors.value = {}
        fieldValidationStatus.value = {}
    }

    /**
     * 滚动到第一个错误字段
     */
    const scrollToError = (): void => {
        if (!formRef.value) return

        const firstErrorField = Object.keys(validationErrors.value)[0]
        if (firstErrorField) {
            formRef.value.scrollToField(firstErrorField)
        }
    }

    /**
     * 获取字段错误消息
     */
    const getFieldError = (field: string): string | undefined => {
        const errors = validationErrors.value[field]
        return errors && errors.length > 0 ? errors[0] : undefined
    }

    /**
     * 获取字段验证状态
     */
    const getFieldStatus = (field: string): boolean | undefined => {
        return fieldValidationStatus.value[field]
    }

    /**
     * 检查字段是否有错误
     */
    const hasFieldError = (field: string): boolean => {
        return !!validationErrors.value[field]
    }

    /**
     * 检查表单是否有错误
     */
    const hasErrors = computed(() => {
        return Object.keys(validationErrors.value).length > 0
    })

    /**
     * 获取错误数量
     */
    const errorCount = computed(() => {
        return Object.keys(validationErrors.value).length
    })

    /**
     * 获取所有错误消息
     */
    const allErrors = computed(() => {
        const errors: string[] = []
        Object.values(validationErrors.value).forEach(fieldErrors => {
            errors.push(...fieldErrors)
        })
        return errors
    })

    return {
        // 状态
        isValidating,
        validationErrors,
        fieldValidationStatus,
        hasErrors,
        errorCount,
        allErrors,

        // 方法
        validate,
        validateField,
        validateFieldDebounced,
        clearValidate,
        resetFields,
        scrollToError,
        getFieldError,
        getFieldStatus,
        hasFieldError
    }
}

/**
 * 常用验证规则
 */
export const ValidationRules = {
    /**
     * 必填规则
     */
    required: (message = '此字段为必填项'): FormItemRule => ({
        required: true,
        message,
        trigger: ['blur', 'change']
    }),

    /**
     * 邮箱规则
     */
    email: (message = '请输入正确的邮箱地址'): FormItemRule => ({
        type: 'email',
        message,
        trigger: 'blur'
    }),

    /**
     * 手机号规则
     */
    phone: (message = '请输入正确的手机号'): FormItemRule => ({
        pattern: /^1[3-9]\d{9}$/,
        message,
        trigger: 'blur'
    }),

    /**
     * 身份证号规则
     */
    idCard: (message = '请输入正确的身份证号'): FormItemRule => ({
        pattern: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/,
        message,
        trigger: 'blur'
    }),

    /**
     * URL 规则
     */
    url: (message = '请输入正确的 URL'): FormItemRule => ({
        type: 'url',
        message,
        trigger: 'blur'
    }),

    /**
     * 长度范围规则
     */
    length: (
        min: number,
        max: number,
        message = `长度在 ${min} 到 ${max} 个字符`
    ): FormItemRule => ({
        min,
        max,
        message,
        trigger: 'blur'
    }),

    /**
     * 最小长度规则
     */
    minLength: (min: number, message = `长度至少 ${min} 个字符`): FormItemRule => ({
        min,
        message,
        trigger: 'blur'
    }),

    /**
     * 最大长度规则
     */
    maxLength: (max: number, message = `长度最多 ${max} 个字符`): FormItemRule => ({
        max,
        message,
        trigger: 'blur'
    }),

    /**
     * 数字范围规则
     */
    range: (
        min: number,
        max: number,
        message = `数值在 ${min} 到 ${max} 之间`
    ): FormItemRule => ({
        type: 'number',
        min,
        max,
        message,
        trigger: 'blur'
    }),

    /**
     * 正则表达式规则
     */
    pattern: (pattern: RegExp, message = '格式不正确'): FormItemRule => ({
        pattern,
        message,
        trigger: 'blur'
    }),

    /**
     * 自定义验证规则
     */
    custom: (
        validator: (rule: any, value: any, callback: any) => void,
        trigger: string | string[] = 'blur'
    ): FormItemRule => ({
        validator,
        trigger
    }),

    /**
     * 密码强度规则（至少包含大小写字母和数字）
     */
    strongPassword: (
        message = '密码必须包含大小写字母和数字，长度至少 8 位'
    ): FormItemRule => ({
        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/,
        message,
        trigger: 'blur'
    }),

    /**
     * 确认密码规则
     */
    confirmPassword: (
        passwordField: string,
        message = '两次输入的密码不一致'
    ): FormItemRule => ({
        validator: (rule: any, value: any, callback: any) => {
            const form = rule.form
            if (value !== form[passwordField]) {
                callback(new Error(message))
            } else {
                callback()
            }
        },
        trigger: 'blur'
    })
}
