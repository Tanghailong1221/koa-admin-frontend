/**
 * 系统监控相关类型定义
 */

// 服务状态
export interface ServiceStatus {
    status: 'ok' | 'error' | 'warning'
    type: string
    message?: string
}

// 内存状态
export interface MemoryStatus {
    heapUsedPercent: number
    status: 'ok' | 'warning' | 'critical'
}

// 健康检查响应
export interface HealthCheckResult {
    status: 'ok' | 'error'
    timestamp: string
    services: {
        database: ServiceStatus
        redis: ServiceStatus
        [key: string]: ServiceStatus
    }
    uptime: number
    memory: MemoryStatus
}

// 监控指标
export interface MonitorMetrics {
    cpu: {
        usage: number
        cores: number
    }
    memory: {
        total: number
        used: number
        free: number
        usagePercent: number
    }
    disk: {
        total: number
        used: number
        free: number
        usagePercent: number
    }
    network: {
        bytesIn: number
        bytesOut: number
    }
    requests: {
        total: number
        success: number
        failed: number
        avgResponseTime: number
    }
}
