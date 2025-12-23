/**
 * 图片优化工具
 * 
 * 功能：
 * - 图片 URL 优化（调整大小、质量、格式）
 * - 响应式图片 srcset 生成
 * - WebP 格式支持与回退
 * - CDN 参数处理
 * 
 * @example
 * ```ts
 * import { imageOptimizer } from '@/utils/image-optimizer'
 * 
 * // 优化图片
 * const url = imageOptimizer.optimize('https://cdn.example.com/image.jpg', {
 *   width: 800,
 *   quality: 80,
 *   format: 'webp'
 * })
 * 
 * // 生成响应式 srcset
 * const srcset = imageOptimizer.getResponsiveSrcset(
 *   'https://cdn.example.com/image.jpg',
 *   [480, 768, 1200]
 * )
 * ```
 */

/**
 * 图片优化配置
 */
export interface ImageOptimizeOptions {
    /** 宽度 */
    width?: number
    /** 高度 */
    height?: number
    /** 质量 (1-100) */
    quality?: number
    /** 格式 */
    format?: 'webp' | 'jpeg' | 'png' | 'avif'
    /** 是否裁剪（默认 false，等比缩放） */
    crop?: boolean
    /** 是否锐化 */
    sharpen?: boolean
    /** 是否模糊 */
    blur?: number
}

/**
 * 图片尺寸预设
 */
export const IMAGE_SIZES = {
    /** 缩略图 */
    thumbnail: { width: 150, height: 150 },
    /** 小图 */
    small: { width: 480, height: 320 },
    /** 中图 */
    medium: { width: 768, height: 512 },
    /** 大图 */
    large: { width: 1200, height: 800 },
    /** 超大图 */
    xlarge: { width: 1920, height: 1080 }
} as const

/**
 * 图片质量预设
 */
export const IMAGE_QUALITY = {
    /** 缩略图（可以更低质量） */
    thumbnail: 60,
    /** 普通图片 */
    normal: 80,
    /** 高质量图片 */
    high: 90,
    /** 原图质量 */
    original: 100
} as const

/**
 * 图片优化器
 */
export class ImageOptimizer {
    private cdnBase: string
    private cdnType: 'aliyun' | 'qiniu' | 'tencent' | 'custom'

    constructor(cdnBase: string, cdnType: 'aliyun' | 'qiniu' | 'tencent' | 'custom' = 'aliyun') {
        this.cdnBase = cdnBase
        this.cdnType = cdnType
    }

    /**
     * 获取优化后的图片 URL
     */
    optimize(url: string, options: ImageOptimizeOptions = {}): string {
        // 如果不是 CDN 图片，直接返回
        if (!this.isCdnImage(url)) {
            return url
        }

        const {
            width,
            height,
            quality = IMAGE_QUALITY.normal,
            format,
            crop = false,
            sharpen = false,
            blur
        } = options

        // 根据 CDN 类型生成参数
        switch (this.cdnType) {
            case 'aliyun':
                return this.optimizeAliyun(url, { width, height, quality, format, crop, sharpen, blur })
            case 'qiniu':
                return this.optimizeQiniu(url, { width, height, quality, format, crop })
            case 'tencent':
                return this.optimizeTencent(url, { width, height, quality, format, crop })
            default:
                return url
        }
    }

    /**
     * 阿里云 OSS 图片处理
     */
    private optimizeAliyun(url: string, options: ImageOptimizeOptions): string {
        const { width, height, quality, format, crop, sharpen, blur } = options
        const params: string[] = []

        // 调整大小
        if (width || height) {
            const mode = crop ? 'crop' : 'resize'
            const sizeParams: string[] = []
            if (width) sizeParams.push(`w_${width}`)
            if (height) sizeParams.push(`h_${height}`)
            params.push(`${mode},${sizeParams.join(',')}`)
        }

        // 质量
        if (quality && quality < 100) {
            params.push(`quality,q_${quality}`)
        }

        // 格式转换
        if (format) {
            params.push(`format,${format}`)
        }

        // 锐化
        if (sharpen) {
            params.push('sharpen,100')
        }

        // 模糊
        if (blur) {
            params.push(`blur,r_${blur},s_${blur}`)
        }

        // 拼接参数
        if (params.length > 0) {
            const separator = url.includes('?') ? '&' : '?'
            return `${url}${separator}x-oss-process=image/${params.join('/')}`
        }

        return url
    }

    /**
     * 七牛云图片处理
     */
    private optimizeQiniu(url: string, options: ImageOptimizeOptions): string {
        const { width, height, quality, format, crop } = options
        const params: string[] = []

        // 调整大小
        if (width || height) {
            const mode = crop ? 'imageMogr2/crop' : 'imageMogr2/thumbnail'
            if (width && height) {
                params.push(`${mode}/${width}x${height}`)
            } else if (width) {
                params.push(`${mode}/${width}x`)
            } else if (height) {
                params.push(`${mode}/x${height}`)
            }
        }

        // 质量
        if (quality && quality < 100) {
            params.push(`quality/${quality}`)
        }

        // 格式转换
        if (format) {
            params.push(`format/${format}`)
        }

        // 拼接参数
        if (params.length > 0) {
            const separator = url.includes('?') ? '|' : '?'
            return `${url}${separator}${params.join('|')}`
        }

        return url
    }

    /**
     * 腾讯云 COS 图片处理
     */
    private optimizeTencent(url: string, options: ImageOptimizeOptions): string {
        const { width, height, quality, format, crop } = options
        const params: string[] = []

        // 调整大小
        if (width || height) {
            const mode = crop ? 'crop' : 'thumbnail'
            if (width && height) {
                params.push(`imageMogr2/${mode}/${width}x${height}`)
            } else if (width) {
                params.push(`imageMogr2/${mode}/${width}x`)
            } else if (height) {
                params.push(`imageMogr2/${mode}/x${height}`)
            }
        }

        // 质量
        if (quality && quality < 100) {
            params.push(`quality/${quality}`)
        }

        // 格式转换
        if (format) {
            params.push(`format/${format}`)
        }

        // 拼接参数
        if (params.length > 0) {
            const separator = url.includes('?') ? '&' : '?'
            return `${url}${separator}${params.join('/')}`
        }

        return url
    }

    /**
     * 获取响应式图片 srcset
     */
    getResponsiveSrcset(
        url: string,
        sizes: number[],
        quality?: number
    ): string {
        const finalQuality = quality !== undefined ? quality : IMAGE_QUALITY.normal
        return sizes
            .map((size) => {
                const optimizedUrl = this.optimize(url, { width: size, quality: finalQuality })
                return `${optimizedUrl} ${size}w`
            })
            .join(', ')
    }

    /**
     * 获取 WebP 和回退格式
     */
    getWebPWithFallback(url: string, options: Omit<ImageOptimizeOptions, 'format'> = {}) {
        return {
            webp: this.optimize(url, { ...options, format: 'webp' }),
            fallback: this.optimize(url, { ...options, format: 'jpeg' })
        }
    }

    /**
     * 获取多种格式（WebP、AVIF、JPEG）
     */
    getMultipleFormats(url: string, options: Omit<ImageOptimizeOptions, 'format'> = {}) {
        return {
            avif: this.optimize(url, { ...options, format: 'avif' }),
            webp: this.optimize(url, { ...options, format: 'webp' }),
            jpeg: this.optimize(url, { ...options, format: 'jpeg' })
        }
    }

    /**
     * 根据预设尺寸优化图片
     */
    optimizeByPreset(
        url: string,
        preset: keyof typeof IMAGE_SIZES,
        quality?: number
    ): string {
        const size = IMAGE_SIZES[preset]
        const defaultQuality = preset === 'thumbnail' ? IMAGE_QUALITY.thumbnail : IMAGE_QUALITY.normal
        return this.optimize(url, {
            width: size.width,
            height: size.height,
            quality: quality !== undefined ? quality : defaultQuality
        })
    }

    /**
     * 判断是否为 CDN 图片
     */
    private isCdnImage(url: string): boolean {
        if (!this.cdnBase) {
            return false
        }
        return url.startsWith(this.cdnBase)
    }

    /**
     * 获取图片信息（宽高、格式、大小）
     */
    async getImageInfo(url: string): Promise<{
        width: number
        height: number
        format: string
        size: number
    } | null> {
        try {
            const img = new Image()
            img.src = url

            await new Promise((resolve, reject) => {
                img.onload = resolve
                img.onerror = reject
            })

            // 获取图片大小（需要发起请求）
            const response = await fetch(url, { method: 'HEAD' })
            const size = parseInt(response.headers.get('content-length') || '0', 10)

            // 从 URL 或 Content-Type 推断格式
            const contentType = response.headers.get('content-type') || ''
            const format = contentType.split('/')[1] || url.split('.').pop() || 'unknown'

            return {
                width: img.naturalWidth,
                height: img.naturalHeight,
                format,
                size
            }
        } catch (error) {
            console.error('[ImageOptimizer] 获取图片信息失败:', error)
            return null
        }
    }
}

/**
 * 创建默认图片优化器实例
 */
export const imageOptimizer = new ImageOptimizer(
    import.meta.env.VITE_CDN_BASE || '',
    (import.meta.env.VITE_CDN_TYPE as 'aliyun' | 'qiniu' | 'tencent') || 'aliyun'
)

/**
 * 便捷函数：优化图片
 */
export function optimizeImage(url: string, options?: ImageOptimizeOptions): string {
    return imageOptimizer.optimize(url, options)
}

/**
 * 便捷函数：获取响应式 srcset
 */
export function getResponsiveSrcset(url: string, sizes: number[], quality?: number): string {
    return imageOptimizer.getResponsiveSrcset(url, sizes, quality)
}

/**
 * 便捷函数：获取 WebP 和回退
 */
export function getWebPWithFallback(
    url: string,
    options?: Omit<ImageOptimizeOptions, 'format'>
) {
    return imageOptimizer.getWebPWithFallback(url, options)
}
