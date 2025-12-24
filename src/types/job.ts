/**
 * 定时任务相关类型定义
 */

// 任务状态
export type JobStatus = 'scheduled' | 'running' | 'stopped' | 'completed' | 'failed'

// 任务执行状态
export type JobRunStatus = 'success' | 'failed' | 'running'

// 任务信息
export interface JobInfo {
    name: string
    schedule: string
    description: string
    status: JobStatus
    lastRunTime?: string
    nextRunTime?: string
    lastRunStatus?: JobRunStatus
    runCount: number
    successCount: number
    failedCount: number
}
