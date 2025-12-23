<template>
  <div class="pro-upload">
    <!-- 上传触发器 -->
    <div
      v-if="!disabled && (!maxCount || fileList.length < maxCount)"
      class="upload-trigger"
      @click="handleTriggerClick"
    >
      <slot name="trigger">
        <el-button type="primary">
          <el-icon><Upload /></el-icon>
          选择文件
        </el-button>
      </slot>
    </div>

    <!-- 隐藏的文件输入框 -->
    <input
      ref="inputRef"
      type="file"
      :accept="acceptString"
      :multiple="multiple"
      style="display: none"
      @change="handleFileChange"
    />

    <!-- 文件列表 -->
    <div v-if="showFileList && fileList.length > 0" class="upload-file-list">
      <transition-group name="upload-list">
        <div
          v-for="file in fileList"
          :key="file.uid"
          :class="['upload-file-item', `status-${file.status}`]"
        >
          <!-- 缩略图 -->
          <div v-if="file.thumbUrl" class="file-thumb">
            <el-image
              :src="file.thumbUrl"
              fit="cover"
              :preview-src-list="[file.thumbUrl]"
            />
          </div>

          <!-- 文件图标 -->
          <div v-else class="file-icon">
            <el-icon><Document /></el-icon>
          </div>

          <!-- 文件信息 -->
          <div class="file-info">
            <div class="file-name" :title="file.name">
              {{ file.name }}
            </div>
            <div class="file-size">
              {{ formatFileSize(file.size) }}
            </div>

            <!-- 进度条 -->
            <el-progress
              v-if="file.status === UploadStatus.UPLOADING"
              :percentage="file.progress"
              :show-text="false"
              :stroke-width="2"
            />

            <!-- 错误信息 -->
            <div v-if="file.status === UploadStatus.ERROR" class="file-error">
              {{ file.error }}
            </div>
          </div>

          <!-- 状态图标 -->
          <div class="file-status">
            <el-icon v-if="file.status === UploadStatus.SUCCESS" class="success-icon">
              <CircleCheck />
            </el-icon>
            <el-icon v-else-if="file.status === UploadStatus.ERROR" class="error-icon">
              <CircleClose />
            </el-icon>
            <el-icon
              v-else-if="file.status === UploadStatus.UPLOADING"
              class="loading-icon"
            >
              <Loading />
            </el-icon>
          </div>

          <!-- 操作按钮 -->
          <div class="file-actions">
            <!-- 取消上传 -->
            <el-button
              v-if="file.status === UploadStatus.UPLOADING"
              type="text"
              size="small"
              @click="handleCancel(file)"
            >
              取消
            </el-button>

            <!-- 重试 -->
            <el-button
              v-if="file.status === UploadStatus.ERROR"
              type="text"
              size="small"
              @click="handleRetry(file)"
            >
              重试
            </el-button>

            <!-- 删除 -->
            <el-button
              v-if="file.status !== UploadStatus.UPLOADING"
              type="text"
              size="small"
              @click="handleRemove(file)"
            >
              删除
            </el-button>
          </div>
        </div>
      </transition-group>
    </div>

    <!-- 提示信息 -->
    <div v-if="tip" class="upload-tip">
      <slot name="tip">
        {{ tip }}
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Upload,
  Document,
  CircleCheck,
  CircleClose,
  Loading
} from '@element-plus/icons-vue'
import type {
  UploadFile,
  UploadConfig,
  FileValidationRule
} from './types'
import { UploadStatus } from './types'
import { FileUploader, generateUid, formatFileSize, generateImageThumb } from './uploader'
import { FileValidator, validateFileCount } from './validator'

interface Props {
  /** 上传配置 */
  config: UploadConfig
  /** 文件验证规则 */
  validation?: FileValidationRule
  /** 是否支持多选 */
  multiple?: boolean
  /** 是否禁用 */
  disabled?: boolean
  /** 是否显示文件列表 */
  showFileList?: boolean
  /** 最大文件数量 */
  maxCount?: number
  /** 是否自动上传 */
  autoUpload?: boolean
  /** 提示信息 */
  tip?: string
  /** 文件列表 */
  modelValue?: UploadFile[]
}

const props = withDefaults(defineProps<Props>(), {
  multiple: false,
  disabled: false,
  showFileList: true,
  autoUpload: true
})

const emit = defineEmits<{
  'update:modelValue': [files: UploadFile[]]
  select: [files: File[]]
  beforeUpload: [file: File]
  progress: [file: UploadFile, progress: number]
  success: [file: UploadFile, response: any]
  error: [file: UploadFile, error: Error]
  remove: [file: UploadFile]
  change: [fileList: UploadFile[]]
}>()

const inputRef = ref<HTMLInputElement>()
const fileList = ref<UploadFile[]>(props.modelValue || [])
const uploaders = new Map<string, FileUploader>()

// Accept 字符串
const acceptString = computed(() => {
  if (!props.validation?.accept) return undefined
  return props.validation.accept.join(',')
})

/**
 * 触发文件选择
 */
function handleTriggerClick() {
  inputRef.value?.click()
}

/**
 * 文件选择变化
 */
async function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const files = Array.from(target.files || [])

  if (files.length === 0) return

  // 重置 input
  target.value = ''

  emit('select', files)

  // 验证文件数量
  const totalCount = fileList.value.length + files.length
  const countResult = validateFileCount(totalCount, props.maxCount)
  if (!countResult.valid) {
    ElMessage.error(countResult.message!)
    return
  }

  // 处理每个文件
  for (const file of files) {
    await handleFile(file)
  }
}

/**
 * 处理单个文件
 */
async function handleFile(rawFile: File) {
  // 创建文件对象
  const file: UploadFile = {
    uid: generateUid(),
    name: rawFile.name,
    size: rawFile.size,
    type: rawFile.type,
    raw: rawFile,
    status: UploadStatus.WAITING,
    progress: 0
  }

  // 生成缩略图（图片）
  if (rawFile.type.startsWith('image/')) {
    try {
      file.thumbUrl = await generateImageThumb(rawFile)
    } catch (error) {
      console.warn('生成缩略图失败:', error)
    }
  }

  // 验证文件
  if (props.validation) {
    const validator = new FileValidator(props.validation)
    const result = await validator.validate(rawFile)
    if (!result.valid) {
      ElMessage.error(result.message!)
      return
    }
  }

  // 添加到文件列表
  fileList.value.push(file)
  emitChange()

  // 自动上传
  if (props.autoUpload) {
    await uploadFile(file)
  }
}

/**
 * 上传文件
 */
async function uploadFile(file: UploadFile) {
  // 更新状态
  file.status = UploadStatus.UPLOADING
  file.progress = 0

  // 创建上传器
  const uploader = new FileUploader(props.config)
  uploaders.set(file.uid, uploader)

  try {
    // 上传
    const response = await uploader.upload(file, (progress) => {
      file.progress = progress
      emit('progress', file, progress)
    })

    // 上传成功
    file.status = UploadStatus.SUCCESS
    file.progress = 100
    file.url = response.url
    file.response = response.data

    emit('success', file, response)
    emitChange()
  } catch (error) {
    // 上传失败
    if (uploader.isAborted()) {
      file.status = UploadStatus.CANCELED
    } else {
      file.status = UploadStatus.ERROR
      file.error = error instanceof Error ? error.message : '上传失败'
      emit('error', file, error as Error)
    }
    emitChange()
  } finally {
    uploaders.delete(file.uid)
  }
}

/**
 * 取消上传
 */
function handleCancel(file: UploadFile) {
  const uploader = uploaders.get(file.uid)
  if (uploader) {
    uploader.abort()
  }
}

/**
 * 重试上传
 */
async function handleRetry(file: UploadFile) {
  await uploadFile(file)
}

/**
 * 删除文件
 */
function handleRemove(file: UploadFile) {
  const index = fileList.value.findIndex(item => item.uid === file.uid)
  if (index > -1) {
    fileList.value.splice(index, 1)
    emit('remove', file)
    emitChange()
  }
}

/**
 * 触发 change 事件
 */
function emitChange() {
  emit('update:modelValue', fileList.value)
  emit('change', fileList.value)
}

/**
 * 监听 modelValue 变化
 */
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      fileList.value = newValue
    }
  }
)

// 暴露方法
defineExpose({
  /** 手动上传 */
  submit: () => {
    fileList.value
      .filter(file => file.status === UploadStatus.WAITING)
      .forEach(file => uploadFile(file))
  },
  /** 清空文件列表 */
  clear: () => {
    fileList.value = []
    emitChange()
  },
  /** 获取文件列表 */
  getFileList: () => fileList.value
})
</script>

<style scoped lang="scss">
.pro-upload {
  .upload-trigger {
    display: inline-block;
    margin-bottom: 10px;
  }

  .upload-file-list {
    margin-top: 10px;
  }

  .upload-file-item {
    display: flex;
    align-items: center;
    padding: 10px;
    margin-bottom: 8px;
    background-color: #f5f7fa;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    transition: all 0.3s;

    &:hover {
      background-color: #f0f2f5;
    }

    &.status-success {
      border-color: var(--el-color-success);
    }

    &.status-error {
      border-color: var(--el-color-danger);
    }

    .file-thumb {
      width: 48px;
      height: 48px;
      margin-right: 12px;
      border-radius: 4px;
      overflow: hidden;

      :deep(.el-image) {
        width: 100%;
        height: 100%;
      }
    }

    .file-icon {
      width: 48px;
      height: 48px;
      margin-right: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      color: #909399;
    }

    .file-info {
      flex: 1;
      min-width: 0;

      .file-name {
        font-size: 14px;
        color: #303133;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        margin-bottom: 4px;
      }

      .file-size {
        font-size: 12px;
        color: #909399;
        margin-bottom: 4px;
      }

      .file-error {
        font-size: 12px;
        color: var(--el-color-danger);
        margin-top: 4px;
      }
    }

    .file-status {
      margin: 0 12px;
      font-size: 20px;

      .success-icon {
        color: var(--el-color-success);
      }

      .error-icon {
        color: var(--el-color-danger);
      }

      .loading-icon {
        color: var(--el-color-primary);
        animation: rotate 1s linear infinite;
      }
    }

    .file-actions {
      display: flex;
      gap: 8px;
    }
  }

  .upload-tip {
    margin-top: 8px;
    font-size: 12px;
    color: #909399;
    line-height: 1.5;
  }
}

// 列表动画
.upload-list-enter-active,
.upload-list-leave-active {
  transition: all 0.3s;
}

.upload-list-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.upload-list-leave-to {
  opacity: 0;
  transform: translateX(10px);
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
