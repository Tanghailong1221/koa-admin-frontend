/**
 * 职位管理 API
 */

import request from '@/utils/request'
import type {
    PageResult,
    PositionInfo,
    PositionListParams,
    CreatePositionParams,
    UpdatePositionParams
} from '@/types'

/**
 * 获取职位列表
 */
export const getPositionList = (params: PositionListParams) =>
    request<PageResult<PositionInfo>>({
        url: '/position/list',
        method: 'get',
        params
    })

/**
 * 获取职位详情
 */
export const getPositionDetail = (id: number) =>
    request<PositionInfo>({
        url: `/position/${id}`,
        method: 'get'
    })

/**
 * 创建职位
 */
export const createPosition = (data: CreatePositionParams) =>
    request<PositionInfo>({
        url: '/position',
        method: 'post',
        data
    })

/**
 * 更新职位
 */
export const updatePosition = (id: number, data: UpdatePositionParams) =>
    request<PositionInfo>({
        url: `/position/${id}`,
        method: 'put',
        data
    })

/**
 * 删除职位
 */
export const deletePosition = (id: number) =>
    request({
        url: `/position/${id}`,
        method: 'delete'
    })
