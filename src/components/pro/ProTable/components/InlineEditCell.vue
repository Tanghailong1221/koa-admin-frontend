<template>
  <div class="inline-edit-cell">
    <!-- 编辑模式 -->
    <template v-if="isEditing">
      <!-- 输入框 -->
      <el-input
        v-if="editType === 'input'"
        ref="inputRef"
        v-model="editValue"
        size="small"
        @keyup.enter="handleSave"
        @keyup.escape="handleCancel"
      />

      <!-- 数字输入框 -->
      <el-input-number
        v-else-if="editType === 'number'"
        ref="inputRef"
        v-model="editValue"
        size="small"
        controls-position="right"
        @keyup.enter="handleSave"
        @keyup.escape="handleCancel"
      />

      <!-- 下拉选择 -->
      <el-select
        v-else-if="editType === 'select'"
        ref="inputRef"
        v-model="editValue"
        size="small"
        @change="handleSave"
      >
        <el-option
          v-for="opt in options"
          :key="opt.value"
          :label="opt.label"
          :value="opt.value"
        />
      </el-select>

      <!-- 日期选择 -->
      <el-date-picker
        v-else-if="editType === 'date'"
        ref="inputRef"
        v-model="editValue"
        type="date"
        size="small"
        value-format="YYYY-MM-DD"
        @change="handleSave"
      />

      <!-- 开关 -->
      <el-switch
        v-else-if="editType === 'switch'"
        v-model="editValue"
        @change="handleSave"
      />

      <!-- 操作按钮 -->
      <div v-if="editType !== 'switch'" class="edit-actions">
        <el-button
          type="primary"
          :icon="Check"
          size="small"
          circle
          :loading="saving"
          @click="handleSave"
        />
        <el-button
          :icon="Close"
          size="small"
          circle
          @click="handleCancel"
        />
      </div>
    </template>

    <!-- 显示模式 -->
    <template v-else>
      <span class="cell-value" :class="{ editable: canEdit }" @click="handleStartEdit">
        <slot>{{ displayValue }}</slot>
      </span>
      <el-icon v-if="canEdit" class="edit-icon" @click="handleStartEdit">
        <Edit />
      </el-icon>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue'
import { Check, Close, Edit } from '@element-plus/icons-vue'
import type { InlineEditConfig } from '../types-plus'

interface Props {
  /** 当前值 */
  value: any
  /** 行数据 */
  row: any
  /** 字段名 */
  field: string
  /** 行索引 */
  index: number
  /** 编辑配置 */
  config?: InlineEditConfig
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'save', value: any, oldValue: any): void
  (e: 'cancel'): void
}>()

// 状态
const isEditing = ref(false)
const editValue = ref<any>(null)
const saving = ref(false)
const inputRef = ref<any>(null)

// 编辑类型
const editType = computed(() => props.config?.type || 'input')

// 选项
const options = computed(() => props.config?.options || [])

// 是否可编辑
const canEdit = computed(() => {
  if (!props.config) return false
  const { editable } = props.config
  if (typeof editable === 'function') {
    return editable(props.row, props.index)
  }
  return editable !== false
})

// 显示值
const displayValue = computed(() => {
  if (editType.value === 'select' && options.value.length > 0) {
    const opt = options.value.find((o) => o.value === props.value)
    return opt?.label || props.value
  }
  if (editType.value === 'switch') {
    return props.value ? '是' : '否'
  }
  return props.value
})

// 开始编辑
const handleStartEdit = () => {
  if (!canEdit.value) return
  editValue.value = props.value
  isEditing.value = true
  nextTick(() => {
    inputRef.value?.focus?.()
  })
}

// 保存
const handleSave = async () => {
  if (editValue.value === props.value) {
    handleCancel()
    return
  }

  const oldValue = props.value

  // 如果有保存回调
  if (props.config?.onSave) {
    saving.value = true
    try {
      const result = await props.config.onSave(props.row, props.field, editValue.value, oldValue)
      if (result !== false) {
        emit('save', editValue.value, oldValue)
        isEditing.value = false
      }
    } catch (err) {
      console.error('保存失败:', err)
    } finally {
      saving.value = false
    }
  } else {
    emit('save', editValue.value, oldValue)
    isEditing.value = false
  }
}

// 取消
const handleCancel = () => {
  isEditing.value = false
  editValue.value = props.value
  emit('cancel')
}

// 监听值变化
watch(
  () => props.value,
  (val) => {
    if (!isEditing.value) {
      editValue.value = val
    }
  }
)
</script>

<style scoped lang="scss">
.inline-edit-cell {
  display: flex;
  align-items: center;
  gap: 8px;

  .cell-value {
    flex: 1;
    
    &.editable {
      cursor: pointer;
      
      &:hover {
        color: var(--el-color-primary);
      }
    }
  }

  .edit-icon {
    cursor: pointer;
    color: var(--el-text-color-secondary);
    opacity: 0;
    transition: opacity 0.2s;

    &:hover {
      color: var(--el-color-primary);
    }
  }

  &:hover .edit-icon {
    opacity: 1;
  }

  .edit-actions {
    display: flex;
    gap: 4px;
    margin-left: 8px;
  }

  :deep(.el-input),
  :deep(.el-select),
  :deep(.el-date-editor) {
    width: auto;
    min-width: 120px;
  }

  :deep(.el-input-number) {
    width: 120px;
  }
}
</style>
