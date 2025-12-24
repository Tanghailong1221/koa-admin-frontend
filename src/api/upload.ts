/**
 * 文件上传 API
 */

import request from '@/utils/request'
import type { SingleUploadResult, MultipleUploadResult } from '@/types'

/**
 * 单文件上传
 */
export const uploadSingle = (file: File, onProgress?: (percent: number) => void) => {
    const formData = new FormData()
    formData.append('file', file)

    return request<SingleUploadResult>({
        url: '/upload/single',
        method: 'post',
        data: formData,
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
                const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
                onProgress(percent)
            }
        }
    })
}

/**
 * 多文件上传
 */
export const uploadMultiple = (files: File[], onProgress?: (percent: number) => void) => {
    const formData = new FormData()
    files.forEach((file) => {
        formData.append('files', file)
    })

    return request<MultipleUploadResult>({
        url: '/upload/multiple',
        method: 'post',
        data: formData,
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
                const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
                onProgress(percent)
            }
        }
    })
}
