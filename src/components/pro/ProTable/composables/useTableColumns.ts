/**
 * useTableColumns - 表格列管理逻辑
 */

import { ref, computed, watch, type Ref } from 'vue'
import type { ProTableColumnPlus, ColumnState } from '../types-plus'

export interface UseTableColumnsOptions<T> {
    /** 列配置 */
    columns: Ref<ProTableColumnPlus<T>[]>
    /** 是否持久化列设置 */
    persistColumnSettings?: boolean
    /** 列设置存储key */
    columnSettingsKey?: string
}

export interface UseTableColumnsReturn<T> {
    /** 列状态 */
    columnStates: Ref<ColumnState[]>
    /** 可见列 */
    visibleColumns: Ref<ProTableColumnPlus<T>[]>
    /** 可隐藏的列 */
    hideableColumns: Ref<ProTableColumnPlus<T>[]>
    /** 设置列可见性 */
    setColumnVisible: (prop: string, visible: boolean) => void
    /** 设置列顺序 */
    setColumnOrder: (props: string[]) => void
    /** 重置列配置 */
    resetColumns: () => void
    /** 保存列设置 */
    saveColumnSettings: () => void
    /** 加载列设置 */
    loadColumnSettings: () => void
}

export function useTableColumns<T = any>(
    options: UseTableColumnsOptions<T>
): UseTableColumnsReturn<T> {
    const { columns, persistColumnSettings = false, columnSettingsKey = 'pro-table-columns' } = options

    // 列状态
    const columnStates = ref<ColumnState[]>([])

    // 初始化列状态
    const initColumnStates = () => {
        columnStates.value = columns.value.map((col, index) => ({
            prop: col.prop,
            visible: col.visible !== false,
            order: col.order ?? index,
        }))
    }

    // 可见列
    const visibleColumns = computed(() => {
        const states = columnStates.value
        return columns.value
            .filter((col) => {
                // 如果列不可隐藏，始终显示
                if (col.hideable === false) return true
                // 根据状态判断是否显示
                const state = states.find((s) => s.prop === col.prop)
                return state ? state.visible : col.visible !== false
            })
            .sort((a, b) => {
                const stateA = states.find((s) => s.prop === a.prop)
                const stateB = states.find((s) => s.prop === b.prop)
                const orderA = stateA?.order ?? columns.value.indexOf(a)
                const orderB = stateB?.order ?? columns.value.indexOf(b)
                return orderA - orderB
            })
    })

    // 可隐藏的列
    const hideableColumns = computed(() => {
        return columns.value.filter((col) => col.hideable !== false)
    })

    // 设置列可见性
    const setColumnVisible = (prop: string, visible: boolean) => {
        const state = columnStates.value.find((s) => s.prop === prop)
        if (state) {
            state.visible = visible
            if (persistColumnSettings) {
                saveColumnSettings()
            }
        }
    }

    // 设置列顺序
    const setColumnOrder = (props: string[]) => {
        props.forEach((prop, index) => {
            const state = columnStates.value.find((s) => s.prop === prop)
            if (state) {
                state.order = index
            }
        })
        if (persistColumnSettings) {
            saveColumnSettings()
        }
    }

    // 重置列配置
    const resetColumns = () => {
        initColumnStates()
        if (persistColumnSettings) {
            localStorage.removeItem(columnSettingsKey)
        }
    }

    // 保存列设置到 localStorage
    const saveColumnSettings = () => {
        if (!persistColumnSettings) return
        try {
            localStorage.setItem(columnSettingsKey, JSON.stringify(columnStates.value))
        } catch (err) {
            console.warn('保存列设置失败:', err)
        }
    }

    // 从 localStorage 加载列设置
    const loadColumnSettings = () => {
        if (!persistColumnSettings) return
        try {
            const saved = localStorage.getItem(columnSettingsKey)
            if (saved) {
                const savedStates: ColumnState[] = JSON.parse(saved)
                // 合并保存的状态和当前列配置
                columnStates.value = columns.value.map((col, index) => {
                    const savedState = savedStates.find((s) => s.prop === col.prop)
                    return {
                        prop: col.prop,
                        visible: savedState ? savedState.visible : col.visible !== false,
                        order: savedState ? savedState.order : col.order ?? index,
                    }
                })
            }
        } catch (err) {
            console.warn('加载列设置失败:', err)
        }
    }

    // 监听列配置变化
    watch(
        columns,
        () => {
            if (persistColumnSettings) {
                loadColumnSettings()
            } else {
                initColumnStates()
            }
        },
        { immediate: true, deep: true }
    )

    return {
        columnStates,
        visibleColumns: visibleColumns as Ref<ProTableColumnPlus<T>[]>,
        hideableColumns: hideableColumns as Ref<ProTableColumnPlus<T>[]>,
        setColumnVisible,
        setColumnOrder,
        resetColumns,
        saveColumnSettings,
        loadColumnSettings,
    }
}
