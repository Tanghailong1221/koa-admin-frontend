<template>
  <el-radio-group
    v-model="selectedValue"
    :disabled="disabled || loading"
    :size="size"
    @change="handleChange"
  >
    <component
      :is="button ? 'el-radio-button' : 'el-radio'"
      v-for="item in dict"
      :key="item.value"
      :label="item.value"
      :disabled="item.status === 0"
    >
      {{ item.label }}
    </component>
  </el-radio-group>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDict } from '@/composables/useDict'

/**
 * 字典单选框组件
 */
interface Props {
  /**
   * 字典类型
   */
  type: string

  /**
   * 绑定值
   */
  modelValue?: string | number

  /**
   * 是否禁用
   */
  disabled?: boolean

  /**
   * 是否按钮样式
   */
  button?: boolean

  /**
   * 尺寸
   */
  size?: 'large' | 'default' | 'small'
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  button: false,
  size: 'default'
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number | undefined]
  change: [value: string | number | undefined]
}>()

// 使用字典
const { dict, loading } = useDict(props.type)

// 选中的值
const selectedValue = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('update:modelValue', value)
  }
})

/**
 * 处理变化
 */
function handleChange(value: string | number) {
  emit('change', value)
}
</script>
