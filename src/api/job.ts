/**
 * 定时任务管理 API
 */

import request from '@/utils/request'
import type { JobInfo } from '@/types'

/**
 * 获取任务列表
 */
export const getJobList = () =>
    request<JobInfo[]>({
        url: '/job/list',
        method: 'get'
    })

/**
 * 获取任务详情
 */
export const getJobDetail = (name: string) =>
    request<JobInfo>({
        url: `/job/detail/${name}`,
        method: 'get'
    })

/**
 * 启动指定任务
 */
export const startJob = (name: string) =>
    request({
        url: `/job/start/${name}`,
        method: 'post'
    })

/**
 * 停止指定任务
 */
export const stopJob = (name: string) =>
    request({
        url: `/job/stop/${name}`,
        method: 'post'
    })

/**
 * 启动所有任务
 */
export const startAllJobs = () =>
    request({
        url: '/job/start-all',
        method: 'post'
    })

/**
 * 停止所有任务
 */
export const stopAllJobs = () =>
    request({
        url: '/job/stop-all',
        method: 'post'
    })
