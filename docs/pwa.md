# PWA（Progressive Web App）功能

## 概述

本应用支持 PWA 功能，提供类似原生应用的体验，包括离线访问、应用安装和自动更新等特性。

## 功能特性

### 1. Service Worker

应用使用 Service Worker 来实现离线功能和缓存管理：

- **自动注册**：在生产环境自动注册 Service Worker
- **缓存策略**：针对不同类型的资源使用不同的缓存策略
- **自动更新**：检测到新版本时自动提示用户更新

### 2. 缓存策略

#### API 请求缓存（NetworkFirst）
- 优先使用网络请求
- 网络失败时使用缓存
- 缓存时间：24 小时
- 最大缓存数：100 条

#### 静态资源缓存（CacheFirst）
- 图片文件：缓存 30 天
- 字体文件：缓存 1 年
- 优先使用缓存，缓存未命中时请求网络

#### CSS/JS 缓存（StaleWhileRevalidate）
- 立即返回缓存内容
- 后台更新缓存
- 缓存时间：7 天

### 3. 离线支持

应用在离线状态下仍可访问：

- **缓存的页面**：已访问过的页面可离线访问
- **缓存的数据**：API 响应会被缓存，离线时提供陈旧数据
- **离线提示**：显示离线状态提示，告知用户当前处于离线模式

### 4. 应用安装

用户可以将应用安装到设备：

- **安装提示**：浏览器会提示用户安装应用
- **主屏幕图标**：安装后在主屏幕显示应用图标
- **独立窗口**：以独立窗口运行，类似原生应用

### 5. 自动更新

应用会自动检测新版本：

- **更新检测**：定期检查是否有新版本
- **更新提示**：发现新版本时显示更新对话框
- **一键更新**：用户确认后立即更新应用

## 使用方法

### 在组件中使用 PWA 功能

```vue
<script setup lang="ts">
import { usePWA } from '@/composables/usePWA'

const { updateInfo, offlineReady, isOnline, activateUpdate } = usePWA()

// 检查是否有更新
if (updateInfo.value.updateAvailable) {
  console.log('New version available!')
}

// 检查是否离线就绪
if (offlineReady.value) {
  console.log('App is ready for offline use')
}

// 检查在线状态
if (isOnline.value) {
  console.log('App is online')
}

// 激活更新
const handleUpdate = async () => {
  await activateUpdate()
}
</script>
```

### 使用安装提示

```vue
<script setup lang="ts">
import { useInstallPrompt } from '@/composables/usePWA'

const { canInstall, promptInstall } = useInstallPrompt()

// 显示安装按钮
const handleInstall = async () => {
  const accepted = await promptInstall()
  if (accepted) {
    console.log('User accepted the install prompt')
  }
}
</script>

<template>
  <el-button v-if="canInstall" @click="handleInstall">
    安装应用
  </el-button>
</template>
```

### 手动控制 Service Worker

```typescript
import { pwaManager } from '@/utils/pwa'

// 初始化 PWA
await pwaManager.init()

// 检查更新
await pwaManager.update()

// 激活更新
await pwaManager.activateUpdate()

// 卸载 Service Worker
await pwaManager.unregister()

// 监听网络状态变化
const cleanup = pwaManager.onNetworkChange((online) => {
  console.log('Network status:', online ? 'online' : 'offline')
})

// 清理监听器
cleanup()
```

## 配置

### Vite 配置

PWA 配置在 `vite.config.ts` 中：

```typescript
VitePWA({
  registerType: 'autoUpdate',
  manifest: {
    name: 'Koa Admin',
    short_name: 'Admin',
    description: 'Vue3 + Vite + Element Plus 管理后台',
    theme_color: '#409EFF',
    icons: [
      {
        src: '/pwa-192x192.png',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: '/pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png'
      }
    ]
  },
  workbox: {
    runtimeCaching: [
      // 缓存策略配置
    ]
  }
})
```

### 环境变量

可以通过环境变量控制 PWA 功能：

```env
# 是否启用 PWA（生产环境默认启用）
VITE_ENABLE_PWA=true
```

## 图标要求

PWA 需要以下图标文件（放置在 `public` 目录）：

- `pwa-192x192.png` - 192x192 像素
- `pwa-512x512.png` - 512x512 像素
- `apple-touch-icon.png` - 180x180 像素
- `favicon.ico` - 32x32 或 16x16 像素

## 浏览器支持

PWA 功能在以下浏览器中得到良好支持：

- ✅ Chrome/Edge 90+
- ✅ Firefox 90+
- ✅ Safari 15.4+
- ✅ Opera 76+
- ⚠️ IE 不支持

## 测试

### 本地测试

1. 构建生产版本：
```bash
npm run build
```

2. 预览构建结果：
```bash
npm run preview
```

3. 在浏览器中访问应用，检查 PWA 功能

### 检查 Service Worker

在浏览器开发者工具中：

1. 打开 Application/应用 标签
2. 查看 Service Workers 部分
3. 检查 Service Worker 状态和缓存

### 测试离线功能

1. 在开发者工具中切换到离线模式
2. 刷新页面，检查应用是否仍可访问
3. 检查离线提示是否显示

### 测试更新功能

1. 修改代码并重新构建
2. 刷新页面，检查是否显示更新提示
3. 点击更新按钮，检查应用是否更新

## 最佳实践

### 1. 缓存策略选择

- **频繁变化的数据**：使用 NetworkFirst
- **静态资源**：使用 CacheFirst
- **需要最新但可容忍陈旧的数据**：使用 StaleWhileRevalidate

### 2. 缓存大小控制

- 设置合理的 `maxEntries` 限制缓存数量
- 设置合理的 `maxAgeSeconds` 控制缓存时间
- 定期清理过期缓存

### 3. 用户体验

- 提供清晰的离线提示
- 提供友好的更新提示
- 避免强制更新，给用户选择权

### 4. 性能优化

- 只缓存必要的资源
- 使用预缓存加速首次加载
- 避免缓存过大的文件

## 故障排除

### Service Worker 未注册

1. 检查是否在生产环境
2. 检查浏览器是否支持 Service Worker
3. 检查控制台是否有错误信息

### 缓存未生效

1. 检查 Service Worker 是否激活
2. 检查缓存策略配置
3. 清除浏览器缓存后重试

### 更新未生效

1. 检查 Service Worker 是否有等待状态
2. 手动激活更新
3. 清除 Service Worker 后重新注册

## 相关资源

- [PWA 官方文档](https://web.dev/progressive-web-apps/)
- [Workbox 文档](https://developers.google.com/web/tools/workbox)
- [vite-plugin-pwa 文档](https://vite-pwa-org.netlify.app/)
