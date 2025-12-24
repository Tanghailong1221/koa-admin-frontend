/**
 * 角色管理 API
 */

import request from '@/utils/request'
import type {
  PageResult,
  RoleInfo,
  RoleListParams,
  CreateRoleParams,
  UpdateRoleParams,
  AssignPermissionsParams
} from '@/types'

// 兼容旧的类型名称
export type RoleItem = RoleInfo

/**
 * 获取角色列表
 */
export const getRoleList = (params: RoleListParams) =>
  request<PageResult<RoleInfo>>({
    url: '/role/list',
    method: 'get',
    params
  })

/**
 * 获取角色详情
 */
export const getRoleDetail = (id: number) =>
  request<RoleInfo>({
    url: `/role/${id}`,
    method: 'get'
  })

/**
 * 创建角色
 */
export const createRole = (data: CreateRoleParams) =>
  request<RoleInfo>({
    url: '/role',
    method: 'post',
    data
  })

/**
 * 更新角色
 */
export const updateRole = (id: number, data: UpdateRoleParams) =>
  request<RoleInfo>({
    url: `/role/${id}`,
    method: 'put',
    data
  })

/**
 * 删除角色
 */
export const deleteRole = (id: number) =>
  request({
    url: `/role/${id}`,
    method: 'delete'
  })

/**
 * 分配权限
 */
export const assignPermissions = (id: number, data: AssignPermissionsParams) =>
  request({
    url: `/role/${id}/permissions`,
    method: 'post',
    data
  })

// 兼容旧的导出名称
export const fetchRoleList = getRoleList
