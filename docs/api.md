# API 接口使用指南

## 概述

本项目已完整对接后端 KOA 管理系统 API，提供了完整的类型定义和 API 函数。

## 配置

### 环境变量

在 `.env.development` 或 `.env.production` 中配置：

```bash
# API 基础路径（后端服务地址）
VITE_API_BASE_URL=http://localhost:3000/api

# API 请求前缀（用于 axios baseURL）
VITE_API_BASE=/api
```

### 代理配置

开发环境下，Vite 会自动将 `/api` 请求代理到后端服务：

```typescript
// vite.config.ts
proxy: {
  '/api': {
    target: 'http://localhost:3000/api',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, '')
  }
}
```

## API 模块

### 1. 认证模块 (`@/api/auth`)

```typescript
import { login, logout, getCurrentUser, refreshToken, changePassword } from '@/api'

// 登录
const result = await login({ username: 'admin', password: '123456' })
console.log(result.token, result.userInfo)

// 获取当前用户
const user = await getCurrentUser()

// 退出登录
await logout()

// 刷新 Token
const tokens = await refreshToken(refreshToken)

// 修改密码
await changePassword({ oldPassword: '123456', newPassword: '654321' })
```

### 2. 用户管理 (`@/api/user`)

```typescript
import { getUserList, getUserDetail, createUser, updateUser, deleteUser, changeUserStatus } from '@/api'

// 获取用户列表
const { list, total } = await getUserList({
  page: 1,
  size: 10,
  keyword: '张三',
  status: 1
})

// 获取用户详情
const user = await getUserDetail(1)

// 创建用户
const newUser = await createUser({
  username: 'testuser',
  password: '123456',
  roleId: 1,
  status: 1
})

// 更新用户
await updateUser(1, { username: 'newname' })

// 删除用户
await deleteUser(1)

// 修改状态
await changeUserStatus(1, { status: 0 })
```

### 3. 角色管理 (`@/api/role`)

```typescript
import { getRoleList, getRoleDetail, createRole, updateRole, deleteRole, assignPermissions } from '@/api'

// 获取角色列表
const { list, total } = await getRoleList({ page: 1, size: 10 })

// 创建角色
const role = await createRole({
  roleName: '普通用户',
  roleCode: 'user',
  description: '普通用户角色',
  permissionIds: [1, 2, 3]
})

// 分配权限
await assignPermissions(1, { permissionIds: [1, 2, 3, 4, 5] })
```

### 4. 菜单管理 (`@/api/menu`)

```typescript
import { getMenuTree, getCurrentMenuTree, getMenuList, createMenu, updateMenu, deleteMenu } from '@/api'

// 获取菜单树（全部）
const tree = await getMenuTree()

// 获取当前角色菜单树
const currentTree = await getCurrentMenuTree()

// 创建菜单
await createMenu({
  permName: '用户管理',
  permCode: 'menu:system:user',
  path: '/system/user',
  component: 'system/user',
  icon: 'user'
})
```

### 5. 权限管理 (`@/api/permission`)

```typescript
import { getPermissionTree, getAllPermissions, getPermissionList, createPermission } from '@/api'

// 获取权限树
const tree = await getPermissionTree()

// 获取所有权限
const permissions = await getAllPermissions()

// 创建权限
await createPermission({
  permName: '用户管理',
  permCode: 'user:manage',
  permType: 3 // 1-菜单，2-按钮，3-接口
})
```

### 6. 数据字典 (`@/api/dict`)

```typescript
import { getDictByType, getDictList, createDict, updateDict, deleteDict } from '@/api'

// 根据类型获取字典
const genderList = await getDictByType('gender')

// 创建字典
await createDict({
  dictType: 'gender',
  dictCode: 'male',
  dictValue: '1',
  dictLabel: '男'
})
```

### 7. 机构管理 (`@/api/org`)

```typescript
import { getOrgTree, getOrgList, getOrgPositions, createOrg, updateOrg, deleteOrg } from '@/api'

// 获取机构树
const tree = await getOrgTree()

// 获取机构下的职位
const positions = await getOrgPositions(1)

// 创建机构
await createOrg({
  orgName: '技术部',
  orgCode: 'tech',
  parentId: 0
})
```

### 8. 职位管理 (`@/api/position`)

```typescript
import { getPositionList, createPosition, updatePosition, deletePosition } from '@/api'

// 获取职位列表
const { list, total } = await getPositionList({ orgId: 1 })

// 创建职位
await createPosition({
  positionName: '前端工程师',
  positionCode: 'fe',
  orgId: 1
})
```

### 9. 文件上传 (`@/api/upload`)

```typescript
import { uploadSingle, uploadMultiple } from '@/api'

// 单文件上传
const result = await uploadSingle(file, (percent) => {
  console.log('上传进度:', percent)
})
console.log(result.url)

// 多文件上传
const results = await uploadMultiple(files, (percent) => {
  console.log('上传进度:', percent)
})
```

### 10. 数据导入导出 (`@/api/export`)

```typescript
import { exportUsers, importUsers, downloadTemplate, downloadFile } from '@/api'

// 导出用户
const blob = await exportUsers({ status: 1 })
downloadFile(blob.data, 'users.xlsx')

// 导入用户
const result = await importUsers(file)
console.log(result.summary)

// 下载模板
const template = await downloadTemplate('user')
downloadFile(template.data, 'user-template.xlsx')
```

### 11. 日志管理 (`@/api/log`)

```typescript
import { getOperationLogList, getLoginLogList, exportOperationLog } from '@/api'

// 获取操作日志
const { list, total } = await getOperationLogList({
  page: 1,
  pageSize: 10,
  username: 'admin',
  startTime: '2024-01-01',
  endTime: '2024-12-31'
})

// 获取登录日志
const loginLogs = await getLoginLogList({ status: 1 })

// 导出操作日志
const blob = await exportOperationLog()
downloadFile(blob.data, 'operation-log.xlsx')
```

### 12. 定时任务 (`@/api/job`)

```typescript
import { getJobList, startJob, stopJob, startAllJobs, stopAllJobs } from '@/api'

// 获取任务列表
const jobs = await getJobList()

// 启动任务
await startJob('cleanLogs')

// 停止任务
await stopJob('cleanLogs')

// 启动所有任务
await startAllJobs()
```

### 13. 系统监控 (`@/api/monitor`)

```typescript
import { getMonitorMetrics, healthCheck, resetMetrics } from '@/api'

// 获取监控指标
const metrics = await getMonitorMetrics()

// 健康检查
const health = await healthCheck()
console.log(health.status, health.services)

// 重置指标
await resetMetrics()
```

### 14. WebSocket 管理 (`@/api/websocket`)

```typescript
import { getOnlineUsers, sendMessageToUser, broadcastMessage, disconnectUser } from '@/api'

// 获取在线用户
const { users, total } = await getOnlineUsers()

// 发送消息给用户
await sendMessageToUser(1, {
  event: 'notification',
  data: { message: '你好' }
})

// 广播消息
await broadcastMessage({
  event: 'announcement',
  data: { message: '系统公告' }
})

// 断开用户连接
await disconnectUser(1, { reason: '管理员操作' })
```

## 类型定义

所有类型定义都在 `@/types` 中导出：

```typescript
import type {
  // 通用类型
  PageQuery,
  PageResult,
  Status,
  Gender,
  PermissionType,
  
  // 用户相关
  UserInfo,
  LoginParams,
  LoginResult,
  CreateUserParams,
  
  // 角色相关
  RoleInfo,
  CreateRoleParams,
  
  // 菜单相关
  MenuInfo,
  MenuTreeNode,
  
  // 权限相关
  PermissionInfo,
  PermissionTreeNode,
  
  // 字典相关
  DictInfo,
  
  // 机构相关
  OrgInfo,
  OrgTreeNode,
  
  // 职位相关
  PositionInfo,
  
  // 上传相关
  UploadFileInfo,
  
  // 日志相关
  OperationLogInfo,
  LoginLogInfo,
  
  // 任务相关
  JobInfo,
  
  // 监控相关
  MonitorMetrics,
  HealthCheckResult,
  
  // WebSocket 相关
  OnlineUser
} from '@/types'
```

## 错误处理

API 请求会自动处理以下错误：

- **401 未授权**: 自动刷新 Token 或跳转登录页
- **403 权限不足**: 显示权限不足提示
- **网络错误**: 自动重试（最多 3 次）
- **离线状态**: 请求加入离线队列，网络恢复后自动重试

```typescript
try {
  const result = await getUserList({ page: 1 })
} catch (error) {
  // 错误已被全局处理，这里可以做额外处理
  console.error('请求失败:', error)
}
```

## 权限编码

完整的权限编码列表：

| 模块 | 权限编码 | 说明 |
|------|----------|------|
| 用户 | user:list | 用户列表 |
| 用户 | user:detail | 用户详情 |
| 用户 | user:create | 创建用户 |
| 用户 | user:update | 更新用户 |
| 用户 | user:delete | 删除用户 |
| 角色 | role:list | 角色列表 |
| 角色 | role:detail | 角色详情 |
| 角色 | role:create | 创建角色 |
| 角色 | role:update | 更新角色 |
| 角色 | role:delete | 删除角色 |
| 角色 | role:assign | 分配权限 |
| 菜单 | menu:list | 菜单列表 |
| 菜单 | menu:create | 创建菜单 |
| 菜单 | menu:update | 更新菜单 |
| 菜单 | menu:delete | 删除菜单 |
| 权限 | permission:list | 权限列表 |
| 权限 | permission:create | 创建权限 |
| 权限 | permission:update | 更新权限 |
| 权限 | permission:delete | 删除权限 |
| 字典 | dict:list | 字典列表 |
| 字典 | dict:create | 创建字典 |
| 字典 | dict:update | 更新字典 |
| 字典 | dict:delete | 删除字典 |
| 机构 | org:list | 机构列表 |
| 机构 | org:create | 创建机构 |
| 机构 | org:update | 更新机构 |
| 机构 | org:delete | 删除机构 |
| 职位 | position:list | 职位列表 |
| 职位 | position:create | 创建职位 |
| 职位 | position:update | 更新职位 |
| 职位 | position:delete | 删除职位 |
| 日志 | log:list | 日志列表 |
| 日志 | log:export | 导出日志 |
| 任务 | job:list | 任务列表 |
| 任务 | job:start | 启动任务 |
| 任务 | job:stop | 停止任务 |
| 监控 | monitor:metrics | 监控指标 |
| 导出 | export:user | 导出用户 |
| 导出 | export:role | 导出角色 |
| 导入 | import:user | 导入用户 |
| 导入 | import:role | 导入角色 |
| WebSocket | websocket:list | 在线用户列表 |
| WebSocket | websocket:send | 发送消息 |
| WebSocket | websocket:broadcast | 广播消息 |
| WebSocket | websocket:disconnect | 断开连接 |

## 最佳实践

### 1. 统一导入

```typescript
// 推荐：从 @/api 统一导入
import { getUserList, createUser, updateUser } from '@/api'

// 不推荐：从具体文件导入
import { getUserList } from '@/api/user'
```

### 2. 类型安全

```typescript
import type { CreateUserParams } from '@/types'

// 使用类型确保参数正确
const params: CreateUserParams = {
  username: 'test',
  password: '123456',
  roleId: 1
}

await createUser(params)
```

### 3. 错误处理

```typescript
import { ElMessage } from 'element-plus'

try {
  await deleteUser(id)
  ElMessage.success('删除成功')
} catch (error: any) {
  // 错误已被全局处理，这里可以做额外处理
  if (error.code === 403) {
    ElMessage.error('没有删除权限')
  }
}
```

### 4. 分页查询

```typescript
import { ref, reactive } from 'vue'
import { getUserList } from '@/api'
import type { UserInfo } from '@/types'

const loading = ref(false)
const list = ref<UserInfo[]>([])
const total = ref(0)
const query = reactive({
  page: 1,
  size: 10,
  keyword: ''
})

const loadData = async () => {
  loading.value = true
  try {
    const result = await getUserList(query)
    list.value = result.list
    total.value = result.total
  } finally {
    loading.value = false
  }
}
```

## 相关文档

- [HTTP 客户端](./http-client.md)
- [错误处理](./error-handling.md)
- [权限系统](./permission-refresh.md)
- [离线队列](./pwa.md)
