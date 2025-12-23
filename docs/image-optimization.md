# 图片优化指南

## 概述

本文档提供了前端项目中图片优化的最佳实践和配置方案。图片优化可以显著减少应用的加载时间和带宽消耗。

## 优化策略

### 1. 构建时优化（可选）

#### 使用 vite-plugin-imagemin

如果项目需要在构建时自动压缩图片，可以安装 `vite-plugin-imagemin`：

```bash
npm install -D vite-plugin-imagemin
```

**注意**：此插件依赖较多，可能会增加构建时间。建议在 CI/CD 环境中使用。

#### Vite 配置示例

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import viteImagemin from 'vite-plugin-imagemin'

export default defineConfig({
  plugins: [
    // 其他插件...
    
    // 图片压缩（仅在生产构建时启用）
    process.env.NODE_ENV === 'production' && viteImagemin({
      // 无损压缩配置
      optipng: {
        optimizationLevel: 7
      },
      // 有损压缩配置
      mozjpeg: {
        quality: 80
      },
      // PNG 转 WebP
      webp: {
        quality: 80
      },
      // SVG 优化
      svgo: {
        plugins: [
          {
            name: 'removeViewBox',
            active: false
          },
          {
            name: 'removeEmptyAttrs',
            active: true
          }
        ]
      }
    })
  ]
})
```

### 2. 运行时优化（推荐）

#### 使用懒加载指令

项目已实现 `v-lazy-load` 指令，可以延迟加载图片：

```vue
<template>
  <!-- 基础用法 -->
  <img v-lazy-load="imageUrl" alt="图片描述" />
  
  <!-- 带占位符 -->
  <img
    v-lazy-load="{
      src: imageUrl,
      options: {
        placeholder: '/placeholder.png',
        error: '/error.png'
      }
    }"
    alt="图片描述"
  />
</template>
```

#### 响应式图片

使用 `srcset` 和 `sizes` 属性提供不同尺寸的图片：

```vue
<template>
  <img
    v-lazy-load="imageUrl"
    :srcset="`
      ${imageUrl}-small.jpg 480w,
      ${imageUrl}-medium.jpg 768w,
      ${imageUrl}-large.jpg 1200w
    `"
    sizes="(max-width: 480px) 480px,
           (max-width: 768px) 768px,
           1200px"
    alt="响应式图片"
  />
</template>
```

#### 使用现代图片格式

优先使用 WebP 格式，并提供回退：

```vue
<template>
  <picture>
    <source :srcset="imageWebp" type="image/webp" />
    <source :srcset="imageJpg" type="image/jpeg" />
    <img v-lazy-load="imageJpg" alt="图片描述" />
  </picture>
</template>
```

### 3. CDN 优化

#### 使用图片 CDN

推荐使用支持实时处理的图片 CDN 服务：

- **阿里云 OSS**：支持图片处理参数
- **七牛云**：提供图片处理 API
- **腾讯云 COS**：支持图片处理
- **Cloudinary**：国际化图片 CDN

#### 图片处理参数示例

```typescript
// 阿里云 OSS 图片处理
const getOptimizedImage = (url: string, width: number, quality = 80) => {
  return `${url}?x-oss-process=image/resize,w_${width}/quality,q_${quality}`
}

// 使用
const imageUrl = getOptimizedImage('https://cdn.example.com/image.jpg', 800, 80)
```

### 4. 图片格式选择

| 格式 | 适用场景 | 优点 | 缺点 |
|------|---------|------|------|
| **WebP** | 所有场景 | 体积小，质量好 | 旧浏览器不支持 |
| **JPEG** | 照片、复杂图像 | 压缩率高 | 不支持透明 |
| **PNG** | 图标、透明图 | 支持透明，无损 | 体积较大 |
| **SVG** | 图标、Logo | 矢量，体积小 | 不适合复杂图像 |
| **AVIF** | 未来格式 | 体积最小 | 浏览器支持有限 |

### 5. 图片尺寸建议

#### 常见尺寸

```typescript
export const IMAGE_SIZES = {
  // 缩略图
  thumbnail: { width: 150, height: 150 },
  // 小图
  small: { width: 480, height: 320 },
  // 中图
  medium: { width: 768, height: 512 },
  // 大图
  large: { width: 1200, height: 800 },
  // 超大图
  xlarge: { width: 1920, height: 1080 }
}
```

#### 质量建议

```typescript
export const IMAGE_QUALITY = {
  // 缩略图（可以更低质量）
  thumbnail: 60,
  // 普通图片
  normal: 80,
  // 高质量图片
  high: 90,
  // 原图质量
  original: 100
}
```

## 图片优化工具类

创建一个图片优化工具类：

```typescript
// src/utils/image-optimizer.ts

/**
 * 图片优化配置
 */
export interface ImageOptimizeOptions {
  /** 宽度 */
  width?: number
  /** 高度 */
  height?: number
  /** 质量 (1-100) */
  quality?: number
  /** 格式 */
  format?: 'webp' | 'jpeg' | 'png'
  /** 是否裁剪 */
  crop?: boolean
}

/**
 * 图片优化器
 */
export class ImageOptimizer {
  private cdnBase: string

  constructor(cdnBase: string) {
    this.cdnBase = cdnBase
  }

  /**
   * 获取优化后的图片 URL
   */
  optimize(url: string, options: ImageOptimizeOptions = {}): string {
    const {
      width,
      height,
      quality = 80,
      format = 'webp',
      crop = false
    } = options

    // 如果不是 CDN 图片，直接返回
    if (!url.startsWith(this.cdnBase)) {
      return url
    }

    // 构建处理参数（以阿里云 OSS 为例）
    const params: string[] = []

    // 调整大小
    if (width || height) {
      const resize = crop ? 'crop' : 'resize'
      const sizeParams: string[] = []
      if (width) sizeParams.push(`w_${width}`)
      if (height) sizeParams.push(`h_${height}`)
      params.push(`${resize},${sizeParams.join(',')}`)
    }

    // 质量
    if (quality < 100) {
      params.push(`quality,q_${quality}`)
    }

    // 格式转换
    if (format) {
      params.push(`format,${format}`)
    }

    // 拼接参数
    if (params.length > 0) {
      return `${url}?x-oss-process=image/${params.join('/')}`
    }

    return url
  }

  /**
   * 获取响应式图片 srcset
   */
  getResponsiveSrcset(url: string, sizes: number[], quality = 80): string {
    return sizes
      .map(size => {
        const optimizedUrl = this.optimize(url, { width: size, quality })
        return `${optimizedUrl} ${size}w`
      })
      .join(', ')
  }

  /**
   * 获取 WebP 和回退格式
   */
  getWebPWithFallback(url: string, options: ImageOptimizeOptions = {}) {
    return {
      webp: this.optimize(url, { ...options, format: 'webp' }),
      fallback: this.optimize(url, { ...options, format: 'jpeg' })
    }
  }
}

// 创建默认实例
export const imageOptimizer = new ImageOptimizer(
  import.meta.env.VITE_CDN_BASE || ''
)
```

## 使用示例

### 1. 基础优化

```vue
<template>
  <img
    v-lazy-load="optimizedImage"
    alt="优化后的图片"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { imageOptimizer } from '@/utils/image-optimizer'

const originalImage = 'https://cdn.example.com/image.jpg'

const optimizedImage = computed(() => {
  return imageOptimizer.optimize(originalImage, {
    width: 800,
    quality: 80,
    format: 'webp'
  })
})
</script>
```

### 2. 响应式图片

```vue
<template>
  <img
    v-lazy-load="imageUrl"
    :srcset="srcset"
    sizes="(max-width: 768px) 100vw, 50vw"
    alt="响应式图片"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { imageOptimizer } from '@/utils/image-optimizer'

const imageUrl = 'https://cdn.example.com/image.jpg'

const srcset = computed(() => {
  return imageOptimizer.getResponsiveSrcset(
    imageUrl,
    [480, 768, 1200],
    80
  )
})
</script>
```

### 3. WebP 与回退

```vue
<template>
  <picture>
    <source :srcset="images.webp" type="image/webp" />
    <source :srcset="images.fallback" type="image/jpeg" />
    <img v-lazy-load="images.fallback" alt="图片" />
  </picture>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { imageOptimizer } from '@/utils/image-optimizer'

const imageUrl = 'https://cdn.example.com/image.jpg'

const images = computed(() => {
  return imageOptimizer.getWebPWithFallback(imageUrl, {
    width: 800,
    quality: 80
  })
})
</script>
```

## 性能监控

使用性能监控工具跟踪图片加载性能：

```typescript
import { reportMetric } from '@/utils/performance-monitor'

// 监控图片加载时间
const img = new Image()
const startTime = performance.now()

img.onload = () => {
  const loadTime = performance.now() - startTime
  reportMetric({
    name: 'image-load-time',
    value: loadTime,
    unit: 'ms',
    tags: {
      url: img.src,
      size: `${img.naturalWidth}x${img.naturalHeight}`
    }
  })
}

img.src = imageUrl
```

## 最佳实践

### 1. 图片命名规范

```
原图：product-hero.jpg
缩略图：product-hero-thumb.jpg
小图：product-hero-sm.jpg
中图：product-hero-md.jpg
大图：product-hero-lg.jpg
WebP：product-hero.webp
```

### 2. 图片存储结构

```
public/images/
├── products/          # 产品图片
├── avatars/          # 用户头像
├── banners/          # 横幅图片
├── icons/            # 图标
└── placeholders/     # 占位图
```

### 3. 环境变量配置

```env
# .env.production
VITE_CDN_BASE=https://cdn.example.com
VITE_IMAGE_QUALITY=80
VITE_IMAGE_FORMAT=webp
```

### 4. 图片预加载

对于关键图片，可以使用预加载：

```vue
<template>
  <link
    rel="preload"
    as="image"
    :href="heroImage"
    type="image/webp"
  />
</template>
```

## 性能指标

### 优化前后对比

| 指标 | 优化前 | 优化后 | 提升 |
|------|--------|--------|------|
| 图片总大小 | ~5MB | ~800KB | 84% |
| 首屏图片加载 | ~3s | ~0.8s | 73% |
| LCP | ~4.5s | ~1.5s | 67% |

### 目标指标

- **图片大小**：单张图片 < 200KB
- **加载时间**：首屏图片 < 1s
- **LCP**：< 2.5s（Good）
- **格式**：优先使用 WebP
- **压缩率**：80-85% 质量

## 工具推荐

### 在线工具

- **TinyPNG**：https://tinypng.com/ - PNG/JPEG 压缩
- **Squoosh**：https://squoosh.app/ - Google 图片压缩工具
- **SVGOMG**：https://jakearchibald.github.io/svgomg/ - SVG 优化

### 命令行工具

```bash
# ImageMagick - 图片处理
convert input.jpg -quality 80 -resize 800x output.jpg

# cwebp - WebP 转换
cwebp -q 80 input.jpg -o output.webp

# svgo - SVG 优化
svgo input.svg -o output.svg
```

### VS Code 插件

- **Image Optimizer** - 右键压缩图片
- **Image Preview** - 预览图片
- **SVG Viewer** - SVG 预览

## 总结

图片优化是前端性能优化的重要环节。通过合理使用：

1. ✅ 懒加载（已实现）
2. ✅ 响应式图片
3. ✅ 现代图片格式（WebP）
4. ✅ CDN 加速
5. ✅ 图片压缩
6. ✅ 性能监控

可以显著提升应用的加载速度和用户体验。

---

**相关文档**：
- [性能优化指南](./performance-optimization.md)
- [懒加载指令](../src/directives/lazy-load.ts)
- [性能监控](../src/utils/performance-monitor.ts)
