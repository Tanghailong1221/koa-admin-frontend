<template>
  <div class="image-optimization-example">
    <el-card header="图片优化示例">
      <el-alert type="info" :closable="false" style="margin-bottom: 20px">
        <p>本示例演示图片优化的各种功能：</p>
        <ul>
          <li>1. 图片懒加载（使用 v-lazy-load 指令）</li>
          <li>2. 响应式图片（srcset 和 sizes）</li>
          <li>3. WebP 格式与回退</li>
          <li>4. 图片尺寸优化</li>
          <li>5. CDN 参数处理</li>
        </ul>
      </el-alert>

      <!-- 示例 1：基础懒加载 -->
      <el-divider content-position="left">示例 1：基础懒加载</el-divider>

      <div class="image-grid">
        <div v-for="i in 6" :key="i" class="image-item">
          <img
            v-lazy-load="{
              src: `https://picsum.photos/400/300?random=${i}`,
              options: {
                placeholder: 'https://via.placeholder.com/400x300?text=Loading...',
                error: 'https://via.placeholder.com/400x300?text=Error'
              }
            }"
            alt="示例图片"
            class="demo-image"
          />
          <p class="image-caption">图片 {{ i }}</p>
        </div>
      </div>

      <!-- 示例 2：响应式图片 -->
      <el-divider content-position="left">示例 2：响应式图片</el-divider>

      <div class="responsive-demo">
        <img
          v-lazy-load="responsiveImage.src"
          :srcset="responsiveImage.srcset"
          :sizes="responsiveImage.sizes"
          alt="响应式图片"
          class="responsive-image"
        />
        <el-descriptions :column="1" border style="margin-top: 20px">
          <el-descriptions-item label="srcset">
            {{ responsiveImage.srcset }}
          </el-descriptions-item>
          <el-descriptions-item label="sizes">
            {{ responsiveImage.sizes }}
          </el-descriptions-item>
          <el-descriptions-item label="说明">
            浏览器会根据屏幕宽度自动选择合适的图片尺寸
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 示例 3：WebP 与回退 -->
      <el-divider content-position="left">示例 3：WebP 格式与回退</el-divider>

      <div class="webp-demo">
        <picture>
          <source :srcset="webpImage.webp" type="image/webp" />
          <source :srcset="webpImage.fallback" type="image/jpeg" />
          <img
            v-lazy-load="webpImage.fallback"
            alt="WebP 图片"
            class="demo-image"
          />
        </picture>
        <el-descriptions :column="1" border style="margin-top: 20px">
          <el-descriptions-item label="WebP URL">
            {{ webpImage.webp }}
          </el-descriptions-item>
          <el-descriptions-item label="JPEG URL (回退)">
            {{ webpImage.fallback }}
          </el-descriptions-item>
          <el-descriptions-item label="说明">
            支持 WebP 的浏览器会加载 WebP 格式，否则加载 JPEG
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 示例 4：图片尺寸预设 -->
      <el-divider content-position="left">示例 4：图片尺寸预设</el-divider>

      <div class="preset-demo">
        <el-space wrap>
          <div
            v-for="preset in presets"
            :key="preset.name"
            class="preset-item"
          >
            <img
              v-lazy-load="preset.url"
              :alt="preset.name"
              class="preset-image"
            />
            <p class="preset-name">{{ preset.label }}</p>
            <p class="preset-size">{{ preset.size }}</p>
          </div>
        </el-space>
      </div>

      <!-- 示例 5：图片信息 -->
      <el-divider content-position="left">示例 5：图片信息查询</el-divider>

      <div class="info-demo">
        <el-input
          v-model="testImageUrl"
          placeholder="输入图片 URL"
          style="margin-bottom: 10px"
        >
          <template #append>
            <el-button
              :loading="loadingInfo"
              @click="handleGetImageInfo"
            >
              获取信息
            </el-button>
          </template>
        </el-input>

        <el-descriptions
          v-if="imageInfo"
          :column="2"
          border
        >
          <el-descriptions-item label="宽度">
            {{ imageInfo.width }}px
          </el-descriptions-item>
          <el-descriptions-item label="高度">
            {{ imageInfo.height }}px
          </el-descriptions-item>
          <el-descriptions-item label="格式">
            {{ imageInfo.format }}
          </el-descriptions-item>
          <el-descriptions-item label="大小">
            {{ formatFileSize(imageInfo.size) }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 使用说明 -->
      <el-divider content-position="left">使用说明</el-divider>

      <el-collapse>
        <el-collapse-item title="1. 基础优化" name="1">
          <pre><code>{{ basicOptimizeCode }}</code></pre>
        </el-collapse-item>

        <el-collapse-item title="2. 响应式图片" name="2">
          <pre><code>{{ responsiveCode }}</code></pre>
        </el-collapse-item>

        <el-collapse-item title="3. WebP 与回退" name="3">
          <pre><code>{{ webpCode }}</code></pre>
        </el-collapse-item>

        <el-collapse-item title="4. 尺寸预设" name="4">
          <pre><code>{{ presetCode }}</code></pre>
        </el-collapse-item>
      </el-collapse>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  imageOptimizer,
  IMAGE_QUALITY
} from '@/utils/image-optimizer'

// 响应式图片
const responsiveImage = computed(() => {
  const baseUrl = 'https://picsum.photos/1200/800'
  return {
    src: baseUrl,
    srcset: imageOptimizer.getResponsiveSrcset(
      baseUrl,
      [480, 768, 1200],
      IMAGE_QUALITY.normal
    ),
    sizes: '(max-width: 480px) 480px, (max-width: 768px) 768px, 1200px'
  }
})

// WebP 图片
const webpImage = computed(() => {
  const baseUrl = 'https://picsum.photos/800/600'
  return imageOptimizer.getWebPWithFallback(baseUrl, {
    width: 800,
    quality: IMAGE_QUALITY.normal
  })
})

// 尺寸预设
const presets = computed(() => [
  {
    name: 'thumbnail',
    label: '缩略图',
    size: '150x150',
    url: imageOptimizer.optimizeByPreset(
      'https://picsum.photos/800/600',
      'thumbnail'
    )
  },
  {
    name: 'small',
    label: '小图',
    size: '480x320',
    url: imageOptimizer.optimizeByPreset(
      'https://picsum.photos/800/600',
      'small'
    )
  },
  {
    name: 'medium',
    label: '中图',
    size: '768x512',
    url: imageOptimizer.optimizeByPreset(
      'https://picsum.photos/800/600',
      'medium'
    )
  },
  {
    name: 'large',
    label: '大图',
    size: '1200x800',
    url: imageOptimizer.optimizeByPreset(
      'https://picsum.photos/800/600',
      'large'
    )
  }
])

// 图片信息
const testImageUrl = ref('https://picsum.photos/800/600')
const imageInfo = ref<{
  width: number
  height: number
  format: string
  size: number
} | null>(null)
const loadingInfo = ref(false)

const handleGetImageInfo = async () => {
  if (!testImageUrl.value) {
    ElMessage.warning('请输入图片 URL')
    return
  }

  loadingInfo.value = true
  try {
    const info = await imageOptimizer.getImageInfo(testImageUrl.value)
    if (info) {
      imageInfo.value = info
      ElMessage.success('获取图片信息成功')
    } else {
      ElMessage.error('获取图片信息失败')
    }
  } catch (error) {
    ElMessage.error('获取图片信息失败')
  } finally {
    loadingInfo.value = false
  }
}

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

// 代码示例
const basicOptimizeCode = `import { imageOptimizer } from '@/utils/image-optimizer'

// 优化图片
const optimizedUrl = imageOptimizer.optimize(imageUrl, {
  width: 800,
  quality: 80,
  format: 'webp'
})

// 使用
<img v-lazy-load="optimizedUrl" alt="优化后的图片" />`

const responsiveCode = `import { imageOptimizer } from '@/utils/image-optimizer'

// 生成响应式 srcset
const srcset = imageOptimizer.getResponsiveSrcset(
  imageUrl,
  [480, 768, 1200],
  80
)

// 使用
<img
  v-lazy-load="imageUrl"
  :srcset="srcset"
  sizes="(max-width: 768px) 100vw, 50vw"
  alt="响应式图片"
/>`

const webpCode = `import { imageOptimizer } from '@/utils/image-optimizer'

// 获取 WebP 和回退格式
const images = imageOptimizer.getWebPWithFallback(imageUrl, {
  width: 800,
  quality: 80
})

// 使用
<picture>
  <source :srcset="images.webp" type="image/webp" />
  <source :srcset="images.fallback" type="image/jpeg" />
  <img v-lazy-load="images.fallback" alt="图片" />
</picture>`

const presetCode = `import { imageOptimizer, IMAGE_SIZES } from '@/utils/image-optimizer'

// 使用预设尺寸
const thumbnailUrl = imageOptimizer.optimizeByPreset(imageUrl, 'thumbnail')
const smallUrl = imageOptimizer.optimizeByPreset(imageUrl, 'small')
const mediumUrl = imageOptimizer.optimizeByPreset(imageUrl, 'medium')
const largeUrl = imageOptimizer.optimizeByPreset(imageUrl, 'large')

// 可用预设
console.log(IMAGE_SIZES)
// {
//   thumbnail: { width: 150, height: 150 },
//   small: { width: 480, height: 320 },
//   medium: { width: 768, height: 512 },
//   large: { width: 1200, height: 800 },
//   xlarge: { width: 1920, height: 1080 }
// }`
</script>

<style scoped lang="scss">
.image-optimization-example {
  padding: 20px;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.image-item {
  text-align: center;
}

.demo-image {
  width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.image-caption {
  margin-top: 10px;
  font-size: 14px;
  color: #606266;
}

.responsive-demo,
.webp-demo,
.preset-demo,
.info-demo {
  margin-bottom: 20px;
}

.responsive-image {
  width: 100%;
  max-width: 1200px;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.preset-item {
  text-align: center;
}

.preset-image {
  width: 100%;
  max-width: 200px;
  height: auto;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.preset-name {
  margin-top: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.preset-size {
  margin-top: 4px;
  font-size: 12px;
  color: #909399;
}

pre {
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
  overflow-x: auto;
}

code {
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
  line-height: 1.5;
}
</style>
