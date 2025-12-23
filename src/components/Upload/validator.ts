/**
 * 文件验证工具
 */

import type { FileValidationRule } from './types'
import { getFileExtension } from './uploader'

/**
 * 验证结果
 */
export interface ValidationResult {
    /** 是否通过 */
    valid: boolean
    /** 错误信息 */
    message?: string
}

/**
 * 文件验证器类
 */
export class FileValidator {
    private rules: FileValidationRule

    constructor(rules: FileValidationRule = {}) {
        this.rules = rules
    }

    /**
     * 验证文件
     */
    async validate(file: File): Promise<ValidationResult> {
        // 验证文件类型
        if (this.rules.accept && this.rules.accept.length > 0) {
            const typeResult = this.validateType(file)
            if (!typeResult.valid) {
                return typeResult
            }
        }

        // 验证文件大小
        if (this.rules.maxSize !== undefined) {
            const maxSizeResult = this.validateMaxSize(file)
            if (!maxSizeResult.valid) {
                return maxSizeResult
            }
        }

        if (this.rules.minSize !== undefined) {
            const minSizeResult = this.validateMinSize(file)
            if (!minSizeResult.valid) {
                return minSizeResult
            }
        }

        // 自定义验证
        if (this.rules.validator) {
            try {
                const valid = await this.rules.validator(file)
                if (!valid) {
                    return {
                        valid: false,
                        message: '文件验证失败'
                    }
                }
            } catch (error) {
                return {
                    valid: false,
                    message: error instanceof Error ? error.message : '文件验证失败'
                }
            }
        }

        return { valid: true }
    }

    /**
     * 验证文件类型
     */
    private validateType(file: File): ValidationResult {
        const accept = this.rules.accept!
        const fileType = file.type
        const fileExt = getFileExtension(file.name)

        // 检查 MIME 类型或扩展名
        const isValid = accept.some(item => {
            // MIME 类型匹配
            if (item.includes('/')) {
                // 支持通配符，如 image/*
                if (item.endsWith('/*')) {
                    const prefix = item.slice(0, -2)
                    return fileType.startsWith(prefix)
                }
                return fileType === item
            }
            // 扩展名匹配
            return fileExt === item.replace('.', '').toLowerCase()
        })

        if (!isValid) {
            return {
                valid: false,
                message: `不支持的文件类型，仅支持: ${accept.join(', ')}`
            }
        }

        return { valid: true }
    }

    /**
     * 验证最大文件大小
     */
    private validateMaxSize(file: File): ValidationResult {
        const maxSize = this.rules.maxSize!
        if (file.size > maxSize) {
            return {
                valid: false,
                message: `文件大小不能超过 ${this.formatSize(maxSize)}`
            }
        }
        return { valid: true }
    }

    /**
     * 验证最小文件大小
     */
    private validateMinSize(file: File): ValidationResult {
        const minSize = this.rules.minSize!
        if (file.size < minSize) {
            return {
                valid: false,
                message: `文件大小不能小于 ${this.formatSize(minSize)}`
            }
        }
        return { valid: true }
    }

    /**
     * 格式化文件大小
     */
    private formatSize(bytes: number): string {
        if (bytes === 0) return '0 B'
        const k = 1024
        const sizes = ['B', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
    }
}

/**
 * 验证文件数量
 */
export function validateFileCount(
    currentCount: number,
    maxCount?: number
): ValidationResult {
    if (maxCount !== undefined && currentCount > maxCount) {
        return {
            valid: false,
            message: `最多只能上传 ${maxCount} 个文件`
        }
    }
    return { valid: true }
}
