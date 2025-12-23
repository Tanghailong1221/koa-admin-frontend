/**
 * ProTable 类型定义
 */

/**
 * 列配置
 */
export interface ProTableColumn<T = any> {
    /** 列的唯一标识 */
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
    /** 对齐方式 */
    align?: 'left' | 'center' | 'right'
    /** 是否显示 */
    visible?: boolean
    /** 自定义渲染函数 */
    render?: (row: T, column: ProTableColumn<T>, index: number) => any
    /** 格式化函数 */
    formatter?: (row: T, column: any, cellValue: any, index: number) => any
    /** 插槽名称 */
    slotName?: string
    /** 是否可隐藏（列设置中） */
    hideable?: boolean
    /** 列的额外属性 */
    [key: string]: any
}

/**
 * 分页配置
 */
export interface ProTablePagination {
    /** 当前页码 */
    page: number
    /** 每页条数 */
    pageSize: number
    /** 总条数 */
    total: number
    /** 每页条数选项 */
    pageSizes?: number[]
    /** 分页布局 */
    layout?: string
}

/**
 * 排序配置
 */
export interface ProTableSort {
    /** 排序字段 */
    prop: string
    /** 排序方向 */
    order: 'ascending' | 'descending' | null
}

/**
 * 过滤配置
 */
export interface ProTableFilter {
    /** 过滤字段 */
    prop: string
    /** 过滤值 */
    value: any
}

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

/**
 * 工具栏配置
 */
export interface ProTableToolbar {
    /** 是否显示刷新按钮 */
    refresh?: boolean
    /** 是否显示列设置 */
    columnSetting?: boolean
    /** 是否显示导出按钮 */
    export?: boolean
    /** 自定义操作插槽 */
    actions?: boolean
}

/**
 * ProTable 属性
 */
export interface ProTableProps<T = any> {
    /** 列配置 */
    columns: ProTableColumn<T>[]
    /** 请求函数 */
    request?: ProTableRequest<T>
    /** 数据源（静态数据） */
    dataSource?: T[]
    /** 是否显示分页 */
    pagination?: boolean | ProTablePagination
    /** 工具栏配置 */
    toolbar?: boolean | ProTableToolbar
    /** 是否显示边框 */
    border?: boolean
    /** 是否显示斑马纹 */
    stripe?: boolean
    /** 表格大小 */
    size?: 'large' | 'default' | 'small'
    /** 是否显示加载状态 */
    loading?: boolean
    /** 行的唯一标识字段 */
    rowKey?: string
    /** 是否可选择行 */
    selectable?: boolean
    /** 空数据文本 */
    emptyText?: string
    /** 表格高度 */
    height?: string | number
    /** 表格最大高度 */
    maxHeight?: string | number
}

/**
 * ProTable 事件
 */
export interface ProTableEmits<T = any> {
    /** 选择变化 */
    (e: 'selection-change', selection: T[]): void
    /** 排序变化 */
    (e: 'sort-change', sort: ProTableSort): void
    /** 过滤变化 */
    (e: 'filter-change', filters: Record<string, any>): void
    /** 行点击 */
    (e: 'row-click', row: T, column: any, event: Event): void
    /** 刷新 */
    (e: 'refresh'): void
    /** 导出 */
    (e: 'export'): void
}

/**
 * ProTable 实例方法
 */
export interface ProTableInstance<T = any> {
    /** 刷新表格 */
    refresh: () => Promise<void>
    /** 重置表格（回到第一页） */
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
}
