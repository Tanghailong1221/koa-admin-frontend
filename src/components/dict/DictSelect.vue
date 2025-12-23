<template>
  <el-select
    v-model="selectedValue"
    :placeholder="placeholder"
    :clearable="clearable"
    :disabled="disabled || loading"
    :multiple="multiple"
    :filterable="filterable"
    :size="size"
    @change="handleChange"
  >
    <el-option
      v-for="item in dict"
      :key="item.value"
      :label="item.label"
      :value="item.value"
      :disabled="item.status === 0"
    />
  </el-select>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDict } from '@/composables/useDict'

/**
 * 字典选择器组件
 */
interface Props {
  /**
   * 字典类型
   */
  type: string

  /**
   * 绑定值
   */
  modelValue?: string | number | (string | number)[]

  /**
   * 占位符
   */
  placeholder?: string

  /**
   * 是否可清空
   */
  clearable?: boolean

  /**
   * 是否禁用
   */
  disabled?: boolean

  /**
   * 是否多选
   */
  multiple?: boolean

  /**
   * 是否可搜索
   */
  filterable?: boolean

  /**
   * 尺寸
   */
  size?: 'large' | 'default' | 'small'
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '请选择',
  clearable: true,
  disabled: false,
  multiple: false,
  filterable: false,
  size: 'default'
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number | (string | number)[] | undefined]
  change: [value: string | number | (string | number)[] | undefined]
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
function handleChange(value: string | number | (string | number)[]) {
  emit('change', value)
}
</script>
