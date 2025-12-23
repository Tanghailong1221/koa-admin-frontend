/**
 * 上传组件类型定义
 */

/**
 * 上传文件状态
 */
export enum UploadStatus {
    /** 等待上传 */
    WAITING = 'waiting',
    /** 上传中 */
    UPLOADING = 'uploading',
    /** 上传成功 */
    SUCCESS = 'success',
    /** 上传失败 */
    ERROR = 'error',
    /** 已取消 */
    CANCELED = 'canceled'
}

/**
 * 上传文件项
 */
export interface UploadFile {
    /** 唯一标识 */
    uid: string
    /** 文件名 */
    name: string
    /** 文件大小（字节） */
    size: number
    /** 文件类型 */
    type: string
    /** 原始文件对象 */
    raw: File
    /** 上传状态 */
    status: UploadStatus
    /** 上传进度（0-100） */
    progress: number
    /** 上传后的 URL */
    url?: string
    /** 错误信息 */
    error?: string
    /** 缩略图 URL（图片） */
    thumbUrl?: string
    /** 响应数据 */
    response?: any
}

/**
 * 上传配置
 */
export interface UploadConfig {
    /** 上传地址 */
    action: string
    /** 请求方法 */
    method?: 'POST' | 'PUT'
    /** 请求头 */
    headers?: Record<string, string>
    /** 额外的表单数据 */
    data?: Record<string, any>
    /** 文件字段名 */
    name?: string
    /** 是否携带 cookie */
    withCredentials?: boolean
    /** 超时时间（毫秒） */
    timeout?: number
}

/**
 * 文件验证规则
 */
export interface FileValidationRule {
    /** 允许的文件类型（MIME 类型或扩展名） */
    accept?: string[]
    /** 最大文件大小（字节） */
    maxSize?: number
    /** 最小文件大小（字节） */
    minSize?: number
    /** 最大文件数量 */
    maxCount?: number
    /** 自定义验证函数 */
    validator?: (file: File) => boolean | Promise<boolean>
}

/**
 * 上传事件
 */
export interface UploadEvents {
    /** 文件选择后 */
    onSelect?: (files: File[]) => void
    /** 开始上传前 */
    onBeforeUpload?: (file: File) => boolean | Promise<boolean>
    /** 上传进度 */
    onProgress?: (file: UploadFile, progress: number) => void
    /** 上传成功 */
    onSuccess?: (file: UploadFile, response: any) => void
    /** 上传失败 */
    onError?: (file: UploadFile, error: Error) => void
    /** 文件移除 */
    onRemove?: (file: UploadFile) => void
    /** 文件列表变化 */
    onChange?: (fileList: UploadFile[]) => void
}

/**
 * 上传响应
 */
export interface UploadResponse {
    /** 是否成功 */
    success: boolean
    /** 文件 URL */
    url?: string
    /** 响应数据 */
    data?: any
    /** 错误信息 */
    message?: string
}
