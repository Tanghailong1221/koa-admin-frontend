/**
 * 字典验证工具
 * 用于验证表单字段值是否在字典允许的范围内
 */

import type { DictItem } from '@/store/dict'
import type { FormItemRule } from 'element-plus'

/**
 * 字典验证选项
 */
export interface DictValidationOptions {
    /** 字典类型 */
    dictType: string
    /** 字典数据 */
    dictData: DictItem[]
    /** 是否必填 */
    required?: boolean
    /** 自定义错误消息 */
    message?: string
    /** 触发方式 */
    trigger?: 'blur' | 'change' | Array<'blur' | 'change'>
}

/**
 * 创建字典验证规则
 * @param options 验证选项
 * @returns Element Plus 表单验证规则
 */
export function createDictRule(options: DictValidationOptions): FormItemRule {
    const {
        dictType,
        dictData,
        required = false,
        message,
        trigger = 'change'
    } = options

    return {
        required,
        trigger,
        validator: (_rule, value, callback) => {
            // 如果不是必填且值为空，则通过验证
            if (!required && (value === null || value === undefined || value === '')) {
                callback()
                return
            }

            // 如果是必填且值为空，则验证失败
            if (required && (value === null || value === undefined || value === '')) {
                callback(new Error(message || `请选择${dictType}`))
                return
            }

            // 验证值是否在字典范围内
            const isValid = validateDictValue(value, dictData)
            if (!isValid) {
                callback(
                    new Error(message || `${dictType}的值不在允许的范围内`)
                )
                return
            }

            callback()
        }
    }
}

/**
 * 验证单个值是否在字典范围内
 * @param value 要验证的值
 * @param dictData 字典数据
 * @returns 是否有效
 */
export function validateDictValue(
    value: any,
    dictData: DictItem[]
): boolean {
    if (value === null || value === undefined) {
        return false
    }

    // 如果是数组（多选），验证每个值
    if (Array.isArray(value)) {
        return value.every((v) => validateSingleValue(v, dictData))
    }

    // 验证单个值
    return validateSingleValue(value, dictData)
}

/**
 * 验证单个值
 * @param value 值
 * @param dictData 字典数据
 * @returns 是否有效
 */
function validateSingleValue(value: any, dictData: DictItem[]): boolean {
    return dictData.some((item) => {
        // 支持数字和字符串比较
        return item.value === value || String(item.value) === String(value)
    })
}

/**
 * 创建字典范围验证规则（用于 ProForm）
 * @param dictType 字典类型
 * @param dictData 字典数据
 * @param required 是否必填
 * @returns 验证规则数组
 */
export function createDictRules(
    dictType: string,
    dictData: DictItem[],
    required = false
): FormItemRule[] {
    const rules: FormItemRule[] = []

    // 必填规则
    if (required) {
        rules.push({
            required: true,
            message: `请选择${dictType}`,
            trigger: 'change'
        })
    }

    // 范围验证规则
    rules.push(
        createDictRule({
            dictType,
            dictData,
            required: false, // 必填已经在上面处理
            trigger: 'change'
        })
    )

    return rules
}

/**
 * 批量验证字典值
 * @param values 值对象 { fieldName: value }
 * @param dictMap 字典映射 { fieldName: { dictType, dictData } }
 * @returns 验证结果 { valid: boolean, errors: { fieldName: string } }
 */
export function validateDictValues(
    values: Record<string, any>,
    dictMap: Record<string, { dictType: string; dictData: DictItem[] }>
): {
    valid: boolean
    errors: Record<string, string>
} {
    const errors: Record<string, string> = {}

    for (const [fieldName, value] of Object.entries(values)) {
        const dictConfig = dictMap[fieldName]
        if (!dictConfig) {
            continue
        }

        const { dictType, dictData } = dictConfig
        const isValid = validateDictValue(value, dictData)

        if (!isValid) {
            errors[fieldName] = `${dictType}的值不在允许的范围内`
        }
    }

    return {
        valid: Object.keys(errors).length === 0,
        errors
    }
}
