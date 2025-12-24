/**
 * 机构管理 API
 */

import request from '@/utils/request'
import type {
    PageResult,
    Status,
    OrgInfo,
    OrgTreeNode,
    OrgListParams,
    CreateOrgParams,
    UpdateOrgParams,
    PositionInfo
} from '@/types'

/**
 * 获取机构树
 */
export const getOrgTree = (status?: Status) =>
    request<OrgTreeNode[]>({
        url: '/org/tree',
        method: 'get',
        params: status !== undefined ? { status } : undefined
    })

/**
 * 获取机构列表
 */
export const getOrgList = (params: OrgListParams) =>
    request<PageResult<OrgInfo>>({
        url: '/org/list',
        method: 'get',
        params
    })

/**
 * 获取机构详情
 */
export const getOrgDetail = (id: number) =>
    request<OrgInfo>({
        url: `/org/${id}`,
        method: 'get'
    })

/**
 * 获取机构下的职位列表
 */
export const getOrgPositions = (id: number) =>
    request<PositionInfo[]>({
        url: `/org/${id}/positions`,
        method: 'get'
    })

/**
 * 创建机构
 */
export const createOrg = (data: CreateOrgParams) =>
    request<OrgInfo>({
        url: '/org',
        method: 'post',
        data
    })

/**
 * 更新机构
 */
export const updateOrg = (id: number, data: UpdateOrgParams) =>
    request<OrgInfo>({
        url: `/org/${id}`,
        method: 'put',
        data
    })

/**
 * 删除机构
 */
export const deleteOrg = (id: number) =>
    request({
        url: `/org/${id}`,
        method: 'delete'
    })
