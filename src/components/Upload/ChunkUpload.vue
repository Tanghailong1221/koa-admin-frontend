<template>
  <div class="chunk-upload">
    <el-card>
      <!-- 文件选择 -->
      <div class="upload-trigger">
        <el-button
          type="primary"
          :disabled="disabled || isUploading"
          @click="handleSelectFile"
        >
          <el-icon><Upload /></el-icon>
          选择大文件
        </el-button>
        <input
          ref="fileInputRef"
          type="file"
          style="display: none"
          @change="handleFileChange"
        />
      </div>

      <!-- 上传列表 -->
      <div v-if="uploadTasks.length > 0" class="upload-list">
        <div
          v-for="task in uploadTasks"
          :key="task.id"
          class="upload-item"
        >
          <!-- 文件信息 -->
          <div class="file-info">
            <el-icon class="file-icon"><Document /></el-icon>
            <div class="file-details">
              <div class="file-name">{{ task.file.name }}</div>
              <div class="file-meta">
                <span>{{ formatFileSize(task.file.size) }}</span>
                <span v-if="task.speed" class="speed">
                  {{ formatSpeed(task.speed) }}
                </span>
                <span v-if="task.remainingTime" class="time">
                  剩余 {{ formatTime(task.remainingTime) }}
                </span>
              </div>
            </div>
          </div>

          <!-- 进度条 -->
          <el-progress
            :percentage="task.progress"
            :status="getProgressStatus(task.status)"
            :stroke-width="8"
          />

          <!-- 状态信息 -->
          <div class="status-info">
            <el-tag :type="getStatusType(task.status)" size="small">
              {{ getStatusText(task.status) }}
            </el-tag>
            <span class="progress-text">
              {{ task.uploadedChunks }} / {{ task.totalChunks }} 分块
            </span>
          </div>

          <!-- 操作按钮 -->
          <div class="actions">
            <el-button
              v-if="task.status === 'uploading'"
              size="small"
              @click="handlePause(task.id)"
            >
              暂停
            </el-button>
            <el-button
              v-if="task.status === 'paused'"
              type="primary"
              size="small"
              @click="handleResume(task.id)"
            >
              继续
            </el-button>
            <el-button
              v-if="task.status === 'error'"
              type="warning"
              size="small"
              @click="handleRetry(task)"
            >
              重试
            </el-button>
            <el-button
              v-if="['uploading', 'paused', 'error'].includes(task.status)"
              type="danger"
              size="small"
              @click="handleCancel(task.id)"
            >
              取消
            </el-button>
            <el-button
              v-if="task.status === 'success'"
              type="success"
              size="small"
              @click="handleRemove(task.id)"
            >
              移除
            </el-button>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <el-empty
        v-else
        description="暂无上传任务"
        :image-size="100"
      />
    </el-card>

    <!-- 配置说明 -->
    <el-card style="margin-top: 20px">
      <template #header>
        <span>配置信息</span>
      </template>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="分块大小">
          {{ formatFileSize(config.chunkSize || 2 * 1024 * 1024) }}
        </el-descriptions-item>
        <el-descriptions-item label="并发数量">
          {{ config.concurrent || 3 }}
        </el-descriptions-item>
        <el-descriptions-item label="断点续传">
          {{ config.enableResume ? '启用' : '禁用' }}
        </el-descriptions-item>
        <el-descriptions-item label="重试次数">
          {{ config.retryCount || 3 }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Upload, Document } from '@element-plus/icons-vue'
import { createChunkUploader, type ChunkUploadConfig, type UploadTask } from '@/utils/chunk-uploader'

/**
 * 组件属性
 */
export interface ChunkUploadProps {
  /**
   * 上传配置
   */
  config: ChunkUploadConfig

  /**
   * 是否禁用
   */
  disabled?: boolean
}

/**
 * 组件事件
 */
export interface ChunkUploadEmits {
  (e: 'success', result: any, task: UploadTask): void
  (e: 'error', error: Error, task: UploadTask): void
  (e: 'progress', progress: number, task: UploadTask): void
}

const props = withDefaults(defineProps<ChunkUploadProps>(), {
  disabled: false
})

const emit = defineEmits<ChunkUploadEmits>()

// 文件输入引用
const fileInputRef = ref<HTMLInputElement>()

// 上传任务列表
const uploadTasks = ref<UploadTask[]>([])

// 上传器实例
const uploader = ref<ReturnType<typeof createChunkUploader>>()

// 是否正在上传
const isUploading = computed(() => {
  return uploadTasks.value.some(task => task.status === 'uploading')
})

/**
 * 选择文件
 */
function handleSelectFile() {
  fileInputRef.value?.click()
}

/**
 * 文件选择变化
 */
async function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  // 清空输入
  target.value = ''

  // 开始上传
  await startUpload(file)
}

/**
 * 开始上传
 */
async function startUpload(file: File) {
  try {
    // 创建上传器
    if (!uploader.value) {
      uploader.value = createChunkUploader(props.config)
    }

    // 开始上传
    ElMessage.info('开始上传...')

    const result = await uploader.value.upload(file, (progress, task) => {
      // 更新任务列表
      const index = uploadTasks.value.findIndex(t => t.id === task.id)
      if (index >= 0) {
        uploadTasks.value[index] = { ...task }
      } else {
        uploadTasks.value.push({ ...task })
      }

      // 触发进度事件
      emit('progress', progress, task)
    })

    // 上传成功
    const task = uploader.value.getAllTasks().find(t => t.file === file)
    if (task) {
      emit('success', result, task)
    }

    ElMessage.success('上传成功')
  } catch (error: any) {
    // 上传失败
    const task = uploader.value?.getAllTasks().find(t => t.file === file)
    if (task) {
      emit('error', error, task)
    }

    ElMessage.error(error.message || '上传失败')
  }
}

/**
 * 暂停上传
 */
function handlePause(taskId: string) {
  uploader.value?.pause(taskId)
  ElMessage.info('上传已暂停')
}

/**
 * 恢复上传
 */
async function handleResume(taskId: string) {
  try {
    ElMessage.info('恢复上传...')

    await uploader.value?.resume(taskId, (progress, task) => {
      const index = uploadTasks.value.findIndex(t => t.id === task.id)
      if (index >= 0) {
        uploadTasks.value[index] = { ...task }
      }

      emit('progress', progress, task)
    })

    ElMessage.success('上传成功')
  } catch (error: any) {
    ElMessage.error(error.message || '上传失败')
  }
}

/**
 * 取消上传
 */
function handleCancel(taskId: string) {
  uploader.value?.cancel(taskId)
  uploadTasks.value = uploadTasks.value.filter(t => t.id !== taskId)
  ElMessage.info('上传已取消')
}

/**
 * 重试上传
 */
async function handleRetry(task: UploadTask) {
  // 移除失败的任务
  uploadTasks.value = uploadTasks.value.filter(t => t.id !== task.id)

  // 重新上传
  await startUpload(task.file)
}

/**
 * 移除任务
 */
function handleRemove(taskId: string) {
  uploadTasks.value = uploadTasks.value.filter(t => t.id !== taskId)
}

/**
 * 格式化文件大小
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

/**
 * 格式化速度
 */
function formatSpeed(bytesPerSecond: number): string {
  return formatFileSize(bytesPerSecond) + '/s'
}

/**
 * 格式化时间
 */
function formatTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}秒`
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60)
    return `${minutes}分钟`
  } else {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}小时${minutes}分钟`
  }
}

/**
 * 获取进度条状态
 */
function getProgressStatus(status: string): '' | 'success' | 'exception' | 'warning' {
  switch (status) {
    case 'success':
      return 'success'
    case 'error':
      return 'exception'
    case 'paused':
      return 'warning'
    default:
      return ''
  }
}

/**
 * 获取状态标签类型
 */
function getStatusType(status: string): 'success' | 'warning' | 'danger' | 'info' {
  switch (status) {
    case 'success':
      return 'success'
    case 'uploading':
      return 'info'
    case 'paused':
      return 'warning'
    case 'error':
      return 'danger'
    default:
      return 'info'
  }
}

/**
 * 获取状态文本
 */
function getStatusText(status: string): string {
  switch (status) {
    case 'waiting':
      return '等待中'
    case 'uploading':
      return '上传中'
    case 'success':
      return '上传成功'
    case 'error':
      return '上传失败'
    case 'paused':
      return '已暂停'
    default:
      return '未知'
  }
}
</script>

<style scoped lang="scss">
.chunk-upload {
  .upload-trigger {
    margin-bottom: 20px;
  }

  .upload-list {
    .upload-item {
      padding: 16px;
      border: 1px solid var(--el-border-color);
      border-radius: 4px;
      margin-bottom: 16px;

      &:last-child {
        margin-bottom: 0;
      }

      .file-info {
        display: flex;
        align-items: center;
        margin-bottom: 12px;

        .file-icon {
          font-size: 32px;
          color: var(--el-color-primary);
          margin-right: 12px;
        }

        .file-details {
          flex: 1;

          .file-name {
            font-size: 14px;
            font-weight: 500;
            margin-bottom: 4px;
          }

          .file-meta {
            font-size: 12px;
            color: var(--el-text-color-secondary);

            span {
              margin-right: 16px;

              &.speed {
                color: var(--el-color-success);
              }

              &.time {
                color: var(--el-color-warning);
              }
            }
          }
        }
      }

      .status-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 12px;
        margin-bottom: 12px;

        .progress-text {
          font-size: 12px;
          color: var(--el-text-color-secondary);
        }
      }

      .actions {
        display: flex;
        gap: 8px;
      }
    }
  }
}
</style>
