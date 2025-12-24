/**
 * 认证相关 API
 */

import request from '@/utils/request'
import type {
  LoginParams,
  LoginResult,
  RefreshTokenResult,
  UserInfo,
  ChangePasswordParams
} from '@/types'

/**
 * 用户登录
 */
export const login = (data: LoginParams) =>
  request<LoginResult>({
    url: '/user/login',
    method: 'post',
    data
  })

/**
 * 获取当前用户信息
 */
export const getCurrentUser = () =>
  request<UserInfo>({
    url: '/user/current',
    method: 'get'
  })

/**
 * 刷新 Token
 */
export const refreshToken = (refreshToken: string) =>
  request<RefreshTokenResult>({
    url: '/user/refresh-token',
    method: 'post',
    data: { refreshToken }
  })

/**
 * 退出登录
 */
export const logout = (refreshToken?: string) =>
  request({
    url: '/user/logout',
    method: 'post',
    data: refreshToken ? { refreshToken } : undefined
  })

/**
 * 修改密码
 */
export const changePassword = (data: ChangePasswordParams) =>
  request({
    url: '/user/change-password',
    method: 'post',
    data
  })

// 兼容旧的导出名称
export const loginApi = login
export const logoutApi = logout
export const refreshTokenApi = refreshToken
export const getProfileApi = getCurrentUser
