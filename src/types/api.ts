/**
 * API 通用类型定义
 */

// 分页查询参数
export interface PageQuery {
  page?: number
  size?: number
}

// 分页结果
export interface PageResult<T> {
  total: number
  list: T[]
}

// API 响应格式
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

// 通用状态枚举
export enum Status {
  DISABLED = 0,
  ENABLED = 1
}

// 性别枚举
export enum Gender {
  UNKNOWN = 0,
  MALE = 1,
  FEMALE = 2
}

// 权限类型枚举
export enum PermissionType {
  MENU = 1,
  BUTTON = 2,
  API = 3
}

// 登录状态枚举
export enum LoginStatus {
  FAILED = 0,
  SUCCESS = 1
}

// 错误码
export enum ErrorCode {
  SUCCESS = 0,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  SERVER_ERROR = 500,
  INVALID_CREDENTIALS = 10001,
  USER_DISABLED = 10002,
  TOKEN_EXPIRED = 10003,
  USER_NOT_FOUND = 10004,
  USERNAME_EXISTS = 10005
}
