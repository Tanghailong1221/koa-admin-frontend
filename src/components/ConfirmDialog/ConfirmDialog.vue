<template>
  <el-dialog
    v-model="visible"
    :title="title"
    :width="width"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="!loading"
    @close="handleCancel"
  >
    <div class="confirm-dialog-content">
      <!-- 图标 -->
      <div v-if="showIcon" class="confirm-icon">
        <el-icon :size="48" :color="iconColor">
          <component :is="iconComponent" />
        </el-icon>
      </div>

      <!-- 消息 -->
      <div class="confirm-message">
        <div v-if="message" class="message-text">{{ message }}</div>
        <div v-if="description" class="message-description">{{ description }}</div>
      </div>

      <!-- 二次确认输入 -->
      <div v-if="requireConfirmText" class="confirm-input">
        <el-alert type="warning" :closable="false" style="margin-bottom: 15px">
          <p>此操作不可撤销，请输入 <strong>{{ confirmText }}</strong> 以确认</p>
        </el-alert>
        <el-input
          v-model="inputValue"
          :placeholder="`请输入 ${confirmText}`"
          :disabled="loading"
          @keyup.enter="handleConfirm"
        />
      </div>

      <!-- 密码确认 -->
      <div v-if="requirePassword" class="confirm-password">
        <el-alert type="warning" :closable="false" style="margin-bottom: 15px">
          <p>此操作需要验证您的密码</p>
        </el-alert>
        <el-input
          v-model="passwordValue"
          type="password"
          placeholder="请输入密码"
          :disabled="loading"
          show-password
          @keyup.enter="handleConfirm"
        />
      </div>

      <!-- 自定义内容 -->
      <div v-if="$slots.default" class="confirm-custom">
        <slot></slot>
      </div>
    </div>

    <template #footer>
      <el-button :disabled="loading" @click="handleCancel">
        {{ cancelText }}
      </el-button>
      <el-button
        :type="confirmButtonType"
        :loading="loading"
        :disabled="!canConfirm"
        @click="handleConfirm"
      >
        {{ confirmText }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { WarningFilled, QuestionFilled, InfoFilled, SuccessFilled } from '@element-plus/icons-vue'

export interface ConfirmDialogProps {
  /**
   * 标题
   */
  title?: string

  /**
   * 消息
   */
  message?: string

  /**
   * 描述
   */
  description?: string

  /**
   * 对话框宽度
   */
  width?: string | number

  /**
   * 确认按钮文本
   */
  confirmText?: string

  /**
   * 取消按钮文本
   */
  cancelText?: string

  /**
   * 确认按钮类型
   */
  confirmButtonType?: 'primary' | 'success' | 'warning' | 'danger' | 'info'

  /**
   * 图标类型
   */
  iconType?: 'warning' | 'question' | 'info' | 'success'

  /**
   * 是否显示图标
   */
  showIcon?: boolean

  /**
   * 是否需要二次确认文本
   */
  requireConfirmText?: boolean

  /**
   * 二次确认文本
   */
  confirmTextValue?: string

  /**
   * 是否需要密码确认
   */
  requirePassword?: boolean

  /**
   * 确认回调
   */
  onConfirm?: (data?: any) => Promise<void> | void

  /**
   * 取消回调
   */
  onCancel?: () => void
}

const props = withDefaults(defineProps<ConfirmDialogProps>(), {
  title: '确认操作',
  message: '确定要执行此操作吗？',
  width: '500px',
  confirmText: '确定',
  cancelText: '取消',
  confirmButtonType: 'primary',
  iconType: 'warning',
  showIcon: true,
  requireConfirmText: false,
  confirmTextValue: '确认',
  requirePassword: false
})

const emit = defineEmits<{
  confirm: [data?: any]
  cancel: []
}>()

// 对话框可见性
const visible = ref(false)

// 加载状态
const loading = ref(false)

// 二次确认输入值
const inputValue = ref('')

// 密码输入值
const passwordValue = ref('')

// 图标组件
const iconComponent = computed(() => {
  switch (props.iconType) {
    case 'warning':
      return WarningFilled
    case 'question':
      return QuestionFilled
    case 'info':
      return InfoFilled
    case 'success':
      return SuccessFilled
    default:
      return WarningFilled
  }
})

// 图标颜色
const iconColor = computed(() => {
  switch (props.iconType) {
    case 'warning':
      return '#E6A23C'
    case 'question':
      return '#409EFF'
    case 'info':
      return '#909399'
    case 'success':
      return '#67C23A'
    default:
      return '#E6A23C'
  }
})

// 是否可以确认
const canConfirm = computed(() => {
  if (loading.value) {
    return false
  }

  // 如果需要二次确认文本
  if (props.requireConfirmText) {
    return inputValue.value === props.confirmTextValue
  }

  // 如果需要密码确认
  if (props.requirePassword) {
    return passwordValue.value.length > 0
  }

  return true
})

// 监听对话框关闭，重置输入
watch(visible, (newVal) => {
  if (!newVal) {
    inputValue.value = ''
    passwordValue.value = ''
    loading.value = false
  }
})

/**
 * 显示对话框
 */
function show() {
  visible.value = true
}

/**
 * 隐藏对话框
 */
function hide() {
  visible.value = false
}

/**
 * 确认
 */
async function handleConfirm() {
  if (!canConfirm.value) {
    return
  }

  try {
    loading.value = true

    // 准备确认数据
    const data: any = {}
    if (props.requireConfirmText) {
      data.confirmText = inputValue.value
    }
    if (props.requirePassword) {
      data.password = passwordValue.value
    }

    // 执行确认回调
    if (props.onConfirm) {
      await props.onConfirm(data)
    }

    emit('confirm', data)
    hide()
  } catch (error) {
    console.error('[ConfirmDialog] 确认失败:', error)
    throw error
  } finally {
    loading.value = false
  }
}

/**
 * 取消
 */
function handleCancel() {
  if (loading.value) {
    return
  }

  if (props.onCancel) {
    props.onCancel()
  }

  emit('cancel')
  hide()
}

// 暴露方法
defineExpose({
  show,
  hide
})
</script>

<style scoped lang="scss">
.confirm-dialog-content {
  .confirm-icon {
    text-align: center;
    margin-bottom: 20px;
  }

  .confirm-message {
    text-align: center;
    margin-bottom: 20px;

    .message-text {
      font-size: 16px;
      font-weight: 500;
      color: #303133;
      margin-bottom: 10px;
    }

    .message-description {
      font-size: 14px;
      color: #606266;
      line-height: 1.6;
    }
  }

  .confirm-input,
  .confirm-password {
    margin-top: 20px;
  }

  .confirm-custom {
    margin-top: 20px;
  }
}
</style>
