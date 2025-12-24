/**
 * 数据导入导出 API
 */

import request, { instance } from '@/utils/request'
import type {
    ImportResult,
    ExportUserParams,
    ExportRoleParams,
    TemplateType
} from '@/types'

/**
 * 导出用户数据
 */
export const exportUsers = (params?: ExportUserParams) =>
    instance({
        url: '/export/users',
        method: 'get',
        params,
        responseType: 'blob'
    })

/**
 * 批量导出用户数据（大数据量）
 */
export const exportUsersLarge = (params?: ExportUserParams) =>
    instance({
        url: '/export/users/large',
        method: 'get',
        params,
        responseType: 'blob'
    })

/**
 * 导出角色数据
 */
export const exportRoles = (params?: ExportRoleParams) =>
    instance({
        url: '/export/roles',
        method: 'get',
        params,
        responseType: 'blob'
    })

/**
 * 导入用户数据
 */
export const importUsers = (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    return request<ImportResult>({
        url: '/export/users/import',
        method: 'post',
        data: formData,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}

/**
 * 导入角色数据
 */
export const importRoles = (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    return request<ImportResult>({
        url: '/export/roles/import',
        method: 'post',
        data: formData,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}

/**
 * 下载导入模板
 */
export const downloadTemplate = (type: TemplateType) =>
    instance({
        url: `/export/template/${type}`,
        method: 'get',
        responseType: 'blob'
    })

/**
 * 下载文件的辅助函数
 */
export const downloadFile = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
}
