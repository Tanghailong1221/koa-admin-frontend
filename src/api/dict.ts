/**
 * 数据字典 API
 */

import request from '@/utils/request'
import type {
    PageResult,
    DictInfo,
    DictListParams,
    CreateDictParams,
    UpdateDictParams
} from '@/types'

/**
 * 根据类型获取字典列表
 */
export const getDictByType = (type: string) =>
    request<DictInfo[]>({
        url: `/dict/type/${type}`,
        method: 'get'
    })

/**
 * 获取字典列表
 */
export const getDictList = (params: DictListParams) =>
    request<PageResult<DictInfo>>({
        url: '/dict/list',
        method: 'get',
        params
    })

/**
 * 获取字典详情
 */
export const getDictDetail = (id: number) =>
    request<DictInfo>({
        url: `/dict/${id}`,
        method: 'get'
    })

/**
 * 创建字典
 */
export const createDict = (data: CreateDictParams) =>
    request<DictInfo>({
        url: '/dict',
        method: 'post',
        data
    })

/**
 * 更新字典
 */
export const updateDict = (id: number, data: UpdateDictParams) =>
    request<DictInfo>({
        url: `/dict/${id}`,
        method: 'put',
        data
    })

/**
 * 删除字典
 */
export const deleteDict = (id: number) =>
    request({
        url: `/dict/${id}`,
        method: 'delete'
    })
