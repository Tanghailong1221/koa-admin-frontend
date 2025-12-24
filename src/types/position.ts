/**
 * 职位相关类型定义
 */

import type { Status } from './api'

// 职位信息
export interface PositionInfo {
    id: number
    positionName: string
    positionCode: string
    orgId: number
    sort: number
    status: Status
    createdAt?: string
    updatedAt?: string
}

// 职位列表查询参数
export interface PositionListParams {
    page?: number
    size?: number
    keyword?: string
    status?: Status
    orgId?: number
}

// 创建职位参数
export interface CreatePositionParams {
    positionName: string
    positionCode: string
    orgId: number
    sort?: number
    status?: Status
}

// 更新职位参数
export interface UpdatePositionParams {
    positionName?: string
    positionCode?: string
    orgId?: number
    sort?: number
    status?: Status
}
