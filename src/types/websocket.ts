/**
 * WebSocket 相关类型定义
 */

// 在线用户信息
export interface OnlineUser {
    userId: number
    username: string
    connectedAt: string
}

// 在线用户列表响应
export interface OnlineUsersResult {
    users: OnlineUser[]
    total: number
}

// 在线数量响应
export interface OnlineCountResult {
    count: number
}

// 用户在线状态响应
export interface UserOnlineStatusResult {
    userId: number
    isOnline: boolean
}

// 发送消息参数
export interface SendMessageParams {
    event: string
    data?: any
}

// 断开连接参数
export interface DisconnectParams {
    reason?: string
}
