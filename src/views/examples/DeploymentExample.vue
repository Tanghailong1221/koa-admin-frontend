<template>
  <div class="deployment-example">
    <el-card header="部署配置示例">
      <el-space direction="vertical" :size="20" style="width: 100%">
        <!-- 当前环境信息 -->
        <el-descriptions title="当前环境信息" :column="2" border>
          <el-descriptions-item label="环境模式">
            <el-tag :type="modeTagType">{{ mode }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="是否开发环境">
            <el-tag :type="isDev ? 'success' : 'info'">
              {{ isDev ? '是' : '否' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="是否生产环境">
            <el-tag :type="isProd ? 'danger' : 'info'">
              {{ isProd ? '是' : '否' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="应用标题">
            {{ env.appTitle }}
          </el-descriptions-item>
        </el-descriptions>

        <!-- 环境配置 -->
        <el-descriptions title="环境配置" :column="1" border>
          <el-descriptions-item label="API 基础路径">
            {{ env.apiBaseUrl }}
          </el-descriptions-item>
          <el-descriptions-item label="CDN 地址">
            {{ env.cdnUrl || '未配置' }}
          </el-descriptions-item>
          <el-descriptions-item label="启用 Mock 数据">
            <el-tag :type="env.useMock ? 'success' : 'info'">
              {{ env.useMock ? '是' : '否' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="启用性能监控">
            <el-tag :type="env.enablePerformanceMonitor ? 'success' : 'info'">
              {{ env.enablePerformanceMonitor ? '是' : '否' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="性能监控采样率">
            {{ (env.performanceSampleRate * 100).toFixed(0) }}%
          </el-descriptions-item>
          <el-descriptions-item label="启用版本检测">
            <el-tag :type="env.enableVersionCheck ? 'success' : 'info'">
              {{ env.enableVersionCheck ? '是' : '否' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="版本检测间隔">
            {{ (env.versionCheckInterval / 1000).toFixed(0) }} 秒
          </el-descriptions-item>
          <el-descriptions-item label="启用控制台日志">
            <el-tag :type="env.enableConsole ? 'success' : 'info'">
              {{ env.enableConsole ? '是' : '否' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="启用数据加密">
            <el-tag :type="env.enableEncryption ? 'success' : 'info'">
              {{ env.enableEncryption ? '是' : '否' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="上传文件大小限制">
            {{ env.uploadMaxSize }} MB
          </el-descriptions-item>
        </el-descriptions>

        <!-- 构建配置 -->
        <el-descriptions title="构建配置" :column="1" border>
          <el-descriptions-item label="代码分割">
            <el-tag type="success">已启用</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="Gzip 压缩">
            <el-tag type="success">已启用</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="Brotli 压缩">
            <el-tag type="success">已启用</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="CSS 代码分割">
            <el-tag type="success">已启用</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="Source Map">
            <el-tag :type="isDev ? 'success' : 'info'">
              {{ isDev ? '已启用' : '已禁用' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="移除 console">
            <el-tag :type="isProd ? 'success' : 'info'">
              {{ isProd ? '已启用' : '已禁用' }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>

        <!-- 说明 -->
        <el-alert
          title="使用说明"
          type="info"
          :closable="false"
          description="本页面展示当前环境的配置信息。不同环境有不同的配置，可以通过 .env.* 文件进行配置。"
        />

        <!-- 代码示例 -->
        <el-divider content-position="left">代码示例</el-divider>

        <el-tabs>
          <el-tab-pane label="使用环境配置">
            <pre><code>import { env, isDev, isProd, mode } from '@/config'

// 获取配置
console.log('API 基础路径:', env.apiBaseUrl)
console.log('是否开发环境:', isDev)
console.log('是否生产环境:', isProd)
console.log('环境模式:', mode)

// 根据环境执行不同逻辑
if (isDev) {
  console.log('开发环境')
} else if (isProd) {
  console.log('生产环境')
}</code></pre>
          </el-tab-pane>

          <el-tab-pane label="环境变量文件">
            <pre><code># .env.production
VITE_APP_TITLE=前端架构增强项目
VITE_API_BASE_URL=https://api.example.com/api
VITE_USE_MOCK=false
VITE_ENABLE_PERFORMANCE_MONITOR=true
VITE_PERFORMANCE_SAMPLE_RATE=0.1
VITE_ENABLE_VERSION_CHECK=true
VITE_VERSION_CHECK_INTERVAL=300000
VITE_ENABLE_CONSOLE=false
VITE_ENABLE_ENCRYPTION=true
VITE_CDN_URL=https://cdn.example.com
VITE_ENABLE_CDN=true</code></pre>
          </el-tab-pane>

          <el-tab-pane label="构建命令">
            <pre><code># 开发环境
npm run build:dev

# 预发布环境
npm run build:staging

# 生产环境
npm run build:prod

# 使用自定义脚本
node scripts/build.js production</code></pre>
          </el-tab-pane>
        </el-tabs>
      </el-space>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { env, isDev, isProd, mode } from '@/config'

/**
 * 环境模式标签类型
 */
const modeTagType = computed(() => {
    if (mode === 'development') return 'success'
    if (mode === 'staging') return 'warning'
    if (mode === 'production') return 'danger'
    return 'info'
})
</script>

<script lang="ts">
export default {
    name: 'DeploymentExample'
}
</script>

<style scoped lang="scss">
.deployment-example {
  padding: 20px;

  pre {
    background-color: #f5f7fa;
    padding: 15px;
    border-radius: 4px;
    overflow-x: auto;

    code {
      font-family: 'Courier New', Courier, monospace;
      font-size: 14px;
      line-height: 1.5;
    }
  }
}
</style>
