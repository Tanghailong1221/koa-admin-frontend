/**
 * 菜单管理 API
 */

import request from '@/utils/request'
import type {
  PageResult,
  Status,
  MenuInfo,
  MenuTreeNode,
  MenuListParams,
  CreateMenuParams,
  UpdateMenuParams
} from '@/types'

/**
 * 获取菜单树（全部）
 */
export const getMenuTree = (status?: Status) =>
  request<MenuTreeNode[]>({
    url: '/menu/tree',
    method: 'get',
    params: status !== undefined ? { status } : undefined
  })

/**
 * 获取当前角色菜单树
 */
export const getCurrentMenuTree = () =>
  request<MenuTreeNode[]>({
    url: '/menu/tree/current',
    method: 'get'
  })

/**
 * 获取菜单列表
 */
export const getMenuList = (params: MenuListParams) =>
  request<PageResult<MenuInfo>>({
    url: '/menu/list',
    method: 'get',
    params
  })

/**
 * 获取菜单详情
 */
export const getMenuDetail = (id: number) =>
  request<MenuInfo>({
    url: `/menu/${id}`,
    method: 'get'
  })

/**
 * 创建菜单
 */
export const createMenu = (data: CreateMenuParams) =>
  request<MenuInfo>({
    url: '/menu',
    method: 'post',
    data
  })

/**
 * 更新菜单
 */
export const updateMenu = (id: number, data: UpdateMenuParams) =>
  request<MenuInfo>({
    url: `/menu/${id}`,
    method: 'put',
    data
  })

/**
 * 删除菜单
 */
export const deleteMenu = (id: number) =>
  request({
    url: `/menu/${id}`,
    method: 'delete'
  })

// 兼容旧的导出名称
export const fetchMenuApi = getCurrentMenuTree
