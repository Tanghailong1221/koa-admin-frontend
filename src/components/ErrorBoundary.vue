<template>
  <div v-if="hasError" class="error-boundary">
    <div class="error-boundary__content">
      <div class="error-boundary__icon">
        <el-icon :size="64" color="#f56c6c">
          <WarningFilled />
        </el-icon>
      </div>
      
      <h2 class="error-boundary__title">{{ title }}</h2>
      
      <p class="error-boundary__message">{{ message }}</p>
      
      <div v-if="showDetails && errorDetails" class="error-boundary__details">
        <el-collapse>
          <el-collapse-item title="错误详情" name="details">
            <pre>{{ errorDetails }}</pre>
          </el-collapse-item>
        </el-collapse>
      </div>
      
      <div class="error-boundary__actions">
        <el-button type="primary" @click="handleRetry">
          <el-icon><RefreshRight /></el-icon>
          重试
        </el-button>
        <el-button @click="handleGoHome">
          <el-icon><HomeFilled /></el-icon>
          返回首页
        </el-button>
        <el-button v-if="showReload" @click="handleReload">
          <el-icon><Refresh /></el-icon>
          刷新页面
        </el-button>
      </div>
    </div>
  </div>
  
  <slot v-else />
</template>

<script setup lang="ts">
import { ref, onErrorCaptured, provide } from 'vue'
import { useRouter } from 'vue-router'
import { WarningFilled, RefreshRight, HomeFilled, Refresh } from '@element-plus/icons-vue'

/**
 * ErrorBoundary 组件属性
 */
interface Props {
  /** 错误标题 */
  title?: string
  /** 错误消息 */
  message?: string
  /** 是否显示错误详情 */
  showDetails?: boolean
  /** 是否显示刷新按钮 */
  showReload?: boolean
  /** 错误回调 */
  onError?: (error: Error, instance: any, info: string) => void
  /** 重试回调 */
  onRetry?: () => void
}

const props = withDefaults(defineProps<Props>(), {
  title: '页面出错了',
  message: '抱歉，页面遇到了一些问题。您可以尝试刷新页面或返回首页。',
  showDetails: import.meta.env.DEV, // 开发环境显示详情
  showReload: true,
})

const router = useRouter()

const hasError = ref(false)
const errorDetails = ref('')
const errorCount = ref(0)

/**
 * 捕获子组件错误
 */
onErrorCaptured((error: Error, instance: any, info: string) => {
  console.error('[ErrorBoundary] 捕获到错误:', error)
  console.error('[ErrorBoundary] 错误信息:', info)
  console.error('[ErrorBoundary] 组件实例:', instance)

  hasError.value = true
  errorCount.value++

  // 格式化错误详情
  errorDetails.value = `
错误类型: ${error.name}
错误消息: ${error.message}
错误位置: ${info}
堆栈信息:
${error.stack || '无堆栈信息'}
  `.trim()

  // 触发错误回调
  if (props.onError) {
    props.onError(error, instance, info)
  }

  // 阻止错误继续向上传播
  return false
})

/**
 * 重置错误状态
 */
function resetError() {
  hasError.value = false
  errorDetails.value = ''
}

/**
 * 处理重试
 */
function handleRetry() {
  console.log('[ErrorBoundary] 用户点击重试')
  
  if (props.onRetry) {
    props.onRetry()
  }
  
  resetError()
}

/**
 * 处理返回首页
 */
function handleGoHome() {
  console.log('[ErrorBoundary] 用户返回首页')
  resetError()
  router.push('/')
}

/**
 * 处理刷新页面
 */
function handleReload() {
  console.log('[ErrorBoundary] 用户刷新页面')
  window.location.reload()
}

/**
 * 提供重置方法给子组件
 */
provide('resetError', resetError)

/**
 * 暴露方法给父组件
 */
defineExpose({
  resetError,
  hasError,
  errorCount,
})
</script>

<style scoped>
.error-boundary {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 40px 20px;
}

.error-boundary__content {
  max-width: 600px;
  text-align: center;
}

.error-boundary__icon {
  margin-bottom: 24px;
}

.error-boundary__title {
  margin: 0 0 16px;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.error-boundary__message {
  margin: 0 0 24px;
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
}

.error-boundary__details {
  margin-bottom: 24px;
  text-align: left;
}

.error-boundary__details pre {
  margin: 0;
  padding: 12px;
  background-color: #f5f7fa;
  border-radius: 4px;
  font-size: 12px;
  line-height: 1.5;
  color: #606266;
  overflow-x: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.error-boundary__actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}
</style>
