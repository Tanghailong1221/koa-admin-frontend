/**
 * ProTablePlus 类型定义
 * 完全可配置的高级表格组件类型
 */

import type { Component, CSSProperties, VNode } from 'vue'
import type { ElTable } from 'element-plus'

// ==================== 卡片配置 ====================

/**
 * 卡片配置
 */
export interface ProTableCardConfig {
    /** 是否显示卡片 */
    show?: boolean
    /** 卡片标题 */
    title?: string
    /** 卡片描述 */
    description?: string
    /** 阴影显示时机 */
    shadow?: 'always' | 'hover' | 'never'
    /** 卡片body样式 */
    bodyStyle?: CSSProperties
}

// ==================== 工具栏配置 ====================

/**
 * 工具栏按钮
 */
export interface ToolbarButton {
    /** 按钮唯一标识 */
    key: string
    /** 按钮文本 */
    label: string
    /** 按钮图标 */
    icon?: Component
    /** 按钮类型 */
    type?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'default'
    /** 是否禁用 */
    disabled?: boolean | ((selection: any[]) => boolean)
    /** 是否显示 */
    show?: boolean | ((selection: any[]) => boolean)
    /** 点击回调 */
    onClick?: (selection: any[]) => void
}


/**
 * 工具栏配置
 */
export interface ProTableToolbarConfig {
    /** 是否显示工具栏 */
    show?: boolean
    /** 是否显示刷新按钮 */
    showRefresh?: boolean
    /** 是否显示列设置按钮 */
    showColumnSetting?: boolean
    /** 是否显示导出全部按钮 */
    showExportAll?: boolean
    /** 是否显示导出当前页按钮 */
    showExportPage?: boolean
    /** 是否显示全屏按钮 */
    showFullscreen?: boolean
    /** 是否显示打印按钮 */
    showPrint?: boolean
    /** 自定义按钮列表 */
    buttons?: ToolbarButton[]
}

// ==================== 列配置 ====================

/**
 * 行内编辑配置
 */
export interface InlineEditConfig<T = any> {
    /** 编辑类型 */
    type?: 'input' | 'number' | 'select' | 'date' | 'switch'
    /** 选项（用于 select） */
    options?: { label: string; value: any }[]
    /** 是否可编辑 */
    editable?: boolean | ((row: T, index: number) => boolean)
    /** 编辑规则 */
    rules?: any[]
    /** 保存回调 */
    onSave?: (row: T, field: string, value: any, oldValue: any) => Promise<boolean> | boolean
}

/**
 * 扩展列配置
 */
export interface ProTableColumnPlus<T = any> {
    /** 列的唯一标识/字段名 */
    prop: string
    /** 列标题 */
    label: string
    /** 列宽度 */
    width?: string | number
    /** 最小列宽 */
    minWidth?: string | number
    /** 是否固定列 */
    fixed?: boolean | 'left' | 'right'
    /** 是否可排序 */
    sortable?: boolean | 'custom'
    /** 是否可过滤 */
    filterable?: boolean
    /** 过滤选项 */
    filters?: { text: string; value: any }[]
    /** 对齐方式 */
    align?: 'left' | 'center' | 'right'
    /** 是否显示 */
    visible?: boolean
    /** 是否可隐藏（列设置中） */
    hideable?: boolean
    /** 列顺序 */
    order?: number
    /** 插槽名称 */
    slotName?: string
    /** 自定义渲染函数 */
    render?: (row: T, column: ProTableColumnPlus<T>, index: number) => VNode
    /** 格式化函数 */
    formatter?: (row: T, column: any, cellValue: any, index: number) => string
    /** 子列（多级表头） */
    children?: ProTableColumnPlus<T>[]
    /** 行内编辑配置 */
    inlineEdit?: InlineEditConfig<T>
    /** 列的额外属性 */
    [key: string]: any
}

// ==================== 操作列配置 ====================

/**
 * 操作按钮
 */
export interface ActionButton<T = any> {
    /** 按钮唯一标识 */
    key: string
    /** 按钮文本 */
    label: string
    /** 按钮图标 */
    icon?: Component
    /** 按钮类型 */
    type?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'default'
    /** 是否为链接样式 */
    link?: boolean
    /** 是否显示 */
    show?: boolean | ((row: T, index: number) => boolean)
    /** 是否禁用 */
    disabled?: boolean | ((row: T, index: number) => boolean)
    /** 确认提示文本 */
    confirm?: string | ((row: T) => string)
    /** 点击回调 */
    onClick?: (row: T, index: number) => void
}

/**
 * 操作列配置
 */
export interface ProTableActionColumn<T = any> {
    /** 是否显示操作列 */
    show?: boolean
    /** 列标题 */
    label?: string
    /** 列宽度 */
    width?: string | number
    /** 是否固定 */
    fixed?: boolean | 'left' | 'right'
    /** 操作按钮列表 */
    buttons?: ActionButton<T>[]
}


// ==================== 导出配置 ====================

/**
 * 导出格式
 */
export type ExportFormat = 'csv' | 'excel' | 'json'

/**
 * 导出配置
 */
export interface ProTableExportConfig {
    /** 导出文件名 */
    filename?: string
    /** 支持的导出格式 */
    formats?: ExportFormat[]
    /** 导出全部数据回调 */
    onExportAll?: (data: any[], format: ExportFormat) => void
    /** 导出当前页数据回调 */
    onExportPage?: (data: any[], format: ExportFormat) => void
}

// ==================== 选择配置 ====================

/**
 * 选择配置
 */
export interface ProTableSelectionConfig<T = any> {
    /** 选择类型 */
    type?: 'checkbox' | 'radio'
    /** 行是否可选择 */
    selectable?: (row: T, index: number) => boolean
    /** 是否保留选择 */
    reserveSelection?: boolean
}

// ==================== 分页配置 ====================

/**
 * 分页配置
 */
export interface ProTablePaginationConfig {
    /** 是否显示分页 */
    show?: boolean
    /** 当前页码 */
    page?: number
    /** 每页条数 */
    pageSize?: number
    /** 总条数 */
    total?: number
    /** 每页条数选项 */
    pageSizes?: number[]
    /** 分页布局 */
    layout?: string
    /** 是否显示背景色 */
    background?: boolean
}

// ==================== 请求相关 ====================

/**
 * 请求参数
 */
export interface ProTableRequestParams {
    /** 当前页码 */
    page: number
    /** 每页条数 */
    pageSize: number
    /** 排序字段 */
    sortBy?: string
    /** 排序方向 */
    sortOrder?: 'asc' | 'desc'
    /** 过滤条件 */
    filters?: Record<string, any>
    /** 其他参数 */
    [key: string]: any
}

/**
 * 请求响应
 */
export interface ProTableResponse<T = any> {
    /** 数据列表 */
    data: T[]
    /** 总条数 */
    total: number
    /** 当前页码 */
    page?: number
    /** 每页条数 */
    pageSize?: number
}

/**
 * 请求函数类型
 */
export type ProTableRequest<T = any> = (
    params: ProTableRequestParams
) => Promise<ProTableResponse<T>>


// ==================== 缓存配置 ====================

/**
 * 数据缓存配置
 */
export interface ProTableCacheConfig {
    /** 是否启用缓存 */
    enabled?: boolean
    /** 缓存时间（毫秒），默认 5 分钟 */
    ttl?: number
    /** 缓存 key 前缀 */
    keyPrefix?: string
}

// ==================== 统一配置 Options ====================

/**
 * ProTablePlus 统一配置选项
 * 将所有配置集中在一个对象中，提供完整的类型提示
 */
export interface ProTablePlusOptions<T = any> {
    // ===== 数据相关 =====
    /** 静态数据源 */
    dataSource?: T[]
    /** 请求函数 - 用于异步加载数据 */
    request?: ProTableRequest<T>
    /** 行的唯一标识字段，默认 'id' */
    rowKey?: string | ((row: T) => string)

    // ===== 卡片配置 =====
    /** 卡片配置 - false 则不显示卡片包装 */
    card?: boolean | ProTableCardConfig

    // ===== 工具栏配置 =====
    /** 工具栏配置 - false 则不显示工具栏 */
    toolbar?: boolean | ProTableToolbarConfig

    // ===== 列配置 =====
    /** 列配置 - 定义表格列 */
    columns: ProTableColumnPlus<T>[]

    // ===== 操作列配置 =====
    /** 操作列配置 - 定义行操作按钮 */
    actionColumn?: ProTableActionColumn<T>

    // ===== 选择配置 =====
    /** 选择配置 - true 启用多选，或传入详细配置 */
    selection?: boolean | ProTableSelectionConfig<T>

    // ===== 分页配置 =====
    /** 分页配置 - false 则不显示分页 */
    pagination?: boolean | ProTablePaginationConfig

    // ===== 导出配置 =====
    /** 导出配置 - 定义导出功能 */
    export?: ProTableExportConfig

    // ===== 缓存配置 =====
    /** 数据缓存配置 */
    cache?: ProTableCacheConfig

    // ===== 列设置持久化 =====
    /** 是否持久化列设置到 localStorage */
    persistColumnSettings?: boolean
    /** 列设置存储的 localStorage key */
    columnSettingsKey?: string

    // ===== 表格属性 =====
    /** 是否显示边框，默认 true */
    border?: boolean
    /** 是否显示斑马纹，默认 false */
    stripe?: boolean
    /** 表格大小 */
    size?: 'large' | 'default' | 'small'
    /** 表格高度 */
    height?: string | number
    /** 表格最大高度 */
    maxHeight?: string | number
    /** 是否自动计算高度以适应容器，默认 true */
    autoHeight?: boolean
    /** 空数据文本，默认 '暂无数据' */
    emptyText?: string
    /** 是否显示加载状态 */
    loading?: boolean
}

/**
 * 创建 ProTablePlus 配置的辅助函数
 * 提供完整的类型推断和代码提示
 * 
 * @example
 * ```ts
 * interface User {
 *   id: number
 *   name: string
 * }
 * 
 * const tableOptions = defineProTableOptions<User>({
 *   columns: [
 *     { prop: 'id', label: 'ID' },
 *     { prop: 'name', label: '姓名' },
 *   ],
 *   request: async (params) => {
 *     const res = await fetchUsers(params)
 *     return { data: res.list, total: res.total }
 *   },
 *   toolbar: {
 *     showRefresh: true,
 *     showColumnSetting: true,
 *   },
 *   pagination: {
 *     pageSize: 20,
 *   },
 * })
 * ```
 */
export function defineProTableOptions<T = any>(
    options: ProTablePlusOptions<T>
): ProTablePlusOptions<T> {
    return options
}

// ==================== 主组件 Props ====================

/**
 * ProTablePlus 组件属性
 */
export interface ProTablePlusProps<T = any> {
    /** 统一配置选项 - 推荐使用此方式配置 */
    options?: ProTablePlusOptions<T>

    // ===== 以下为单独传入的属性（向后兼容，优先级低于 options） =====
    /** 静态数据源 */
    dataSource?: T[]
    /** 请求函数 */
    request?: ProTableRequest<T>
    /** 行的唯一标识字段 */
    rowKey?: string | ((row: T) => string)
    /** 卡片配置 */
    card?: boolean | ProTableCardConfig
    /** 工具栏配置 */
    toolbar?: boolean | ProTableToolbarConfig
    /** 列配置 */
    columns?: ProTableColumnPlus<T>[]
    /** 操作列配置 */
    actionColumn?: ProTableActionColumn<T>
    /** 选择配置 */
    selection?: boolean | ProTableSelectionConfig<T>
    /** 分页配置 */
    pagination?: boolean | ProTablePaginationConfig
    /** 导出配置 */
    export?: ProTableExportConfig
    /** 是否持久化列设置 */
    persistColumnSettings?: boolean
    /** 列设置存储key */
    columnSettingsKey?: string
    /** 是否显示边框 */
    border?: boolean
    /** 是否显示斑马纹 */
    stripe?: boolean
    /** 表格大小 */
    size?: 'large' | 'default' | 'small'
    /** 表格高度 */
    height?: string | number
    /** 表格最大高度 */
    maxHeight?: string | number
    /** 是否自动计算高度以适应容器，默认 true */
    autoHeight?: boolean
    /** 空数据文本 */
    emptyText?: string
    /** 是否显示加载状态 */
    loading?: boolean
}

// ==================== 组件事件 ====================

/**
 * ProTablePlus 组件事件
 */
export interface ProTablePlusEmits<T = any> {
    /** 选择变化 */
    (e: 'selection-change', selection: T[]): void
    /** 排序变化 */
    (e: 'sort-change', sort: { prop: string; order: 'ascending' | 'descending' | null }): void
    /** 过滤变化 */
    (e: 'filter-change', filters: Record<string, any>): void
    /** 行点击 */
    (e: 'row-click', row: T, column: any, event: Event): void
    /** 刷新 */
    (e: 'refresh'): void
    /** 导出全部 */
    (e: 'export-all', data: T[], format: ExportFormat): void
    /** 导出当前页 */
    (e: 'export-page', data: T[], format: ExportFormat): void
}

// ==================== 实例方法 ====================

/**
 * ProTablePlus 实例方法
 */
export interface ProTablePlusInstance<T = any> {
    /** 刷新表格（重新加载当前页） */
    refresh: () => Promise<void>
    /** 重置表格（回到第一页并重新加载） */
    reset: () => Promise<void>
    /** 获取选中的行 */
    getSelection: () => T[]
    /** 清空选中 */
    clearSelection: () => void
    /** 设置选中的行 */
    setSelection: (rows: T[]) => void
    /** 获取表格数据 */
    getData: () => T[]
    /** 设置加载状态 */
    setLoading: (loading: boolean) => void
    /** 获取 el-table 实例 */
    getTableRef: () => InstanceType<typeof ElTable> | undefined
    /** 重置列配置 */
    resetColumns: () => void
    /** 设置列可见性 */
    setColumnVisible: (prop: string, visible: boolean) => void
    /** 切换全屏模式 */
    toggleFullscreen: () => void
    /** 是否全屏 */
    isFullscreen: () => boolean
    /** 打印表格 */
    print: () => void
    /** 清空缓存 */
    clearCache: () => void
    /** 生成缓存 key */
    generateCacheKey: (params: any) => string
    /** 获取缓存数据 */
    getCachedData: (key: string) => any | null
    /** 设置缓存数据 */
    setCachedData: (key: string, data: any) => void
}

// ==================== 内部状态 ====================

/**
 * 表格内部状态
 */
export interface TableState<T = any> {
    /** 表格数据 */
    data: T[]
    /** 加载状态 */
    loading: boolean
    /** 错误信息 */
    error: Error | null
    /** 分页状态 */
    pagination: {
        page: number
        pageSize: number
        total: number
    }
    /** 排序状态 */
    sort: {
        prop: string
        order: 'ascending' | 'descending' | null
    }
    /** 过滤状态 */
    filters: Record<string, any>
    /** 选中的行 */
    selection: T[]
}

/**
 * 列状态
 */
export interface ColumnState {
    /** 列标识 */
    prop: string
    /** 是否可见 */
    visible: boolean
    /** 列顺序 */
    order: number
}
