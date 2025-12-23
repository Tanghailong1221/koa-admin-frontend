# Sentry 错误追踪集成

## 概述

Sentry 是一个强大的错误追踪和性能监控平台。本项目已集成 Sentry，用于在生产环境中自动捕获和报告错误。

## 功能特性

- ✅ 自动捕获 JavaScript 错误
- ✅ 自动捕获 Vue 组件错误
- ✅ 自动捕获 Promise 拒绝
- ✅ 自动捕获网络请求错误
- ✅ 性能监控（页面加载、路由切换）
- ✅ 会话重放（错误时）
- ✅ Source Map 支持
- ✅ 用户上下文追踪
- ✅ 面包屑追踪
- ✅ 敏感信息过滤

## 配置

### 1. 环境变量配置

在 `.env.production` 中配置 Sentry：

```bash
# 是否启用 Sentry
VITE_ENABLE_SENTRY=true

# Sentry DSN（从 Sentry 项目设置中获取）
VITE_SENTRY_DSN=https://your-key@sentry.io/your-project-id

# Sentry 组织名称（用于上传 Source Maps）
VITE_SENTRY_ORG=your-org-name

# Sentry 项目名称
VITE_SENTRY_PROJECT=your-project-name

# Sentry Auth Token（用于上传 Source Maps）
VITE_SENTRY_AUTH_TOKEN=your-auth-token
```

### 2. 获取 Sentry DSN

1. 登录 [Sentry](https://sentry.io/)
2. 创建或选择一个项目
3. 进入 **Settings** → **Projects** → **[Your Project]** → **Client Keys (DSN)**
4. 复制 DSN 并配置到环境变量

### 3. 获取 Auth Token

用于上传 Source Maps：

1. 进入 **Settings** → **Account** → **API** → **Auth Tokens**
2. 创建新 Token，权限选择：`project:releases` 和 `project:write`
3. 复制 Token 并配置到环境变量

## 使用方法

### 自动错误捕获

Sentry 会自动捕获以下错误：

```typescript
// JavaScript 错误
throw new Error('Something went wrong')

// Promise 拒绝
Promise.reject(new Error('Async error'))

// Vue 组件错误
// 组件内的任何错误都会被自动捕获
```

### 手动捕获错误

```typescript
import { captureSentryException, captureSentryMessage } from '@/utils/sentry'

// 捕获异常
try {
  // 可能出错的代码
  riskyOperation()
} catch (error) {
  captureSentryException(error as Error, {
    extra: {
      userId: user.id,
      action: 'riskyOperation'
    }
  })
}

// 捕获消息
captureSentryMessage('User performed important action', 'info')
```

### 设置用户上下文

```typescript
import { setSentryUser, clearSentryUser } from '@/utils/sentry'

// 登录时设置用户信息
setSentryUser({
  id: user.id,
  username: user.username,
  email: user.email
})

// 登出时清除用户信息
clearSentryUser()
```

### 添加标签

```typescript
import { setSentryTag } from '@/utils/sentry'

// 添加自定义标签
setSentryTag('page', 'checkout')
setSentryTag('feature', 'payment')
```

### 添加上下文

```typescript
import { setSentryContext } from '@/utils/sentry'

// 添加自定义上下文
setSentryContext('order', {
  orderId: '12345',
  amount: 99.99,
  currency: 'USD'
})
```

### 添加面包屑

```typescript
import { addSentryBreadcrumb } from '@/utils/sentry'

// 添加面包屑（用于追踪用户操作路径）
addSentryBreadcrumb({
  message: 'User clicked checkout button',
  category: 'user-action',
  level: 'info',
  data: {
    buttonId: 'checkout-btn',
    cartTotal: 99.99
  }
})
```

### 性能追踪

```typescript
import { startSentryTransaction } from '@/utils/sentry'

// 开始性能追踪
const transaction = startSentryTransaction('checkout-process', 'task')

try {
  // 执行操作
  await processCheckout()
  transaction.setStatus('ok')
} catch (error) {
  transaction.setStatus('internal_error')
  throw error
} finally {
  transaction.finish()
}
```

## 与 ErrorLogger 集成

ErrorLogger 已自动集成 Sentry：

```typescript
import { getErrorLogger } from '@/utils/error-logger'

const logger = getErrorLogger()

// 记录错误（会自动上报到 Sentry）
logger.error(
  'HTTP_ERROR',
  'API request failed',
  new Error('Network error'),
  { url: '/api/users', status: 500 }
)
```

## 敏感信息过滤

Sentry 配置已自动过滤以下敏感信息：

### URL 参数
- `token`
- `password`
- `secret`
- `key`
- `apiKey`

### 请求头
- `authorization`
- `cookie`
- `x-api-key`

### 示例

```typescript
// 原始 URL
https://api.example.com/users?token=abc123&name=john

// 发送到 Sentry 的 URL
https://api.example.com/users?token=[FILTERED]&name=john
```

## 错误分组

Sentry 会自动将相似的错误分组。你可以通过以下方式优化分组：

### 1. 使用指纹（Fingerprint）

```typescript
import Sentry from '@/utils/sentry'

Sentry.withScope((scope) => {
  // 自定义错误分组
  scope.setFingerprint(['custom-error-group', errorType])
  Sentry.captureException(error)
})
```

### 2. 使用标签

```typescript
import { setSentryTag, captureSentryException } from '@/utils/sentry'

// 使用标签帮助分组
setSentryTag('error-type', 'validation')
captureSentryException(error)
```

## 性能监控

### 页面加载性能

Sentry 自动追踪：
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- First Input Delay (FID)
- Cumulative Layout Shift (CLS)

### 路由切换性能

```typescript
// 自动追踪路由切换时间
// 无需额外配置
```

### 自定义性能指标

```typescript
import { startSentryTransaction } from '@/utils/sentry'

const transaction = startSentryTransaction('data-processing', 'task')

// 添加子操作
const span = transaction.startChild({
  op: 'db-query',
  description: 'Fetch user data'
})

await fetchUserData()
span.finish()

transaction.finish()
```

## 会话重放

当错误发生时，Sentry 会自动录制用户会话：

- ✅ 自动录制错误前的用户操作
- ✅ 自动遮蔽敏感文本
- ✅ 自动阻止媒体内容
- ✅ 可回放查看错误发生时的用户行为

### 配置

```typescript
// 在 src/utils/sentry.ts 中配置
replaysSessionSampleRate: 0.1,  // 10% 的正常会话
replaysOnErrorSampleRate: 1.0,  // 100% 的错误会话
```

## Source Maps

### 自动上传

构建时自动上传 Source Maps 到 Sentry：

```bash
# 生产构建
npm run build

# Sentry 插件会自动上传 Source Maps
```

### 手动上传

```bash
# 安装 Sentry CLI
npm install -g @sentry/cli

# 配置
sentry-cli login

# 上传
sentry-cli releases files <release-version> upload-sourcemaps ./dist
```

## 最佳实践

### 1. 合理设置采样率

```typescript
// 生产环境建议
tracesSampleRate: 0.1,           // 10% 的性能追踪
replaysSessionSampleRate: 0.1,   // 10% 的正常会话
replaysOnErrorSampleRate: 1.0,   // 100% 的错误会话
```

### 2. 添加有意义的上下文

```typescript
// ❌ 不好
captureSentryException(error)

// ✅ 好
captureSentryException(error, {
  userId: user.id,
  action: 'checkout',
  orderId: order.id,
  amount: order.total
})
```

### 3. 使用面包屑追踪用户路径

```typescript
// 在关键操作前添加面包屑
addSentryBreadcrumb({
  message: 'User started checkout',
  category: 'user-action',
  data: { cartItems: 3, total: 99.99 }
})
```

### 4. 设置用户信息

```typescript
// 登录后立即设置
setSentryUser({
  id: user.id,
  username: user.username,
  email: user.email
})
```

### 5. 忽略预期的错误

```typescript
// 在 sentry.ts 中配置
ignoreErrors: [
  'Network request failed',
  'Request aborted',
  // 其他预期的错误
]
```

## 调试

### 开发环境

开发环境不会发送错误到 Sentry，但会在控制台打印：

```typescript
// 开发环境输出
[Sentry] Error: Something went wrong
  at ...
```

### 测试 Sentry 集成

```typescript
// 在浏览器控制台执行
import { captureSentryMessage } from '@/utils/sentry'

captureSentryMessage('Test message from console', 'info')
```

## 常见问题

### Q1: 为什么开发环境看不到错误？

**A**: 开发环境默认不发送错误到 Sentry。如需测试，可以临时修改配置：

```typescript
// src/utils/sentry.ts
if (import.meta.env.DEV) {
  console.error('[Sentry]', hint.originalException)
  return null // 改为 return event
}
```

### Q2: 如何查看 Source Maps 是否上传成功？

**A**: 
1. 进入 Sentry 项目
2. 点击 **Releases**
3. 查看对应版本的 **Artifacts**

### Q3: 错误太多怎么办？

**A**: 
1. 调整采样率
2. 添加更多忽略规则
3. 使用错误分组
4. 设置错误级别过滤

### Q4: 如何测试会话重放？

**A**: 
1. 触发一个错误
2. 进入 Sentry 项目
3. 点击错误详情
4. 查看 **Replays** 标签

## 相关资源

- [Sentry 官方文档](https://docs.sentry.io/)
- [Sentry Vue 集成](https://docs.sentry.io/platforms/javascript/guides/vue/)
- [Sentry 性能监控](https://docs.sentry.io/product/performance/)
- [Sentry 会话重放](https://docs.sentry.io/product/session-replay/)

## 示例代码

完整示例请查看：
- `src/utils/sentry.ts` - Sentry 配置和工具函数
- `src/utils/error-logger.ts` - ErrorLogger 集成
- `src/main.ts` - Sentry 初始化
- `vite.config.ts` - Sentry 插件配置
