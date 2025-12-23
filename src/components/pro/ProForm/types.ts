/**
 * ProForm 类型定义
 */

import type { FormRules, FormItemRule } from 'element-plus'

/**
 * 表单字段类型
 */
export const FormFieldType = {
    INPUT: 'input',
    TEXTAREA: 'textarea',
    NUMBER: 'number',
    SELECT: 'select',
    RADIO: 'radio',
    CHECKBOX: 'checkbox',
    DATE: 'date',
    DATERANGE: 'daterange',
    TIME: 'time',
    TIMERANGE: 'timerange',
    DATETIME: 'datetime',
    DATETIMERANGE: 'datetimerange',
    SWITCH: 'switch',
    SLIDER: 'slider',
    RATE: 'rate',
    COLOR: 'color',
    UPLOAD: 'upload',
    CUSTOM: 'custom'
} as const

export type FormFieldTypeValue = typeof FormFieldType[keyof typeof FormFieldType]

/**
 * 表单布局类型
 */
export const FormLayout = {
    HORIZONTAL: 'horizontal',
    VERTICAL: 'vertical',
    INLINE: 'inline'
} as const

export type FormLayoutValue = typeof FormLayout[keyof typeof FormLayout]

/**
 * 表单字段配置
 */
export interface ProFormField<T = any> {
    /** 字段名称（对应表单数据的 key） */
    name: string
    /** 字段标签 */
    label: string
    /** 字段类型 */
    type: FormFieldTypeValue
    /** 默认值 */
    defaultValue?: any
    /** 占位符 */
    placeholder?: string
    /** 是否必填 */
    required?: boolean
    /** 是否禁用 */
    disabled?: boolean
    /** 是否只读 */
    readonly?: boolean
    /** 是否隐藏 */
    hidden?: boolean
    /** 验证规则 */
    rules?: FormItemRule[]
    /** 字段提示 */
    tooltip?: string
    /** 字段说明 */
    extra?: string
    /** 栅格布局（1-24） */
    span?: number
    /** 字段依赖（当依赖字段值满足条件时显示） */
    dependencies?: {
        field: string
        value: any
        operator?: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'notIn'
    }[]
    /** 字段特定配置 */
    fieldProps?: Record<string, any>
    /** 自定义渲染函数 */
    render?: (value: any, formData: T) => any
    /** 插槽名称 */
    slotName?: string
    /** 值变化回调 */
    onChange?: (value: any, formData: T) => void
}

/**
 * Select 选项
 */
export interface SelectOption {
    label: string
    value: any
    disabled?: boolean
    [key: string]: any
}

/**
 * 表单配置
 */
export interface ProFormConfig {
    /** 表单布局 */
    layout?: FormLayoutValue
    /** 标签宽度 */
    labelWidth?: string | number
    /** 标签位置 */
    labelPosition?: 'left' | 'right' | 'top'
    /** 是否显示标签后的冒号 */
    labelSuffix?: string
    /** 是否显示必填星号 */
    requireAsteriskPosition?: 'left' | 'right'
    /** 是否显示验证错误信息 */
    showMessage?: boolean
    /** 是否行内显示验证错误信息 */
    inlineMessage?: boolean
    /** 是否在输入框中显示校验结果反馈图标 */
    statusIcon?: boolean
    /** 是否禁用表单 */
    disabled?: boolean
    /** 栅格间隔 */
    gutter?: number
    /** 是否显示重置按钮 */
    showReset?: boolean
    /** 是否显示取消按钮 */
    showCancel?: boolean
    /** 提交按钮文本 */
    submitText?: string
    /** 重置按钮文本 */
    resetText?: string
    /** 取消按钮文本 */
    cancelText?: string
}

/**
 * ProForm 属性
 */
export interface ProFormProps<T = any> {
    /** 表单字段配置 */
    fields: ProFormField<T>[]
    /** 表单数据 */
    modelValue?: T
    /** 表单配置 */
    config?: ProFormConfig
    /** 表单验证规则 */
    rules?: FormRules
    /** 是否显示加载状态 */
    loading?: boolean
    /** 是否只读模式 */
    readonly?: boolean
}

/**
 * ProForm 事件
 */
export interface ProFormEmits<T = any> {
    /** 表单数据更新 */
    (e: 'update:modelValue', value: T): void
    /** 表单提交 */
    (e: 'submit', value: T): void
    /** 表单重置 */
    (e: 'reset'): void
    /** 表单取消 */
    (e: 'cancel'): void
    /** 字段值变化 */
    (e: 'field-change', field: string, value: any): void
    /** 验证失败 */
    (e: 'validate-error', errors: any): void
}

/**
 * ProForm 实例方法
 */
export interface ProFormInstance<T = any> {
    /** 验证整个表单 */
    validate: () => Promise<boolean>
    /** 验证指定字段 */
    validateField: (field: string | string[]) => Promise<boolean>
    /** 重置表单 */
    resetFields: () => void
    /** 清空验证 */
    clearValidate: (field?: string | string[]) => void
    /** 获取表单数据 */
    getFormData: () => T
    /** 设置表单数据 */
    setFormData: (data: Partial<T>) => void
    /** 设置字段值 */
    setFieldValue: (field: string, value: any) => void
    /** 获取字段值 */
    getFieldValue: (field: string) => any
    /** 设置字段属性 */
    setFieldProps: (field: string, props: Partial<ProFormField<T>>) => void
    /** 设置加载状态 */
    setLoading: (loading: boolean) => void
}

/**
 * 表单验证结果
 */
export interface FormValidateResult {
    valid: boolean
    errors?: Record<string, string[]>
}
