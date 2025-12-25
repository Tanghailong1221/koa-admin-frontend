/**
 * 日志相关类型定义
 */

import type { LoginStatus } from './api'

// 操作日志信息
export interface OperationLogInfo {
    id: number
    userId: number
    username: string
    operation: string
    method: string
    url: string
    params?: string
    result?: string
    ip: string
    userAgent?: string
    duration: number
    status: number
    errorMsg?: string
    createTime: string
    createdAt?: string // 兼容字段
}

// 操作日志查询参数
export interface OperationLogParams {
    page?: number
    pageSize?: number
    username?: string
    operation?: string
    method?: string
    startTime?: string
    endTime?: string
}

// 登录日志信息
export interface LoginLogInfo {
    id: number
    userId: number
    username: string
    ip: string
    location?: string
    browser?: string
    os?: string
    userAgent?: string
    status: LoginStatus
    message?: string
    loginTime: string
    createdAt?: string // 兼容字段
}

// 登录日志查询参数
export interface LoginLogParams {
    page?: number
    pageSize?: number
    username?: string
    status?: LoginStatus
    startTime?: string
    endTime?: string
}
