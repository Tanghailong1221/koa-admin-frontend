<template>
  <div class="image-upload-example">
    <el-card header="图片上传增强示例">
      <el-alert type="info" :closable="false" style="margin-bottom: 20px">
        <p>图片上传组件提供了缩略图生成、图片预览、拖拽排序等功能。</p>
      </el-alert>

      <!-- 基础图片上传 -->
      <el-divider content-position="left">基础图片上传</el-divider>
      <ImageUpload
        v-model="basicImages"
        action="/api/upload"
        :limit="9"
        :max-size="5"
        @success="handleSuccess"
        @error="handleError"
      />
      <div style="margin-top: 10px">
        <el-text type="info">已上传 {{ basicImages.length }} 张图片</el-text>
      </div>

      <!-- 单张图片上传 -->
      <el-divider content-position="left">单张图片上传</el-divider>
      <ImageUpload
        v-model="singleImage"
        action="/api/upload"
        :limit="1"
        :multiple="false"
        upload-text="上传头像"
      />

      <!-- 自定义尺寸 -->
      <el-divider content-position="left">自定义缩略图尺寸</el-divider>
      <ImageUpload
        v-model="customSizeImages"
        action="/api/upload"
        :limit="6"
        :thumb-width="300"
        :thumb-height="200"
      />

      <!-- 禁用缩略图 -->
      <el-divider content-position="left">禁用缩略图生成</el-divider>
      <ImageUpload
        v-model="noThumbImages"
        action="/api/upload"
        :limit="6"
        :generate-thumb="false"
      />

      <!-- 图片裁剪（需要安装 cropperjs） -->
      <el-divider content-position="left">图片裁剪（需要安装 cropperjs）</el-divider>
      <el-alert type="warning" :closable="false" style="margin-bottom: 10px">
        <p>图片裁剪功能需要安装 cropperjs 库：</p>
        <code>npm install cropperjs</code>
      </el-alert>
      <ImageUpload
        v-model="cropImages"
        action="/api/upload"
        :limit="6"
        :enable-crop="false"
        :crop-aspect-ratio="1"
        upload-text="上传并裁剪"
      />

      <!-- 上传日志 -->
      <el-divider content-position="left">上传日志</el-divider>
      <el-card shadow="never">
        <div v-if="uploadLogs.length === 0" style="text-align: center; color: var(--el-text-color-secondary)">
          暂无上传记录
        </div>
        <div v-else>
          <div
            v-for="(log, index) in uploadLogs"
            :key="index"
            style="margin-bottom: 10px; padding: 10px; background-color: var(--el-fill-color-light); border-radius: 4px"
          >
            <div style="display: flex; justify-content: space-between; align-items: center">
              <div>
                <el-tag :type="log.type" size="small">{{ log.status }}</el-tag>
                <span style="margin-left: 10px">{{ log.fileName }}</span>
              </div>
              <el-text type="info" size="small">{{ log.time }}</el-text>
            </div>
            <div v-if="log.message" style="margin-top: 5px; font-size: 12px; color: var(--el-text-color-secondary)">
              {{ log.message }}
            </div>
          </div>
        </div>
      </el-card>

      <!-- 使用说明 -->
      <el-divider content-position="left">使用说明</el-divider>
      <el-collapse>
        <el-collapse-item title="1. 基础用法" name="1">
          <pre><code>&lt;template&gt;
  &lt;ImageUpload
    v-model="images"
    action="/api/upload"
    :limit="9"
    :max-size="5"
    @success="handleSuccess"
    @error="handleError"
  /&gt;
&lt;/template&gt;

&lt;script setup lang="ts"&gt;
import { ref } from 'vue'
import { ImageUpload } from '@/components/Upload'

const images = ref&lt;string[]&gt;([])

function handleSuccess(response: any, file: any) {
  console.log('上传成功:', response, file)
}

function handleError(error: Error, file: any) {
  console.error('上传失败:', error, file)
}
&lt;/script&gt;</code></pre>
        </el-collapse-item>

        <el-collapse-item title="2. 单张图片上传" name="2">
          <pre><code>&lt;ImageUpload
  v-model="avatar"
  action="/api/upload"
  :limit="1"
  :multiple="false"
  upload-text="上传头像"
/&gt;</code></pre>
        </el-collapse-item>

        <el-collapse-item title="3. 自定义缩略图尺寸" name="3">
          <pre><code>&lt;ImageUpload
  v-model="images"
  action="/api/upload"
  :thumb-width="300"
  :thumb-height="200"
/&gt;</code></pre>
        </el-collapse-item>

        <el-collapse-item title="4. 禁用缩略图生成" name="4">
          <pre><code>&lt;ImageUpload
  v-model="images"
  action="/api/upload"
  :generate-thumb="false"
/&gt;</code></pre>
        </el-collapse-item>

        <el-collapse-item title="5. 图片裁剪（需要安装 cropperjs）" name="5">
          <pre><code>// 安装 cropperjs
npm install cropperjs

// 使用裁剪功能
&lt;ImageUpload
  v-model="images"
  action="/api/upload"
  :enable-crop="true"
  :crop-aspect-ratio="1"
/&gt;</code></pre>
        </el-collapse-item>

        <el-collapse-item title="6. 组件属性" name="6">
          <ul>
            <li><code>modelValue</code> - 绑定值（图片 URL 数组）</li>
            <li><code>action</code> - 上传地址（必填）</li>
            <li><code>limit</code> - 最大上传数量（默认 9）</li>
            <li><code>maxSize</code> - 最大文件大小 MB（默认 5）</li>
            <li><code>accept</code> - 允许的文件类型（默认 image/jpeg,image/png,image/gif,image/webp）</li>
            <li><code>multiple</code> - 是否支持多选（默认 true）</li>
            <li><code>uploadText</code> - 上传按钮文字（默认 '上传图片'）</li>
            <li><code>enableCrop</code> - 是否启用图片裁剪（默认 false）</li>
            <li><code>cropAspectRatio</code> - 裁剪比例（默认 1）</li>
            <li><code>generateThumb</code> - 是否生成缩略图（默认 true）</li>
            <li><code>thumbWidth</code> - 缩略图宽度（默认 200）</li>
            <li><code>thumbHeight</code> - 缩略图高度（默认 200）</li>
            <li><code>headers</code> - 请求头</li>
            <li><code>data</code> - 额外的上传数据</li>
            <li><code>disabled</code> - 是否禁用（默认 false）</li>
          </ul>
        </el-collapse-item>

        <el-collapse-item title="7. 组件事件" name="7">
          <ul>
            <li><code>@update:modelValue</code> - 绑定值变化</li>
            <li><code>@change</code> - 文件列表变化</li>
            <li><code>@success</code> - 上传成功</li>
            <li><code>@error</code> - 上传失败</li>
            <li><code>@remove</code> - 移除文件</li>
            <li><code>@preview</code> - 预览文件</li>
          </ul>
        </el-collapse-item>
      </el-collapse>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ImageUpload } from '@/components/Upload'
import { ElMessage } from 'element-plus'

// 基础图片上传
const basicImages = ref<string[]>([])

// 单张图片上传
const singleImage = ref<string[]>([])

// 自定义尺寸
const customSizeImages = ref<string[]>([])

// 禁用缩略图
const noThumbImages = ref<string[]>([])

// 图片裁剪
const cropImages = ref<string[]>([])

// 上传日志
interface UploadLog {
  status: string
  type: 'success' | 'danger' | 'warning'
  fileName: string
  message?: string
  time: string
}

const uploadLogs = ref<UploadLog[]>([])

/**
 * 上传成功
 */
function handleSuccess(response: any, file: any) {
  uploadLogs.value.unshift({
    status: '上传成功',
    type: 'success',
    fileName: file.name,
    message: `URL: ${response.url || response.data?.url}`,
    time: new Date().toLocaleTimeString()
  })
  
  ElMessage.success(`${file.name} 上传成功`)
}

/**
 * 上传失败
 */
function handleError(error: Error, file: any) {
  uploadLogs.value.unshift({
    status: '上传失败',
    type: 'danger',
    fileName: file.name,
    message: error.message,
    time: new Date().toLocaleTimeString()
  })
  
  ElMessage.error(`${file.name} 上传失败`)
}
</script>

<style scoped lang="scss">
.image-upload-example {
  padding: 20px;

  pre {
    margin: 0;
    padding: 10px;
    background-color: #f5f7fa;
    border-radius: 4px;
    overflow: auto;
  }

  :deep(.el-collapse-item__content) {
    padding-bottom: 15px;
  }

  pre code {
    display: block;
    font-size: 13px;
    line-height: 1.6;
  }

  ul {
    margin: 10px 0;
    padding-left: 20px;
  }

  li {
    margin: 5px 0;
  }

  code {
    padding: 2px 6px;
    background-color: #f5f7fa;
    border-radius: 3px;
    font-size: 12px;
  }
}
</style>
