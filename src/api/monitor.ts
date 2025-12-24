/**
 * 系统监控 API
 */

import request from '@/utils/request'
import type { MonitorMetrics, HealthCheckResult } from '@/types'

/**
 * 获取监控指标
 */
export const getMonitorMetrics = () =>
    request<MonitorMetrics>({
        url: '/monitor/metrics',
        method: 'get'
    })

/**
 * 健康检查
 */
export const healthCheck = () =>
    request<HealthCheckResult>({
        url: '/monitor/health',
        method: 'get'
    })

/**
 * 重置监控指标
 */
export const resetMetrics = () =>
    request({
        url: '/monitor/metrics/reset',
        method: 'post'
    })
