# 文件上传组件文档

## 概述

Upload 组件提供了完整的文件上传功能，支持文件验证、进度显示、取消上传、重试等功能。

## 功能特性

### 1. 基础功能

- ✅ 单文件/多文件上传
- ✅ 文件类型验证
- ✅ 文件大小验证
- ✅ 文件数量限制
- ✅ 自定义验证函数
- ✅ 上传进度显示
- ✅ 取消上传
- ✅ 重试上传
- ✅ 删除文件

### 2. 高级功能

- ✅ 图片缩略图预览
- ✅ 自动上传/手动上传
- ✅ 自定义上传触发器
- ✅ 自定义提示信息
- ✅ 文件列表显示/隐藏
- ✅ 完整的事件系统

## 使用方法

### 1. 基础文件上传

### 1. 基础用法

```vue
<template>
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

function handleSuccess(file, response) {
  console.log('上传成功:', file, response)
}

function handleError(file, error) {
  console.error('上传失败:', file, error)
}
</script>
```

### 2. 多文件上传

```vue
<template>
  <Upload
    :config="uploadConfig"
    :validation="validation"
    multiple
    :max-count="5"
    tip="最多上传 5 个文件"
  />
</template>
```

### 3. 图片上传

```vue
<template>
  <Upload
    :config="uploadConfig"
    :validation="imageValidation"
    multiple
    :max-count="3"
  />
</template>

<script setup lang="ts">
const imageValidation: FileValidationRule = {
  maxSize: 5 * 1024 * 1024, // 5MB
  accept: ['image/jpeg', 'image/png', 'image/gif']
}
</script>
```

### 4. 手动上传

```vue
<template>
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

const uploadRef = ref()

function handleUpload() {
  uploadRef.value?.submit()
}
</script>
```

### 5. 自定义验证

```vue
<template>
  <Upload
    :config="uploadConfig"
    :validation="customValidation"
  />
</template>

<script setup lang="ts">
const customValidation: FileValidationRule = {
  maxSize: 10 * 1024 * 1024,
  validator: (file: File) => {
    // 自定义验证逻辑
    if (!file.name.includes('test')) {
      ElMessage.error('文件名必须包含 "test"')
      return false
    }
    return true
  }
}
</script>
```

## API 文档

### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| config | UploadConfig | - | 上传配置（必填） |
| validation | FileValidationRule | - | 文件验证规则 |
| multiple | boolean | false | 是否支持多选 |
| disabled | boolean | false | 是否禁用 |
| showFileList | boolean | true | 是否显示文件列表 |
| maxCount | number | - | 最大文件数量 |
| autoUpload | boolean | true | 是否自动上传 |
| tip | string | - | 提示信息 |
| modelValue | UploadFile[] | - | 文件列表（v-model） |

### UploadConfig

```typescript
interface UploadConfig {
  /** 上传地址 */
  action: string
  /** 请求方法 */
  method?: 'POST' | 'PUT'
  /** 请求头 */
  headers?: Record<string, string>
  /** 额外的表单数据 */
  data?: Record<string, any>
  /** 文件字段名 */
  name?: string
  /** 是否携带 cookie */
  withCredentials?: boolean
  /** 超时时间（毫秒） */
  timeout?: number
}
```

### FileValidationRule

```typescript
interface FileValidationRule {
  /** 允许的文件类型（MIME 类型或扩展名） */
  accept?: string[]
  /** 最大文件大小（字节） */
  maxSize?: number
  /** 最小文件大小（字节） */
  minSize?: number
  /** 最大文件数量 */
  maxCount?: number
  /** 自定义验证函数 */
  validator?: (file: File) => boolean | Promise<boolean>
}
```

### Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| select | files: File[] | 文件选择后触发 |
| beforeUpload | file: File | 开始上传前触发 |
| progress | file: UploadFile, progress: number | 上传进度变化时触发 |
| success | file: UploadFile, response: any | 上传成功时触发 |
| error | file: UploadFile, error: Error | 上传失败时触发 |
| remove | file: UploadFile | 文件移除时触发 |
| change | fileList: UploadFile[] | 文件列表变化时触发 |

### Slots

| 插槽名 | 说明 |
|--------|------|
| trigger | 自定义上传触发器 |
| tip | 自定义提示信息 |

### Methods

| 方法名 | 参数 | 返回值 | 说明 |
|--------|------|--------|------|
| submit | - | void | 手动上传（autoUpload=false 时使用） |
| clear | - | void | 清空文件列表 |
| getFileList | - | UploadFile[] | 获取文件列表 |

### UploadFile

```typescript
interface UploadFile {
  /** 唯一标识 */
  uid: string
  /** 文件名 */
  name: string
  /** 文件大小（字节） */
  size: number
  /** 文件类型 */
  type: string
  /** 原始文件对象 */
  raw: File
  /** 上传状态 */
  status: UploadStatus
  /** 上传进度（0-100） */
  progress: number
  /** 上传后的 URL */
  url?: string
  /** 错误信息 */
  error?: string
  /** 缩略图 URL（图片） */
  thumbUrl?: string
  /** 响应数据 */
  response?: any
}
```

### UploadStatus

```typescript
enum UploadStatus {
  /** 等待上传 */
  WAITING = 'waiting',
  /** 上传中 */
  UPLOADING = 'uploading',
  /** 上传成功 */
  SUCCESS = 'success',
  /** 上传失败 */
  ERROR = 'error',
  /** 已取消 */
  CANCELED = 'canceled'
}
```

## 文件验证

### 1. 文件类型验证

支持两种方式：

- **MIME 类型**：`image/jpeg`、`application/pdf`
- **扩展名**：`.jpg`、`.pdf`
- **通配符**：`image/*`（所有图片）

```typescript
const validation: FileValidationRule = {
  accept: [
    'image/*',           // 所有图片
    'image/jpeg',        // JPEG 图片
    'application/pdf',   // PDF 文件
    '.doc',              // Word 文档
    '.docx'
  ]
}
```

### 2. 文件大小验证

```typescript
const validation: FileValidationRule = {
  maxSize: 10 * 1024 * 1024, // 10MB
  minSize: 1024              // 1KB
}
```

### 3. 文件数量验证

```typescript
const validation: FileValidationRule = {
  maxCount: 5  // 最多 5 个文件
}
```

### 4. 自定义验证

```typescript
const validation: FileValidationRule = {
  validator: async (file: File) => {
    // 同步验证
    if (file.name.length > 100) {
      ElMessage.error('文件名太长')
      return false
    }

    // 异步验证
    const isValid = await checkFileOnServer(file)
    if (!isValid) {
      ElMessage.error('文件验证失败')
      return false
    }

    return true
  }
}
```

## 最佳实践

### 1. 上传配置

```typescript
const uploadConfig: UploadConfig = {
  action: '/api/upload',
  method: 'POST',
  headers: {
    // 添加认证 token
    Authorization: `Bearer ${getToken()}`
  },
  data: {
    // 添加额外参数
    folder: 'uploads',
    userId: getUserId()
  },
  name: 'file',
  timeout: 60000  // 60 秒超时
}
```

### 2. 错误处理

```typescript
function handleError(file: UploadFile, error: Error) {
  console.error('上传失败:', file.name, error)
  
  // 根据错误类型显示不同提示
  if (error.message.includes('timeout')) {
    ElMessage.error('上传超时，请重试')
  } else if (error.message.includes('network')) {
    ElMessage.error('网络错误，请检查网络连接')
  } else {
    ElMessage.error(`上传失败: ${error.message}`)
  }
}
```

### 3. 进度显示

```typescript
function handleProgress(file: UploadFile, progress: number) {
  console.log(`${file.name}: ${progress}%`)
  
  // 可以在这里更新全局进度
  updateGlobalProgress(progress)
}
```

### 4. 响应处理

```typescript
function handleSuccess(file: UploadFile, response: any) {
  console.log('上传成功:', file.name)
  console.log('文件 URL:', file.url)
  console.log('响应数据:', response)
  
  // 保存文件信息到表单
  formData.value.fileUrl = file.url
  formData.value.fileName = file.name
}
```

## 注意事项

1. **上传地址**：确保 `action` 地址正确且可访问
2. **CORS**：如果跨域上传，需要服务器配置 CORS
3. **文件大小**：注意服务器的文件大小限制
4. **超时时间**：大文件上传建议增加超时时间
5. **错误处理**：建议添加完整的错误处理逻辑
6. **安全性**：建议在服务器端也进行文件验证

## 示例页面

完整的示例页面位于 `src/views/examples/UploadExample.vue`，包含：
- 基础上传
- 多文件上传
- 图片上传
- 手动上传
- 自定义验证
- 代码示例

## 验证的需求

- ✅ **需求 17.1**：基础上传功能（文件验证、进度显示、取消支持）
- ✅ **需求 17.2**：文件验证（类型、大小、数量）
- ✅ **需求 17.5**：错误处理（错误提示、重试功能）

---

**更新时间**：2025-12-23
**版本**：1.0.0


## 图片上传增强

### ImageUpload 组件

专门用于图片上传的组件，提供更丰富的图片处理功能。

#### 基础用法

```vue
<template>
  <ImageUpload
    v-model="images"
    action="/api/upload"
    :limit="9"
    :max-size="5"
    @success="handleSuccess"
    @error="handleError"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ImageUpload } from '@/components/Upload'

const images = ref<string[]>([])

function handleSuccess(response: any, file: any) {
  console.log('上传成功:', response, file)
}

function handleError(error: Error, file: any) {
  console.error('上传失败:', error, file)
}
</script>
```

#### 单张图片上传

```vue
<template>
  <ImageUpload
    v-model="avatar"
    action="/api/upload"
    :limit="1"
    :multiple="false"
    upload-text="上传头像"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ImageUpload } from '@/components/Upload'

const avatar = ref<string[]>([])
</script>
```

#### 自定义缩略图尺寸

```vue
<template>
  <ImageUpload
    v-model="images"
    action="/api/upload"
    :thumb-width="300"
    :thumb-height="200"
  />
</template>
```

#### 禁用缩略图生成

```vue
<template>
  <ImageUpload
    v-model="images"
    action="/api/upload"
    :generate-thumb="false"
  />
</template>
```

#### 图片裁剪（需要安装 cropperjs）

```bash
# 安装 cropperjs
npm install cropperjs
```

```vue
<template>
  <ImageUpload
    v-model="images"
    action="/api/upload"
    :enable-crop="true"
    :crop-aspect-ratio="1"
  />
</template>
```

### ImageUpload Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| modelValue | string[] | - | 绑定值（图片 URL 数组） |
| action | string | - | 上传地址（必填） |
| limit | number | 9 | 最大上传数量 |
| maxSize | number | 5 | 最大文件大小（MB） |
| accept | string | image/jpeg,image/png,image/gif,image/webp | 允许的文件类型 |
| multiple | boolean | true | 是否支持多选 |
| uploadText | string | '上传图片' | 上传按钮文字 |
| enableCrop | boolean | false | 是否启用图片裁剪 |
| cropAspectRatio | number | 1 | 裁剪比例 |
| generateThumb | boolean | true | 是否生成缩略图 |
| thumbWidth | number | 200 | 缩略图宽度 |
| thumbHeight | number | 200 | 缩略图高度 |
| headers | Record<string, string> | - | 请求头 |
| data | Record<string, any> | - | 额外的上传数据 |
| disabled | boolean | false | 是否禁用 |

### ImageUpload Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| update:modelValue | (value: string[]) | 绑定值变化 |
| change | (fileList: any[]) | 文件列表变化 |
| success | (response: any, file: any) | 上传成功 |
| error | (error: Error, file: any) | 上传失败 |
| remove | (file: any, index: number) | 移除文件 |
| preview | (file: any) | 预览文件 |

## 功能特性

### 1. 缩略图生成

ImageUpload 组件会自动生成缩略图，减少内存占用和提升加载速度。

**工作原理：**
1. 读取原始图片文件
2. 使用 Canvas API 缩放图片
3. 生成 Data URL 作为缩略图
4. 显示缩略图，原图用于上传

**优点：**
- 减少内存占用
- 提升页面加载速度
- 改善用户体验

### 2. 图片预览

点击图片可以查看大图预览。

**功能：**
- 全屏预览
- 高清显示
- 关闭按钮

### 3. 图片裁剪（可选）

集成 cropperjs 库，提供强大的图片裁剪功能。

**功能：**
- 自定义裁剪比例
- 拖拽调整裁剪区域
- 缩放图片
- 旋转图片

**注意：** 需要手动安装 cropperjs 库。

### 4. 上传进度

实时显示上传进度，让用户了解上传状态。

**显示内容：**
- 上传中：圆形进度条
- 上传成功：图片预览
- 上传失败：错误提示

### 5. 文件验证

自动验证文件类型和大小。

**验证规则：**
- 文件类型：只允许图片格式
- 文件大小：默认最大 5MB
- 文件数量：默认最多 9 张

## 最佳实践

### 1. 合理设置图片大小限制

```typescript
// 根据实际需求设置大小限制
<ImageUpload
  :max-size="2"  // 头像：2MB
  :max-size="10" // 相册：10MB
/>
```

### 2. 使用缩略图

```typescript
// 启用缩略图生成（默认启用）
<ImageUpload
  :generate-thumb="true"
  :thumb-width="200"
  :thumb-height="200"
/>
```

### 3. 限制上传数量

```typescript
// 根据业务需求限制数量
<ImageUpload
  :limit="1"  // 头像：1 张
  :limit="9"  // 相册：9 张
/>
```

### 4. 处理上传结果

```typescript
function handleSuccess(response: any, file: any) {
  // 保存图片 URL
  console.log('图片 URL:', response.url)
  
  // 更新数据库
  await updateUserAvatar(response.url)
}

function handleError(error: Error, file: any) {
  // 记录错误日志
  console.error('上传失败:', error)
  
  // 提示用户
  ElMessage.error('上传失败，请重试')
}
```

### 5. 服务器端处理

```javascript
// Node.js/Express 示例
app.post('/api/upload', upload.single('file'), (req, res) => {
  const file = req.file
  
  // 验证文件类型
  if (!file.mimetype.startsWith('image/')) {
    return res.status(400).json({ error: '只允许上传图片' })
  }
  
  // 验证文件大小
  if (file.size > 5 * 1024 * 1024) {
    return res.status(400).json({ error: '文件大小不能超过 5MB' })
  }
  
  // 保存文件
  const url = `/uploads/${file.filename}`
  
  res.json({ success: true, url })
})
```

## 常见问题

### 1. 如何自定义上传样式？

使用 CSS 覆盖默认样式：

```scss
.image-upload {
  .image-upload-btn {
    width: 200px;
    height: 200px;
    border: 2px dashed #409eff;
  }
}
```

### 2. 如何实现拖拽上传？

ImageUpload 组件暂不支持拖拽上传，可以使用基础 Upload 组件。

### 3. 如何压缩图片？

可以在上传前使用 Canvas API 压缩图片：

```typescript
async function compressImage(file: File, quality: number = 0.8): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const img = new Image()
      
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')!
        
        canvas.width = img.width
        canvas.height = img.height
        
        ctx.drawImage(img, 0, 0)
        
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('压缩失败'))
          }
        }, file.type, quality)
      }
      
      img.src = e.target?.result as string
    }
    
    reader.readAsDataURL(file)
  })
}
```

### 4. 如何实现图片裁剪？

安装 cropperjs 并启用裁剪功能：

```bash
npm install cropperjs
```

```vue
<ImageUpload
  :enable-crop="true"
  :crop-aspect-ratio="16/9"
/>
```

## 分块上传

### ChunkUpload 组件

专门用于大文件分块上传的组件，支持断点续传、秒传等功能。

#### 基础用法

```vue
<template>
  <ChunkUpload
    :config="uploadConfig"
    @success="handleSuccess"
    @error="handleError"
    @progress="handleProgress"
  />
</template>

<script setup lang="ts">
import { ChunkUpload } from '@/components/Upload'
import type { ChunkUploadConfig } from '@/utils/chunk-uploader'

const uploadConfig: ChunkUploadConfig = {
  action: '/api/upload/chunk',
  chunkSize: 2 * 1024 * 1024, // 2MB
  concurrent: 3,
  enableResume: true,
  retryCount: 3
}

function handleSuccess(result: any, task: any) {
  console.log('上传成功:', result, task)
}

function handleError(error: Error, task: any) {
  console.error('上传失败:', error, task)
}

function handleProgress(progress: number, task: any) {
  console.log('上传进度:', progress, task)
}
</script>
```

#### 配置选项

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| action | string | - | 上传地址（必填） |
| chunkSize | number | 2 * 1024 * 1024 | 分块大小（字节） |
| concurrent | number | 3 | 并发上传数量 |
| enableResume | boolean | true | 是否启用断点续传 |
| retryCount | number | 3 | 重试次数 |
| retryDelay | number | 1000 | 重试延迟（毫秒） |
| timeout | number | 30000 | 超时时间（毫秒） |
| headers | Record<string, string> | - | 请求头 |
| data | Record<string, any> | - | 额外的表单数据 |

#### 事件

| 事件名 | 参数 | 说明 |
|--------|------|------|
| success | (result: any, task: UploadTask) | 上传成功 |
| error | (error: Error, task: UploadTask) | 上传失败 |
| progress | (progress: number, task: UploadTask) | 上传进度变化 |

### 功能特性

#### 1. 分块上传

将大文件分成多个小块上传，提高上传成功率。

**工作原理：**
1. 将文件分成固定大小的分块（默认 2MB）
2. 并发上传多个分块（默认 3 个）
3. 所有分块上传完成后，服务器合并分块

**优点：**
- 提高上传成功率
- 支持并发上传，提升速度
- 减少单次请求失败的影响

#### 2. 断点续传

上传中断后可以继续上传，无需重新开始。

**工作原理：**
1. 上传过程中保存进度到 localStorage
2. 上传中断后，下次上传时加载进度
3. 只上传未完成的分块

**优点：**
- 节省时间和流量
- 提升用户体验
- 适合网络不稳定的场景

#### 3. 秒传

文件已存在时直接返回，无需重复上传。

**工作原理：**
1. 计算文件哈希值
2. 上传前检查文件是否已存在
3. 如果存在，直接返回文件 URL

**优点：**
- 节省时间和流量
- 提升用户体验
- 减少服务器存储压力

#### 4. 自动重试

上传失败自动重试，提高上传成功率。

**工作原理：**
1. 分块上传失败时自动重试
2. 支持配置重试次数和延迟
3. 重试失败后显示错误信息

**优点：**
- 提高上传成功率
- 减少用户操作
- 适合网络不稳定的场景

#### 5. 进度显示

实时显示上传进度、速度和剩余时间。

**显示内容：**
- 上传进度（百分比）
- 已上传分块数 / 总分块数
- 上传速度（字节/秒）
- 剩余时间（秒）

### 服务器端实现

服务器端需要实现三个接口：

#### 1. 检查文件是否存在（秒传）

```javascript
POST /api/upload/chunk/check
Content-Type: application/json

{
  "hash": "文件哈希值"
}

// 响应
{
  "exists": true/false
}
```

#### 2. 上传分块

```javascript
POST /api/upload/chunk
Content-Type: multipart/form-data

FormData:
  - file: 分块数据
  - hash: 文件哈希值
  - index: 分块索引
  - total: 总分块数

// 响应
{
  "success": true
}
```

#### 3. 合并分块

```javascript
POST /api/upload/chunk/merge
Content-Type: application/json

{
  "hash": "文件哈希值",
  "filename": "文件名",
  "total": 总分块数
}

// 响应
{
  "success": true,
  "url": "文件URL"
}
```

### Node.js 服务器示例

```javascript
const express = require('express')
const multer = require('multer')
const fs = require('fs')
const path = require('path')

const app = express()
const upload = multer({ dest: 'uploads/chunks/' })

// 检查文件是否存在
app.post('/api/upload/chunk/check', (req, res) => {
  const { hash } = req.body
  const filePath = path.join('uploads', hash)
  
  res.json({ exists: fs.existsSync(filePath) })
})

// 上传分块
app.post('/api/upload/chunk', upload.single('file'), (req, res) => {
  const { hash, index } = req.body
  const chunkDir = path.join('uploads/chunks', hash)
  
  // 创建目录
  if (!fs.existsSync(chunkDir)) {
    fs.mkdirSync(chunkDir, { recursive: true })
  }
  
  // 移动分块文件
  const chunkPath = path.join(chunkDir, index)
  fs.renameSync(req.file.path, chunkPath)
  
  res.json({ success: true })
})

// 合并分块
app.post('/api/upload/chunk/merge', async (req, res) => {
  const { hash, filename, total } = req.body
  const chunkDir = path.join('uploads/chunks', hash)
  const filePath = path.join('uploads', hash)
  
  // 创建写入流
  const writeStream = fs.createWriteStream(filePath)
  
  // 合并分块
  for (let i = 0; i < total; i++) {
    const chunkPath = path.join(chunkDir, String(i))
    const data = fs.readFileSync(chunkPath)
    writeStream.write(data)
    fs.unlinkSync(chunkPath) // 删除分块
  }
  
  writeStream.end()
  
  // 删除分块目录
  fs.rmdirSync(chunkDir)
  
  res.json({
    success: true,
    url: `/uploads/${hash}`
  })
})
```

### 最佳实践

#### 1. 合理设置分块大小

```typescript
// 根据网络情况调整分块大小
const uploadConfig: ChunkUploadConfig = {
  action: '/api/upload/chunk',
  chunkSize: 2 * 1024 * 1024,  // 网络好：2-5MB
  // chunkSize: 1 * 1024 * 1024,  // 网络差：1-2MB
  // chunkSize: 10 * 1024 * 1024, // 网络很好：5-10MB
}
```

#### 2. 合理设置并发数量

```typescript
// 根据服务器性能调整并发数量
const uploadConfig: ChunkUploadConfig = {
  action: '/api/upload/chunk',
  concurrent: 3,  // 一般服务器：3-5
  // concurrent: 5,  // 高性能服务器：5-10
  // concurrent: 1,  // 低性能服务器：1-2
}
```

#### 3. 启用断点续传

```typescript
const uploadConfig: ChunkUploadConfig = {
  action: '/api/upload/chunk',
  enableResume: true,  // 启用断点续传
}
```

#### 4. 使用真实的文件哈希

```typescript
// 生产环境建议使用 spark-md5 等库计算真实的文件哈希
import SparkMD5 from 'spark-md5'

async function calculateHash(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const spark = new SparkMD5.ArrayBuffer()
    const fileReader = new FileReader()
    
    fileReader.onload = (e) => {
      spark.append(e.target?.result as ArrayBuffer)
      resolve(spark.end())
    }
    
    fileReader.onerror = reject
    fileReader.readAsArrayBuffer(file)
  })
}
```

#### 5. 服务器端验证

```javascript
// 验证分块完整性
app.post('/api/upload/chunk', upload.single('file'), (req, res) => {
  const { hash, index, total } = req.body
  
  // 验证参数
  if (!hash || index === undefined || !total) {
    return res.status(400).json({ error: '参数错误' })
  }
  
  // 验证分块索引
  if (index < 0 || index >= total) {
    return res.status(400).json({ error: '分块索引错误' })
  }
  
  // 验证文件大小
  if (req.file.size > 10 * 1024 * 1024) {
    return res.status(400).json({ error: '分块大小超过限制' })
  }
  
  // 保存分块
  // ...
})
```

### 常见问题

#### 1. 如何处理上传失败？

组件会自动重试失败的分块，如果重试次数用完仍然失败，会显示错误信息。用户可以点击"重试"按钮重新上传。

#### 2. 如何实现秒传？

服务器端需要实现 `/api/upload/chunk/check` 接口，根据文件哈希值检查文件是否已存在。如果存在，直接返回文件 URL。

#### 3. 如何优化上传速度？

- 增加分块大小（2-10MB）
- 增加并发数量（3-5）
- 使用 CDN 加速
- 优化服务器性能

#### 4. 如何处理网络中断？

组件会自动保存上传进度到 localStorage，网络恢复后可以继续上传。用户也可以手动点击"继续"按钮恢复上传。

#### 5. 如何清理临时文件？

服务器端在合并分块后应该删除临时分块文件，避免占用存储空间。

## 相关资源

- [cropperjs 文档](https://github.com/fengyuanchen/cropperjs)
- [Canvas API 文档](https://developer.mozilla.org/zh-CN/docs/Web/API/Canvas_API)
- [File API 文档](https://developer.mozilla.org/zh-CN/docs/Web/API/File)
- [spark-md5 文档](https://github.com/satazor/js-spark-md5)
