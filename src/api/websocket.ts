/**
 * WebSocket 管理 API
 */

import request from '@/utils/request'
import type {
    OnlineUsersResult,
    OnlineCountResult,
    UserOnlineStatusResult,
    SendMessageParams,
    DisconnectParams
} from '@/types'

/**
 * 获取在线用户列表
 */
export const getOnlineUsers = () =>
    request<OnlineUsersResult>({
        url: '/websocket/online-users',
        method: 'get'
    })

/**
 * 获取在线用户数量
 */
export const getOnlineCount = () =>
    request<OnlineCountResult>({
        url: '/websocket/online-count',
        method: 'get'
    })

/**
 * 检查用户是否在线
 */
export const checkUserOnline = (userId: number) =>
    request<UserOnlineStatusResult>({
        url: `/websocket/user/${userId}/online`,
        method: 'get'
    })

/**
 * 向指定用户发送消息
 */
export const sendMessageToUser = (userId: number, data: SendMessageParams) =>
    request({
        url: `/websocket/user/${userId}/send`,
        method: 'post',
        data
    })

/**
 * 广播消息
 */
export const broadcastMessage = (data: SendMessageParams) =>
    request({
        url: '/websocket/broadcast',
        method: 'post',
        data
    })

/**
 * 强制断开用户连接
 */
export const disconnectUser = (userId: number, data?: DisconnectParams) =>
    request({
        url: `/websocket/user/${userId}/disconnect`,
        method: 'post',
        data
    })
