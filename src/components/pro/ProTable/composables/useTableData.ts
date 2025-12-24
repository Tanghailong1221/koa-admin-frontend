/**
 * useTableData - 表格数据加载逻辑
 */

import { ref, watch, type Ref } from 'vue'
import type {
    ProTableRequest,
    ProTableRequestParams,
    ProTablePaginationConfig,
} from '../types-plus'

export interface UseTableDataOptions<T> {
    /** 静态数据源 */
    dataSource?: Ref<T[] | undefined>
    /** 请求函数 */
    request?: ProTableRequest<T>
    /** 分页配置 */
    paginationConfig?: Ref<ProTablePaginationConfig | boolean | undefined>
    /** 立即加载 */
    immediate?: boolean
}

export interface UseTableDataReturn<T> {
    /** 表格数据 */
    data: Ref<T[]>
    /** 加载状态 */
    loading: Ref<boolean>
    /** 错误信息 */
    error: Ref<Error | null>
    /** 分页状态 */
    pagination: Ref<{
        page: number
        pageSize: number
        total: number
    }>
    /** 排序状态 */
    sort: Ref<{
        prop: string
        order: 'ascending' | 'descending' | null
    }>
    /** 过滤状态 */
    filters: Ref<Record<string, any>>
    /** 加载数据 */
    loadData: () => Promise<void>
    /** 刷新数据 */
    refresh: () => Promise<void>
    /** 重置并加载 */
    reset: () => Promise<void>
    /** 设置加载状态 */
    setLoading: (val: boolean) => void
    /** 处理分页变化 */
    handlePageChange: (page: number) => void
    /** 处理每页条数变化 */
    handleSizeChange: (size: number) => void
    /** 处理排序变化 */
    handleSortChange: (sortInfo: { prop: string; order: 'ascending' | 'descending' | null }) => void
    /** 处理过滤变化 */
    handleFilterChange: (filterInfo: Record<string, any>) => void
}

export function useTableData<T = any>(
    options: UseTableDataOptions<T>
): UseTableDataReturn<T> {
    const { dataSource, request, paginationConfig, immediate = true } = options

    // 状态
    const data = ref<T[]>([]) as Ref<T[]>
    const loading = ref(false)
    const error = ref<Error | null>(null)

    const pagination = ref({
        page: 1,
        pageSize: 10,
        total: 0,
    })

    const sort = ref<{
        prop: string
        order: 'ascending' | 'descending' | null
    }>({
        prop: '',
        order: null,
    })

    const filters = ref<Record<string, any>>({})

    // 初始化分页配置
    const initPagination = () => {
        const config = paginationConfig?.value
        if (config && typeof config === 'object') {
            if (config.page !== undefined) pagination.value.page = config.page
            if (config.pageSize !== undefined) pagination.value.pageSize = config.pageSize
            if (config.total !== undefined) pagination.value.total = config.total
        }
    }

    // 加载数据
    const loadData = async () => {
        // 如果有静态数据源，直接使用
        if (dataSource?.value) {
            data.value = dataSource.value
            pagination.value.total = dataSource.value.length
            return
        }

        // 如果没有请求函数，直接返回
        if (!request) {
            return
        }

        try {
            loading.value = true
            error.value = null

            // 构建请求参数
            const params: ProTableRequestParams = {
                page: pagination.value.page,
                pageSize: pagination.value.pageSize,
                filters: filters.value,
            }

            // 添加排序参数
            if (sort.value.prop && sort.value.order) {
                params.sortBy = sort.value.prop
                params.sortOrder = sort.value.order === 'ascending' ? 'asc' : 'desc'
            }

            // 调用请求函数
            const response = await request(params)

            // 更新数据
            data.value = response.data
            pagination.value.total = response.total

            if (response.page !== undefined) {
                pagination.value.page = response.page
            }
            if (response.pageSize !== undefined) {
                pagination.value.pageSize = response.pageSize
            }
        } catch (err) {
            error.value = err instanceof Error ? err : new Error(String(err))
            console.error('加载表格数据失败:', err)
        } finally {
            loading.value = false
        }
    }

    // 刷新数据
    const refresh = async () => {
        await loadData()
    }

    // 重置并加载
    const reset = async () => {
        pagination.value.page = 1
        sort.value = { prop: '', order: null }
        filters.value = {}
        await loadData()
    }

    // 设置加载状态
    const setLoading = (val: boolean) => {
        loading.value = val
    }

    // 处理分页变化
    const handlePageChange = (page: number) => {
        pagination.value.page = page
        loadData()
    }

    // 处理每页条数变化
    const handleSizeChange = (size: number) => {
        pagination.value.pageSize = size
        pagination.value.page = 1
        loadData()
    }

    // 处理排序变化
    const handleSortChange = (sortInfo: { prop: string; order: 'ascending' | 'descending' | null }) => {
        sort.value = sortInfo
        loadData()
    }

    // 处理过滤变化
    const handleFilterChange = (filterInfo: Record<string, any>) => {
        filters.value = filterInfo
        pagination.value.page = 1
        loadData()
    }

    // 监听静态数据源变化
    if (dataSource) {
        watch(
            dataSource,
            () => {
                if (dataSource.value) {
                    loadData()
                }
            },
            { deep: true }
        )
    }

    // 初始化
    initPagination()
    if (immediate) {
        loadData()
    }

    return {
        data,
        loading,
        error,
        pagination,
        sort,
        filters,
        loadData,
        refresh,
        reset,
        setLoading,
        handlePageChange,
        handleSizeChange,
        handleSortChange,
        handleFilterChange,
    }
}
