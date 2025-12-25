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
  // 工作台
  {
    id: 1,
    name: '工作台',
    path: '/dashboard',
    component: 'dashboard/Index',
    icon: 'Odometer',
    sort: 0,
    visible: 1,
    status: 1,
    parentId: 0,
  },
  // 系统管理
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
        id: 201,
        name: '账号管理',
        parentId: 2,
        path: '/system/user',
        component: 'system/user/List',
        icon: 'User',
        sort: 1,
        visible: 1,
        status: 1,
      },
      {
        id: 202,
        name: '角色管理',
        parentId: 2,
        path: '/system/role',
        component: 'system/role/List',
        icon: 'UserFilled',
        sort: 2,
        visible: 1,
        status: 1,
      },
      {
        id: 203,
        name: '机构管理',
        parentId: 2,
        path: '/system/org',
        component: 'system/org/List',
        icon: 'OfficeBuilding',
        sort: 3,
        visible: 1,
        status: 1,
      },
      {
        id: 204,
        name: '职位管理',
        parentId: 2,
        path: '/system/position',
        component: 'system/position/List',
        icon: 'Postcard',
        sort: 4,
        visible: 1,
        status: 1,
      },
      {
        id: 205,
        name: '个人中心',
        parentId: 2,
        path: '/system/profile',
        component: 'system/profile/Index',
        icon: 'Avatar',
        sort: 5,
        visible: 1,
        status: 1,
      },
      {
        id: 206,
        name: '通知公告',
        parentId: 2,
        path: '/system/notification',
        component: 'system/notification/List',
        icon: 'Bell',
        sort: 6,
        visible: 1,
        status: 1,
      },
      {
        id: 207,
        name: '三方账号',
        parentId: 2,
        path: '/system/third-account',
        component: 'system/third-account/List',
        icon: 'ChatDotRound',
        sort: 7,
        visible: 1,
        status: 1,
      },
      {
        id: 208,
        name: 'AD域配置',
        parentId: 2,
        path: '/system/ad-config',
        component: 'system/ad-config/List',
        icon: 'Connection',
        sort: 8,
        visible: 1,
        status: 1,
      },
    ],
  },
  // 平台管理
  {
    id: 3,
    name: '平台管理',
    path: '/platform',
    component: '',
    icon: 'Platform',
    sort: 2,
    visible: 1,
    status: 1,
    parentId: 0,
    children: [
      {
        id: 301,
        name: '租户管理',
        parentId: 3,
        path: '/platform/tenant',
        component: 'platform/tenant/List',
        icon: 'House',
        sort: 1,
        visible: 1,
        status: 1,
      },
      {
        id: 302,
        name: '菜单管理',
        parentId: 3,
        path: '/platform/menu',
        component: 'platform/menu/List',
        icon: 'Menu',
        sort: 2,
        visible: 1,
        status: 1,
      },
      {
        id: 303,
        name: '配置参数',
        parentId: 3,
        path: '/platform/config',
        component: 'platform/config/List',
        icon: 'SetUp',
        sort: 3,
        visible: 1,
        status: 1,
      },
      {
        id: 304,
        name: '字典管理',
        parentId: 3,
        path: '/platform/dict',
        component: 'platform/dict/List',
        icon: 'Notebook',
        sort: 4,
        visible: 1,
        status: 1,
      },
      {
        id: 305,
        name: '任务调度',
        parentId: 3,
        path: '/platform/schedule',
        component: 'platform/schedule/List',
        icon: 'Timer',
        sort: 5,
        visible: 1,
        status: 1,
      },
      {
        id: 306,
        name: '系统监控',
        parentId: 3,
        path: '/platform/monitor',
        component: 'platform/monitor/Index',
        icon: 'Monitor',
        sort: 6,
        visible: 1,
        status: 1,
      },
      {
        id: 307,
        name: '缓存管理',
        parentId: 3,
        path: '/platform/cache',
        component: 'platform/cache/Index',
        icon: 'Coin',
        sort: 7,
        visible: 1,
        status: 1,
      },
      {
        id: 308,
        name: '行政区划',
        parentId: 3,
        path: '/platform/region',
        component: 'platform/region/List',
        icon: 'Location',
        sort: 8,
        visible: 1,
        status: 1,
      },
      {
        id: 309,
        name: '文件管理',
        parentId: 3,
        path: '/platform/file',
        component: 'platform/file/List',
        icon: 'Folder',
        sort: 9,
        visible: 1,
        status: 1,
      },
      {
        id: 310,
        name: '打印模板',
        parentId: 3,
        path: '/platform/print-template',
        component: 'platform/print-template/List',
        icon: 'Printer',
        sort: 10,
        visible: 1,
        status: 1,
      },
      {
        id: 311,
        name: '动态插件',
        parentId: 3,
        path: '/platform/plugin',
        component: 'platform/plugin/List',
        icon: 'Connection',
        sort: 11,
        visible: 1,
        status: 1,
      },
      {
        id: 312,
        name: '开放接口',
        parentId: 3,
        path: '/platform/api',
        component: 'platform/api/List',
        icon: 'Link',
        sort: 12,
        visible: 1,
        status: 1,
      },
      {
        id: 313,
        name: '系统配置',
        parentId: 3,
        path: '/platform/system-config',
        component: 'platform/system-config/Index',
        icon: 'Tools',
        sort: 13,
        visible: 1,
        status: 1,
      },
      {
        id: 314,
        name: '微信支付',
        parentId: 3,
        path: '/platform/wechat-pay',
        component: 'platform/wechat-pay/Index',
        icon: 'Wallet',
        sort: 14,
        visible: 1,
        status: 1,
      },
      {
        id: 315,
        name: '更新日志',
        parentId: 3,
        path: '/platform/changelog',
        component: 'platform/changelog/List',
        icon: 'Document',
        sort: 15,
        visible: 1,
        status: 1,
      },
      {
        id: 316,
        name: '流水序号',
        parentId: 3,
        path: '/platform/serial-number',
        component: 'platform/serial-number/List',
        icon: 'List',
        sort: 16,
        visible: 1,
        status: 1,
      },
      {
        id: 317,
        name: '数据审批',
        parentId: 3,
        path: '/platform/approval',
        component: 'platform/approval/List',
        icon: 'Checked',
        sort: 17,
        visible: 1,
        status: 1,
      },
    ],
  },
  // 日志管理
  {
    id: 4,
    name: '日志管理',
    path: '/log',
    component: '',
    icon: 'Tickets',
    sort: 3,
    visible: 1,
    status: 1,
    parentId: 0,
    children: [
      {
        id: 401,
        name: '操作日志',
        parentId: 4,
        path: '/log/operation',
        component: 'log/operation/List',
        icon: 'Edit',
        sort: 1,
        visible: 1,
        status: 1,
      },
      {
        id: 402,
        name: '登录日志',
        parentId: 4,
        path: '/log/login',
        component: 'log/login/List',
        icon: 'Key',
        sort: 2,
        visible: 1,
        status: 1,
      },
      {
        id: 403,
        name: '异常日志',
        parentId: 4,
        path: '/log/error',
        component: 'log/error/List',
        icon: 'Warning',
        sort: 3,
        visible: 1,
        status: 1,
      },
    ],
  },
  // 开发工具
  {
    id: 5,
    name: '开发工具',
    path: '/dev',
    component: '',
    icon: 'Cpu',
    sort: 4,
    visible: 1,
    status: 1,
    parentId: 0,
    children: [
      {
        id: 501,
        name: '代码生成',
        parentId: 5,
        path: '/dev/code-generator',
        component: 'dev/code-generator/Index',
        icon: 'Promotion',
        sort: 1,
        visible: 1,
        status: 1,
      },
      {
        id: 502,
        name: '表单设计',
        parentId: 5,
        path: '/dev/form-designer',
        component: 'dev/form-designer/Index',
        icon: 'Edit',
        sort: 2,
        visible: 1,
        status: 1,
      },
      {
        id: 503,
        name: '接口文档',
        parentId: 5,
        path: '/dev/api-doc',
        component: 'dev/api-doc/Index',
        icon: 'Document',
        sort: 3,
        visible: 1,
        status: 1,
      },
      {
        id: 504,
        name: '数据库文档',
        parentId: 5,
        path: '/dev/db-doc',
        component: 'dev/db-doc/Index',
        icon: 'Coin',
        sort: 4,
        visible: 1,
        status: 1,
      },
    ],
  },
  // BI管理
  {
    id: 6,
    name: 'BI管理',
    path: '/bi',
    component: '',
    icon: 'DataAnalysis',
    sort: 5,
    visible: 1,
    status: 1,
    parentId: 0,
    children: [
      {
        id: 601,
        name: '数据大屏',
        parentId: 6,
        path: '/bi/dashboard',
        component: 'bi/dashboard/Index',
        icon: 'DataBoard',
        sort: 1,
        visible: 1,
        status: 1,
      },
      {
        id: 602,
        name: '报表管理',
        parentId: 6,
        path: '/bi/report',
        component: 'bi/report/List',
        icon: 'TrendCharts',
        sort: 2,
        visible: 1,
        status: 1,
      },
      {
        id: 603,
        name: '图表设计',
        parentId: 6,
        path: '/bi/chart-designer',
        component: 'bi/chart-designer/Index',
        icon: 'PieChart',
        sort: 3,
        visible: 1,
        status: 1,
      },
    ],
  },
  // 示例页面
  {
    id: 7,
    name: '示例页面',
    path: '/examples',
    component: '',
    icon: 'Grid',
    sort: 6,
    visible: 1,
    status: 1,
    parentId: 0,
    children: [
      {
        id: 701,
        name: 'ProTable 示例',
        parentId: 7,
        path: '/examples/pro-table',
        component: 'examples/ProTableExample',
        icon: 'Grid',
        sort: 1,
        visible: 1,
        status: 1,
      },
      {
        id: 702,
        name: 'ProTablePlus 示例',
        parentId: 7,
        path: '/examples/pro-table-plus',
        component: 'examples/ProTablePlusExample',
        icon: 'Grid',
        sort: 2,
        visible: 1,
        status: 1,
      },
      {
        id: 703,
        name: 'ProForm 示例',
        parentId: 7,
        path: '/examples/pro-form',
        component: 'examples/ProFormExample',
        icon: 'Edit',
        sort: 3,
        visible: 1,
        status: 1,
      },
      {
        id: 7031,
        name: 'ProDialog 示例',
        parentId: 7,
        path: '/examples/pro-dialog',
        component: 'examples/ProDialogExample',
        icon: 'ChatDotSquare',
        sort: 4,
        visible: 1,
        status: 1,
      },
      {
        id: 704,
        name: '表单草稿',
        parentId: 7,
        path: '/examples/form-draft',
        component: 'examples/FormDraftExample',
        icon: 'Document',
        sort: 5,
        visible: 1,
        status: 1,
      },
      {
        id: 705,
        name: '表单验证',
        parentId: 7,
        path: '/examples/form-validation',
        component: 'examples/FormValidationExample',
        icon: 'CircleCheck',
        sort: 5,
        visible: 1,
        status: 1,
      },
      {
        id: 706,
        name: '主题切换',
        parentId: 7,
        path: '/examples/theme',
        component: 'examples/ThemeExample',
        icon: 'Sunny',
        sort: 6,
        visible: 1,
        status: 1,
      },
      {
        id: 707,
        name: '高级表格',
        parentId: 7,
        path: '/examples/advanced-table',
        component: 'examples/AdvancedTableExample',
        icon: 'Grid',
        sort: 7,
        visible: 1,
        status: 1,
      },
      {
        id: 708,
        name: '权限示例',
        parentId: 7,
        path: '/examples/permission',
        component: 'examples/PermissionExample',
        icon: 'Lock',
        sort: 8,
        visible: 1,
        status: 1,
      },
      {
        id: 709,
        name: '数据权限',
        parentId: 7,
        path: '/examples/data-permission',
        component: 'examples/DataPermissionExample',
        icon: 'Key',
        sort: 9,
        visible: 1,
        status: 1,
      },
      {
        id: 710,
        name: '性能优化',
        parentId: 7,
        path: '/examples/performance',
        component: 'examples/PerformanceExample',
        icon: 'TrendCharts',
        sort: 10,
        visible: 1,
        status: 1,
      },
      {
        id: 711,
        name: '表格过滤',
        parentId: 7,
        path: '/examples/table-filter',
        component: 'examples/TableFilterExample',
        icon: 'Filter',
        sort: 11,
        visible: 1,
        status: 1,
      },
      {
        id: 712,
        name: '字典示例',
        parentId: 7,
        path: '/examples/dict',
        component: 'examples/DictExample',
        icon: 'Collection',
        sort: 12,
        visible: 1,
        status: 1,
      },
      {
        id: 713,
        name: '字典验证',
        parentId: 7,
        path: '/examples/dict-validation',
        component: 'examples/DictValidationExample',
        icon: 'CircleCheck',
        sort: 13,
        visible: 1,
        status: 1,
      },
      {
        id: 714,
        name: '图片优化',
        parentId: 7,
        path: '/examples/image-optimization',
        component: 'examples/ImageOptimizationExample',
        icon: 'Picture',
        sort: 14,
        visible: 1,
        status: 1,
      },
      {
        id: 715,
        name: '性能监控',
        parentId: 7,
        path: '/examples/performance-monitor',
        component: 'examples/PerformanceMonitorExample',
        icon: 'Monitor',
        sort: 15,
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

