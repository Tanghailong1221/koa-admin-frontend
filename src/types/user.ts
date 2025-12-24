/**
 * 用户相关类型定义
 */

import type { Status, Gender } from './api'

// 用户信息
export interface UserInfo {
    id: number
    username: string
    nickname?: string
    avatar?: string
    email?: string
    phone?: string
    gender?: Gender
    birthday?: string
    status: Status
    roleId?: number
    roleName?: string
    orgId?: number
    orgName?: string
    positionId?: number
    positionName?: string
    permissions?: string[]
    createdAt?: string
    updatedAt?: string
}

// 登录请求参数
export interface LoginParams {
    username: string
    password: string
}

// 登录响应
export interface LoginResult {
    token: string
    refreshToken: string
    userInfo: UserInfo
}

// 刷新 Token 响应
export interface RefreshTokenResult {
    token: string
    refreshToken: string
}

// 用户列表查询参数
export interface UserListParams {
    page?: number
    size?: number
    keyword?: string
    status?: Status
    roleId?: number
    orgId?: number
    positionId?: number
}

// 创建用户参数
export interface CreateUserParams {
    username: string
    password: string
    roleId: number
    status?: Status
    orgId?: number
    positionId?: number
    avatar?: string
    phone?: string
    email?: string
    gender?: Gender
    birthday?: string
}

// 更新用户参数
export interface UpdateUserParams {
    username?: string
    roleId?: number
    status?: Status
    orgId?: number
    positionId?: number
    avatar?: string
    phone?: string
    email?: string
    gender?: Gender
    birthday?: string
}

// 修改密码参数
export interface ChangePasswordParams {
    oldPassword: string
    newPassword: string
}

// 修改状态参数
export interface ChangeStatusParams {
    status: Status
}
