<template>
  <el-dialog
    v-model="visible"
    title="列设置"
    width="500px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="column-setting">
      <div class="column-setting__header">
        <span>拖拽调整列顺序，勾选控制列显示</span>
      </div>
      
      <div class="column-setting__list" ref="listRef">
        <div
          v-for="(col, index) in localColumns"
          :key="col.prop"
          class="column-setting__item"
          :class="{ 'is-dragging': dragIndex === index, 'is-drop-target': dropIndex === index }"
          :data-prop="col.prop"
          draggable="true"
          @dragstart="handleDragStart($event, index)"
          @dragover="handleDragOver($event, index)"
          @drop="handleDrop($event, index)"
          @dragend="handleDragEnd"
        >
          <el-icon class="drag-handle">
            <Rank />
          </el-icon>
          <el-checkbox
            v-model="col.visible"
            :disabled="isColumnFixed(col.prop)"
          >
            {{ getColumnLabel(col.prop) }}
          </el-checkbox>
          <span v-if="isColumnFixed(col.prop)" class="fixed-tag">(固定)</span>
        </div>
      </div>
    </div>
    
    <template #footer>
      <el-button @click="handleReset">重置</el-button>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleConfirm">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Rank } from '@element-plus/icons-vue'
import type { ProTableColumnPlus, ColumnState } from '../types-plus'

interface Props {
  /** 是否显示 */
  modelValue: boolean
  /** 列配置 */
  columns: ProTableColumnPlus[]
  /** 列状态 */
  columnStates: ColumnState[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'visible-change', prop: string, visible: boolean): void
  (e: 'order-change', props: string[]): void
  (e: 'reset'): void
  (e: 'confirm'): void
}>()

// 本地列数据（用于编辑）
interface LocalColumn {
  prop: string
  visible: boolean
  order: number
}

const localColumns = ref<LocalColumn[]>([])

// 拖拽状态
const dragIndex = ref<number | null>(null)
const dropIndex = ref<number | null>(null)

// 对话框可见性
const visible = ref(false)

// 监听 modelValue
watch(
  () => props.modelValue,
  (val) => {
    visible.value = val
    if (val) {
      initLocalColumns()
    }
  },
  { immediate: true }
)

// 监听 visible 变化
watch(visible, (val) => {
  emit('update:modelValue', val)
})

// 初始化本地列数据
const initLocalColumns = () => {
  // 获取可隐藏的列
  const hideableColumns = props.columns.filter((col) => col.hideable !== false)
  
  // 根据 columnStates 的顺序排序
  localColumns.value = hideableColumns
    .map((col) => {
      const state = props.columnStates.find((s) => s.prop === col.prop)
      return {
        prop: col.prop,
        visible: state ? state.visible : col.visible !== false,
        order: state ? state.order : props.columns.indexOf(col),
      }
    })
    .sort((a, b) => a.order - b.order)
}

// 获取列标签
const getColumnLabel = (prop: string): string => {
  const col = props.columns.find((c) => c.prop === prop)
  return col?.label || prop
}

// 判断列是否固定（不可隐藏）
const isColumnFixed = (prop: string): boolean => {
  const col = props.columns.find((c) => c.prop === prop)
  return col?.hideable === false
}

// 拖拽开始
const handleDragStart = (e: DragEvent, index: number) => {
  dragIndex.value = index
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(index))
  }
}

// 拖拽经过
const handleDragOver = (e: DragEvent, index: number) => {
  e.preventDefault()
  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = 'move'
  }
  dropIndex.value = index
}

// 拖拽放下
const handleDrop = (e: DragEvent, index: number) => {
  e.preventDefault()
  if (dragIndex.value === null || dragIndex.value === index) return

  const newColumns = [...localColumns.value]
  const removed = newColumns.splice(dragIndex.value, 1)[0]
  if (removed) {
    newColumns.splice(index, 0, removed)
    
    // 更新顺序
    newColumns.forEach((col, i) => {
      col.order = i
    })
    
    localColumns.value = newColumns
  }
  dragIndex.value = null
  dropIndex.value = null
}

// 拖拽结束
const handleDragEnd = () => {
  dragIndex.value = null
  dropIndex.value = null
}

// 重置
const handleReset = () => {
  // 重置本地列数据为原始配置
  const hideableColumns = props.columns.filter((col) => col.hideable !== false)
  localColumns.value = hideableColumns.map((col, index) => ({
    prop: col.prop,
    visible: col.visible !== false,
    order: col.order ?? index,
  }))
  
  // 通知父组件重置
  emit('reset')
}

// 取消
const handleCancel = () => {
  visible.value = false
  initLocalColumns()
}

// 确认
const handleConfirm = () => {
  // 应用可见性变化
  localColumns.value.forEach((col) => {
    const state = props.columnStates.find((s) => s.prop === col.prop)
    if (state && state.visible !== col.visible) {
      emit('visible-change', col.prop, col.visible)
    }
  })
  
  // 应用顺序变化
  const newOrder = localColumns.value.map((col) => col.prop)
  emit('order-change', newOrder)
  
  emit('confirm')
  visible.value = false
}

// 关闭
const handleClose = () => {
  initLocalColumns()
}
</script>

<style scoped lang="scss">
.column-setting {
  &__header {
    margin-bottom: 12px;
    color: var(--el-text-color-secondary);
    font-size: 12px;
  }

  &__list {
    max-height: 400px;
    overflow-y: auto;
  }

  &__item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-bottom: 1px solid var(--el-border-color-lighter);
    cursor: move;
    transition: background-color 0.2s;
    user-select: none;

    &:hover {
      background-color: var(--el-fill-color-light);
    }

    &:last-child {
      border-bottom: none;
    }

    &.is-dragging {
      opacity: 0.5;
      background-color: var(--el-color-primary-light-9);
    }

    &.is-drop-target {
      border-top: 2px solid var(--el-color-primary);
    }

    .drag-handle {
      color: var(--el-text-color-placeholder);
      cursor: grab;

      &:active {
        cursor: grabbing;
      }
    }

    .fixed-tag {
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }
  }
}
</style>
