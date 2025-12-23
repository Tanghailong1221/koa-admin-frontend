/**
 * 表格导出工具
 * 
 * 功能：
 * - 导出为 CSV
 * - 导出为 Excel
 * - 导出为 JSON
 * - 自定义导出格式
 */

import type { ProTableColumn } from '@/components/pro'

/**
 * 导出格式
 */
export const ExportFormat = {
    CSV: 'csv',
    EXCEL: 'excel',
    JSON: 'json'
} as const

export type ExportFormatValue = typeof ExportFormat[keyof typeof ExportFormat]

/**
 * 导出选项
 */
export interface ExportOptions<T = any> {
    /** 文件名 */
    filename?: string
    /** 导出格式 */
    format?: ExportFormatValue
    /** 要导出的列 */
    columns?: ProTableColumn<T>[]
    /** 要导出的数据 */
    data: T[]
    /** 是否包含表头 */
    includeHeader?: boolean
    /** 字段分隔符（CSV） */
    delimiter?: string
    /** 自定义格式化函数 */
    formatter?: (row: T, column: ProTableColumn<T>) => any
}

/**
 * 表格导出类
 */
export class TableExporter {
    /**
     * 导出为 CSV
     */
    static exportCSV<T = any>(options: ExportOptions<T>): void {
        const {
            filename = 'export.csv',
            columns = [],
            data = [],
            includeHeader = true,
            delimiter = ',',
            formatter
        } = options

        const lines: string[] = []

        // 添加表头
        if (includeHeader && columns.length > 0) {
            const headers = columns.map(col => this.escapeCSV(col.label))
            lines.push(headers.join(delimiter))
        }

        // 添加数据行
        data.forEach(row => {
            const values = columns.map(col => {
                let value: any

                if (formatter) {
                    value = formatter(row, col)
                } else if (col.formatter) {
                    value = col.formatter(row, col as any, row[col.prop], 0)
                } else {
                    value = row[col.prop]
                }

                return this.escapeCSV(String(value ?? ''))
            })
            lines.push(values.join(delimiter))
        })

        // 生成 CSV 内容
        const csvContent = lines.join('\n')

        // 下载文件
        this.downloadFile(csvContent, filename, 'text/csv;charset=utf-8;')
    }

    /**
     * 导出为 JSON
     */
    static exportJSON<T = any>(options: ExportOptions<T>): void {
        const {
            filename = 'export.json',
            columns = [],
            data = [],
            formatter
        } = options

        // 转换数据
        const exportData = data.map(row => {
            const item: any = {}

            columns.forEach(col => {
                let value: any

                if (formatter) {
                    value = formatter(row, col)
                } else if (col.formatter) {
                    value = col.formatter(row, col as any, row[col.prop], 0)
                } else {
                    value = row[col.prop]
                }

                item[col.prop] = value
            })

            return item
        })

        // 生成 JSON 内容
        const jsonContent = JSON.stringify(exportData, null, 2)

        // 下载文件
        this.downloadFile(jsonContent, filename, 'application/json;charset=utf-8;')
    }

    /**
     * 导出（根据格式自动选择）
     */
    static export<T = any>(options: ExportOptions<T>): void {
        const format = options.format || ExportFormat.CSV

        switch (format) {
            case ExportFormat.CSV:
                this.exportCSV(options)
                break
            case ExportFormat.JSON:
                this.exportJSON(options)
                break
            case ExportFormat.EXCEL:
                // Excel 导出需要额外的库（如 xlsx），这里暂时使用 CSV
                console.warn('[TableExporter] Excel 导出暂未实现，使用 CSV 代替')
                this.exportCSV({ ...options, filename: options.filename?.replace('.xlsx', '.csv') })
                break
            default:
                console.error('[TableExporter] 不支持的导出格式:', format)
        }
    }

    /**
     * 转义 CSV 字段
     */
    private static escapeCSV(value: string): string {
        // 如果包含逗号、引号或换行符，需要用引号包裹
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
            // 引号需要转义为两个引号
            return `"${value.replace(/"/g, '""')}"`
        }
        return value
    }

    /**
     * 下载文件
     */
    private static downloadFile(content: string, filename: string, mimeType: string): void {
        // 创建 Blob
        const blob = new Blob([content], { type: mimeType })

        // 创建下载链接
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = filename

        // 触发下载
        document.body.appendChild(link)
        link.click()

        // 清理
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
    }
}

/**
 * 导出表格数据
 */
export function exportTable<T = any>(options: ExportOptions<T>): void {
    TableExporter.export(options)
}

/**
 * 导出为 CSV
 */
export function exportCSV<T = any>(options: ExportOptions<T>): void {
    TableExporter.exportCSV(options)
}

/**
 * 导出为 JSON
 */
export function exportJSON<T = any>(options: ExportOptions<T>): void {
    TableExporter.exportJSON(options)
}
