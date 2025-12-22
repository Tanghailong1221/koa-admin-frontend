import request from '@/utils/request'
import type { PageQuery, PageResult } from '@/types/api'

export interface RoleItem {
  id: number
  roleName: string
  roleCode: string
  remark?: string
  status?: number
  permissionIds?: number[]
  createdAt?: string
}

export interface RoleListQuery extends PageQuery {
  roleName?: string
}

export const fetchRoleList = (params: RoleListQuery) =>
  request<PageResult<RoleItem>>({
    url: '/role/list',
    method: 'get',
    params,
  })

