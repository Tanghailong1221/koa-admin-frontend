# 版本检测系统

版本检测系统用于监控应用版本更新，当检测到新版本时，自动提示用户刷新页面以获取最新功能。

## 功能特性

- ✅ 定期检测版本更新
- ✅ 自动显示更新通知
- ✅ 支持手动检测
- ✅ 支持自定义检测间隔
- ✅ 支持自定义通知样式
- ✅ 支持版本不匹配回调
- ✅ 支持错误处理回调
- ✅ 响应式状态管理

## 快速开始

### 1. 创建 version.json 文件

在 `public` 目录下创建 `version.json` 文件：

```json
{
  "version": "1.0.0",
  "buildTime": "2025-12-23T10:00:00.000Z",
  "commitHash": "abc123"
}
```

### 2. 使用 useVersionCheck

```vue
<template>
  <div>
    <el-tag v-if="hasNewVersion" type="warning">
      发现新版本: {{ latestVersion }}
    </el-tag>
    
    <el-button @click="check">检测更新</el-button>
    <el-button @click="refresh">刷新页面</el-button>
  </div>
</template>

<script setup lang="ts">
import { useVersionCheck } from '@/composables'

const {
  hasNewVersion,
  latestVersion,
  checking,
  check,
  refresh
} = useVersionCheck('1.0.0', {
  autoStart: true,
  showNotification: true
})
</script>
```

## API 文档

### useVersionCheck

```typescript
function useVersionCheck(
  currentVersion: string,
  options?: UseVersionCheckOptions
): UseVersionCheckReturn
```

#### 参数

**currentVersion**
- 类型：`string`
- 必填：是
- 说明：当前应用版本号

**options**
- 类型：`UseVersionCheckOptions`
- 必填：否
- 说明：配置选项

```typescript
interface UseVersionCheckOptions {
  // 版本检测 URL
  url?: string // 默认: '/version.json'
  
  // 检测间隔（毫秒）
  interval?: number // 默认: 60000 (1 分钟)
  
  // 是否启用版本检测
  enabled?: boolean // 默认: true
  
  // 是否自动开始检测
  autoStart?: boolean // 默认: true
  
  // 是否显示更新提示
  showNotification?: boolean // 默认: true
  
  // 提示标题
  notificationTitle?: string // 默认: '发现新版本'
  
  // 提示消息
  notificationMessage?: string // 默认: '检测到新版本，请刷新页面以获取最新功能'
  
  // 是否显示刷新按钮
  showRefreshButton?: boolean // 默认: true
  
  // 刷新按钮文本
  refreshButtonText?: string // 默认: '立即刷新'
  
  // 版本不匹配时的回调
  onVersionMismatch?: (currentVersion: string, latestVersion: string) => void
  
  // 检测失败时的回调
  onError?: (error: Error) => void
}
```

#### 返回值

```typescript
interface UseVersionCheckReturn {
  // 是否有新版本
  hasNewVersion: Ref<boolean>
  
  // 最新版本号
  latestVersion: Ref<string>
  
  // 是否正在检测
  checking: Ref<boolean>
  
  // 当前版本号
  currentVersion: string
  
  // 开始检测
  start: () => void
  
  // 停止检测
  stop: () => void
  
  // 手动检测
  check: () => Promise<boolean>
  
  // 刷新页面
  refresh: () => void
  
  // 清除新版本标记
  clearNewVersion: () => void
}
```

## 使用场景

### 场景 1：基础用法

```typescript
const { hasNewVersion, latestVersion } = useVersionCheck('1.0.0')
```

### 场景 2：自定义检测间隔

```typescript
const { ... } = useVersionCheck('1.0.0', {
  interval: 30000 // 30 秒检测一次
})
```

### 场景 3：自定义通知样式

```typescript
const { ... } = useVersionCheck('1.0.0', {
  notificationTitle: '系统更新',
  notificationMessage: '发现新版本，建议立即更新',
  refreshButtonText: '立即更新'
})
```

### 场景 4：版本不匹配回调

```typescript
const { ... } = useVersionCheck('1.0.0', {
  onVersionMismatch: (current, latest) => {
    console.log(`版本更新: ${current} -> ${latest}`)
    
    // 上报到监控系统
    reportToMonitoring({
      type: 'version_mismatch',
      current,
      latest
    })
  }
})
```

### 场景 5：手动控制

```typescript
const { start, stop, check } = useVersionCheck('1.0.0', {
  autoStart: false // 不自动开始
})

// 手动开始
start()

// 手动检测
await check()

// 停止检测
stop()
```

### 场景 6：禁用通知

```typescript
const { hasNewVersion, latestVersion } = useVersionCheck('1.0.0', {
  showNotification: false // 不显示通知
})

// 自己处理新版本提示
watch(hasNewVersion, (value) => {
  if (value) {
    // 自定义提示逻辑
    console.log(`发现新版本: ${latestVersion.value}`)
  }
})
```

## 服务端实现

### Node.js + Express

```javascript
const express = require('express')
const fs = require('fs')
const path = require('path')

const app = express()

// 生成 version.json
app.get('/version.json', (req, res) => {
  const version = {
    version: process.env.APP_VERSION || '1.0.0',
    buildTime: new Date().toISOString(),
    commitHash: process.env.GIT_COMMIT || ''
  }
  
  res.json(version)
})

app.listen(3000)
```

### 构建时生成

在 `vite.config.ts` 中添加插件：

```typescript
import { defineConfig } from 'vite'
import fs from 'fs'
import path from 'path'

export default defineConfig({
  plugins: [
    {
      name: 'generate-version',
      buildEnd() {
        const version = {
          version: process.env.npm_package_version || '1.0.0',
          buildTime: new Date().toISOString(),
          commitHash: process.env.GIT_COMMIT || ''
        }
        
        fs.writeFileSync(
          path.resolve(__dirname, 'dist/version.json'),
          JSON.stringify(version, null, 2)
        )
      }
    }
  ]
})
```

## 最佳实践

### 1. 版本号管理

使用语义化版本号（Semantic Versioning）：

```
主版本号.次版本号.修订号

1.0.0 -> 1.0.1 (修复 bug)
1.0.1 -> 1.1.0 (新增功能)
1.1.0 -> 2.0.0 (破坏性更新)
```

### 2. 检测间隔

根据应用更新频率设置合理的检测间隔：

- 高频更新：30 秒 - 1 分钟
- 中频更新：1 分钟 - 5 分钟
- 低频更新：5 分钟 - 10 分钟

### 3. 用户体验

- 不要过于频繁地提示用户更新
- 提供"稍后提醒"选项
- 在用户空闲时提示更新
- 避免在用户操作时强制刷新

### 4. 错误处理

```typescript
const { ... } = useVersionCheck('1.0.0', {
  onError: (error) => {
    // 记录错误，但不影响用户使用
    console.error('版本检测失败:', error)
    
    // 上报到监控系统
    reportError(error)
  }
})
```

### 5. 生产环境优化

```typescript
const { ... } = useVersionCheck('1.0.0', {
  // 生产环境启用，开发环境禁用
  enabled: import.meta.env.PROD,
  
  // 生产环境检测间隔更长
  interval: import.meta.env.PROD ? 300000 : 60000
})
```

## 注意事项

1. **缓存问题**：确保 `version.json` 不被缓存，可以添加时间戳参数
2. **跨域问题**：如果 `version.json` 在其他域名，需要配置 CORS
3. **性能影响**：检测请求很轻量，但不要设置过短的检测间隔
4. **版本格式**：建议使用语义化版本号，便于比较和管理
5. **错误处理**：检测失败不应影响应用正常使用

## 相关文档

- [VersionChecker 类](../src/utils/version-checker.ts)
- [useVersionCheck Composable](../src/composables/useVersionCheck.ts)
- [版本检测示例](../src/views/examples/VersionCheckExample.vue)

## 常见问题

### Q: 如何在构建时自动更新版本号？

A: 可以使用 `npm version` 命令或在 CI/CD 中自动更新 `package.json` 的版本号。

### Q: 如何强制用户更新？

A: 可以在检测到新版本时，禁用应用功能，强制用户刷新页面。但不建议这样做，会影响用户体验。

### Q: 如何区分重要更新和普通更新？

A: 可以在 `version.json` 中添加 `critical` 字段，标记重要更新，然后在回调中处理。

```json
{
  "version": "2.0.0",
  "critical": true,
  "message": "重要安全更新，请立即刷新"
}
```

### Q: 如何在多个页面共享版本检测状态？

A: 可以将版本检测逻辑放在 Pinia store 中，所有页面共享状态。

```typescript
// src/store/version.ts
import { defineStore } from 'pinia'
import { createVersionChecker } from '@/utils/version-checker'

export const useVersionStore = defineStore('version', () => {
  const checker = createVersionChecker('1.0.0')
  
  // ...
  
  return { checker, ... }
})
```
