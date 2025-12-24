/**
 * 权限相关类型定义
 */

import type { PermissionType } from './api'

// 权限信息
export interface PermissionInfo {
    id: number
    permName: string
    permCode: string
    permType: PermissionType
    parentId: number
    children?: PermissionInfo[]
    createdAt?: string
    updatedAt?: string
}

// 权限树节点
export interface PermissionTreeNode extends PermissionInfo {
    children?: PermissionTreeNode[]
}

// 权限列表查询参数
export interface PermissionListParams {
    page?: number
    size?: number
    keyword?: string
    permType?: PermissionType
    parentId?: number
}

// 创建权限参数
export interface CreatePermissionParams {
    permName: string
    permCode: string
    permType: PermissionType
    parentId?: number
}

// 更新权限参数
export interface UpdatePermissionParams {
    permName?: string
    permCode?: string
    permType?: PermissionType
    parentId?: number
}
