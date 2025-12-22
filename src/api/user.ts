import request from '@/utils/request'
import type { PageQuery, PageResult } from '@/types/api'
import type { UserInfo } from './auth'

export interface UserListQuery extends PageQuery {
  username?: string
  roleId?: number
  orgId?: number
  positionId?: number
  status?: number
}

export interface UserListItem extends UserInfo {
  roleName?: string
  orgName?: string
  positionName?: string
  createdAt?: string
}

export const fetchUserList = (params: UserListQuery) =>
  request<PageResult<UserListItem>>({
    url: '/user/list',
    method: 'get',
    params,
  })

