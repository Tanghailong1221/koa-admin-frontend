<template>
  <div class="performance-example">
    <el-card header="性能优化示例">
      <!-- 图片懒加载示例 -->
      <div>
        <strong>图片懒加载（v-lazy-load）：</strong>
      </div>
      <el-space direction="vertical" style="width: 100%; margin-top: 16px">
        <div>
          <p>向下滚动查看懒加载效果：</p>
        </div>
        <div
          v-for="i in 10"
          :key="i"
          style="margin-bottom: 20px"
        >
          <el-card>
            <template #header>
              图片 {{ i }}
            </template>
            <img
              v-lazy-load="`https://picsum.photos/800/400?random=${i}`"
              alt="示例图片"
              style="width: 100%; height: 400px; object-fit: cover"
            />
          </el-card>
        </div>
      </el-space>

      <el-divider />

      <!-- 路由预取信息 -->
      <div>
        <strong>路由预取：</strong>
      </div>
      <el-space direction="vertical" style="margin-top: 16px; width: 100%">
        <div>
          <el-alert type="info" :closable="false">
            路由预取已启用，系统会自动预测并预加载下一个可能访问的路由组件。
          </el-alert>
        </div>
        <div>
          <strong>已预取的路由：</strong>
          <el-tag
            v-for="route in prefetchedRoutes"
            :key="route"
            size="small"
            style="margin-right: 8px; margin-top: 8px"
          >
            {{ route }}
          </el-tag>
          <span v-if="prefetchedRoutes.length === 0" style="color: #999">
            暂无预取路由
          </span>
        </div>
        <div>
          <el-button @click="refreshPrefetchedRoutes">
            刷新预取列表
          </el-button>
          <el-button @click="clearPrefetch">
            清除预取缓存
          </el-button>
        </div>
      </el-space>

      <el-divider />

      <!-- 构建优化信息 -->
      <div>
        <strong>构建优化：</strong>
      </div>
      <el-descriptions :column="1" border style="margin-top: 16px">
        <el-descriptions-item label="代码分割">
          已启用，按模块分割代码（vue-vendor, element-plus, utils）
        </el-descriptions-item>
        <el-descriptions-item label="Gzip 压缩">
          已启用，10KB 以上文件自动压缩
        </el-descriptions-item>
        <el-descriptions-item label="Brotli 压缩">
          已启用，10KB 以上文件自动压缩
        </el-descriptions-item>
        <el-descriptions-item label="CSS 代码分割">
          已启用
        </el-descriptions-item>
        <el-descriptions-item label="Tree Shaking">
          已启用（Vite 默认）
        </el-descriptions-item>
        <el-descriptions-item label="依赖预构建">
          已优化（vue, vue-router, pinia, element-plus, axios）
        </el-descriptions-item>
      </el-descriptions>

      <el-divider />

      <!-- 说明 -->
      <el-alert type="info" :closable="false">
        <template #title>性能优化说明</template>
        <ul style="margin: 0; padding-left: 20px">
          <li>图片懒加载：使用 IntersectionObserver 实现，只加载可见区域的图片</li>
          <li>路由预取：自动预测并预加载下一个可能访问的路由组件</li>
          <li>代码分割：按模块分割代码，减少初始加载体积</li>
          <li>Gzip/Brotli 压缩：减少传输体积，提升加载速度</li>
          <li>CSS 代码分割：按需加载 CSS，减少初始 CSS 体积</li>
          <li>依赖预构建：优化第三方依赖加载速度</li>
        </ul>
      </el-alert>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getPrefetchedRoutes, clearPrefetchCache } from '@/utils/route-prefetch'
import { ElMessage } from 'element-plus'

// 已预取的路由
const prefetchedRoutes = ref<string[]>([])

/**
 * 刷新预取列表
 */
const refreshPrefetchedRoutes = () => {
  prefetchedRoutes.value = getPrefetchedRoutes()
  ElMessage.success('已刷新预取列表')
}

/**
 * 清除预取缓存
 */
const clearPrefetch = () => {
  clearPrefetchCache()
  prefetchedRoutes.value = []
  ElMessage.success('已清除预取缓存')
}

// 初始化
onMounted(() => {
  refreshPrefetchedRoutes()
})
</script>

<style scoped lang="scss">
.performance-example {
  padding: 20px;
}

// 懒加载样式
:deep(.lazy-loading) {
  filter: blur(5px);
  transition: filter 0.3s;
}

:deep(.lazy-loaded) {
  filter: blur(0);
}

:deep(.lazy-error) {
  opacity: 0.5;
}
</style>
