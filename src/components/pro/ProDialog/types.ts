/**
 * ProDialog 类型定义
 */

import type { ProFormField, ProFormConfig } from '../ProForm/types'

/**
 * 弹窗模式
 */
export const DialogMode = {
    /** 新增 */
    ADD: 'add',
    /** 编辑 */
    EDIT: 'edit',
    /** 查看 */
    VIEW: 'view',
    /** 自定义 */
    CUSTOM: 'custom',
} as const

export type DialogModeValue = (typeof DialogMode)[keyof typeof DialogMode]

/**
 * 弹窗尺寸
 */
export const DialogSize = {
    /** 小 */
    SMALL: 'small',
    /** 默认 */
    DEFAULT: 'default',
    /** 大 */
    LARGE: 'large',
    /** 超大 */
    XLARGE: 'xlarge',
    /** 全屏 */
    FULLSCREEN: 'fullscreen',
} as const

export type DialogSizeValue = (typeof DialogSize)[keyof typeof DialogSize]

/**
 * 弹窗配置
 */
export interface ProDialogConfig {
    /** 弹窗宽度 */
    width?: string | number
    /** 弹窗尺寸预设 */
    size?: DialogSizeValue
    /** 是否可拖拽 */
    draggable?: boolean
    /** 是否显示关闭按钮 */
    showClose?: boolean
    /** 是否点击遮罩关闭 */
    closeOnClickModal?: boolean
    /** 是否按 ESC 关闭 */
    closeOnPressEscape?: boolean
    /** 是否显示全屏按钮（已废弃） */
    showFullscreen?: boolean
    /** 是否显示底部按钮 */
    showFooter?: boolean
    /** 确认按钮文本 */
    confirmText?: string
    /** 取消按钮文本 */
    cancelText?: string
    /** 是否显示确认按钮 */
    showConfirm?: boolean
    /** 是否显示取消按钮 */
    showCancel?: boolean
    /** 确认按钮加载状态 */
    confirmLoading?: boolean
    /** 关闭前回调 */
    beforeClose?: (done: () => void) => void
    /** 是否在关闭时销毁内容 */
    destroyOnClose?: boolean
    /** 是否居中显示 */
    center?: boolean
    /** 是否对齐头部和底部 */
    alignCenter?: boolean
    /** 自定义类名 */
    customClass?: string
    /** 弹窗层级 */
    zIndex?: number
    /** 是否锁定滚动 */
    lockScroll?: boolean
    /** 是否追加到 body */
    appendToBody?: boolean
    /** 是否显示重置按钮 */
    showReset?: boolean
    /** 副标题 */
    subtitle?: string
}

/**
 * 弹窗标题配置
 */
export interface DialogTitleConfig {
    /** 新增模式标题 */
    add?: string
    /** 编辑模式标题 */
    edit?: string
    /** 查看模式标题 */
    view?: string
    /** 自定义标题 */
    custom?: string
}

/**
 * ProDialog 属性
 */
export interface ProDialogProps<T = any> {
    /** 是否显示弹窗 */
    modelValue?: boolean
    /** 弹窗模式 */
    mode?: DialogModeValue
    /** 弹窗标题 */
    title?: string | DialogTitleConfig
    /** 表单字段配置 */
    fields?: ProFormField<T>[]
    /** 表单数据 */
    formData?: T
    /** 表单配置 */
    formConfig?: ProFormConfig
    /** 弹窗配置 */
    dialogConfig?: ProDialogConfig
    /** 是否加载中 */
    loading?: boolean
    /** 是否使用内置表单 */
    useForm?: boolean
}

/**
 * ProDialog 事件
 */
export interface ProDialogEmits<T = any> {
    /** 弹窗显示状态变化 */
    (e: 'update:modelValue', value: boolean): void
    /** 弹窗打开 */
    (e: 'open'): void
    /** 弹窗打开动画结束 */
    (e: 'opened'): void
    /** 弹窗关闭 */
    (e: 'close'): void
    /** 弹窗关闭动画结束 */
    (e: 'closed'): void
    /** 确认按钮点击 */
    (e: 'confirm', data: T): void
    /** 取消按钮点击 */
    (e: 'cancel'): void
    /** 表单提交 */
    (e: 'submit', data: T): void
    /** 表单验证失败 */
    (e: 'validate-error', errors: any): void
}

/**
 * ProDialog 实例方法
 */
export interface ProDialogInstance<T = any> {
    /** 打开弹窗 */
    open: (mode?: DialogModeValue, data?: T) => void
    /** 关闭弹窗 */
    close: () => void
    /** 获取表单数据 */
    getFormData: () => T
    /** 设置表单数据 */
    setFormData: (data: Partial<T>) => void
    /** 验证表单 */
    validate: () => Promise<boolean>
    /** 重置表单 */
    resetForm: () => void
    /** 设置加载状态 */
    setLoading: (loading: boolean) => void
    /** 设置确认按钮加载状态 */
    setConfirmLoading: (loading: boolean) => void
}

/**
 * 弹窗尺寸映射
 */
export const DialogSizeMap: Record<DialogSizeValue, string> = {
    [DialogSize.SMALL]: '400px',
    [DialogSize.DEFAULT]: '520px',
    [DialogSize.LARGE]: '720px',
    [DialogSize.XLARGE]: '960px',
    [DialogSize.FULLSCREEN]: '100%',
}
