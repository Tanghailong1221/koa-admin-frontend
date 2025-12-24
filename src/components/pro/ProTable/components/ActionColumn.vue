<template>
  <div class="action-column">
    <template v-for="btn in visibleButtons" :key="btn.key">
      <!-- 带确认的按钮 -->
      <el-popconfirm
        v-if="getButtonConfirm(btn)"
        :title="getButtonConfirm(btn)"
        @confirm="handleButtonClick(btn)"
      >
        <template #reference>
          <el-button
            :type="btn.type || 'primary'"
            :icon="btn.icon"
            :link="btn.link !== false"
            :disabled="getButtonDisabled(btn)"
            size="small"
          >
            {{ btn.label }}
          </el-button>
        </template>
      </el-popconfirm>
      
      <!-- 普通按钮 -->
      <el-button
        v-else
        :type="btn.type || 'primary'"
        :icon="btn.icon"
        :link="btn.link !== false"
        :disabled="getButtonDisabled(btn)"
        size="small"
        @click="handleButtonClick(btn)"
      >
        {{ btn.label }}
      </el-button>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ActionButton } from '../types-plus'

interface Props {
  /** 操作按钮列表 */
  buttons?: ActionButton[]
  /** 当前行数据 */
  row: any
  /** 当前行索引 */
  index: number
}

const props = withDefaults(defineProps<Props>(), {
  buttons: () => [],
})

const emit = defineEmits<{
  (e: 'button-click', button: ActionButton, row: any, index: number): void
}>()

// 可见的按钮
const visibleButtons = computed(() => {
  return props.buttons.filter((btn) => {
    if (typeof btn.show === 'function') {
      return btn.show(props.row, props.index)
    }
    return btn.show !== false
  })
})

// 获取按钮禁用状态
const getButtonDisabled = (btn: ActionButton): boolean => {
  if (typeof btn.disabled === 'function') {
    return btn.disabled(props.row, props.index)
  }
  return btn.disabled === true
}

// 获取按钮确认文本
const getButtonConfirm = (btn: ActionButton): string | undefined => {
  if (!btn.confirm) return undefined
  if (typeof btn.confirm === 'function') {
    return btn.confirm(props.row)
  }
  return btn.confirm
}

// 处理按钮点击
const handleButtonClick = (btn: ActionButton) => {
  if (btn.onClick) {
    btn.onClick(props.row, props.index)
  }
  emit('button-click', btn, props.row, props.index)
}
</script>

<style scoped lang="scss">
.action-column {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
}
</style>
