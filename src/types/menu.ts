/**
 * 菜单相关类型定义
 */

import type { Status } from './api'

// 菜单信息
export interface MenuInfo {
  id: number
  permName: string
  permCode: string
  path: string
  parentId: number
  component?: string
  icon?: string
  sort: number
  visible: Status
  status: Status
  children?: MenuInfo[]
  createdAt?: string
  updatedAt?: string
}

// 菜单树节点
export interface MenuTreeNode extends MenuInfo {
  children?: MenuTreeNode[]
}

// 菜单列表查询参数
export interface MenuListParams {
  page?: number
  size?: number
  keyword?: string
  status?: Status
}

// 创建菜单参数
export interface CreateMenuParams {
  permName: string
  permCode: string
  path: string
  parentId?: number
  component?: string
  icon?: string
  sort?: number
  visible?: Status
  status?: Status
}

// 更新菜单参数
export interface UpdateMenuParams {
  permName?: string
  permCode?: string
  path?: string
  parentId?: number
  component?: string
  icon?: string
  sort?: number
  visible?: Status
  status?: Status
}

// 菜单项（兼容旧代码）
export interface MenuItem {
  id: number
  name: string
  path: string
  component?: string
  icon?: string
  parentId: number
  sort: number
  visible: Status
  status: Status
  children?: MenuItem[]
}
