# 性能监控工具

## 概述

性能监控工具用于收集和分析应用的性能指标，帮助开发者发现和优化性能问题。

## 核心功能

- ✅ **Web Vitals 监控** - 自动收集 LCP、FID、CLS、FCP、TTFB 等核心指标
- ✅ **导航性能监控** - DNS、TCP、请求、响应、DOM 解析等
- ✅ **资源性能监控** - JS、CSS、图片、字体等资源加载时间
- ✅ **自定义指标** - 支持上报自定义性能指标
- ✅ **函数性能测量** - 测量同步/异步函数执行时间
- ✅ **本地存储** - 性能数据本地存储和分析
- ✅ **服务器上报** - 支持将性能数据上报到服务器
- ✅ **采样控制** - 支持采样率控制，减少性能开销

## 安装依赖

```bash
# 安装 web-vitals（可选，用于 Web Vitals 监控）
npm install web-vitals
```

## 快速开始

### 1. 初始化性能监控

在 `main.ts` 中初始化：

```typescript
import { setupPerformanceMonitor } from '@/utils/performance-monitor'

setupPerformanceMonitor({
  reportUrl: '/api/performance',  // 上报 URL（可选）
  sampleRate: 1.0,                // 采样率（1.0 = 100%）
  enableConsole: true,            // 控制台输出
  enableStorage: true,            // 本地存储
  enableWebVitals: true           // Web Vitals
})
```

### 2. 上报自定义指标

```typescript
import { reportMetric } from '@/utils/performance-monitor'

// 上报 API 响应时间
reportMetric({
  name: 'api-response-time',
  value: 150,
  unit: 'ms',
  rating: 'good'
})
```

### 3. 测量函数性能

```typescript
import { measureAsync, measure } from '@/utils/performance-monitor'

// 测量异步函数
const users = await measureAsync('fetch-users', async () => {
  return await fetchUsers()
})

// 测量同步函数
const result = measure('calculate', () => {
  return heavyCalculation()
})
```

## 配置选项

```typescript
interface PerformanceMonitorConfig {
  // 上报 URL
  reportUrl?: string

  // 采样率（0-1，默认：1.0）
  sampleRate?: number

  // 是否启用控制台输出（默认：false）
  enableConsole?: boolean

  // 是否启用本地存储（默认：true）
  enableStorage?: boolean

  // 本地存储的最大条数（默认：100）
  maxStorageSize?: number

  // 自定义上报函数
  onReport?: (metric: PerformanceMetric) => void

  // 是否启用 Web Vitals（默认：true）
  enableWebVitals?: boolean

  // 是否启用资源性能监控（默认：true）
  enableResourceTiming?: boolean

  // 是否启用导航性能监控（默认：true）
  enableNavigationTiming?: boolean
}
```

## Web Vitals 指标

| 指标 | 说明 | 优秀 | 需改进 | 较差 |
|------|------|------|--------|------|
| **LCP** | 最大内容绘制 | < 2.5s | 2.5s - 4s | > 4s |
| **FID** | 首次输入延迟 | < 100ms | 100ms - 300ms | > 300ms |
| **CLS** | 累积布局偏移 | < 0.1 | 0.1 - 0.25 | > 0.25 |
| **FCP** | 首次内容绘制 | < 1.8s | 1.8s - 3s | > 3s |
| **TTFB** | 首字节时间 | < 800ms | 800ms - 1800ms | > 1800ms |

## 导航性能指标

- **DNS** - DNS 查询时间
- **TCP** - TCP 连接时间
- **Request** - 请求时间
- **Response** - 响应时间
- **DOM Parse** - DOM 解析时间
- **DOM Content Loaded** - DOM 内容加载完成时间
- **Load** - 页面完全加载时间

## 资源性能指标

- **Resource JS** - JavaScript 文件平均加载时间
- **Resource CSS** - CSS 文件平均加载时间
- **Resource Image** - 图片平均加载时间
- **Resource Font** - 字体平均加载时间
- **Resource API** - API 请求平均响应时间

## API

### setupPerformanceMonitor(config)

初始化性能监控。

```typescript
setupPerformanceMonitor({
  reportUrl: '/api/performance',
  sampleRate: 0.5,  // 50% 采样
  enableConsole: true
})
```

### getPerformanceMonitor()

获取性能监控实例。

```typescript
const monitor = getPerformanceMonitor()
if (monitor) {
  const metrics = monitor.getMetrics()
  const summary = monitor.getSummary()
}
```

### reportMetric(metric)

上报自定义指标。

```typescript
reportMetric({
  name: 'custom-metric',
  value: 100,
  unit: 'ms',
  rating: 'good',
  meta: { userId: 123 }
})
```

### measureAsync(name, fn)

测量异步函数执行时间。

```typescript
const data = await measureAsync('fetch-data', async () => {
  return await fetchData()
})
```

### measure(name, fn)

测量同步函数执行时间。

```typescript
const result = measure('calculate', () => {
  return calculate()
})
```

## 使用场景

### 1. 监控页面加载性能

```typescript
// 自动监控，无需额外代码
setupPerformanceMonitor({
  enableWebVitals: true,
  enableNavigationTiming: true,
  enableResourceTiming: true
})
```

### 2. 监控 API 响应时间

```typescript
import { measureAsync } from '@/utils/performance-monitor'

export async function fetchUsers() {
  return await measureAsync('api-fetch-users', async () => {
    const response = await axios.get('/api/users')
    return response.data
  })
}
```

### 3. 监控组件渲染性能

```typescript
import { measure } from '@/utils/performance-monitor'

export default {
  mounted() {
    measure('component-mount', () => {
      // 组件挂载逻辑
    })
  }
}
```

### 4. 自定义业务指标

```typescript
import { reportMetric } from '@/utils/performance-monitor'

// 监控表单提交时间
const startTime = performance.now()
await submitForm(data)
const duration = performance.now() - startTime

reportMetric({
  name: 'form-submit',
  value: duration,
  unit: 'ms',
  rating: duration < 1000 ? 'good' : 'needs-improvement'
})
```

## 服务器端集成

### 1. 创建上报接口

```typescript
// backend/routes/performance.ts
app.post('/api/performance', (req, res) => {
  const metric = req.body
  
  // 保存到数据库
  await db.performance.create({
    name: metric.name,
    value: metric.value,
    unit: metric.unit,
    rating: metric.rating,
    userAgent: metric.userAgent,
    url: metric.url,
    timestamp: metric.timestamp
  })
  
  res.json({ success: true })
})
```

### 2. 配置上报 URL

```typescript
setupPerformanceMonitor({
  reportUrl: '/api/performance',
  sampleRate: 0.1  // 10% 采样，减少服务器压力
})
```

## 性能优化建议

### 1. 采样控制

生产环境建议使用采样，避免性能开销：

```typescript
setupPerformanceMonitor({
  sampleRate: import.meta.env.PROD ? 0.1 : 1.0
})
```

### 2. 批量上报

避免频繁上报，可以批量上报：

```typescript
let metricsBuffer: PerformanceMetric[] = []

setupPerformanceMonitor({
  onReport: (metric) => {
    metricsBuffer.push(metric)
    
    // 每 10 条上报一次
    if (metricsBuffer.length >= 10) {
      sendBatch(metricsBuffer)
      metricsBuffer = []
    }
  }
})
```

### 3. 异步上报

使用 `navigator.sendBeacon` 进行异步上报：

```typescript
function sendMetric(metric: PerformanceMetric) {
  const blob = new Blob([JSON.stringify(metric)], {
    type: 'application/json'
  })
  navigator.sendBeacon('/api/performance', blob)
}
```

## 注意事项

1. **Web Vitals 依赖** - 需要安装 `web-vitals` 包才能收集 Web Vitals 指标
2. **采样率** - 生产环境建议使用采样，避免性能开销和服务器压力
3. **隐私保护** - 不要上报敏感信息（如用户数据、token 等）
4. **存储限制** - 本地存储有大小限制，注意控制存储数量
5. **浏览器兼容性** - 部分 API（如 PerformanceObserver）在旧浏览器中不支持

## 示例

完整示例请参考：`src/views/examples/PerformanceMonitorExample.vue`

## 相关文档

- [Web Vitals](https://web.dev/vitals/)
- [Performance API](https://developer.mozilla.org/en-US/docs/Web/API/Performance)
- [PerformanceObserver](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceObserver)
