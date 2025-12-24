/**
 * ProSearch 类型定义
 * 可配置的搜索表单组件
 */

import type { Component } from 'vue'

// ==================== 搜索字段类型 ====================

/**
 * 搜索字段类型
 */
export type SearchFieldType =
    | 'input'
    | 'select'
    | 'date'
    | 'dateRange'
    | 'number'
    | 'cascader'
    | 'treeSelect'
    | 'custom'

/**
 * 选项配置
 */
export interface SearchFieldOption {
    label: string
    value: string | number | boolean
    disabled?: boolean
    children?: SearchFieldOption[]
}

/**
 * 异步获取选项的函数类型
 */
export type FetchOptionsFunc = () => Promise<SearchFieldOption[]>

/**
 * 远程搜索函数类型
 */
export type RemoteSearchFunc = (query: string) => Promise<SearchFieldOption[]>

/**
 * 字段联动配置
 */
export interface FieldDependency {
    /** 依赖的字段名 */
    field: string
    /** 当依赖字段值变化时，获取新选项的函数 */
    fetchOptions: (dependValue: any, formValues: Record<string, any>) => Promise<SearchFieldOption[]>
    /** 是否在依赖字段变化时清空当前字段值，默认 true */
    clearOnChange?: boolean
}

/**
 * 搜索字段配置
 */
export interface SearchField {
    /** 字段名 */
    field: string
    /** 标签 */
    label: string
    /** 字段类型 */
    type?: SearchFieldType
    /** 占位符 */
    placeholder?: string
    /** 默认值 */
    defaultValue?: any
    /** 选项（用于 select、cascader 等） */
    options?: SearchFieldOption[]
    /** 异步获取选项的函数 */
    fetchOptions?: FetchOptionsFunc
    /** 是否可清空 */
    clearable?: boolean
    /** 是否禁用 */
    disabled?: boolean
    /** 是否必填 */
    required?: boolean
    /** 必填提示信息 */
    requiredMessage?: string
    /** 宽度 */
    width?: string | number
    /** 栅格列数（1-24） */
    span?: number
    /** 自定义组件 */
    component?: Component
    /** 组件属性 */
    componentProps?: Record<string, any>
    /** 插槽名称 */
    slotName?: string
    /** 是否隐藏 */
    hidden?: boolean
    /** 日期格式（用于 date、dateRange） */
    format?: string
    /** 值格式（用于 date、dateRange） */
    valueFormat?: string
    /** 远程搜索函数（用于 select） */
    remoteSearch?: RemoteSearchFunc
    /** 远程搜索防抖时间（毫秒），默认 300 */
    remoteSearchDelay?: number
    /** 字段联动配置 */
    dependsOn?: FieldDependency
    /** 是否支持多选（用于 select） */
    multiple?: boolean
}

// ==================== 搜索配置 ====================

/**
 * 快捷搜索配置
 */
export interface QuickSearchItem {
    /** 唯一标识 */
    key: string
    /** 显示名称 */
    label: string
    /** 预设的搜索值 */
    values: Record<string, any>
    /** 图标 */
    icon?: Component
    /** 类型 */
    type?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'default'
}

/**
 * 搜索历史配置
 */
export interface SearchHistoryConfig {
    /** 是否启用搜索历史 */
    enabled?: boolean
    /** 最大历史记录数 */
    maxCount?: number
    /** localStorage 存储的 key */
    storageKey?: string
    /** 是否显示清空按钮 */
    showClear?: boolean
}

/**
 * ProSearch 配置选项
 */
export interface ProSearchOptions {
    /** 搜索字段配置 */
    fields: SearchField[]
    /** 默认表单值 */
    defaultValues?: Record<string, any>
    /** 是否显示搜索按钮 */
    showSearch?: boolean
    /** 是否显示重置按钮 */
    showReset?: boolean
    /** 是否显示展开/收起按钮 */
    showExpand?: boolean
    /** 默认展开的字段数量 */
    defaultExpandCount?: number
    /** 搜索按钮文本 */
    searchText?: string
    /** 重置按钮文本 */
    resetText?: string
    /** 标签宽度 */
    labelWidth?: string | number
    /** 标签位置 */
    labelPosition?: 'left' | 'right' | 'top'
    /** 栅格间距 */
    gutter?: number
    /** 每行列数 */
    columns?: number
    /** 是否内联模式 */
    inline?: boolean
    /** 是否显示阴影效果 */
    shadow?: boolean
    /** 快捷搜索配置 */
    quickSearch?: QuickSearchItem[]
    /** 搜索历史配置 */
    history?: SearchHistoryConfig
    /** 搜索回调 */
    onSearch?: (values: Record<string, any>) => void
    /** 重置回调 */
    onReset?: () => void
}

/**
 * 创建 ProSearch 配置的辅助函数
 */
export function defineSearchOptions(options: ProSearchOptions): ProSearchOptions {
    return options
}

// ==================== 组件 Props ====================

/**
 * ProSearch 组件属性
 */
export interface ProSearchProps {
    /** 统一配置选项 */
    options?: ProSearchOptions
    /** 搜索字段配置 */
    fields?: SearchField[]
    /** 默认表单值 */
    defaultValues?: Record<string, any>
    /** 是否显示搜索按钮 */
    showSearch?: boolean
    /** 是否显示重置按钮 */
    showReset?: boolean
    /** 是否显示展开/收起按钮 */
    showExpand?: boolean
    /** 默认展开的字段数量 */
    defaultExpandCount?: number
    /** 搜索按钮文本 */
    searchText?: string
    /** 重置按钮文本 */
    resetText?: string
    /** 标签宽度 */
    labelWidth?: string | number
    /** 标签位置 */
    labelPosition?: 'left' | 'right' | 'top'
    /** 栅格间距 */
    gutter?: number
    /** 每行列数 */
    columns?: number
    /** 是否内联模式 */
    inline?: boolean
    /** 是否显示阴影效果 */
    shadow?: boolean
}

// ==================== 组件实例 ====================

/**
 * ProSearch 实例方法
 */
export interface ProSearchInstance {
    /** 获取搜索值 */
    getValues: () => Record<string, any>
    /** 设置搜索值 */
    setValues: (values: Record<string, any>) => void
    /** 重置表单 */
    reset: () => void
    /** 触发搜索 */
    search: () => void
    /** 验证表单 */
    validate: () => Promise<boolean>
    /** 刷新选项（重新获取异步选项） */
    refreshOptions: (field?: string) => Promise<void>
    /** 获取搜索历史 */
    getHistory: () => Record<string, any>[]
    /** 清空搜索历史 */
    clearHistory: () => void
    /** 应用快捷搜索 */
    applyQuickSearch: (key: string) => void
}
