import request from '@/utils/request'

export interface LoginPayload {
  username: string
  password: string
}

export interface UserInfo {
  id: string
  username: string
  nickname?: string
  roleId?: number
  orgId?: number
  positionId?: number
  avatar?: string
  phone?: string
  email?: string
  gender?: 0 | 1 | 2
  birthday?: string
  status?: number
}

export interface LoginResponse {
  token: string
  refreshToken: string
  userInfo: UserInfo
}

export interface RefreshResponse {
  token: string
  refreshToken: string
}

export const loginApi = (data: LoginPayload) =>
  request<LoginResponse>({
    url: '/user/login',
    method: 'post',
    data,
  })

export const logoutApi = () =>
  request({
    url: '/user/logout',
    method: 'post',
  })

export const refreshTokenApi = (refreshToken: string) =>
  request<RefreshResponse>({
    url: '/user/refresh-token',
    method: 'post',
    data: { refreshToken },
  })

export const getProfileApi = () =>
  request<UserInfo>({
    url: '/user/current',
    method: 'get',
  })

