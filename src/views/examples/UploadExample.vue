<template>
  <div class="upload-example">
    <el-card header="文件上传示例 / Upload Example">
      <el-alert
        title="功能说明 / Description"
        type="info"
        :closable="false"
        style="margin-bottom: 20px"
      >
        <p>本示例展示了文件上传组件的各种功能。</p>
        <p>This example demonstrates various features of the upload component.</p>
      </el-alert>

      <!-- 基础上传 -->
      <el-card header="基础上传 / Basic Upload" style="margin-bottom: 20px">
        <Upload
          :config="uploadConfig"
          :validation="basicValidation"
          @success="handleSuccess"
          @error="handleError"
        />
      </el-card>

      <!-- 多文件上传 -->
      <el-card header="多文件上传 / Multiple Upload" style="margin-bottom: 20px">
        <Upload
          :config="uploadConfig"
          :validation="basicValidation"
          multiple
          :max-count="5"
          tip="最多上传 5 个文件，每个文件不超过 10MB"
        />
      </el-card>

      <!-- 图片上传 -->
      <el-card header="图片上传 / Image Upload" style="margin-bottom: 20px">
        <Upload
          :config="uploadConfig"
          :validation="imageValidation"
          multiple
          :max-count="3"
          tip="仅支持 jpg、png、gif 格式，每个文件不超过 5MB"
        />
      </el-card>

      <!-- 手动上传 -->
      <el-card header="手动上传 / Manual Upload" style="margin-bottom: 20px">
        <Upload
          ref="manualUploadRef"
          :config="uploadConfig"
          :validation="basicValidation"
          :auto-upload="false"
          multiple
        >
          <template #trigger>
            <el-button type="primary">选择文件</el-button>
          </template>
        </Upload>

        <el-button
          type="success"
          style="margin-top: 10px"
          @click="handleManualUpload"
        >
          开始上传
        </el-button>
      </el-card>

      <!-- 自定义验证 -->
      <el-card header="自定义验证 / Custom Validation" style="margin-bottom: 20px">
        <Upload
          :config="uploadConfig"
          :validation="customValidation"
          tip="文件名必须包含 'test' 字符"
        />
      </el-card>

      <!-- 使用说明 -->
      <el-card header="使用说明 / Usage">
        <el-collapse>
          <el-collapse-item title="基础用法" name="1">
            <pre><code>{{ basicUsageCode }}</code></pre>
          </el-collapse-item>
          <el-collapse-item title="文件验证" name="2">
            <pre><code>{{ validationCode }}</code></pre>
          </el-collapse-item>
          <el-collapse-item title="事件处理" name="3">
            <pre><code>{{ eventsCode }}</code></pre>
          </el-collapse-item>
          <el-collapse-item title="手动上传" name="4">
            <pre><code>{{ manualCode }}</code></pre>
          </el-collapse-item>
        </el-collapse>
      </el-card>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Upload } from '@/components/Upload'
import type { UploadConfig, FileValidationRule, UploadFile } from '@/components/Upload'

// 上传配置
const uploadConfig: UploadConfig = {
  action: '/api/upload',
  method: 'POST',
  headers: {
    Authorization: 'Bearer token'
  },
  data: {
    folder: 'uploads'
  },
  name: 'file',
  timeout: 60000
}

// 基础验证
const basicValidation: FileValidationRule = {
  maxSize: 10 * 1024 * 1024, // 10MB
  accept: ['image/*', 'application/pdf', '.doc', '.docx']
}

// 图片验证
const imageValidation: FileValidationRule = {
  maxSize: 5 * 1024 * 1024, // 5MB
  accept: ['image/jpeg', 'image/png', 'image/gif']
}

// 自定义验证
const customValidation: FileValidationRule = {
  maxSize: 10 * 1024 * 1024,
  validator: (file: File) => {
    if (!file.name.includes('test')) {
      ElMessage.error('文件名必须包含 "test" 字符')
      return false
    }
    return true
  }
}

// 手动上传引用
const manualUploadRef = ref<InstanceType<typeof Upload>>()

/**
 * 上传成功
 */
function handleSuccess(file: UploadFile, response: any) {
  ElMessage.success(`文件 ${file.name} 上传成功`)
  console.log('上传成功:', file, response)
}

/**
 * 上传失败
 */
function handleError(file: UploadFile, error: Error) {
  ElMessage.error(`文件 ${file.name} 上传失败: ${error.message}`)
  console.error('上传失败:', file, error)
}

/**
 * 手动上传
 */
function handleManualUpload() {
  manualUploadRef.value?.submit()
}

// 代码示例
const basicUsageCode = `<template>
  <Upload
    :config="uploadConfig"
    :validation="validation"
    @success="handleSuccess"
    @error="handleError"
  />
</template>

<script setup lang="ts">
import { Upload } from '@/components/Upload'
import type { UploadConfig, FileValidationRule } from '@/components/Upload'

const uploadConfig: UploadConfig = {
  action: '/api/upload',
  method: 'POST',
  headers: {
    Authorization: 'Bearer token'
  },
  name: 'file'
}

const validation: FileValidationRule = {
  maxSize: 10 * 1024 * 1024, // 10MB
  accept: ['image/*', 'application/pdf']
}
<\/script>`

const validationCode = `// 文件验证规则
const validation: FileValidationRule = {
  // 允许的文件类型
  accept: [
    'image/*',           // 所有图片
    'image/jpeg',        // JPEG 图片
    'application/pdf',   // PDF 文件
    '.doc',              // Word 文档（扩展名）
    '.docx'
  ],
  
  // 最大文件大小（字节）
  maxSize: 10 * 1024 * 1024, // 10MB
  
  // 最小文件大小（字节）
  minSize: 1024, // 1KB
  
  // 最大文件数量
  maxCount: 5,
  
  // 自定义验证函数
  validator: (file: File) => {
    // 返回 true 表示验证通过
    // 返回 false 表示验证失败
    return file.name.length < 100
  }
}`

const eventsCode = `<template>
  <Upload
    :config="uploadConfig"
    @select="handleSelect"
    @before-upload="handleBeforeUpload"
    @progress="handleProgress"
    @success="handleSuccess"
    @error="handleError"
    @remove="handleRemove"
    @change="handleChange"
  />
</template>

<script setup lang="ts">
// 文件选择后
function handleSelect(files: File[]) {
  console.log('选择的文件:', files)
}

// 开始上传前
function handleBeforeUpload(file: File) {
  console.log('开始上传:', file)
}

// 上传进度
function handleProgress(file: UploadFile, progress: number) {
  console.log('上传进度:', file.name, progress)
}

// 上传成功
function handleSuccess(file: UploadFile, response: any) {
  console.log('上传成功:', file, response)
}

// 上传失败
function handleError(file: UploadFile, error: Error) {
  console.error('上传失败:', file, error)
}

// 文件移除
function handleRemove(file: UploadFile) {
  console.log('移除文件:', file)
}

// 文件列表变化
function handleChange(fileList: UploadFile[]) {
  console.log('文件列表:', fileList)
}
<\/script>`

const manualCode = `<template>
  <Upload
    ref="uploadRef"
    :config="uploadConfig"
    :auto-upload="false"
    multiple
  >
    <template #trigger>
      <el-button type="primary">选择文件</el-button>
    </template>
  </Upload>

  <el-button type="success" @click="handleUpload">
    开始上传
  </el-button>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Upload } from '@/components/Upload'

const uploadRef = ref<InstanceType<typeof Upload>>()

// 手动上传
function handleUpload() {
  uploadRef.value?.submit()
}

// 清空文件列表
function handleClear() {
  uploadRef.value?.clear()
}

// 获取文件列表
function getFiles() {
  const files = uploadRef.value?.getFileList()
  console.log('文件列表:', files)
}
<\/script>`
</script>

<style scoped lang="scss">
.upload-example {
  padding: 20px;
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
