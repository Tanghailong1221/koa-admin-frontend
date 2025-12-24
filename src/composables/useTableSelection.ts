/**
 * 表格选择 Composable
 * 
 * 功能：
 * - 跨页选择
 * - 全选/取消全选
 * - 选择状态管理
 * - 选择持久化
 */

import { ref, computed } from 'vue'

/**
 * 选择选项
 */
export interface TableSelectionOptions<T = any> {
    /** 行唯一标识字段 */
    rowKey?: string
    /** 是否启用跨页选择 */
    crossPage?: boolean
    /** 最大选择数量 */
    maxSelection?: number
}

/**
 * 表格选择 Hook
 */
export function useTableSelection<T extends Record<string, any>>(
    options: TableSelectionOptions<T> = {}
) {
    // 配置
    const config = {
        rowKey: options.rowKey ?? 'id',
        crossPage: options.crossPage ?? false,
        maxSelection: options.maxSelection
    }

    // 状态
    const selectedRows = ref<T[]>([])
    const selectedKeys = ref<Set<any>>(new Set())

    /**
     * 获取行的唯一标识
     */
    const getRowKey = (row: T): any => {
        return row[config.rowKey]
    }

    /**
     * 检查行是否已选中
     */
    const isRowSelected = (row: T): boolean => {
        const key = getRowKey(row)
        return selectedKeys.value.has(key)
    }

    /**
     * 选中行
     */
    const selectRow = (row: T): boolean => {
        // 检查最大选择数量
        if (config.maxSelection && selectedRows.value.length >= config.maxSelection) {
            console.warn('[TableSelection] 已达到最大选择数量:', config.maxSelection)
            return false
        }

        const key = getRowKey(row)
        if (selectedKeys.value.has(key)) {
            return false
        }

        selectedKeys.value.add(key)
        selectedRows.value.push(row)
        return true
    }

    /**
     * 取消选中行
     */
    const unselectRow = (row: T): boolean => {
        const key = getRowKey(row)
        if (!selectedKeys.value.has(key)) {
            return false
        }

        selectedKeys.value.delete(key)
        const index = selectedRows.value.findIndex(r => getRowKey(r) === key)
        if (index !== -1) {
            selectedRows.value.splice(index, 1)
        }
        return true
    }

    /**
     * 切换行选中状态
     */
    const toggleRow = (row: T): boolean => {
        if (isRowSelected(row)) {
            return unselectRow(row)
        } else {
            return selectRow(row)
        }
    }

    /**
     * 选中多行
     */
    const selectRows = (rows: T[]): number => {
        let count = 0
        for (const row of rows) {
            if (selectRow(row)) {
                count++
            }
        }
        return count
    }

    /**
     * 取消选中多行
     */
    const unselectRows = (rows: T[]): number => {
        let count = 0
        for (const row of rows) {
            if (unselectRow(row)) {
                count++
            }
        }
        return count
    }

    /**
     * 全选当前页
     */
    const selectAll = (rows: T[]): void => {
        selectRows(rows)
    }

    /**
     * 取消全选当前页
     */
    const unselectAll = (rows: T[]): void => {
        unselectRows(rows)
    }

    /**
     * 清空选择
     */
    const clearSelection = (): void => {
        selectedRows.value = []
        selectedKeys.value.clear()
    }

    /**
     * 设置选中的行
     */
    const setSelection = (rows: T[]): void => {
        clearSelection()
        selectRows(rows)
    }

    /**
     * 获取选中的行
     */
    const getSelection = (): T[] => {
        return [...selectedRows.value]
    }

    /**
     * 获取选中的行键
     */
    const getSelectionKeys = (): any[] => {
        return Array.from(selectedKeys.value)
    }

    /**
     * 检查当前页是否全选
     */
    const isAllSelected = (rows: T[]): boolean => {
        if (rows.length === 0) return false
        return rows.every(row => isRowSelected(row))
    }

    /**
     * 检查当前页是否部分选中
     */
    const isIndeterminate = (rows: T[]): boolean => {
        if (rows.length === 0) return false
        const selectedCount = rows.filter(row => isRowSelected(row)).length
        return selectedCount > 0 && selectedCount < rows.length
    }

    // 计算属性
    const selectionCount = computed(() => selectedRows.value.length)
    const hasSelection = computed(() => selectedRows.value.length > 0)

    return {
        // 状态
        selectedRows,
        selectedKeys,
        selectionCount,
        hasSelection,

        // 方法
        isRowSelected,
        selectRow,
        unselectRow,
        toggleRow,
        selectRows,
        unselectRows,
        selectAll,
        unselectAll,
        clearSelection,
        setSelection,
        getSelection,
        getSelectionKeys,
        isAllSelected,
        isIndeterminate
    }
}
