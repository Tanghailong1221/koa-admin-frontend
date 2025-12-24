/**
 * 日志相关类型定义
 */

import type { LoginStatus } from './api'

// 操作日志信息
export interface OperationLogInfo {
    id: number
    username: string
    operation: string
    method: string
    url: string
    params?: string
    ip: string
    userAgent?: string
    duration: number
    status: number
    errorMsg?: string
    createdAt: string
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
    username: string
    ip: string
    location?: string
    browser?: string
    os?: string
    status: LoginStatus
    message?: string
    createdAt: string
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
