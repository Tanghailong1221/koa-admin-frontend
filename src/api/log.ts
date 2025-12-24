/**
 * 日志管理 API
 */

import request, { instance } from '@/utils/request'
import type {
    PageResult,
    OperationLogInfo,
    OperationLogParams,
    LoginLogInfo,
    LoginLogParams
} from '@/types'

/**
 * 获取操作日志列表
 */
export const getOperationLogList = (params: OperationLogParams) =>
    request<PageResult<OperationLogInfo>>({
        url: '/log/operation/list',
        method: 'get',
        params
    })

/**
 * 获取操作日志详情
 */
export const getOperationLogDetail = (id: number) =>
    request<OperationLogInfo>({
        url: `/log/operation/${id}`,
        method: 'get'
    })

/**
 * 导出操作日志
 */
export const exportOperationLog = (params?: OperationLogParams) =>
    instance({
        url: '/log/operation/export',
        method: 'get',
        params,
        responseType: 'blob'
    })

/**
 * 获取登录日志列表
 */
export const getLoginLogList = (params: LoginLogParams) =>
    request<PageResult<LoginLogInfo>>({
        url: '/log/login/list',
        method: 'get',
        params
    })

/**
 * 导出登录日志
 */
export const exportLoginLog = (params?: LoginLogParams) =>
    instance({
        url: '/log/login/export',
        method: 'get',
        params,
        responseType: 'blob'
    })
