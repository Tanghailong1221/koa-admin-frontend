/**
 * 权限管理 API
 */

import request from '@/utils/request'
import type {
    PageResult,
    PermissionInfo,
    PermissionTreeNode,
    PermissionListParams,
    CreatePermissionParams,
    UpdatePermissionParams
} from '@/types'

/**
 * 获取权限树
 */
export const getPermissionTree = () =>
    request<PermissionTreeNode[]>({
        url: '/permission/tree',
        method: 'get'
    })

/**
 * 获取所有权限（不分页）
 */
export const getAllPermissions = () =>
    request<PermissionInfo[]>({
        url: '/permission/all',
        method: 'get'
    })

/**
 * 获取权限列表
 */
export const getPermissionList = (params: PermissionListParams) =>
    request<PageResult<PermissionInfo>>({
        url: '/permission/list',
        method: 'get',
        params
    })

/**
 * 获取权限详情
 */
export const getPermissionDetail = (id: number) =>
    request<PermissionInfo>({
        url: `/permission/${id}`,
        method: 'get'
    })

/**
 * 创建权限
 */
export const createPermission = (data: CreatePermissionParams) =>
    request<PermissionInfo>({
        url: '/permission',
        method: 'post',
        data
    })

/**
 * 更新权限
 */
export const updatePermission = (id: number, data: UpdatePermissionParams) =>
    request<PermissionInfo>({
        url: `/permission/${id}`,
        method: 'put',
        data
    })

/**
 * 删除权限
 */
export const deletePermission = (id: number) =>
    request({
        url: `/permission/${id}`,
        method: 'delete'
    })
