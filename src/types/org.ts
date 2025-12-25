/**
 * 机构相关类型定义
 */

import type { Status } from './api'

// 机构信息
export interface OrgInfo {
    id: number
    orgName: string
    orgCode: string
    parentId: number
    sort: number
    status: Status
    leader?: string
    phone?: string
    email?: string
    remark?: string
    children?: OrgInfo[]
    createdAt?: string
    updatedAt?: string
}

// 机构树节点
export interface OrgTreeNode extends OrgInfo {
    children?: OrgTreeNode[]
}

// 机构列表查询参数
export interface OrgListParams {
    page?: number
    size?: number
    keyword?: string
    status?: Status
}

// 创建机构参数
export interface CreateOrgParams {
    orgName: string
    orgCode: string
    parentId?: number
    sort?: number
    status?: Status
    leader?: string
    phone?: string
    email?: string
    remark?: string
}

// 更新机构参数
export interface UpdateOrgParams {
    orgName?: string
    orgCode?: string
    parentId?: number
    sort?: number
    status?: Status
    leader?: string
    phone?: string
    email?: string
    remark?: string
}
