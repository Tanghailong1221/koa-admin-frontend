<template>
  <div class="image-upload">
    <!-- 图片列表 -->
    <div class="image-list">
      <div
        v-for="(image, index) in imageList"
        :key="image.uid"
        class="image-item"
      >
        <!-- 图片预览 -->
        <div class="image-preview">
          <img :src="image.url || image.thumbUrl" :alt="image.name" />
          
          <!-- 遮罩层 -->
          <div class="image-mask">
            <el-icon class="icon" @click="handlePreview(image)">
              <ZoomIn />
            </el-icon>
            <el-icon class="icon" @click="handleRemove(index)">
              <Delete />
            </el-icon>
          </div>
          
          <!-- 上传进度 -->
          <div v-if="image.status === 'uploading'" class="image-progress">
            <el-progress
              type="circle"
              :percentage="image.percentage || 0"
              :width="60"
            />
          </div>
          
          <!-- 上传失败 -->
          <div v-if="image.status === 'error'" class="image-error">
            <el-icon><CircleClose /></el-icon>
            <span>上传失败</span>
          </div>
        </div>
      </div>
      
      <!-- 上传按钮 -->
      <div
        v-if="imageList.length < limit"
        class="image-upload-btn"
        @click="handleClick"
      >
        <el-icon class="upload-icon"><Plus /></el-icon>
        <div class="upload-text">{{ uploadText }}</div>
      </div>
    </div>
    
    <!-- 隐藏的文件输入 -->
    <input
      ref="inputRef"
      type="file"
      :accept="accept"
      :multiple="multiple"
      style="display: none"
      @change="handleFileChange"
    />
    
    <!-- 图片预览对话框 -->
    <el-dialog
      v-model="previewVisible"
      title="图片预览"
      width="800px"
      append-to-body
    >
      <img :src="previewUrl" style="width: 100%" alt="预览图片" />
    </el-dialog>
    
    <!-- 图片裁剪对话框 -->
    <el-dialog
      v-model="cropVisible"
      title="图片裁剪"
      width="800px"
      append-to-body
      @close="handleCropClose"
    >
      <div class="crop-container">
        <img ref="cropImageRef" :src="cropImageUrl" alt="裁剪图片" />
      </div>
      <template #footer>
        <el-button @click="cropVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCropConfirm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, ZoomIn, Delete, CircleClose } from '@element-plus/icons-vue'
import { validateFile } from './validator'
import { uploadFile as uploadFileRequest } from './uploader'

/**
 * 图片上传组件属性
 */
export interface ImageUploadProps {
  /**
   * 绑定值（图片 URL 数组）
   */
  modelValue?: string[]
  
  /**
   * 上传地址
   */
  action: string
  
  /**
   * 最大上传数量
   * @default 9
   */
  limit?: number
  
  /**
   * 最大文件大小（MB）
   * @default 5
   */
  maxSize?: number
  
  /**
   * 允许的文件类型
   * @default ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
   */
  accept?: string
  
  /**
   * 是否支持多选
   * @default true
   */
  multiple?: boolean
  
  /**
   * 上传按钮文字
   * @default '上传图片'
   */
  uploadText?: string
  
  /**
   * 是否启用图片裁剪
   * @default false
   */
  enableCrop?: boolean
  
  /**
   * 裁剪比例
   * @default 1 (1:1)
   */
  cropAspectRatio?: number
  
  /**
   * 是否生成缩略图
   * @default true
   */
  generateThumb?: boolean
  
  /**
   * 缩略图宽度
   * @default 200
   */
  thumbWidth?: number
  
  /**
   * 缩略图高度
   * @default 200
   */
  thumbHeight?: number
  
  /**
   * 请求头
   */
  headers?: Record<string, string>
  
  /**
   * 额外的上传数据
   */
  data?: Record<string, any>
  
  /**
   * 是否禁用
   * @default false
   */
  disabled?: boolean
}

/**
 * 图片上传组件事件
 */
export interface ImageUploadEmits {
  (e: 'update:modelValue', value: string[]): void
  (e: 'change', fileList: any[]): void
  (e: 'success', response: any, file: any): void
  (e: 'error', error: Error, file: any): void
  (e: 'remove', file: any, index: number): void
  (e: 'preview', file: any): void
}

const props = withDefaults(defineProps<ImageUploadProps>(), {
  limit: 9,
  maxSize: 5,
  accept: 'image/jpeg,image/png,image/gif,image/webp',
  multiple: true,
  uploadText: '上传图片',
  enableCrop: false,
  cropAspectRatio: 1,
  generateThumb: true,
  thumbWidth: 200,
  thumbHeight: 200,
  disabled: false
})

const emit = defineEmits<ImageUploadEmits>()

  // 图片列表
const imageList = ref<Array<{
  uid: string
  name: string
  url?: string
  thumbUrl?: string
  status: 'waiting' | 'uploading' | 'success' | 'error'
  percentage?: number
  size?: number
  type?: string
  raw?: File
}>>([])

// 文件输入引用
const inputRef = ref<HTMLInputElement>()

// 预览相关
const previewVisible = ref(false)
const previewUrl = ref('')

// 裁剪相关
const cropVisible = ref(false)
const cropImageUrl = ref('')
const cropImageRef = ref<HTMLImageElement>()
const cropperInstance = ref<any>(null)
const currentCropFile = ref<File | null>(null)

/**
 * 初始化图片列表
 */
watch(
  () => props.modelValue,
  (urls) => {
    if (urls && urls.length > 0) {
      imageList.value = urls.map((url, index) => ({
        uid: `${Date.now()}-${index}`,
        name: url.split('/').pop() || '',
        url,
        status: 'success',
        percentage: 100
      }))
    } else {
      imageList.value = []
    }
  },
  { immediate: true }
)

/**
 * 点击上传按钮
 */
function handleClick() {
  if (props.disabled) return
  inputRef.value?.click()
}

/**
 * 文件选择变化
 */
async function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const files = Array.from(target.files || [])
  
  if (files.length === 0) return
  
  // 检查数量限制
  if (imageList.value.length + files.length > props.limit) {
    ElMessage.warning(`最多只能上传 ${props.limit} 张图片`)
    target.value = ''
    return
  }
  
  // 处理每个文件
  for (const file of files) {
    await handleFile(file)
  }
  
  // 清空输入
  target.value = ''
}

/**
 * 处理单个文件
 */
async function handleFile(file: File) {
  // 验证文件
  const validation = validateFile(file, {
    maxSize: props.maxSize,
    allowedTypes: props.accept.split(',')
  })
  
  if (!validation.valid) {
    ElMessage.error(validation.error || '文件验证失败')
    return
  }
  
  // 如果启用裁剪，显示裁剪对话框
  if (props.enableCrop) {
    await showCropDialog(file)
    return
  }
  
  // 直接上传
  await uploadImage(file)
}

/**
 * 显示裁剪对话框
 */
async function showCropDialog(file: File) {
  currentCropFile.value = file
  
  // 读取文件为 Data URL
  const reader = new FileReader()
  reader.onload = async (e) => {
    cropImageUrl.value = e.target?.result as string
    cropVisible.value = true
    
    // 等待 DOM 更新后初始化 Cropper
    await nextTick()
    initCropper()
  }
  reader.readAsDataURL(file)
}

/**
 * 初始化 Cropper
 */
function initCropper() {
  if (!cropImageRef.value) return
  
  // 注意：这里需要安装 cropperjs 库
  // npm install cropperjs
  // import Cropper from 'cropperjs'
  // import 'cropperjs/dist/cropper.css'
  
  // cropperInstance.value = new Cropper(cropImageRef.value, {
  //   aspectRatio: props.cropAspectRatio,
  //   viewMode: 1,
  //   dragMode: 'move',
  //   autoCropArea: 1,
  //   restore: false,
  //   guides: true,
  //   center: true,
  //   highlight: false,
  //   cropBoxMovable: true,
  //   cropBoxResizable: true,
  //   toggleDragModeOnDblclick: false
  // })
  
  console.log('[ImageUpload] Cropper 初始化（需要安装 cropperjs）')
}

/**
 * 确认裁剪
 */
async function handleCropConfirm() {
  if (!cropperInstance.value || !currentCropFile.value) {
    ElMessage.error('裁剪失败')
    return
  }
  
  // 获取裁剪后的 canvas
  // const canvas = cropperInstance.value.getCroppedCanvas()
  
  // 转换为 Blob
  // canvas.toBlob(async (blob: Blob) => {
  //   if (!blob) {
  //     ElMessage.error('裁剪失败')
  //     return
  //   }
  //   
  //   // 创建新文件
  //   const file = new File([blob], currentCropFile.value!.name, {
  //     type: currentCropFile.value!.type
  //   })
  //   
  //   // 上传裁剪后的图片
  //   await uploadImage(file)
  //   
  //   // 关闭对话框
  //   cropVisible.value = false
  // })
  
  // 临时实现：直接上传原图
  await uploadImage(currentCropFile.value)
  cropVisible.value = false
}

/**
 * 关闭裁剪对话框
 */
function handleCropClose() {
  if (cropperInstance.value) {
    cropperInstance.value.destroy()
    cropperInstance.value = null
  }
  currentCropFile.value = null
}

/**
 * 上传图片
 */
async function uploadImage(file: File) {
  // 创建上传文件对象
  const uploadFileItem = {
    uid: `${Date.now()}-${Math.random()}`,
    name: file.name,
    size: file.size,
    type: file.type,
    status: 'uploading' as const,
    percentage: 0,
    raw: file
  }
  
  // 生成缩略图
  if (props.generateThumb) {
    uploadFileItem.thumbUrl = await generateThumbnail(file, props.thumbWidth, props.thumbHeight)
  }
  
  // 添加到列表
  imageList.value.push(uploadFileItem)
  
  try {
    // 上传文件
    const response = await uploadFileRequest(file, {
      action: props.action,
      headers: props.headers,
      data: props.data,
      onProgress: (percentage) => {
        uploadFileItem.percentage = percentage
      }
    })
    
    // 上传成功
    uploadFileItem.status = 'success'
    uploadFileItem.url = response.url || response.data?.url
    uploadFileItem.percentage = 100
    
    // 更新绑定值
    updateModelValue()
    
    // 触发事件
    emit('success', response, uploadFileItem)
    emit('change', imageList.value)
    
    ElMessage.success('上传成功')
  } catch (error: any) {
    // 上传失败
    uploadFileItem.status = 'error'
    
    // 触发事件
    emit('error', error, uploadFileItem)
    emit('change', imageList.value)
    
    ElMessage.error(error.message || '上传失败')
  }
}

/**
 * 生成缩略图
 */
function generateThumbnail(
  file: File,
  width: number,
  height: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const img = new Image()
      
      img.onload = () => {
        // 创建 canvas
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        if (!ctx) {
          reject(new Error('无法创建 canvas 上下文'))
          return
        }
        
        // 计算缩放比例
        const scale = Math.min(width / img.width, height / img.height)
        const scaledWidth = img.width * scale
        const scaledHeight = img.height * scale
        
        // 设置 canvas 尺寸
        canvas.width = scaledWidth
        canvas.height = scaledHeight
        
        // 绘制图片
        ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight)
        
        // 转换为 Data URL
        resolve(canvas.toDataURL(file.type))
      }
      
      img.onerror = () => {
        reject(new Error('图片加载失败'))
      }
      
      img.src = e.target?.result as string
    }
    
    reader.onerror = () => {
      reject(new Error('文件读取失败'))
    }
    
    reader.readAsDataURL(file)
  })
}

/**
 * 预览图片
 */
function handlePreview(file: any) {
  previewUrl.value = file.url || file.thumbUrl || ''
  previewVisible.value = true
  emit('preview', file)
}

/**
 * 移除图片
 */
function handleRemove(index: number) {
  const file = imageList.value[index]
  imageList.value.splice(index, 1)
  
  // 更新绑定值
  updateModelValue()
  
  // 触发事件
  emit('remove', file, index)
  emit('change', imageList.value)
}

/**
 * 更新绑定值
 */
function updateModelValue() {
  const urls = imageList.value
    .filter(file => file.status === 'success' && file.url)
    .map(file => file.url!)
  
  emit('update:modelValue', urls)
}
</script>

<style scoped lang="scss">
.image-upload {
  .image-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .image-item,
  .image-upload-btn {
    width: 148px;
    height: 148px;
    border: 1px dashed var(--el-border-color);
    border-radius: 6px;
    overflow: hidden;
    position: relative;
  }

  .image-preview {
    width: 100%;
    height: 100%;
    position: relative;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .image-mask {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      opacity: 0;
      transition: opacity 0.3s;

      .icon {
        font-size: 20px;
        color: #fff;
        cursor: pointer;
        transition: transform 0.3s;

        &:hover {
          transform: scale(1.2);
        }
      }
    }

    &:hover .image-mask {
      opacity: 1;
    }

    .image-progress {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(255, 255, 255, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .image-error {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.7);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 14px;

      .el-icon {
        font-size: 32px;
        margin-bottom: 8px;
      }
    }
  }

  .image-upload-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: border-color 0.3s;

    &:hover {
      border-color: var(--el-color-primary);
    }

    .upload-icon {
      font-size: 28px;
      color: var(--el-text-color-secondary);
      margin-bottom: 8px;
    }

    .upload-text {
      font-size: 14px;
      color: var(--el-text-color-regular);
    }
  }

  .crop-container {
    max-height: 500px;
    overflow: hidden;

    img {
      max-width: 100%;
      display: block;
    }
  }
}
</style>
