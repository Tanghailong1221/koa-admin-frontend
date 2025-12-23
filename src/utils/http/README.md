# HTTP 客户端增强功能

这个目录包含了 HTTP 客户端的增强功能，包括请求重试、请求去重、离线队列等。

## 功能列表

### ✅ 请求重试策略（RetryStrategy）

自动重试失败的请求，支持指数退避和自定义重试条件。

#### 特性

- ✅ 自动重试网络错误、超时和 5xx 服务器错误
- ✅ 指数退避算法（避免服务器过载）
- ✅ 随机抖动（避免多个请求同时重试）
- ✅ 可配置的最大重试次数和延迟时间
- ✅ 自定义重试条件判断
- ✅ 重试回调通知
- ✅ 支持标记请求为不可重试

#### 默认配置

```typescript
{
  maxRetries: 3,           // 最大重试 3 次
  initialDelay: 1000,      // 初始延迟 1 秒
  maxDelay: 30000,         // 最大延迟 30 秒
  backoffFactor: 2,        // 指数退避倍数
}
```

#### 默认重试条件

以下情况会自动重试：
- 网络错误（无响应）
- 超时错误
- 5xx 服务器错误（500-599）
- 429 Too Many Requests
- 408 Request Timeout

以下情况不会重试：
- 4xx 客户端错误（400, 401, 403, 404 等）
- 2xx 成功响应
- 3xx 重定向

#### 使用方法

##### 1. 全局配置（已在 request.ts 中配置）

所有请求默认启用重试策略：

```typescript
import { createRetryStrategy } from './http/retry-strategy'

const retryStrategy = createRetryStrategy({
  maxRetries: 3,
  initialDelay: 1000,
  onRetry: (error, retryCount, delay) => {
    console.log(`请求失败，${delay}ms 后进行第 ${retryCount + 1} 次重试`)
  },
})
```

##### 2. 禁用特定请求的重试

对于某些不应该重试的请求（如登录、支付等），可以标记为不可重试：

```typescript
import request from '@/utils/request'
import { RetryStrategy } from '@/utils/http/retry-strategy'

// 方式 1：在请求配置中标记
const config = {
  url: '/payment/submit',
  method: 'post',
  data: paymentData,
}
RetryStrategy.markAsNoRetry(config)
await request(config)

// 方式 2：在 API 函数中标记
export const submitPayment = (data: PaymentData) => {
  const config = {
    url: '/payment/submit',
    method: 'post',
    data,
  }
  RetryStrategy.markAsNoRetry(config)
  return request<PaymentResult>(config)
}
```

##### 3. 自定义重试条件

```typescript
const customRetryStrategy = createRetryStrategy({
  maxRetries: 5,
  shouldRetry: (error) => {
    // 只重试特定的错误
    if (!error.response) return true // 网络错误
    
    const status = error.response.status
    // 只重试 503 Service Unavailable
    return status === 503
  },
})
```

##### 4. 监听重试事件

```typescript
const retryStrategy = createRetryStrategy({
  onRetry: (error, retryCount, delay) => {
    // 显示重试提示
    console.log(`请求 ${error.config?.url} 失败`)
    console.log(`将在 ${delay}ms 后进行第 ${retryCount + 1} 次重试`)
    
    // 可以在这里显示 UI 提示
    // ElMessage.warning(`请求失败，正在重试...`)
  },
})
```

#### 重试延迟计算

使用指数退避算法，每次重试的延迟时间会指数增长：

```
第 1 次重试：1000ms ± 250ms (随机抖动)
第 2 次重试：2000ms ± 500ms
第 3 次重试：4000ms ± 1000ms
...
最大延迟：30000ms
```

#### 示例场景

##### 场景 1：网络不稳定

```typescript
// 用户网络不稳定，请求超时
// 系统会自动重试 3 次，每次延迟递增
const users = await request({ url: '/users' })
// 如果 3 次都失败，才会抛出错误
```

##### 场景 2：服务器临时故障

```typescript
// 服务器返回 503 Service Unavailable
// 系统会自动重试，给服务器恢复的时间
const data = await request({ url: '/api/data' })
```

##### 场景 3：不应该重试的请求

```typescript
// 登录请求不应该重试（避免账号锁定）
const config = {
  url: '/auth/login',
  method: 'post',
  data: { username, password },
}
RetryStrategy.markAsNoRetry(config)
const result = await request(config)
```

#### 注意事项

1. **幂等性**：只对幂等请求（GET、PUT、DELETE）自动重试是安全的。POST 请求可能会导致重复操作，需要服务端支持幂等性。

2. **超时设置**：确保请求超时时间（timeout）小于重试总时间，避免用户等待过久。

3. **服务器压力**：指数退避和随机抖动可以避免大量请求同时重试，减轻服务器压力。

4. **用户体验**：对于重要的请求，可以在 `onRetry` 回调中显示 UI 提示，让用户知道系统正在重试。

5. **错误处理**：即使启用了重试，最终失败时仍然会抛出错误，需要在业务代码中处理。

### ✅ 请求去重（RequestDeduplication）

防止重复发送相同的请求，自动取消重复的请求。

#### 特性

- ✅ 自动检测重复请求（基于 method + url + params + data）
- ✅ 自动取消重复请求
- ✅ 支持标记请求为允许重复
- ✅ 支持自定义请求键生成函数
- ✅ 支持手动取消单个或所有请求
- ✅ 自动清理超时请求（防止内存泄漏）
- ✅ 可以启用/禁用去重功能

#### 工作原理

1. **请求拦截**：在发送请求前，生成请求的唯一键
2. **重复检测**：检查是否已有相同的请求正在进行
3. **自动取消**：如果检测到重复，自动取消新请求
4. **请求完成**：请求成功或失败后，从队列中移除

#### 默认配置

```typescript
{
  enabled: true,  // 启用去重
}
```

#### 请求键生成规则

默认基于以下信息生成唯一键：
- HTTP 方法（GET、POST 等）
- 请求 URL
- 查询参数（params）
- 请求体（data）

例如：
```
GET:/api/users:{"page":1}:
POST:/api/users::{"name":"John"}
```

#### 使用方法

##### 1. 全局配置（已在 request.ts 中配置）

所有请求默认启用去重：

```typescript
import { createRequestDeduplication } from './http/request-deduplication'

const requestDeduplication = createRequestDeduplication({
  enabled: true,
})
```

##### 2. 允许特定请求重复

对于某些需要允许重复的请求（如轮询、实时数据等），可以标记为允许重复：

```typescript
import request from '@/utils/request'
import { RequestDeduplication } from '@/utils/http/request-deduplication'

// 方式 1：在请求配置中标记
const config = {
  url: '/api/realtime-data',
  method: 'get',
}
RequestDeduplication.markAsAllowDuplicate(config)
await request(config)

// 方式 2：在 API 函数中标记
export const getRealtimeData = () => {
  const config = {
    url: '/api/realtime-data',
    method: 'get',
  }
  RequestDeduplication.markAsAllowDuplicate(config)
  return request<RealtimeData>(config)
}
```

##### 3. 自定义请求键生成

```typescript
const customDeduplication = createRequestDeduplication({
  generateKey: (config) => {
    // 只基于 URL 生成键，忽略参数
    return `${config.method}:${config.url}`
  },
})
```

##### 4. 手动取消请求

```typescript
// 取消特定请求
requestDeduplication.cancelRequest(config, '用户取消')

// 取消所有请求（如页面卸载时）
requestDeduplication.cancelAllRequests('页面已卸载')
```

#### 示例场景

##### 场景 1：防止按钮重复点击

```typescript
// 用户快速点击"提交"按钮多次
// 只有第一个请求会发送，后续的会被自动取消
async function handleSubmit() {
  try {
    await request({
      url: '/api/submit',
      method: 'post',
      data: formData,
    })
    ElMessage.success('提交成功')
  } catch (error) {
    if (axios.isCancel(error)) {
      // 重复请求被取消，不显示错误
      return
    }
    ElMessage.error('提交失败')
  }
}
```

##### 场景 2：防止搜索框频繁请求

```typescript
// 用户快速输入搜索关键词
// 相同的搜索请求会被去重
async function handleSearch(keyword: string) {
  const results = await request({
    url: '/api/search',
    method: 'get',
    params: { keyword },
  })
  return results
}
```

##### 场景 3：允许轮询请求

```typescript
// 轮询请求需要允许重复
async function pollData() {
  const config = {
    url: '/api/poll',
    method: 'get',
  }
  RequestDeduplication.markAsAllowDuplicate(config)
  
  const data = await request(config)
  return data
}

// 每 5 秒轮询一次
setInterval(pollData, 5000)
```

##### 场景 4：页面卸载时取消所有请求

```typescript
import { onBeforeUnmount } from 'vue'

export default {
  setup() {
    onBeforeUnmount(() => {
      // 取消所有待处理的请求
      requestDeduplication.cancelAllRequests('组件已卸载')
    })
  }
}
```

#### 注意事项

1. **幂等性**：去重主要用于防止短时间内的重复请求，不能替代服务端的幂等性设计。

2. **轮询请求**：对于轮询、实时数据等需要重复请求的场景，记得标记为允许重复。

3. **取消处理**：被取消的请求会抛出 `axios.Cancel` 错误，需要在业务代码中适当处理。

4. **内存管理**：系统会自动清理超时的请求（默认 1 分钟），防止内存泄漏。

5. **自定义键**：如果默认的键生成规则不满足需求，可以自定义键生成函数。

### ✅ 离线队列（OfflineQueue）

在离线时缓存请求，网络恢复后自动重放。

#### 特性

- ✅ 自动检测网络状态（online/offline）
- ✅ 离线时自动缓存变更请求（POST、PUT、DELETE、PATCH）
- ✅ 网络恢复时自动重放队列中的请求
- ✅ 支持请求重试（失败后最多重试 3 次）
- ✅ 支持队列持久化（刷新页面后仍然保留）
- ✅ 支持队列大小限制（防止内存溢出）
- ✅ 支持标记请求为不缓存
- ✅ 提供网络状态变化回调
- ✅ 提供请求重放成功/失败回调

#### 工作原理

1. **网络监听**：监听 `online` 和 `offline` 事件
2. **请求拦截**：网络错误时，将变更请求加入队列
3. **持久化**：队列保存到 localStorage，刷新页面不丢失
4. **自动重放**：网络恢复时，自动重放队列中的所有请求
5. **失败重试**：重放失败的请求会重试，最多 3 次

#### 默认配置

```typescript
{
  enabled: true,        // 启用离线队列
  maxQueueSize: 50,     // 最大队列大小
  persist: true,        // 持久化队列
}
```

#### 缓存规则

只缓存以下类型的请求：
- POST（创建）
- PUT（更新）
- DELETE（删除）
- PATCH（部分更新）

不缓存以下类型的请求：
- GET（查询）
- HEAD、OPTIONS 等

#### 使用方法

##### 1. 全局配置（已在 request.ts 中配置）

所有变更请求在离线时会自动加入队列：

```typescript
import { createOfflineQueue } from './http/offline-queue'

const offlineQueue = createOfflineQueue({
  enabled: true,
  maxQueueSize: 50,
  persist: true,
  onOnline: () => {
    ElMessage.success('网络已恢复，正在同步离线数据...')
  },
  onOffline: () => {
    ElMessage.warning('网络已断开，请求将在网络恢复后自动重试')
  },
})
```

##### 2. 禁用特定请求的离线缓存

对于某些不应该缓存的请求（如敏感操作），可以标记为不缓存：

```typescript
import request from '@/utils/request'
import { OfflineQueue } from '@/utils/http/offline-queue'

// 方式 1：在请求配置中标记
const config = {
  url: '/payment/submit',
  method: 'post',
  data: paymentData,
}
OfflineQueue.markAsNoCache(config)
await request(config)

// 方式 2：在 API 函数中标记
export const submitPayment = (data: PaymentData) => {
  const config = {
    url: '/payment/submit',
    method: 'post',
    data,
  }
  OfflineQueue.markAsNoCache(config)
  return request<PaymentResult>(config)
}
```

##### 3. 手动触发队列重放

```typescript
// 手动重放队列（通常不需要，网络恢复时会自动重放）
await offlineQueue.replayQueue()
```

##### 4. 查看队列状态

```typescript
// 获取队列大小
const size = offlineQueue.getQueueSize()

// 获取所有待处理的请求
const queue = offlineQueue.getQueue()

// 检查网络状态
const isOnline = offlineQueue.isNetworkOnline()
```

##### 5. 清空队列

```typescript
// 清空所有待处理的请求
offlineQueue.clear()
```

#### 示例场景

##### 场景 1：移动端网络不稳定

```typescript
// 用户在地铁中使用应用，网络时断时续
// 用户提交表单
async function handleSubmit() {
  try {
    await request({
      url: '/api/submit',
      method: 'post',
      data: formData,
    })
    ElMessage.success('提交成功')
  } catch (error: any) {
    if (error.message?.includes('离线队列')) {
      // 请求已加入离线队列
      ElMessage.info('网络不稳定，数据将在网络恢复后自动提交')
    } else {
      ElMessage.error('提交失败')
    }
  }
}
```

##### 场景 2：批量操作

```typescript
// 用户批量删除数据
async function batchDelete(ids: number[]) {
  const promises = ids.map(id =>
    request({
      url: `/api/items/${id}`,
      method: 'delete',
    })
  )
  
  try {
    await Promise.all(promises)
    ElMessage.success('删除成功')
  } catch (error) {
    // 部分请求可能已加入离线队列
    ElMessage.warning('部分操作将在网络恢复后完成')
  }
}
```

##### 场景 3：不应该缓存的请求

```typescript
// 支付请求不应该缓存（避免重复支付）
export const submitPayment = (data: PaymentData) => {
  const config = {
    url: '/payment/submit',
    method: 'post',
    data,
  }
  OfflineQueue.markAsNoCache(config)
  return request<PaymentResult>(config)
}
```

##### 场景 4：监听网络状态

```typescript
import { onMounted, onUnmounted } from 'vue'

export default {
  setup() {
    const handleOnline = () => {
      console.log('网络已恢复')
      // 可以刷新数据
    }
    
    const handleOffline = () => {
      console.log('网络已断开')
      // 可以显示离线提示
    }
    
    onMounted(() => {
      window.addEventListener('online', handleOnline)
      window.addEventListener('offline', handleOffline)
    })
    
    onUnmounted(() => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    })
  }
}
```

#### 注意事项

1. **幂等性**：离线队列会重放请求，确保服务端接口支持幂等性，避免重复操作。

2. **敏感操作**：支付、转账等敏感操作不应该使用离线队列，应该标记为不缓存。

3. **队列大小**：默认最多缓存 50 个请求，超过限制的请求会被拒绝。

4. **持久化**：队列保存在 localStorage，注意不要存储敏感数据。

5. **重试限制**：每个请求最多重试 3 次，超过限制会被丢弃。

6. **网络检测**：使用 `navigator.onLine` 检测网络状态，可能不够准确，建议结合实际请求结果判断。

7. **用户体验**：在离线时应该给用户明确的提示，告知数据将在网络恢复后同步。

### ⏳ 请求取消（待实现）

支持取消正在进行的请求。

**注意：** 请求取消功能已通过请求去重和离线队列实现：
- 请求去重提供了 `cancelRequest()` 和 `cancelAllRequests()` 方法
- 离线队列在网络离线时会自动取消无法发送的请求
- Axios 原生支持通过 `CancelToken` 取消请求

## 完整示例

### 综合使用所有功能

```typescript
import request from '@/utils/request'
import { RetryStrategy } from '@/utils/http/retry-strategy'
import { RequestDeduplication } from '@/utils/http/request-deduplication'
import { OfflineQueue } from '@/utils/http/offline-queue'

// 示例 1：普通请求（自动启用重试、去重、离线队列）
async function fetchUsers() {
  const users = await request({
    url: '/api/users',
    method: 'get',
  })
  return users
}

// 示例 2：禁用重试的请求（如登录）
async function login(username: string, password: string) {
  const config = {
    url: '/auth/login',
    method: 'post',
    data: { username, password },
  }
  RetryStrategy.markAsNoRetry(config)
  return request(config)
}

// 示例 3：允许重复的请求（如轮询）
async function pollStatus() {
  const config = {
    url: '/api/status',
    method: 'get',
  }
  RequestDeduplication.markAsAllowDuplicate(config)
  return request(config)
}

// 示例 4：不缓存的请求（如支付）
async function submitPayment(data: PaymentData) {
  const config = {
    url: '/payment/submit',
    method: 'post',
    data,
  }
  OfflineQueue.markAsNoCache(config)
  return request(config)
}

// 示例 5：综合配置
async function criticalOperation(data: any) {
  const config = {
    url: '/api/critical',
    method: 'post',
    data,
  }
  
  // 不重试（避免重复操作）
  RetryStrategy.markAsNoRetry(config)
  // 不缓存（避免离线重放）
  OfflineQueue.markAsNoCache(config)
  
  return request(config)
}
```

## HTTP 客户端架构

```
┌─────────────────────────────────────────────────────────┐
│                     应用层                               │
│              (API 函数、业务逻辑)                        │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                  Request 函数                            │
│              (统一的请求入口)                            │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              请求拦截器                                  │
│  ┌──────────────┐  ┌──────────────┐                    │
│  │  添加 Token  │  │  请求去重    │                    │
│  └──────────────┘  └──────────────┘                    │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              Axios Instance                              │
│              (发送 HTTP 请求)                            │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              响应拦截器                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  移除去重    │  │  请求重试    │  │  离线队列    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│  ┌──────────────┐  ┌──────────────┐                    │
│  │  Token 刷新  │  │  错误处理    │                    │
│  └──────────────┘  └──────────────┘                    │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                     应用层                               │
│              (处理响应数据)                              │
└─────────────────────────────────────────────────────────┘
```

## 测试

运行测试：

```bash
npm test src/utils/http
```

查看测试覆盖率：

```bash
npm test -- --coverage src/utils/http
```


### ✅ 数据级权限拦截器（DataPermissionInterceptor）

自动在 HTTP 请求中注入用户的组织和角色过滤条件，实现数据级别的权限控制。

#### 特性

- ✅ 自动注入数据权限过滤条件
- ✅ 支持组织/部门过滤
- ✅ 支持角色过滤
- ✅ 支持多种数据权限类型
- ✅ 支持白名单（跳过权限注入）
- ✅ 支持黑名单（强制权限注入）
- ✅ 支持自定义过滤规则
- ✅ 超级管理员自动跳过权限过滤

#### 工作原理

1. **权限配置**：从用户信息中提取权限配置（用户 ID、部门 ID、角色等）
2. **请求拦截**：在发送请求前，检查是否需要注入权限
3. **参数注入**：根据请求方法，将权限参数注入到 params 或 data
4. **白名单过滤**：白名单中的请求不注入权限（如登录、公开接口）
5. **超级管理员**：超级管理员自动跳过权限过滤

#### 数据权限类型

```typescript
enum DataPermissionType {
  ALL = 'all',                    // 全部数据
  DEPT = 'dept',                  // 本部门数据
  DEPT_AND_CHILD = 'dept_and_child', // 本部门及子部门数据
  SELF = 'self',                  // 仅本人数据
  CUSTOM = 'custom'               // 自定义数据
}
```

#### 默认配置

```typescript
{
  enabled: true,                  // 启用拦截器
  whitelist: [                    // 白名单（不注入权限）
    '/user/login',
    '/user/logout',
    '/user/refresh-token',
    '/captcha',
    '/public'
  ],
  blacklist: [],                  // 黑名单（强制注入权限）
  paramNames: {                   // 参数名称映射
    userId: 'userId',
    username: 'username',
    deptId: 'deptId',
    deptIds: 'deptIds',
    roleIds: 'roleIds',
    roleCodes: 'roleCodes',
    dataPermissionType: 'dataPermissionType'
  }
}
```

#### 使用方法

##### 1. 全局配置（已在 request.ts 中配置）

所有请求默认启用数据权限拦截：

```typescript
import { createDataPermissionInterceptor } from './http/data-permission-interceptor'
import { useAuthStore } from '@/store/auth'

const dataPermissionInterceptor = createDataPermissionInterceptor({
  enabled: true,
  getPermissionConfig: () => {
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

// 在请求拦截器中使用
instance.interceptors.request.use(config => {
  config = dataPermissionInterceptor.intercept(config)
  return config
})
```

##### 2. 配置白名单

某些接口不需要注入权限过滤（如登录、公开接口）：

```typescript
const interceptor = createDataPermissionInterceptor({
  whitelist: [
    '/user/login',
    '/user/logout',
    '/public/*'  // 支持通配符
  ]
})

// 动态添加白名单
interceptor.addWhitelist('/api/public/news')

// 移除白名单
interceptor.removeWhitelist('/api/public/news')
```

##### 3. 配置黑名单

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
```

##### 4. 自定义参数名称

如果后端使用不同的参数名称：

```typescript
const interceptor = createDataPermissionInterceptor({
  paramNames: {
    userId: 'user_id',
    deptId: 'dept_id',
    roleIds: 'role_ids'
  }
})
```

##### 5. 自定义过滤器

添加自定义的权限过滤逻辑：

```typescript
const interceptor = createDataPermissionInterceptor({
  customFilter: (config, permissionConfig) => {
    // 订单列表：只能查看自己创建的订单
    if (config.url?.includes('/order/list')) {
      config.params = {
        ...config.params,
        createdBy: permissionConfig.userId
      }
    }

    // 报表接口：添加时间范围限制
    if (config.url?.includes('/report/')) {
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

##### 6. 动态启用/禁用

```typescript
// 禁用拦截器
interceptor.disable()

// 启用拦截器
interceptor.enable()
```

#### 示例场景

##### 场景 1：部门管理员查看用户列表

```typescript
// 部门管理员只能查看本部门及子部门的用户
// GET /api/user/list?page=1&pageSize=10
// 实际请求：/api/user/list?page=1&pageSize=10&userId=2&deptId=10&deptIds=10,11,12&roleIds=2

async function fetchUsers(page: number, pageSize: number) {
  const users = await request({
    url: '/api/user/list',
    method: 'get',
    params: { page, pageSize }
    // userId, deptId, deptIds, roleIds 会自动注入
  })
  return users
}
```

##### 场景 2：普通用户只能查看自己的数据

```typescript
// 普通用户只能查看自己创建的订单
// GET /api/order/list?page=1
// 实际请求：/api/order/list?page=1&userId=3&deptId=10&roleIds=3

async function fetchMyOrders(page: number) {
  const orders = await request({
    url: '/api/order/list',
    method: 'get',
    params: { page }
    // userId, deptId, roleIds 会自动注入
  })
  return orders
}
```

##### 场景 3：超级管理员查看所有数据

```typescript
// 超级管理员可以查看所有数据，不会注入权限过滤
// GET /api/user/list?page=1&pageSize=10
// 实际请求：/api/user/list?page=1&pageSize=10（不注入权限参数）

async function fetchAllUsers(page: number, pageSize: number) {
  const users = await request({
    url: '/api/user/list',
    method: 'get',
    params: { page, pageSize }
    // 超级管理员不会注入权限参数
  })
  return users
}
```

##### 场景 4：公开接口不注入权限

```typescript
// 公开接口（在白名单中）不会注入权限
// GET /api/public/news?page=1
// 实际请求：/api/public/news?page=1（不注入权限参数）

async function fetchPublicNews(page: number) {
  const news = await request({
    url: '/api/public/news',
    method: 'get',
    params: { page }
    // 白名单接口不会注入权限参数
  })
  return news
}
```

#### 后端配置

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

#### 注意事项

1. **超级管理员**：超级管理员会自动跳过权限过滤，可以查看所有数据

2. **白名单优先级**：黑名单优先级高于白名单

3. **参数合并**：权限参数会与原有参数合并，不会覆盖

4. **FormData 支持**：支持 FormData 类型的请求

5. **安全性**：前端权限过滤只是辅助，后端必须进行权限验证

6. **性能**：权限参数注入是轻量级操作，不会影响性能

#### 相关文档

- [数据权限拦截器详细文档](./data-permission-interceptor.md)
- [数据权限示例页面](../../views/examples/DataPermissionExample.vue)
