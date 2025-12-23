/**
 * 表格列配置 Composable
 * 
 * 功能：
 * - 列配置持久化
 * - 列显示/隐藏
 * - 列排序
 * - 列宽调整
 */

import { ref, watch } from 'vue'
import { CacheManager } from '@/utils/cache'
import type { ProTableColumn } from '@/components/pro'

/**
 * 列配置选项
 */
export interface TableColumnsOptions {
    /** 表格唯一标识（用于持久化） */
    tableId: string
    /** 是否启用持久化 */
    persist?: boolean
    /** 持久化过期时间（毫秒，默认 30 天） */
    ttl?: number
}

/**
 * 列配置状态
 */
interface ColumnState {
    /** 列标识 */
    prop: string
    /** 是否可见 */
    visible: boolean
    /** 列宽 */
    width?: string | number
    /** 排序索引 */
    order: number
}

const DEFAULT_TTL = 30 * 24 * 60 * 60 * 1000 // 30 天

/**
 * 表格列配置 Hook
 */
export function useTableColumns<T = any>(
    initialColumns: ProTableColumn<T>[],
    options: TableColumnsOptions
) {
    // 配置
    const config = {
        tableId: options.tableId,
        persist: options.persist ?? true,
        ttl: options.ttl ?? DEFAULT_TTL
    }

    // 缓存管理器
    const cacheManager = new CacheManager({
        storage: localStorage,
        prefix: 'table_columns_'
    })

    // 状态
    const columns = ref<ProTableColumn<T>[]>([...initialColumns])
    const columnStates = ref<Map<string, ColumnState>>(new Map())

    /**
     * 初始化列状态
     */
    const initColumnStates = () => {
        columns.value.forEach((col, index) => {
            columnStates.value.set(col.prop, {
                prop: col.prop,
                visible: col.visible !== false,
                width: col.width,
                order: index
            })
        })
    }

    /**
     * 加载持久化的列配置
     */
    const loadPersistedConfig = () => {
        if (!config.persist) return

        const persisted = cacheManager.get<ColumnState[]>(config.tableId)
        if (!persisted) return

        // 更新列状态
        persisted.forEach(state => {
            columnStates.value.set(state.prop, state)
        })

        // 应用列配置
        applyColumnStates()

        console.log('[TableColumns] 加载持久化配置:', config.tableId)
    }

    /**
     * 持久化列配置
     */
    const persistConfig = () => {
        if (!config.persist) return

        const states = Array.from(columnStates.value.values())
        cacheManager.set(config.tableId, states, config.ttl)

        console.log('[TableColumns] 持久化配置:', config.tableId)
    }

    /**
     * 应用列状态到列配置
     */
    const applyColumnStates = () => {
        // 按排序索引排序
        const sortedColumns = [...columns.value].sort((a, b) => {
            const stateA = columnStates.value.get(a.prop)
            const stateB = columnStates.value.get(b.prop)
            return (stateA?.order ?? 0) - (stateB?.order ?? 0)
        })

        // 应用可见性和宽度
        columns.value = sortedColumns.map(col => {
            const state = columnStates.value.get(col.prop)
            if (!state) return col

            return {
                ...col,
                visible: state.visible,
                width: state.width ?? col.width
            }
        })
    }

    /**
     * 设置列可见性
     */
    const setColumnVisible = (prop: string, visible: boolean) => {
        const state = columnStates.value.get(prop)
        if (!state) return

        state.visible = visible
        applyColumnStates()
        persistConfig()
    }

    /**
     * 切换列可见性
     */
    const toggleColumnVisible = (prop: string) => {
        const state = columnStates.value.get(prop)
        if (!state) return

        setColumnVisible(prop, !state.visible)
    }

    /**
     * 设置列宽
     */
    const setColumnWidth = (prop: string, width: string | number) => {
        const state = columnStates.value.get(prop)
        if (!state) return

        state.width = width
        applyColumnStates()
        persistConfig()
    }

    /**
     * 设置列排序
     */
    const setColumnOrder = (prop: string, order: number) => {
        const state = columnStates.value.get(prop)
        if (!state) return

        state.order = order
        applyColumnStates()
        persistConfig()
    }

    /**
     * 移动列
     */
    const moveColumn = (fromIndex: number, toIndex: number) => {
        if (fromIndex === toIndex) return
        if (fromIndex < 0 || fromIndex >= columns.value.length) return
        if (toIndex < 0 || toIndex >= columns.value.length) return

        const newColumns = [...columns.value]
        const [movedColumn] = newColumns.splice(fromIndex, 1)
        newColumns.splice(toIndex, 0, movedColumn)

        // 更新排序索引
        newColumns.forEach((col, index) => {
            const state = columnStates.value.get(col.prop)
            if (state) {
                state.order = index
            }
        })

        columns.value = newColumns
        persistConfig()
    }

    /**
     * 重置列配置
     */
    const reset = () => {
        columns.value = [...initialColumns]
        initColumnStates()
        persistConfig()
    }

    /**
     * 清除持久化配置
     */
    const clearPersisted = () => {
        cacheManager.remove(config.tableId)
        console.log('[TableColumns] 清除持久化配置:', config.tableId)
    }

    /**
     * 获取可见列
     */
    const getVisibleColumns = () => {
        return columns.value.filter(col => col.visible !== false)
    }

    /**
     * 获取隐藏列
     */
    const getHiddenColumns = () => {
        return columns.value.filter(col => col.visible === false)
    }

    /**
     * 获取列状态
     */
    const getColumnState = (prop: string) => {
        return columnStates.value.get(prop)
    }

    // 初始化
    initColumnStates()
    loadPersistedConfig()

    // 监听列变化
    watch(
        columns,
        () => {
            // 列变化时不自动持久化，由具体操作触发
        },
        { deep: true }
    )

    return {
        // 状态
        columns,
        columnStates,

        // 方法
        setColumnVisible,
        toggleColumnVisible,
        setColumnWidth,
        setColumnOrder,
        moveColumn,
        reset,
        clearPersisted,
        getVisibleColumns,
        getHiddenColumns,
        getColumnState
    }
}
