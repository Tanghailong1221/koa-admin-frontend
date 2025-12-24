/**
 * 数据导入导出相关类型定义
 */

// 导入结果摘要
export interface ImportSummary {
    total: number
    valid: number
    invalid: number
    success: number
    failed: number
}

// 导入错误信息
export interface ImportError {
    row: number
    field?: string
    message: string
}

// 导入结果
export interface ImportResult {
    summary: ImportSummary
    validationErrors: ImportError[]
    importErrors: ImportError[]
}

// 导出用户参数
export interface ExportUserParams {
    keyword?: string
    status?: number
}

// 导出角色参数
export interface ExportRoleParams {
    keyword?: string
}

// 模板类型
export type TemplateType = 'user' | 'role'
