<template>
  <div class="performance-monitor-example">
    <el-card header="性能监控示例">
      <el-alert type="info" :closable="false" style="margin-bottom: 20px">
        <p>此示例演示了性能监控功能：</p>
        <ul>
          <li>自动收集 Web Vitals 指标（需要安装 web-vitals）</li>
          <li>收集导航性能指标（DNS、TCP、请求、响应等）</li>
          <li>收集资源加载性能（JS、CSS、图片等）</li>
          <li>支持自定义性能指标上报</li>
          <li>性能数据本地存储和分析</li>
        </ul>
      </el-alert>

      <!-- 操作按钮 -->
      <el-space wrap style="margin-bottom: 20px">
        <el-button type="primary" @click="handleTestMetric">
          测试自定义指标
        </el-button>
        <el-button @click="handleTestAsync">
          测试异步函数性能
        </el-button>
        <el-button @click="handleTestSync">
          测试同步函数性能
        </el-button>
        <el-button @click="handleRefresh">
          刷新数据
        </el-button>
        <el-button @click="handleClear">
          清空数据
        </el-button>
      </el-space>

      <!-- 性能摘要 -->
      <el-divider content-position="left">性能摘要</el-divider>
      <el-table :data="summaryData" border>
        <el-table-column prop="name" label="指标名称" min-width="150" />
        <el-table-column prop="avg" label="平均值" width="120">
          <template #default="{ row }">
            {{ row.avg.toFixed(2) }} {{ row.unit }}
          </template>
        </el-table-column>
        <el-table-column prop="min" label="最小值" width="120">
          <template #default="{ row }">
            {{ row.min.toFixed(2) }} {{ row.unit }}
          </template>
        </el-table-column>
        <el-table-column prop="max" label="最大值" width="120">
          <template #default="{ row }">
            {{ row.max.toFixed(2) }} {{ row.unit }}
          </template>
        </el-table-column>
        <el-table-column prop="count" label="采样次数" width="100" />
        <el-table-column prop="rating" label="评级" width="120">
          <template #default="{ row }">
            <el-tag
              v-if="row.rating"
              :type="getRatingType(row.rating)"
              size="small"
            >
              {{ getRatingText(row.rating) }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>

      <!-- 详细指标 -->
      <el-divider content-position="left">详细指标</el-divider>
      <el-table :data="metricsData" border max-height="400">
        <el-table-column prop="name" label="指标名称" width="150" />
        <el-table-column prop="value" label="值" width="100">
          <template #default="{ row }">
            {{ row.value.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="unit" label="单位" width="80" />
        <el-table-column prop="rating" label="评级" width="120">
          <template #default="{ row }">
            <el-tag
              v-if="row.rating"
              :type="getRatingType(row.rating)"
              size="small"
            >
              {{ getRatingText(row.rating) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="timestamp" label="时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.timestamp) }}
          </template>
        </el-table-column>
        <el-table-column prop="meta" label="额外信息" min-width="200">
          <template #default="{ row }">
            <span v-if="row.meta">{{ JSON.stringify(row.meta) }}</span>
          </template>
        </el-table-column>
      </el-table>

      <!-- 使用说明 -->
      <el-divider content-position="left">使用说明</el-divider>
      <el-descriptions :column="1" border>
        <el-descriptions-item label="安装依赖">
          <el-code>npm install web-vitals</el-code>
        </el-descriptions-item>
        <el-descriptions-item label="初始化">
          <pre>{{ initCode }}</pre>
        </el-descriptions-item>
        <el-descriptions-item label="自定义指标">
          <pre>{{ customCode }}</pre>
        </el-descriptions-item>
        <el-descriptions-item label="测量函数">
          <pre>{{ measureCode }}</pre>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getPerformanceMonitor, reportMetric, measureAsync, measure } from '@/utils/performance-monitor'
import { ElMessage } from 'element-plus'
import type { PerformanceMetric } from '@/utils/performance-monitor'

// 性能指标数据
const metricsData = ref<PerformanceMetric[]>([])

// 性能摘要数据
const summaryData = computed(() => {
  const monitor = getPerformanceMonitor()
  if (!monitor) {
    return []
  }

  const summary = monitor.getSummary()
  return Object.entries(summary).map(([name, stat]) => {
    // 获取第一个指标的单位和评级
    const firstMetric = monitor.getMetricsByName(name)[0]
    return {
      name,
      ...stat,
      unit: firstMetric?.unit || '',
      rating: firstMetric?.rating
    }
  })
})

// 初始化代码
const initCode = `import { setupPerformanceMonitor } from '@/utils/performance-monitor'

// 在 main.ts 中初始化
setupPerformanceMonitor({
  reportUrl: '/api/performance',  // 上报 URL
  sampleRate: 1.0,                // 采样率
  enableConsole: true,            // 控制台输出
  enableStorage: true,            // 本地存储
  enableWebVitals: true           // Web Vitals
})`

// 自定义指标代码
const customCode = `import { reportMetric } from '@/utils/performance-monitor'

// 上报自定义指标
reportMetric({
  name: 'api-response-time',
  value: 150,
  unit: 'ms',
  rating: 'good'
})`

// 测量函数代码
const measureCode = `import { measureAsync, measure } from '@/utils/performance-monitor'

// 测量异步函数
const data = await measureAsync('fetch-users', async () => {
  return await fetchUsers()
})

// 测量同步函数
const result = measure('calculate', () => {
  return heavyCalculation()
})`

/**
 * 刷新数据
 */
const handleRefresh = () => {
  const monitor = getPerformanceMonitor()
  if (!monitor) {
    ElMessage.warning('性能监控未初始化')
    return
  }

  metricsData.value = monitor.getMetrics().reverse()
  ElMessage.success('数据已刷新')
}

/**
 * 清空数据
 */
const handleClear = () => {
  const monitor = getPerformanceMonitor()
  if (!monitor) {
    ElMessage.warning('性能监控未初始化')
    return
  }

  monitor.clearMetrics()
  metricsData.value = []
  ElMessage.success('数据已清空')
}

/**
 * 测试自定义指标
 */
const handleTestMetric = () => {
  reportMetric({
    name: 'custom-metric',
    value: Math.random() * 1000,
    unit: 'ms',
    rating: 'good',
    meta: {
      test: true,
      timestamp: Date.now()
    }
  })

  ElMessage.success('已上报自定义指标')
  handleRefresh()
}

/**
 * 测试异步函数性能
 */
const handleTestAsync = async () => {
  await measureAsync('test-async', async () => {
    // 模拟异步操作
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 500))
  })

  ElMessage.success('已测量异步函数性能')
  handleRefresh()
}

/**
 * 测试同步函数性能
 */
const handleTestSync = () => {
  measure('test-sync', () => {
    // 模拟同步操作
    let sum = 0
    for (let i = 0; i < 1000000; i++) {
      sum += i
    }
    return sum
  })

  ElMessage.success('已测量同步函数性能')
  handleRefresh()
}

/**
 * 获取评级类型
 */
const getRatingType = (rating: string) => {
  switch (rating) {
    case 'good':
      return 'success'
    case 'needs-improvement':
      return 'warning'
    case 'poor':
      return 'danger'
    default:
      return 'info'
  }
}

/**
 * 获取评级文本
 */
const getRatingText = (rating: string) => {
  switch (rating) {
    case 'good':
      return '优秀'
    case 'needs-improvement':
      return '需改进'
    case 'poor':
      return '较差'
    default:
      return '未知'
  }
}

/**
 * 格式化时间
 */
const formatTime = (timestamp?: number) => {
  if (!timestamp) {
    return '-'
  }

  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN')
}

// 初始化
onMounted(() => {
  handleRefresh()
})
</script>

<style scoped lang="scss">
.performance-monitor-example {
  padding: 20px;

  :deep(.el-alert) {
    ul {
      margin: 10px 0 0 20px;
      padding: 0;
    }

    li {
      margin: 5px 0;
    }
  }

  pre {
    background-color: #f5f7fa;
    padding: 15px;
    border-radius: 4px;
    overflow-x: auto;
    margin: 0;
  }

  .el-code {
    background-color: #f5f7fa;
    padding: 2px 8px;
    border-radius: 3px;
    font-family: 'Courier New', monospace;
  }
}
</style>
