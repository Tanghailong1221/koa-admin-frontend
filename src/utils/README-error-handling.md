# 错误处理系统使用指南

本项目实现了完整的错误处理系统，包括错误捕获、日志记录、用户提示和错误上报。

## 组件概览

### 1. ErrorLogger（错误日志记录器）
负责收集、分类和记录错误信息。

### 2. ErrorBoundary（错误边界组件）
捕获 Vue 组件树中的错误，提供降级 UI。

### 3. 全局错误处理器
捕获应用中所有未处理的错误。

## 使用方法

### 1. 使用 ErrorBoundary 组件

在可能出错的组件外包裹 ErrorBoundary：

```vue
<template>
  <ErrorBoundary
    title="数据加载失败"
    message="无法加载用户数据，请稍后重试"
    :show-details="true"
    @error="handleError"
    @retry="handleRetry"
  >
    <UserList />
  </ErrorBoundary>
</template>

<script setup lang="ts">
import ErrorBoundary from '@/components/ErrorBoundary.vue'
import UserList from './UserList.vue'

function handleError(error: Error) {
  console.log('捕获到错误:', error)
}

function handleRetry() {
  console.log('用户点击重试')
  // 重新加载数据
}
</script>
```

### 2. 手动报告错误

在业务代码中手动报告错误：

```typescript
import { reportError, reportWarning, reportInfo } from '@/utils/setup-error-handler'

// 报告错误
try {
  await someOperation()
} catch (error) {
  reportError(error as Error, {
    operation: 'someOperation',
    userId: user.id,
  })
}

// 报告警告
reportWarning('数据可能不完整', {
  dataId: data.id,
})

// 报告信息
reportInfo('操作成功完成', {
  operation: 'export',
})
```

### 3. 使用 ErrorLogger

直接使用 ErrorLogger 记录错误：

```typescript
import { getErrorLogger, ErrorType } from '@/utils/error-logger'

const errorLogger = getErrorLogger()

// 记录不同级别的日志
errorLogger.debug('调试信息')
errorLogger.info('一般信息')
errorLogger.warning('警告信息')
errorLogger.error(ErrorType.BUSINESS_ERROR, '业务错误', error)
errorLogger.fatal(ErrorType.JS_ERROR, '严重错误', error)

// 查询日志
const allLogs = errorLogger.getLogs()
const errorLogs = errorLogger.getLogsByLevel(ErrorLevel.ERROR)
const httpErrors = errorLogger.getLogsByType(ErrorType.HTTP_ERROR)

// 清空日志
errorLogger.clear()
```

### 4. HTTP 错误处理

HTTP 错误会自动被捕获和记录：

```typescript
import request from '@/utils/request'

try {
  const data = await request({
    url: '/api/users',
    method: 'get',
  })
} catch (error) {
  // 错误已被自动记录和显示
  // 这里可以添加额外的错误处理逻辑
}
```

## 错误类型

系统支持以下错误类型：

- `JS_ERROR` - JavaScript 错误
- `NETWORK_ERROR` - 网络错误
- `RESOURCE_ERROR` - 资源加载错误
- `PROMISE_ERROR` - Promise 未捕获错误
- `VUE_ERROR` - Vue 组件错误
- `HTTP_ERROR` - HTTP 请求错误
- `BUSINESS_ERROR` - 业务逻辑错误
- `UNKNOWN_ERROR` - 未知错误

## 错误级别

系统支持以下错误级别：

- `DEBUG` - 调试信息
- `INFO` - 一般信息
- `WARNING` - 警告
- `ERROR` - 错误
- `FATAL` - 严重错误

## 全局错误处理

全局错误处理器会自动捕获：

1. **Vue 组件错误** - 通过 `app.config.errorHandler`
2. **未捕获的 Promise 错误** - 通过 `unhandledrejection` 事件
3. **JavaScript 错误** - 通过 `error` 事件
4. **资源加载错误** - 通过 `error` 事件

### 用户提示策略

- **重要错误**（网络、超时、代码分割）：使用通知（Notification）
- **一般错误**：使用消息提示（Message）
- **开发环境**：显示详细错误信息
- **生产环境**：显示用户友好的通用消息

## 错误上报

### 配置错误上报

```typescript
import { getErrorLogger } from '@/utils/error-logger'

const errorLogger = getErrorLogger()

// 配置上报函数（如 Sentry）
errorLogger.reportFunction = async (entry) => {
  // 发送到监控服务
  await fetch('/api/error-report', {
    method: 'POST',
    body: JSON.stringify(entry),
  })
}

// 批量上报所有未上报的错误
await errorLogger.reportAll()
```

### 集成 Sentry（可选）

```typescript
// src/utils/sentry.ts
import * as Sentry from '@sentry/vue'
import { getErrorLogger } from './error-logger'

export function setupSentry(app: App) {
  Sentry.init({
    app,
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    // 其他配置...
  })

  // 集成到 ErrorLogger
  const errorLogger = getErrorLogger()
  errorLogger.reportFunction = async (entry) => {
    Sentry.captureException(new Error(entry.message), {
      level: entry.level as any,
      tags: {
        type: entry.type,
      },
      extra: entry.context,
    })
  }
}
```

## 最佳实践

### 1. 在关键操作中使用 ErrorBoundary

```vue
<template>
  <ErrorBoundary>
    <CriticalComponent />
  </ErrorBoundary>
</template>
```

### 2. 为异步操作添加错误处理

```typescript
async function loadData() {
  try {
    const data = await fetchData()
    return data
  } catch (error) {
    reportError(error as Error, {
      operation: 'loadData',
      timestamp: Date.now(),
    })
    throw error
  }
}
```

### 3. 在表单提交中处理错误

```typescript
async function handleSubmit() {
  try {
    await submitForm(formData)
    ElMessage.success('提交成功')
  } catch (error) {
    // 错误已被自动处理
    // 可以添加额外的 UI 反馈
  }
}
```

### 4. 记录重要的业务操作

```typescript
import { reportInfo } from '@/utils/setup-error-handler'

async function exportData() {
  try {
    await performExport()
    reportInfo('数据导出成功', {
      recordCount: data.length,
      format: 'excel',
    })
  } catch (error) {
    reportError(error as Error, {
      operation: 'export',
    })
  }
}
```

## 调试技巧

### 查看错误日志

在浏览器控制台中：

```javascript
// 获取所有错误日志
window.__errorLogger = getErrorLogger()
window.__errorLogger.getLogs()

// 查看特定类型的错误
window.__errorLogger.getLogsByType('http_error')

// 查看特定级别的错误
window.__errorLogger.getLogsByLevel('error')
```

### 测试错误处理

```typescript
// 触发 Vue 错误
throw new Error('测试 Vue 错误')

// 触发 Promise 错误
Promise.reject(new Error('测试 Promise 错误'))

// 触发网络错误
await request({ url: '/non-existent-api' })
```

## 注意事项

1. **不要过度使用 ErrorBoundary**：只在关键组件周围使用
2. **避免在错误处理中再次抛出错误**：可能导致无限循环
3. **生产环境不要暴露敏感信息**：错误消息应该是用户友好的
4. **定期清理错误日志**：避免内存占用过大
5. **合理设置采样率**：生产环境建议 10-20% 采样率

## 故障排查

### 错误没有被捕获

1. 检查是否在 `main.ts` 中调用了 `setupErrorHandler(app)`
2. 检查错误是否在异步代码中，确保使用了 try-catch
3. 检查是否使用了 ErrorBoundary 组件

### 错误日志过多

1. 调整采样率：`errorLogger.sampleRate = 0.1`（10%）
2. 增加日志清理频率
3. 过滤不重要的错误类型

### 用户看不到错误提示

1. 检查 Element Plus 是否正确安装
2. 检查是否有其他代码阻止了错误显示
3. 检查浏览器控制台是否有错误

## 相关文件

- `src/utils/error-logger.ts` - 错误日志记录器
- `src/utils/setup-error-handler.ts` - 全局错误处理器
- `src/components/ErrorBoundary.vue` - 错误边界组件
- `src/utils/request.ts` - HTTP 错误处理
