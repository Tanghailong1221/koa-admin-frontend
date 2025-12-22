import type { LoginPayload, LoginResponse, UserInfo, RefreshResponse } from '@/api/auth'
import type { BackendMenu } from '@/api/menu'
import type { UserListItem, UserListQuery } from '@/api/user'
import type { RoleItem, RoleListQuery } from '@/api/role'
import type { PageResult } from '@/types/api'

// Mock 用户数据
const mockUsers: UserListItem[] = [
  {
    id: '1',
    username: 'admin',
    nickname: '管理员',
    roleId: 1,
    orgId: 1,
    positionId: 1,
    avatar: '',
    phone: '13800138000',
    email: 'admin@example.com',
    gender: 1,
    birthday: '1990-01-01',
    status: 1,
    roleName: '超级管理员',
    orgName: '总公司',
    positionName: '技术总监',
    createdAt: '2024-01-01 10:00:00',
  },
  {
    id: '2',
    username: 'user1',
    nickname: '用户1',
    roleId: 2,
    orgId: 2,
    positionId: 2,
    avatar: '',
    phone: '13800138001',
    email: 'user1@example.com',
    gender: 0,
    birthday: '1995-05-15',
    status: 1,
    roleName: '普通用户',
    orgName: '分公司A',
    positionName: '开发工程师',
    createdAt: '2024-01-02 10:00:00',
  },
  {
    id: '3',
    username: 'user2',
    nickname: '用户2',
    roleId: 2,
    orgId: 2,
    positionId: 3,
    avatar: '',
    phone: '13800138002',
    email: 'user2@example.com',
    gender: 2,
    birthday: '1998-08-20',
    status: 0,
    roleName: '普通用户',
    orgName: '分公司A',
    positionName: '测试工程师',
    createdAt: '2024-01-03 10:00:00',
  },
]

// Mock 角色数据
const mockRoles: RoleItem[] = [
  {
    id: 1,
    roleName: '超级管理员',
    roleCode: 'admin',
    remark: '拥有所有权限',
    status: 1,
    permissionIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    createdAt: '2024-01-01 10:00:00',
  },
  {
    id: 2,
    roleName: '普通用户',
    roleCode: 'user',
    remark: '普通用户权限',
    status: 1,
    permissionIds: [1, 2],
    createdAt: '2024-01-02 10:00:00',
  },
  {
    id: 3,
    roleName: '访客',
    roleCode: 'guest',
    remark: '只读权限',
    status: 1,
    permissionIds: [1],
    createdAt: '2024-01-03 10:00:00',
  },
]

// Mock 菜单数据
const mockMenus: BackendMenu[] = [
  {
    id: 1,
    menuName: '系统管理',
    menuType: 1,
    path: '/system',
    component: '',
    icon: 'Setting',
    sort: 1,
    visible: 1,
    status: 1,
    permCode: 'system',
    children: [
      {
        id: 11,
        menuName: '用户管理',
        menuType: 2,
        parentId: 1,
        path: '/system/user',
        component: 'system/user/List',
        icon: 'User',
        sort: 1,
        visible: 1,
        status: 1,
        permCode: 'user:list',
      },
      {
        id: 12,
        menuName: '角色管理',
        menuType: 2,
        parentId: 1,
        path: '/system/role',
        component: 'system/role/List',
        icon: 'UserFilled',
        sort: 2,
        visible: 1,
        status: 1,
        permCode: 'role:list',
      },
    ],
  },
  {
    id: 2,
    menuName: '仪表盘',
    menuType: 2,
    path: '/',
    component: 'dashboard/Index',
    icon: 'Odometer',
    sort: 0,
    visible: 1,
    status: 1,
    permCode: 'dashboard',
  },
]

// 模拟延迟
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms))

// Mock API 处理函数
export const mockApi = {
  // 登录
  async login(data: LoginPayload): Promise<LoginResponse> {
    await delay()
    if (data.username === 'admin' && data.password === 'admin123') {
      const userInfo: UserInfo = {
        id: '1',
        username: 'admin',
        nickname: '管理员',
        roleId: 1,
        orgId: 1,
        positionId: 1,
        avatar: '',
        phone: '13800138000',
        email: 'admin@example.com',
        gender: 1,
        birthday: '1990-01-01',
        status: 1,
      }
      return {
        token: 'mock_access_token_' + Date.now(),
        refreshToken: 'mock_refresh_token_' + Date.now(),
        userInfo,
      }
    }
    throw new Error('用户名或密码错误')
  },

  // 刷新 token
  async refreshToken(refreshToken: string): Promise<RefreshResponse> {
    await delay()
    return {
      token: 'mock_access_token_' + Date.now(),
      refreshToken: 'mock_refresh_token_' + Date.now(),
    }
  },

  // 登出
  async logout(): Promise<null> {
    await delay()
    return null
  },

  // 获取当前用户
  async getCurrentUser(): Promise<UserInfo> {
    await delay()
    return {
      id: '1',
      username: 'admin',
      nickname: '管理员',
      roleId: 1,
      orgId: 1,
      positionId: 1,
      avatar: '',
      phone: '13800138000',
      email: 'admin@example.com',
      gender: 1,
      birthday: '1990-01-01',
      status: 1,
    }
  },

  // 获取菜单树
  async getMenuTree(): Promise<BackendMenu[]> {
    await delay()
    return mockMenus
  },

  // 获取用户列表
  async getUserList(params: UserListQuery): Promise<PageResult<UserListItem>> {
    await delay()
    let list = [...mockUsers]

    // 搜索过滤
    if (params.username) {
      list = list.filter(u => u.username.includes(params.username!))
    }
    if (params.roleId) {
      list = list.filter(u => u.roleId === params.roleId)
    }
    if (params.orgId) {
      list = list.filter(u => u.orgId === params.orgId)
    }
    if (params.status !== undefined) {
      list = list.filter(u => u.status === params.status)
    }

    // 分页
    const pageNum = params.pageNum || 1
    const pageSize = params.pageSize || 10
    const total = list.length
    const start = (pageNum - 1) * pageSize
    const end = start + pageSize
    const pageList = list.slice(start, end)

    return {
      total,
      list: pageList,
    }
  },

  // 获取角色列表
  async getRoleList(params: RoleListQuery): Promise<PageResult<RoleItem>> {
    await delay()
    let list = [...mockRoles]

    // 搜索过滤
    if (params.roleName) {
      list = list.filter(r => r.roleName.includes(params.roleName!))
    }

    // 分页
    const pageNum = params.pageNum || 1
    const pageSize = params.pageSize || 10
    const total = list.length
    const start = (pageNum - 1) * pageSize
    const end = start + pageSize
    const pageList = list.slice(start, end)

    return {
      total,
      list: pageList,
    }
  },
}

// 检查是否启用 mock
export const isMockEnabled = () => {
  return import.meta.env.DEV && import.meta.env.VITE_USE_MOCK !== 'false'
}

