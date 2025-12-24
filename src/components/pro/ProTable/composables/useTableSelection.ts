/**
 * useTableSelection - 表格选择逻辑
 */

import { ref, type Ref } from 'vue'
import type { ElTable } from 'element-plus'
import type { ProTableSelectionConfig } from '../types-plus'

export interface UseTableSelectionOptions<T> {
    /** 选择配置 */
    selectionConfig?: Ref<ProTableSelectionConfig<T> | boolean | undefined>
    /** el-table 引用 */
    tableRef?: Ref<InstanceType<typeof ElTable> | undefined>
}

export interface UseTableSelectionReturn<T> {
    /** 选中的行 */
    selection: Ref<T[]>
    /** 获取选中的行 */
    getSelection: () => T[]
    /** 清空选中 */
    clearSelection: () => void
    /** 设置选中的行 */
    setSelection: (rows: T[]) => void
    /** 切换行选中状态 */
    toggleRowSelection: (row: T, selected?: boolean) => void
    /** 处理选择变化 */
    handleSelectionChange: (rows: T[]) => void
    /** 判断行是否可选 */
    isRowSelectable: (row: T, index: number) => boolean
}

export function useTableSelection<T = any>(
    options: UseTableSelectionOptions<T>
): UseTableSelectionReturn<T> {
    const { selectionConfig, tableRef } = options

    // 选中的行
    const selection = ref<T[]>([]) as Ref<T[]>

    // 获取选中的行
    const getSelection = (): T[] => {
        return selection.value
    }

    // 清空选中
    const clearSelection = () => {
        selection.value = []
        tableRef?.value?.clearSelection()
    }

    // 设置选中的行
    const setSelection = (rows: T[]) => {
        // 先清空
        tableRef?.value?.clearSelection()
        // 再设置
        rows.forEach((row) => {
            tableRef?.value?.toggleRowSelection(row, true)
        })
        selection.value = rows
    }

    // 切换行选中状态
    const toggleRowSelection = (row: T, selected?: boolean) => {
        tableRef?.value?.toggleRowSelection(row, selected)
    }

    // 处理选择变化
    const handleSelectionChange = (rows: T[]) => {
        selection.value = rows
    }

    // 判断行是否可选
    const isRowSelectable = (row: T, index: number): boolean => {
        const config = selectionConfig?.value
        if (!config || typeof config === 'boolean') {
            return true
        }
        if (config.selectable) {
            return config.selectable(row, index)
        }
        return true
    }

    return {
        selection,
        getSelection,
        clearSelection,
        setSelection,
        toggleRowSelection,
        handleSelectionChange,
        isRowSelectable,
    }
}
