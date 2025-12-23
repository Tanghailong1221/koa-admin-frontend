# 数据级权限拦截器

数据级权限拦截器用于在 HTTP 请求中自动注入用户的组织和角色过滤条件，实现数据级别的权限控制。

## 功能特性

- ✅ 自动注入数据权限过滤条件
- ✅ 支持组织/部门过滤
- ✅ 支持角色过滤
- ✅ 支持多种数据权限类型
- ✅ 支持白名单（跳过权限注入）
- ✅ 支持黑名单（强制权限注入）
- ✅ 支持自定义过滤规则
- ✅ 超级管理员自动跳过权限过滤

## 数据权限类型

```typescript
enum DataPermissionType {
  ALL = 'all',                    // 全部数据
  DEPT = 'dept',                  // 本部门数据
  DEPT_AND_CHILD = 'dept_and_child', // 本部门及子部门数据
  SELF = 'self',                  // 仅本人数据
  CUSTOM = 'custom'               // 自定义数据
}
```

## 基础用法

### 1. 创建拦截器实例

```typescript
import { createDataPermissionInterceptor } from '@/utils/http/data-permission-interceptor'
import type { DataPermissionConfig } from '@/utils/http/data-permission-interceptor'

const interceptor = createDataPermissionInterceptor({
  enabled: true,
  getPermissionConfig: () => {
    // 从 store 或其他地方获取用户权限配置
    const auth = useAuthStore()
    if (!auth.userInfo) {
      return null
    }

    return {
      userId: auth.userInfo.id,
      username: auth.userInfo.username,
      deptId: auth.userInfo.deptId,
      roleIds: auth.userInfo.roles?.map(r => r.id) || [],
      roleCodes: auth.userInfo.roles?.map(r => r.code) || [],
      isSuperAdmin: auth.userInfo.roles?.some(r => r.code === 'super_admin') || false
    }
  }
})
```

### 2. 集成到 Axios

```typescript
import axios from 'axios'

const instance = axios.create({
  baseURL: '/api/v1',
  timeout: 15000
})

// 添加请求拦截器
instance.interceptors.request.use(config => {
  // 注入数据权限
  config = interceptor.intercept(config)
  return config
})
```

### 3. 发起请求

```typescript
// GET 请求 - 权限参数会自动注入到 params
const users = await axios.get('/user/list', {
  params: {
    page: 1,
    pageSize: 10
    // userId, deptId, roleIds 等会自动注入
  }
})

// POST 请求 - 权限参数会自动注入到 data
const result = await axios.post('/user/create', {
  name: '张三',
  email: 'zhangsan@example.com'
  // userId, deptId, roleIds 等会自动注入
})
```

## 高级用法

### 1. 配置白名单

某些接口不需要注入权限过滤（如登录、公开接口）：

```typescript
const interceptor = createDataPermissionInterceptor({
  whitelist: [
    '/user/login',
    '/user/logout',
    '/user/refresh-token',
    '/captcha',
    '/public/*'  // 支持通配符
  ]
})

// 动态添加白名单
interceptor.addWhitelist('/api/public/news')
interceptor.addWhitelist(['/api/public/about', '/api/public/contact'])

// 移除白名单
interceptor.removeWhitelist('/api/public/news')
```

### 2. 配置黑名单

某些接口强制注入权限过滤（优先级高于白名单）：

```typescript
const interceptor = createDataPermissionInterceptor({
  blacklist: [
    '/sensitive/*',
    '/admin/*'
  ]
})

// 动态添加黑名单
interceptor.addBlacklist('/api/sensitive/data')

// 移除黑名单
interceptor.removeBlacklist('/api/sensitive/data')
```

### 3. 自定义参数名称

如果后端使用不同的参数名称：

```typescript
const interceptor = createDataPermissionInterceptor({
  paramNames: {
    userId: 'user_id',
    username: 'user_name',
    deptId: 'dept_id',
    deptIds: 'dept_ids',
    roleIds: 'role_ids',
    roleCodes: 'role_codes',
    dataPermissionType: 'data_permission_type'
  }
})
```

### 4. 自定义过滤器

添加自定义的权限过滤逻辑：

```typescript
const interceptor = createDataPermissionInterceptor({
  customFilter: (config, permissionConfig) => {
    // 根据不同的接口添加不同的过滤条件
    if (config.url?.includes('/order/list')) {
      // 订单列表：只能查看自己创建的订单
      config.params = {
        ...config.params,
        createdBy: permissionConfig.userId
      }
    }

    if (config.url?.includes('/report/')) {
      // 报表接口：添加时间范围限制
      const now = new Date()
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      config.params = {
        ...config.params,
        startDate: startDate.toISOString(),
        endDate: now.toISOString()
      }
    }
  }
})
```

### 5. 动态启用/禁用

```typescript
// 禁用拦截器
interceptor.disable()

// 启用拦截器
interceptor.enable()
```

### 6. 更新权限配置

```typescript
// 用户登录后更新权限配置
const auth = useAuthStore()
await auth.login({ username, password })

interceptor.setPermissionConfig({
  userId: auth.userInfo.id,
  username: auth.userInfo.username,
  deptId: auth.userInfo.deptId,
  roleIds: auth.userInfo.roles?.map(r => r.id) || [],
  isSuperAdmin: auth.userInfo.roles?.some(r => r.code === 'super_admin') || false
})

// 用户登出后清空权限配置
await auth.logout()
interceptor.setPermissionConfig(null)
```

## 完整示例

```typescript
import { createDataPermissionInterceptor, DataPermissionType } from '@/utils/http/data-permission-interceptor'
import { useAuthStore } from '@/store/auth'
import axios from 'axios'

// 创建拦截器
const dataPermissionInterceptor = createDataPermissionInterceptor({
  enabled: true,
  whitelist: [
    '/user/login',
    '/user/logout',
    '/user/refresh-token',
    '/captcha',
    '/public/*'
  ],
  blacklist: [
    '/sensitive/*'
  ],
  paramNames: {
    userId: 'userId',
    deptId: 'deptId',
    roleIds: 'roleIds'
  },
  getPermissionConfig: () => {
    const auth = useAuthStore()
    if (!auth.userInfo) {
      return null
    }

    return {
      userId: auth.userInfo.id,
      username: auth.userInfo.username,
      deptId: auth.userInfo.deptId,
      deptIds: auth.userInfo.deptIds || [],
      roleIds: auth.userInfo.roles?.map(r => r.id) || [],
      roleCodes: auth.userInfo.roles?.map(r => r.code) || [],
      dataPermissionType: DataPermissionType.DEPT_AND_CHILD,
      isSuperAdmin: auth.userInfo.roles?.some(r => r.code === 'super_admin') || false,
      customFilters: {
        // 自定义过滤条件
        status: 1
      }
    }
  },
  customFilter: (config, permissionConfig) => {
    // 自定义过滤逻辑
    if (config.url?.includes('/order/list')) {
      config.params = {
        ...config.params,
        createdBy: permissionConfig.userId
      }
    }
  }
})

// 创建 axios 实例
const instance = axios.create({
  baseURL: '/api/v1',
  timeout: 15000
})

// 添加请求拦截器
instance.interceptors.request.use(config => {
  // 注入数据权限
  config = dataPermissionInterceptor.intercept(config)
  return config
})

// 使用
async function fetchUsers() {
  // GET 请求
  // 实际请求：/api/v1/user/list?page=1&pageSize=10&userId=1&deptId=10&roleIds=1,2&status=1
  const users = await instance.get('/user/list', {
    params: {
      page: 1,
      pageSize: 10
    }
  })
  return users
}

async function createUser(data: any) {
  // POST 请求
  // 实际请求体：{ name: '张三', email: '...', userId: 1, deptId: 10, roleIds: [1, 2], status: 1 }
  const result = await instance.post('/user/create', data)
  return result
}
```

## 后端配置

后端需要根据注入的权限参数进行数据过滤：

```java
// Java 示例
@GetMapping("/user/list")
public Result<List<User>> getUserList(
    @RequestParam Integer page,
    @RequestParam Integer pageSize,
    @RequestParam(required = false) Long userId,
    @RequestParam(required = false) Long deptId,
    @RequestParam(required = false) List<Long> roleIds
) {
    // 构建查询条件
    QueryWrapper<User> query = new QueryWrapper<>();
    
    // 根据部门过滤
    if (deptId != null) {
        query.eq("dept_id", deptId);
    }
    
    // 根据角色过滤
    if (roleIds != null && !roleIds.isEmpty()) {
        query.in("role_id", roleIds);
    }
    
    // 分页查询
    Page<User> result = userService.page(new Page<>(page, pageSize), query);
    return Result.success(result);
}
```

```typescript
// Node.js 示例
app.get('/user/list', async (req, res) => {
  const { page, pageSize, userId, deptId, roleIds } = req.query

  // 构建查询条件
  const where: any = {}
  
  if (deptId) {
    where.deptId = deptId
  }
  
  if (roleIds) {
    where.roleId = { $in: Array.isArray(roleIds) ? roleIds : [roleIds] }
  }

  // 分页查询
  const users = await User.find(where)
    .skip((page - 1) * pageSize)
    .limit(pageSize)

  res.json({ code: 0, data: users })
})
```

## 注意事项

1. **超级管理员**：超级管理员会自动跳过权限过滤，可以查看所有数据
2. **白名单优先级**：黑名单优先级高于白名单
3. **参数合并**：权限参数会与原有参数合并，不会覆盖
4. **FormData 支持**：支持 FormData 类型的请求
5. **安全性**：前端权限过滤只是辅助，后端必须进行权限验证
6. **性能**：权限参数注入是轻量级操作，不会影响性能

## API 参考

### DataPermissionInterceptor

#### 构造函数

```typescript
constructor(config?: DataPermissionInterceptorConfig)
```

#### 方法

- `setPermissionConfig(config: DataPermissionConfig | null): void` - 设置权限配置
- `enable(): void` - 启用拦截器
- `disable(): void` - 禁用拦截器
- `intercept(config: AxiosRequestConfig): AxiosRequestConfig` - 拦截请求
- `addWhitelist(url: string | string[]): void` - 添加白名单
- `removeWhitelist(url: string): void` - 移除白名单
- `addBlacklist(url: string | string[]): void` - 添加黑名单
- `removeBlacklist(url: string): void` - 移除黑名单
- `getConfig(): Required<DataPermissionInterceptorConfig>` - 获取配置

### 类型定义

```typescript
interface DataPermissionConfig {
  userId?: string | number
  username?: string
  deptId?: string | number
  deptIds?: (string | number)[]
  roleIds?: (string | number)[]
  roleCodes?: string[]
  dataPermissionType?: DataPermissionType
  isSuperAdmin?: boolean
  customFilters?: Record<string, any>
}

interface DataPermissionInterceptorConfig {
  enabled?: boolean
  whitelist?: string[]
  blacklist?: string[]
  paramNames?: {
    userId?: string
    username?: string
    deptId?: string
    deptIds?: string
    roleIds?: string
    roleCodes?: string
    dataPermissionType?: string
  }
  getPermissionConfig?: () => DataPermissionConfig | null
  customFilter?: (config: AxiosRequestConfig, permissionConfig: DataPermissionConfig) => void
}
```
