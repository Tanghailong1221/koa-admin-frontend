import type { MenuItem } from '@/types/menu'
import type { UserInfo, LoginResult, RefreshTokenResult } from '@/types/user'
import type { PageResult } from '@/types/api'

// Mock 用户数据
const mockUsers: any[] = [
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
const mockRoles: any[] = [
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
const mockMenus: MenuItem[] = [
  {
    id: 1,
    name: '仪表盘',
    path: '/',
    component: 'dashboard/Index',
    icon: 'Odometer',
    sort: 0,
    visible: 1,
    status: 1,
  },
  {
    id: 2,
    name: '系统管理',
    path: '/system',
    component: '',
    icon: 'Setting',
    sort: 1,
    visible: 1,
    status: 1,
    parentId: 0,
    children: [
      {
        id: 21,
        name: '用户管理',
        parentId: 2,
        path: '/system/user',
        component: 'system/user/List',
        icon: 'User',
        sort: 1,
        visible: 1,
        status: 1,
      },
      {
        id: 22,
        name: '角色管理',
        parentId: 2,
        path: '/system/role',
        component: 'system/role/List',
        icon: 'UserFilled',
        sort: 2,
        visible: 1,
        status: 1,
      },
    ],
  },
  {
    id: 3,
    name: '示例页面',
    path: '/examples',
    component: '',
    icon: 'Grid',
    sort: 2,
    visible: 1,
    status: 1,
    parentId: 0,
    children: [
      {
        id: 31,
        name: 'ProTable 示例',
        parentId: 3,
        path: '/examples/pro-table',
        component: 'examples/ProTableExample',
        icon: 'Grid',
        sort: 1,
        visible: 1,
        status: 1,
      },
      {
        id: 32,
        name: 'ProForm 示例',
        parentId: 3,
        path: '/examples/pro-form',
        component: 'examples/ProFormExample',
        icon: 'Edit',
        sort: 2,
        visible: 1,
        status: 1,
      },
      {
        id: 33,
        name: '表单草稿',
        parentId: 3,
        path: '/examples/form-draft',
        component: 'examples/FormDraftExample',
        icon: 'Document',
        sort: 3,
        visible: 1,
        status: 1,
      },
      {
        id: 34,
        name: '表单验证',
        parentId: 3,
        path: '/examples/form-validation',
        component: 'examples/FormValidationExample',
        icon: 'CircleCheck',
        sort: 4,
        visible: 1,
        status: 1,
      },
      {
        id: 35,
        name: '主题切换',
        parentId: 3,
        path: '/examples/theme',
        component: 'examples/ThemeExample',
        icon: 'Sunny',
        sort: 5,
        visible: 1,
        status: 1,
      },
      {
        id: 36,
        name: '高级表格',
        parentId: 3,
        path: '/examples/advanced-table',
        component: 'examples/AdvancedTableExample',
        icon: 'Grid',
        sort: 6,
        visible: 1,
        status: 1,
      },
      {
        id: 37,
        name: '权限示例',
        parentId: 3,
        path: '/examples/permission',
        component: 'examples/PermissionExample',
        icon: 'Lock',
        sort: 7,
        visible: 1,
        status: 1,
      },
      {
        id: 38,
        name: '数据权限',
        parentId: 3,
        path: '/examples/data-permission',
        component: 'examples/DataPermissionExample',
        icon: 'Key',
        sort: 8,
        visible: 1,
        status: 1,
      },
      {
        id: 39,
        name: '性能优化',
        parentId: 3,
        path: '/examples/performance',
        component: 'examples/PerformanceExample',
        icon: 'TrendCharts',
        sort: 9,
        visible: 1,
        status: 1,
      },
      {
        id: 310,
        name: '表格过滤',
        parentId: 3,
        path: '/examples/table-filter',
        component: 'examples/TableFilterExample',
        icon: 'Filter',
        sort: 10,
        visible: 1,
        status: 1,
      },
      {
        id: 311,
        name: '字典示例',
        parentId: 3,
        path: '/examples/dict',
        component: 'examples/DictExample',
        icon: 'Collection',
        sort: 11,
        visible: 1,
        status: 1,
      },
      {
        id: 312,
        name: '字典验证',
        parentId: 3,
        path: '/examples/dict-validation',
        component: 'examples/DictValidationExample',
        icon: 'CircleCheck',
        sort: 12,
        visible: 1,
        status: 1,
      },
      {
        id: 313,
        name: '图片优化',
        parentId: 3,
        path: '/examples/image-optimization',
        component: 'examples/ImageOptimizationExample',
        icon: 'Picture',
        sort: 13,
        visible: 1,
        status: 1,
      },
      {
        id: 314,
        name: '性能监控',
        parentId: 3,
        path: '/examples/performance-monitor',
        component: 'examples/PerformanceMonitorExample',
        icon: 'Monitor',
        sort: 14,
        visible: 1,
        status: 1,
      },
    ],
  },
]

// 模拟延迟
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms))

// Mock API 处理函数
export const mockApi = {
  // 登录
  async login(data: any): Promise<LoginResult> {
    await delay()
    if (data.username === 'admin' && data.password === 'admin123') {
      const userInfo: UserInfo = {
        id: 1,
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
  async refreshToken(refreshToken: string): Promise<RefreshTokenResult> {
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
      id: 1,
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
  async getMenuTree(): Promise<MenuItem[]> {
    await delay()
    return mockMenus
  },

  // 获取用户列表
  async getUserList(params: any): Promise<PageResult<any>> {
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
  async getRoleList(params: any): Promise<PageResult<any>> {
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

