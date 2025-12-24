/**
 * 文件上传相关类型定义
 */

// 上传文件信息
export interface UploadFileInfo {
    url: string
    filename: string
    size: number
    md5: string
    mime: string
}

// 单文件上传响应
export interface SingleUploadResult {
    url: string
    filename: string
    size: number
    md5: string
    mime: string
}

// 多文件上传响应
export interface MultipleUploadResult {
    files: UploadFileInfo[]
}
