/**
 * useTableExport - 表格导出逻辑
 */

import { type Ref, type ComputedRef } from 'vue'
import { ElMessage } from 'element-plus'
import type { ProTableExportConfig, ProTableColumnPlus, ExportFormat } from '../types-plus'

export interface UseTableExportOptions<T> {
    /** 导出配置 */
    exportConfig?: Ref<ProTableExportConfig | undefined> | ComputedRef<ProTableExportConfig | undefined>
    /** 列配置 */
    columns: Ref<ProTableColumnPlus<T>[]> | ComputedRef<ProTableColumnPlus<T>[]>
    /** 当前页数据 */
    pageData: Ref<T[]>
    /** 获取全部数据的函数 */
    getAllData?: () => Promise<T[]>
}

export interface UseTableExportReturn<T> {
    /** 导出全部数据 */
    exportAll: (format?: ExportFormat) => Promise<void>
    /** 导出当前页数据 */
    exportPage: (format?: ExportFormat) => void
    /** 导出数据为 CSV */
    exportToCsv: (data: T[], filename?: string) => void
    /** 导出数据为 JSON */
    exportToJson: (data: T[], filename?: string) => void
}

export function useTableExport<T = any>(
    options: UseTableExportOptions<T>
): UseTableExportReturn<T> {
    const { exportConfig, columns, pageData, getAllData } = options

    // 获取导出的列（排除操作列和不可见列）
    const getExportColumns = () => {
        return columns.value.filter(
            (col) => col.prop && col.prop !== 'actions' && !col.slotName?.includes('action')
        )
    }

    // 格式化单元格值
    const formatCellValue = (row: T, column: ProTableColumnPlus<T>): string => {
        const value = (row as any)[column.prop]
        if (column.formatter) {
            return String(column.formatter(row, column, value, 0))
        }
        if (value === null || value === undefined) {
            return ''
        }
        // 处理布尔值
        if (typeof value === 'boolean') {
            return value ? '是' : '否'
        }
        return String(value)
    }

    // 导出为 CSV
    const exportToCsv = (data: T[], filename?: string) => {
        try {
            if (!data || data.length === 0) {
                ElMessage.warning('没有可导出的数据')
                return
            }

            const exportColumns = getExportColumns()
            if (exportColumns.length === 0) {
                ElMessage.warning('没有可导出的列')
                return
            }

            console.log('导出列:', exportColumns.map(c => c.label))
            console.log('导出数据条数:', data.length)

            // 表头
            const headers = exportColumns.map((col) => col.label)

            // 数据行
            const rows = data.map((row) =>
                exportColumns.map((col) => {
                    const value = formatCellValue(row, col)
                    // 处理包含逗号、引号、换行的值
                    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
                        return `"${value.replace(/"/g, '""')}"`
                    }
                    return value
                })
            )

            // 组合 CSV 内容
            const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n')

            // 添加 BOM 以支持中文
            const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })

            // 下载文件
            const finalFilename = filename || exportConfig?.value?.filename || 'export'
            downloadBlob(blob, `${finalFilename}.csv`)

            ElMessage.success(`成功导出 ${data.length} 条数据`)
        } catch (err) {
            console.error('导出 CSV 失败:', err)
            ElMessage.error('导出失败')
        }
    }

    // 导出为 JSON
    const exportToJson = (data: T[], filename?: string) => {
        try {
            if (!data || data.length === 0) {
                ElMessage.warning('没有可导出的数据')
                return
            }

            const exportColumns = getExportColumns()

            // 只导出指定列的数据
            const exportData = data.map((row) => {
                const obj: Record<string, any> = {}
                exportColumns.forEach((col) => {
                    obj[col.label] = (row as any)[col.prop]
                })
                return obj
            })

            const jsonContent = JSON.stringify(exportData, null, 2)
            const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' })

            const finalFilename = filename || exportConfig?.value?.filename || 'export'
            downloadBlob(blob, `${finalFilename}.json`)

            ElMessage.success(`成功导出 ${data.length} 条数据`)
        } catch (err) {
            console.error('导出 JSON 失败:', err)
            ElMessage.error('导出失败')
        }
    }

    // 下载 Blob
    const downloadBlob = (blob: Blob, filename: string) => {
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        link.style.display = 'none'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
    }

    // 导出全部数据
    const exportAll = async (format: ExportFormat = 'csv') => {
        try {
            console.log('开始导出全部数据, 格式:', format)

            // 如果有自定义导出回调
            if (exportConfig?.value?.onExportAll) {
                let allData: T[] = []
                if (getAllData) {
                    allData = await getAllData()
                } else {
                    allData = pageData.value
                }
                exportConfig.value.onExportAll(allData, format)
                return
            }

            // 默认导出逻辑 - 导出当前页数据（因为没有获取全部数据的方法）
            let allData: T[] = []
            if (getAllData) {
                allData = await getAllData()
            } else {
                // 如果没有 getAllData，则导出当前页
                allData = pageData.value
                ElMessage.info('提示：当前导出的是本页数据，如需导出全部数据请配置 getAllData')
            }

            const finalFilename = (exportConfig?.value?.filename || 'export') + '-all'
            if (format === 'csv') {
                exportToCsv(allData, finalFilename)
            } else if (format === 'json') {
                exportToJson(allData, finalFilename)
            }
        } catch (err) {
            console.error('导出全部数据失败:', err)
            ElMessage.error('导出失败')
        }
    }

    // 导出当前页数据
    const exportPage = (format: ExportFormat = 'csv') => {
        try {
            console.log('开始导出当前页数据, 格式:', format, '数据条数:', pageData.value.length)

            // 如果有自定义导出回调
            if (exportConfig?.value?.onExportPage) {
                exportConfig.value.onExportPage(pageData.value, format)
                return
            }

            // 默认导出逻辑
            const finalFilename = (exportConfig?.value?.filename || 'export') + '-page'
            if (format === 'csv') {
                exportToCsv(pageData.value, finalFilename)
            } else if (format === 'json') {
                exportToJson(pageData.value, finalFilename)
            }
        } catch (err) {
            console.error('导出当前页数据失败:', err)
            ElMessage.error('导出失败')
        }
    }

    return {
        exportAll,
        exportPage,
        exportToCsv,
        exportToJson,
    }
}
