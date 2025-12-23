<template>
  <div class="chunk-upload-example">
    <el-card header="分块上传示例">
      <el-alert type="info" :closable="false" style="margin-bottom: 20px">
        <p>分块上传支持大文件上传、断点续传、秒传等功能，适用于上传大文件场景。</p>
      </el-alert>

      <!-- 分块上传组件 -->
      <ChunkUpload
        :config="uploadConfig"
        @success="handleSuccess"
        @error="handleError"
        @progress="handleProgress"
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
  &lt;ChunkUpload
    :config="uploadConfig"
    @success="handleSuccess"
    @error="handleError"
    @progress="handleProgress"
  /&gt;
&lt;/template&gt;

&lt;script setup lang="ts"&gt;
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
&lt;/script&gt;</code></pre>
        </el-collapse-item>

        <el-collapse-item title="2. 配置选项" name="2">
          <ul>
            <li><code>action</code> - 上传地址（必填）</li>
            <li><code>chunkSize</code> - 分块大小（字节，默认 2MB）</li>
            <li><code>concurrent</code> - 并发上传数量（默认 3）</li>
            <li><code>enableResume</code> - 是否启用断点续传（默认 true）</li>
            <li><code>retryCount</code> - 重试次数（默认 3）</li>
            <li><code>retryDelay</code> - 重试延迟（毫秒，默认 1000）</li>
            <li><code>timeout</code> - 超时时间（毫秒，默认 30000）</li>
            <li><code>headers</code> - 请求头</li>
            <li><code>data</code> - 额外的表单数据</li>
          </ul>
        </el-collapse-item>

        <el-collapse-item title="3. 服务器端实现" name="3">
          <p>服务器端需要实现三个接口：</p>
          <pre><code>// 1. 检查文件是否存在（秒传）
POST /api/upload/chunk/check
{
  "hash": "文件哈希值"
}
响应: { "exists": true/false }

// 2. 上传分块
POST /api/upload/chunk
FormData:
  - file: 分块数据
  - hash: 文件哈希值
  - index: 分块索引
  - total: 总分块数
响应: { "success": true }

// 3. 合并分块
POST /api/upload/chunk/merge
{
  "hash": "文件哈希值",
  "filename": "文件名",
  "total": 总分块数
}
响应: { "success": true, "url": "文件URL" }</code></pre>
        </el-collapse-item>

        <el-collapse-item title="4. Node.js 服务器示例" name="4">
          <pre><code>// Express 示例
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
})</code></pre>
        </el-collapse-item>

        <el-collapse-item title="5. 功能特性" name="5">
          <ul>
            <li><strong>分块上传</strong>：将大文件分成多个小块上传，提高上传成功率</li>
            <li><strong>并发上传</strong>：同时上传多个分块，提升上传速度</li>
            <li><strong>断点续传</strong>：上传中断后可以继续上传，无需重新开始</li>
            <li><strong>秒传</strong>：文件已存在时直接返回，无需重复上传</li>
            <li><strong>自动重试</strong>：上传失败自动重试，提高上传成功率</li>
            <li><strong>进度显示</strong>：实时显示上传进度、速度和剩余时间</li>
            <li><strong>暂停/继续</strong>：支持暂停和继续上传</li>
            <li><strong>取消上传</strong>：支持取消正在进行的上传</li>
          </ul>
        </el-collapse-item>

        <el-collapse-item title="6. 最佳实践" name="6">
          <ul>
            <li>根据网络情况调整分块大小（2-10MB）</li>
            <li>根据服务器性能调整并发数量（3-5）</li>
            <li>启用断点续传，提升用户体验</li>
            <li>使用真实的文件哈希（如 MD5），避免重复上传</li>
            <li>服务器端验证分块完整性</li>
            <li>合并完成后删除分块文件，节省存储空间</li>
            <li>设置合理的超时时间</li>
            <li>记录上传日志，方便排查问题</li>
          </ul>
        </el-collapse-item>
      </el-collapse>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ChunkUpload } from '@/components/Upload'
import type { ChunkUploadConfig, UploadTask } from '@/utils/chunk-uploader'
import { ElMessage } from 'element-plus'

// 上传配置
const uploadConfig: ChunkUploadConfig = {
  action: '/api/upload/chunk',
  chunkSize: 2 * 1024 * 1024, // 2MB
  concurrent: 3,
  enableResume: true,
  retryCount: 3,
  retryDelay: 1000,
  timeout: 30000
}

// 上传日志
interface UploadLog {
  status: string
  type: 'success' | 'danger' | 'warning' | 'info'
  fileName: string
  message?: string
  time: string
}

const uploadLogs = ref<UploadLog[]>([])

/**
 * 上传成功
 */
function handleSuccess(result: any, task: UploadTask) {
  uploadLogs.value.unshift({
    status: '上传成功',
    type: 'success',
    fileName: task.file.name,
    message: `URL: ${result.url || ''}`,
    time: new Date().toLocaleTimeString()
  })
  
  ElMessage.success(`${task.file.name} 上传成功`)
}

/**
 * 上传失败
 */
function handleError(error: Error, task: UploadTask) {
  uploadLogs.value.unshift({
    status: '上传失败',
    type: 'danger',
    fileName: task.file.name,
    message: error.message,
    time: new Date().toLocaleTimeString()
  })
  
  ElMessage.error(`${task.file.name} 上传失败`)
}

/**
 * 上传进度
 */
function handleProgress(progress: number, task: UploadTask) {
  console.log(`${task.file.name} 上传进度: ${progress}%`)
}
</script>

<style scoped lang="scss">
.chunk-upload-example {
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
