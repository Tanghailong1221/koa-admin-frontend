/**
 * 用户管理 API
 */

import request from '@/utils/request'
import type {
  PageResult,
  UserInfo,
  UserListParams,
  CreateUserParams,
  UpdateUserParams,
  ChangeStatusParams
} from '@/types'

/**
 * 获取用户列表
 */
export const getUserList = (params: UserListParams) =>
  request<PageResult<UserInfo>>({
    url: '/user/list',
    method: 'get',
    params
  })

/**
 * 获取用户详情
 */
export const getUserDetail = (id: number) =>
  request<UserInfo>({
    url: `/user/${id}`,
    method: 'get'
  })

/**
 * 创建用户
 */
export const createUser = (data: CreateUserParams) =>
  request<UserInfo>({
    url: '/user',
    method: 'post',
    data
  })

/**
 * 更新用户
 */
export const updateUser = (id: number, data: UpdateUserParams) =>
  request<UserInfo>({
    url: `/user/${id}`,
    method: 'put',
    data
  })

/**
 * 删除用户
 */
export const deleteUser = (id: number) =>
  request({
    url: `/user/${id}`,
    method: 'delete'
  })

/**
 * 修改用户状态
 */
export const changeUserStatus = (id: number, data: ChangeStatusParams) =>
  request({
    url: `/user/${id}/status`,
    method: 'put',
    data
  })

// 兼容旧的导出名称
export const fetchUserList = getUserList
