import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import BasicLayout from '@/layouts/BasicLayout.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/Login.vue'),
    meta: { public: true, title: '登录' },
  },
  {
    path: '/',
    name: 'Root',
    component: BasicLayout,
    redirect: '/dashboard',
    children: [
      // 工作台
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/Index.vue'),
        meta: { title: '工作台' },
      },
      // 系统管理
      {
        path: 'system/user',
        name: 'SystemUser',
        component: () => import('@/views/system/user/List.vue'),
        meta: { title: '账号管理' },
      },
      {
        path: 'system/role',
        name: 'SystemRole',
        component: () => import('@/views/system/role/List.vue'),
        meta: { title: '角色管理' },
      },
      {
        path: 'system/org',
        name: 'SystemOrg',
        component: () => import('@/views/system/org/List.vue'),
        meta: { title: '机构管理' },
      },
      {
        path: 'system/position',
        name: 'SystemPosition',
        component: () => import('@/views/system/position/List.vue'),
        meta: { title: '职位管理' },
      },
      {
        path: 'system/profile',
        name: 'SystemProfile',
        component: () => import('@/views/system/profile/Index.vue'),
        meta: { title: '个人中心' },
      },
      {
        path: 'system/notification',
        name: 'SystemNotification',
        component: () => import('@/views/system/notification/List.vue'),
        meta: { title: '通知公告' },
      },
      {
        path: 'system/third-account',
        name: 'SystemThirdAccount',
        component: () => import('@/views/system/third-account/List.vue'),
        meta: { title: '三方账号' },
      },
      {
        path: 'system/ad-config',
        name: 'SystemAdConfig',
        component: () => import('@/views/system/ad-config/List.vue'),
        meta: { title: 'AD域配置' },
      },
      // 平台管理
      {
        path: 'platform/tenant',
        name: 'PlatformTenant',
        component: () => import('@/views/platform/tenant/List.vue'),
        meta: { title: '租户管理' },
      },
      {
        path: 'platform/menu',
        name: 'PlatformMenu',
        component: () => import('@/views/platform/menu/List.vue'),
        meta: { title: '菜单管理' },
      },
      {
        path: 'platform/config',
        name: 'PlatformConfig',
        component: () => import('@/views/platform/config/List.vue'),
        meta: { title: '配置参数' },
      },
      {
        path: 'platform/dict',
        name: 'PlatformDict',
        component: () => import('@/views/platform/dict/List.vue'),
        meta: { title: '字典管理' },
      },
      {
        path: 'platform/schedule',
        name: 'PlatformSchedule',
        component: () => import('@/views/platform/schedule/List.vue'),
        meta: { title: '任务调度' },
      },
      {
        path: 'platform/monitor',
        name: 'PlatformMonitor',
        component: () => import('@/views/platform/monitor/Index.vue'),
        meta: { title: '系统监控' },
      },
      {
        path: 'platform/cache',
        name: 'PlatformCache',
        component: () => import('@/views/platform/cache/Index.vue'),
        meta: { title: '缓存管理' },
      },
      {
        path: 'platform/region',
        name: 'PlatformRegion',
        component: () => import('@/views/platform/region/List.vue'),
        meta: { title: '行政区划' },
      },
      {
        path: 'platform/file',
        name: 'PlatformFile',
        component: () => import('@/views/platform/file/List.vue'),
        meta: { title: '文件管理' },
      },
      {
        path: 'platform/print-template',
        name: 'PlatformPrintTemplate',
        component: () => import('@/views/platform/print-template/List.vue'),
        meta: { title: '打印模板' },
      },
      {
        path: 'platform/plugin',
        name: 'PlatformPlugin',
        component: () => import('@/views/platform/plugin/List.vue'),
        meta: { title: '动态插件' },
      },
      {
        path: 'platform/api',
        name: 'PlatformApi',
        component: () => import('@/views/platform/api/List.vue'),
        meta: { title: '开放接口' },
      },
      {
        path: 'platform/system-config',
        name: 'PlatformSystemConfig',
        component: () => import('@/views/platform/system-config/Index.vue'),
        meta: { title: '系统配置' },
      },
      {
        path: 'platform/wechat-pay',
        name: 'PlatformWechatPay',
        component: () => import('@/views/platform/wechat-pay/Index.vue'),
        meta: { title: '微信支付' },
      },
      {
        path: 'platform/changelog',
        name: 'PlatformChangelog',
        component: () => import('@/views/platform/changelog/List.vue'),
        meta: { title: '更新日志' },
      },
      {
        path: 'platform/serial-number',
        name: 'PlatformSerialNumber',
        component: () => import('@/views/platform/serial-number/List.vue'),
        meta: { title: '流水序号' },
      },
      {
        path: 'platform/approval',
        name: 'PlatformApproval',
        component: () => import('@/views/platform/approval/List.vue'),
        meta: { title: '数据审批' },
      },
      // 日志管理
      {
        path: 'log/operation',
        name: 'LogOperation',
        component: () => import('@/views/log/operation/List.vue'),
        meta: { title: '操作日志' },
      },
      {
        path: 'log/login',
        name: 'LogLogin',
        component: () => import('@/views/log/login/List.vue'),
        meta: { title: '登录日志' },
      },
      {
        path: 'log/error',
        name: 'LogError',
        component: () => import('@/views/log/error/List.vue'),
        meta: { title: '异常日志' },
      },
      // 开发工具
      {
        path: 'dev/code-generator',
        name: 'DevCodeGenerator',
        component: () => import('@/views/dev/code-generator/Index.vue'),
        meta: { title: '代码生成' },
      },
      {
        path: 'dev/form-designer',
        name: 'DevFormDesigner',
        component: () => import('@/views/dev/form-designer/Index.vue'),
        meta: { title: '表单设计' },
      },
      {
        path: 'dev/api-doc',
        name: 'DevApiDoc',
        component: () => import('@/views/dev/api-doc/Index.vue'),
        meta: { title: '接口文档' },
      },
      {
        path: 'dev/db-doc',
        name: 'DevDbDoc',
        component: () => import('@/views/dev/db-doc/Index.vue'),
        meta: { title: '数据库文档' },
      },
      // BI管理
      {
        path: 'bi/dashboard',
        name: 'BiDashboard',
        component: () => import('@/views/bi/dashboard/Index.vue'),
        meta: { title: '数据大屏' },
      },
      {
        path: 'bi/report',
        name: 'BiReport',
        component: () => import('@/views/bi/report/List.vue'),
        meta: { title: '报表管理' },
      },
      {
        path: 'bi/chart-designer',
        name: 'BiChartDesigner',
        component: () => import('@/views/bi/chart-designer/Index.vue'),
        meta: { title: '图表设计' },
      },
      // 示例页面
      {
        path: 'examples/pro-table',
        name: 'ExamplesProTable',
        component: () => import('@/views/examples/ProTableExample.vue'),
        meta: { title: 'ProTable 示例' },
      },
      {
        path: 'examples/pro-table-plus',
        name: 'ExamplesProTablePlus',
        component: () => import('@/views/examples/ProTablePlusExample.vue'),
        meta: { title: 'ProTablePlus 示例' },
      },
      {
        path: 'examples/pro-form',
        name: 'ExamplesProForm',
        component: () => import('@/views/examples/ProFormExample.vue'),
        meta: { title: 'ProForm 示例' },
      },
      {
        path: 'examples/pro-dialog',
        name: 'ExamplesProDialog',
        component: () => import('@/views/examples/ProDialogExample.vue'),
        meta: { title: 'ProDialog 示例' },
      },
      {
        path: 'examples/form-draft',
        name: 'ExamplesFormDraft',
        component: () => import('@/views/examples/FormDraftExample.vue'),
        meta: { title: '表单草稿' },
      },
      {
        path: 'examples/form-validation',
        name: 'ExamplesFormValidation',
        component: () => import('@/views/examples/FormValidationExample.vue'),
        meta: { title: '表单验证' },
      },
      {
        path: 'examples/theme',
        name: 'ExamplesTheme',
        component: () => import('@/views/examples/ThemeExample.vue'),
        meta: { title: '主题切换' },
      },
      {
        path: 'examples/advanced-table',
        name: 'ExamplesAdvancedTable',
        component: () => import('@/views/examples/AdvancedTableExample.vue'),
        meta: { title: '高级表格' },
      },
      {
        path: 'examples/permission',
        name: 'ExamplesPermission',
        component: () => import('@/views/examples/PermissionExample.vue'),
        meta: { title: '权限示例' },
      },
      {
        path: 'examples/data-permission',
        name: 'ExamplesDataPermission',
        component: () => import('@/views/examples/DataPermissionExample.vue'),
        meta: { title: '数据权限' },
      },
      {
        path: 'examples/performance',
        name: 'ExamplesPerformance',
        component: () => import('@/views/examples/PerformanceExample.vue'),
        meta: { title: '性能优化' },
      },
      {
        path: 'examples/table-filter',
        name: 'ExamplesTableFilter',
        component: () => import('@/views/examples/TableFilterExample.vue'),
        meta: { title: '表格过滤' },
      },
      {
        path: 'examples/dict',
        name: 'ExamplesDict',
        component: () => import('@/views/examples/DictExample.vue'),
        meta: { title: '字典示例' },
      },
      {
        path: 'examples/dict-validation',
        name: 'ExamplesDictValidation',
        component: () => import('@/views/examples/DictValidationExample.vue'),
        meta: { title: '字典验证' },
      },
      {
        path: 'examples/image-optimization',
        name: 'ExamplesImageOptimization',
        component: () => import('@/views/examples/ImageOptimizationExample.vue'),
        meta: { title: '图片优化' },
      },
      {
        path: 'examples/performance-monitor',
        name: 'ExamplesPerformanceMonitor',
        component: () => import('@/views/examples/PerformanceMonitorExample.vue'),
        meta: { title: '性能监控' },
      },
      // 404
      {
        path: ':pathMatch(.*)*',
        name: 'NotFoundInLayout',
        component: () => import('@/views/error/NotFound.vue'),
        meta: { title: '404' },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router

