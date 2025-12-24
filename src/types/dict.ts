/**
 * 数据字典相关类型定义
 */

import type { Status } from './api'

// 字典信息
export interface DictInfo {
    id: number
    dictType: string
    dictCode: string
    dictValue: string
    dictLabel: string
    sort: number
    status: Status
    createdAt?: string
    updatedAt?: string
}

// 字典列表查询参数
export interface DictListParams {
    page?: number
    size?: number
    dictType?: string
    status?: Status
}

// 创建字典参数
export interface CreateDictParams {
    dictType: string
    dictCode: string
    dictValue: string
    dictLabel: string
    sort?: number
    status?: Status
}

// 更新字典参数
export interface UpdateDictParams {
    dictType?: string
    dictCode?: string
    dictValue?: string
    dictLabel?: string
    sort?: number
    status?: Status
}
