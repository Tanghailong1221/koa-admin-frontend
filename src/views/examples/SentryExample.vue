<template>
  <div class="sentry-example">
    <el-card header="Sentry 错误追踪示例">
      <el-alert
        title="注意"
        type="warning"
        :closable="false"
        style="margin-bottom: 20px"
      >
        Sentry 仅在生产环境启用。开发环境的错误会在控制台打印，不会发送到 Sentry。
      </el-alert>

      <el-space direction="vertical" :size="20" style="width: 100%">
        <!-- 用户上下文 -->
        <el-card>
          <template #header>
            <span>用户上下文</span>
          </template>

          <el-form :model="userForm" label-width="100px">
            <el-form-item label="用户 ID">
              <el-input v-model="userForm.id" placeholder="请输入用户 ID" />
            </el-form-item>
            <el-form-item label="用户名">
              <el-input v-model="userForm.username" placeholder="请输入用户名" />
            </el-form-item>
            <el-form-item label="邮箱">
              <el-input v-model="userForm.email" placeholder="请输入邮箱" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="setUser">设置用户</el-button>
              <el-button @click="clearUser">清除用户</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 手动捕获错误 -->
        <el-card>
          <template #header>
            <span>手动捕获错误</span>
          </template>

          <el-space wrap>
            <el-button type="danger" @click="captureException">
              捕获异常
            </el-button>
            <el-button type="warning" @click="captureMessage('info')">
              捕获信息消息
            </el-button>
            <el-button type="warning" @click="captureMessage('warning')">
              捕获警告消息
            </el-button>
            <el-button type="danger" @click="captureMessage('error')">
              捕获错误消息
            </el-button>
          </el-space>
        </el-card>

        <!-- 自动捕获错误 -->
        <el-card>
          <template #header>
            <span>自动捕获错误</span>
          </template>

          <el-space wrap>
            <el-button type="danger" @click="throwError">
              抛出 JavaScript 错误
            </el-button>
            <el-button type="danger" @click="throwAsyncError">
              抛出异步错误
            </el-button>
            <el-button type="danger" @click="throwPromiseError">
              Promise 拒绝
            </el-button>
          </el-space>
        </el-card>

        <!-- 标签和上下文 -->
        <el-card>
          <template #header>
            <span>标签和上下文</span>
          </template>

          <el-form :model="tagForm" label-width="100px">
            <el-form-item label="标签键">
              <el-input v-model="tagForm.key" placeholder="例如: page" />
            </el-form-item>
            <el-form-item label="标签值">
              <el-input v-model="tagForm.value" placeholder="例如: checkout" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="addTag">添加标签</el-button>
            </el-form-item>
          </el-form>

          <el-divider />

          <el-form :model="contextForm" label-width="100px">
            <el-form-item label="上下文名称">
              <el-input v-model="contextForm.name" placeholder="例如: order" />
            </el-form-item>
            <el-form-item label="上下文数据">
              <el-input
                v-model="contextForm.data"
                type="textarea"
                :rows="3"
                placeholder='例如: {"orderId": "12345", "amount": 99.99}'
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="addContext">添加上下文</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 面包屑 -->
        <el-card>
          <template #header>
            <span>面包屑追踪</span>
          </template>

          <el-form :model="breadcrumbForm" label-width="100px">
            <el-form-item label="消息">
              <el-input v-model="breadcrumbForm.message" placeholder="例如: User clicked button" />
            </el-form-item>
            <el-form-item label="类别">
              <el-select v-model="breadcrumbForm.category" placeholder="选择类别">
                <el-option label="用户操作" value="user-action" />
                <el-option label="导航" value="navigation" />
                <el-option label="HTTP" value="http" />
                <el-option label="控制台" value="console" />
              </el-select>
            </el-form-item>
            <el-form-item label="级别">
              <el-select v-model="breadcrumbForm.level" placeholder="选择级别">
                <el-option label="调试" value="debug" />
                <el-option label="信息" value="info" />
                <el-option label="警告" value="warning" />
                <el-option label="错误" value="error" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="addBreadcrumb">添加面包屑</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 性能追踪 -->
        <el-card>
          <template #header>
            <span>性能追踪</span>
          </template>

          <el-space wrap>
            <el-button type="primary" @click="startTransaction">
              开始性能追踪
            </el-button>
            <el-button type="success" :disabled="!transaction" @click="finishTransaction">
              完成追踪
            </el-button>
          </el-space>

          <div v-if="transaction" style="margin-top: 10px">
            <el-tag type="success">追踪进行中...</el-tag>
          </div>
        </el-card>

        <!-- ErrorLogger 集成 -->
        <el-card>
          <template #header>
            <span>ErrorLogger 集成</span>
          </template>

          <el-space wrap>
            <el-button type="info" @click="logInfo">记录信息</el-button>
            <el-button type="warning" @click="logWarning">记录警告</el-button>
            <el-button type="danger" @click="logError">记录错误</el-button>
          </el-space>
        </el-card>

        <!-- 配置信息 -->
        <el-card>
          <template #header>
            <span>配置信息</span>
          </template>

          <el-descriptions :column="1" border>
            <el-descriptions-item label="环境">
              {{ config.environment }}
            </el-descriptions-item>
            <el-descriptions-item label="DSN 已配置">
              {{ config.dsnConfigured ? '是' : '否' }}
            </el-descriptions-item>
            <el-descriptions-item label="Sentry 启用">
              {{ config.enabled ? '是' : '否' }}
            </el-descriptions-item>
            <el-descriptions-item label="版本">
              {{ config.version }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-space>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import {
  setSentryUser,
  clearSentryUser,
  setSentryTag,
  setSentryContext,
  captureSentryException,
  captureSentryMessage,
  addSentryBreadcrumb,
  startSentryTransaction
} from '@/utils/sentry'
import { getErrorLogger, ErrorType } from '@/utils/error-logger'

// 用户表单
const userForm = reactive({
  id: '12345',
  username: 'testuser',
  email: 'test@example.com'
})

// 标签表单
const tagForm = reactive({
  key: 'page',
  value: 'example'
})

// 上下文表单
const contextForm = reactive({
  name: 'order',
  data: '{"orderId": "12345", "amount": 99.99}'
})

// 面包屑表单
const breadcrumbForm = reactive({
  message: 'User clicked button',
  category: 'user-action',
  level: 'info'
})

// 性能追踪
const transaction = ref<any>(null)

// 配置信息
const config = reactive({
  environment: import.meta.env.MODE,
  dsnConfigured: !!import.meta.env.VITE_SENTRY_DSN,
  enabled: import.meta.env.PROD && !!import.meta.env.VITE_SENTRY_DSN,
  version: import.meta.env.VITE_APP_VERSION || '1.0.0'
})

// 设置用户
const setUser = () => {
  setSentryUser(userForm)
  ElMessage.success('用户上下文已设置')
}

// 清除用户
const clearUser = () => {
  clearSentryUser()
  ElMessage.success('用户上下文已清除')
}

// 捕获异常
const captureException = () => {
  const error = new Error('这是一个测试异常')
  captureSentryException(error, {
    testData: 'This is test data',
    timestamp: Date.now()
  })
  ElMessage.success('异常已捕获并发送到 Sentry')
}

// 捕获消息
const captureMessage = (level: 'info' | 'warning' | 'error') => {
  const messages = {
    info: '这是一条信息消息',
    warning: '这是一条警告消息',
    error: '这是一条错误消息'
  }
  captureSentryMessage(messages[level], level)
  ElMessage.success(`${level} 消息已发送到 Sentry`)
}

// 抛出错误
const throwError = () => {
  throw new Error('这是一个测试 JavaScript 错误')
}

// 抛出异步错误
const throwAsyncError = async () => {
  await new Promise((resolve) => setTimeout(resolve, 100))
  throw new Error('这是一个测试异步错误')
}

// Promise 拒绝
const throwPromiseError = () => {
  Promise.reject(new Error('这是一个测试 Promise 拒绝'))
}

// 添加标签
const addTag = () => {
  if (!tagForm.key || !tagForm.value) {
    ElMessage.warning('请填写标签键和值')
    return
  }
  setSentryTag(tagForm.key, tagForm.value)
  ElMessage.success('标签已添加')
}

// 添加上下文
const addContext = () => {
  if (!contextForm.name || !contextForm.data) {
    ElMessage.warning('请填写上下文名称和数据')
    return
  }
  try {
    const data = JSON.parse(contextForm.data)
    setSentryContext(contextForm.name, data)
    ElMessage.success('上下文已添加')
  } catch (error) {
    ElMessage.error('上下文数据格式错误，请输入有效的 JSON')
  }
}

// 添加面包屑
const addBreadcrumb = () => {
  if (!breadcrumbForm.message) {
    ElMessage.warning('请填写消息')
    return
  }
  addSentryBreadcrumb({
    message: breadcrumbForm.message,
    category: breadcrumbForm.category,
    level: breadcrumbForm.level as any
  })
  ElMessage.success('面包屑已添加')
}

// 开始性能追踪
const startTransaction = () => {
  transaction.value = startSentryTransaction('test-transaction', 'task')
  ElMessage.success('性能追踪已开始')
}

// 完成追踪
const finishTransaction = () => {
  if (transaction.value) {
    transaction.value.setStatus('ok')
    transaction.value.finish()
    transaction.value = null
    ElMessage.success('性能追踪已完成')
  }
}

// ErrorLogger 集成
const logger = getErrorLogger()

const logInfo = () => {
  logger.info('这是一条信息日志', { source: 'SentryExample' })
  ElMessage.success('信息已记录')
}

const logWarning = () => {
  logger.warning('这是一条警告日志', new Error('Warning'), { source: 'SentryExample' })
  ElMessage.success('警告已记录')
}

const logError = () => {
  logger.error(
    ErrorType.BUSINESS_ERROR,
    '这是一条错误日志',
    new Error('Business Error'),
    { source: 'SentryExample' }
  )
  ElMessage.success('错误已记录并上报到 Sentry')
}
</script>

<style scoped lang="scss">
.sentry-example {
  padding: 20px;
}
</style>
