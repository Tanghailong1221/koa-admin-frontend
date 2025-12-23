/**
 * 搜索组件类型定义
 */

/**
 * 搜索配置
 */
export interface SearchConfig {
    /** 占位符 */
    placeholder?: string
    /** 防抖延迟（毫秒） */
    debounce?: number
    /** 是否显示清空按钮 */
    clearable?: boolean
    /** 是否显示搜索按钮 */
    showSearchButton?: boolean
    /** 最小搜索长度 */
    minLength?: number
    /** 是否高亮结果 */
    highlight?: boolean
}

/**
 * 过滤条件
 */
export interface FilterCondition {
    /** 字段名 */
    field: string
    /** 操作符 */
    operator: FilterOperator
    /** 值 */
    value: any
    /** 标签（显示用） */
    label?: string
}

/**
 * 过滤操作符
 */
export enum FilterOperator {
    /** 等于 */
    EQUAL = 'eq',
    /** 不等于 */
    NOT_EQUAL = 'ne',
    /** 大于 */
    GREATER_THAN = 'gt',
    /** 大于等于 */
    GREATER_THAN_OR_EQUAL = 'gte',
    /** 小于 */
    LESS_THAN = 'lt',
    /** 小于等于 */
    LESS_THAN_OR_EQUAL = 'lte',
    /** 包含 */
    CONTAINS = 'contains',
    /** 不包含 */
    NOT_CONTAINS = 'not_contains',
    /** 开始于 */
    STARTS_WITH = 'starts_with',
    /** 结束于 */
    ENDS_WITH = 'ends_with',
    /** 在...之中 */
    IN = 'in',
    /** 不在...之中 */
    NOT_IN = 'not_in',
    /** 为空 */
    IS_NULL = 'is_null',
    /** 不为空 */
    IS_NOT_NULL = 'is_not_null',
    /** 介于 */
    BETWEEN = 'between'
}

/**
 * 过滤逻辑
 */
export enum FilterLogic {
    /** 且 */
    AND = 'and',
    /** 或 */
    OR = 'or'
}

/**
 * 过滤组
 */
export interface FilterGroup {
    /** 逻辑关系 */
    logic: FilterLogic
    /** 条件列表 */
    conditions: FilterCondition[]
    /** 子组 */
    groups?: FilterGroup[]
}

/**
 * 保存的搜索
 */
export interface SavedSearch {
    /** ID */
    id: string
    /** 名称 */
    name: string
    /** 描述 */
    description?: string
    /** 过滤组 */
    filterGroup: FilterGroup
    /** 创建时间 */
    createdAt: number
    /** 更新时间 */
    updatedAt: number
}

/**
 * 字段配置
 */
export interface FieldConfig {
    /** 字段名 */
    field: string
    /** 标签 */
    label: string
    /** 类型 */
    type: 'string' | 'number' | 'date' | 'boolean' | 'select'
    /** 选项（select 类型） */
    options?: Array<{ label: string; value: any }>
    /** 支持的操作符 */
    operators?: FilterOperator[]
}
