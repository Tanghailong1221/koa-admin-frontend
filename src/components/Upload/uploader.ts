/**
 * 文件上传器
 */

import type { UploadConfig, UploadFile, UploadResponse } from './types'

/**
 * 文件上传器类
 */
export class FileUploader {
    private config: UploadConfig
    private xhr: XMLHttpRequest | null = null
    private aborted = false

    constructor(config: UploadConfig) {
        this.config = config
    }

    /**
     * 上传文件
     */
    upload(
        file: UploadFile,
        onProgress?: (progress: number) => void
    ): Promise<UploadResponse> {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest()
            this.xhr = xhr

            // 上传进度
            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                    const progress = Math.round((e.loaded / e.total) * 100)
                    onProgress?.(progress)
                }
            })

            // 上传完成
            xhr.addEventListener('load', () => {
                if (this.aborted) {
                    return
                }

                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const response = JSON.parse(xhr.responseText)
                        resolve({
                            success: true,
                            url: response.url || response.data?.url,
                            data: response.data || response,
                            message: response.message
                        })
                    } catch (error) {
                        resolve({
                            success: true,
                            data: xhr.responseText
                        })
                    }
                } else {
                    reject(new Error(`上传失败: ${xhr.status} ${xhr.statusText}`))
                }
            })

            // 上传错误
            xhr.addEventListener('error', () => {
                if (!this.aborted) {
                    reject(new Error('上传失败: 网络错误'))
                }
            })

            // 上传超时
            xhr.addEventListener('timeout', () => {
                if (!this.aborted) {
                    reject(new Error('上传失败: 请求超时'))
                }
            })

            // 上传中止
            xhr.addEventListener('abort', () => {
                if (this.aborted) {
                    reject(new Error('上传已取消'))
                }
            })

            // 配置请求
            const method = this.config.method || 'POST'
            xhr.open(method, this.config.action)

            // 设置请求头
            if (this.config.headers) {
                Object.entries(this.config.headers).forEach(([key, value]) => {
                    xhr.setRequestHeader(key, value)
                })
            }

            // 设置超时
            if (this.config.timeout) {
                xhr.timeout = this.config.timeout
            }

            // 设置 withCredentials
            if (this.config.withCredentials) {
                xhr.withCredentials = true
            }

            // 构建表单数据
            const formData = new FormData()
            const fileName = this.config.name || 'file'
            formData.append(fileName, file.raw)

            // 添加额外数据
            if (this.config.data) {
                Object.entries(this.config.data).forEach(([key, value]) => {
                    formData.append(key, value)
                })
            }

            // 发送请求
            xhr.send(formData)
        })
    }

    /**
     * 取消上传
     */
    abort(): void {
        if (this.xhr) {
            this.aborted = true
            this.xhr.abort()
            this.xhr = null
        }
    }

    /**
     * 是否已取消
     */
    isAborted(): boolean {
        return this.aborted
    }
}

/**
 * 生成唯一 ID
 */
export function generateUid(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}

/**
 * 获取文件扩展名
 */
export function getFileExtension(filename: string): string {
    const lastDot = filename.lastIndexOf('.')
    return lastDot > 0 ? filename.substring(lastDot + 1).toLowerCase() : ''
}

/**
 * 检查是否为图片
 */
export function isImageFile(file: File): boolean {
    return file.type.startsWith('image/')
}

/**
 * 生成图片缩略图
 */
export function generateImageThumb(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        if (!isImageFile(file)) {
            reject(new Error('不是图片文件'))
            return
        }

        const reader = new FileReader()
        reader.onload = (e) => {
            resolve(e.target?.result as string)
        }
        reader.onerror = () => {
            reject(new Error('读取文件失败'))
        }
        reader.readAsDataURL(file)
    })
}
