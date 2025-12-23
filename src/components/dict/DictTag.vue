<template>
  <el-tag v-if="!loading" :type="tagType" :size="size" :effect="effect">
    {{ label }}
  </el-tag>
  <el-skeleton v-else animated style="width: 60px">
    <template #template>
      <el-skeleton-item variant="text" style="width: 100%" />
    </template>
  </el-skeleton>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDict } from '@/composables/useDict'

/**
 * 字典标签组件
 */
interface Props {
  /**
   * 字典类型
   */
  type: string

  /**
   * 字典值
   */
  value: string | number

  /**
   * 标签大小
   */
  size?: 'large' | 'default' | 'small'

  /**
   * 标签效果
   */
  effect?: 'dark' | 'light' | 'plain'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'default',
  effect: 'light'
})

// 使用字典
const { dict, loading, getLabel, getTagType } = useDict(props.type)

// 标签文本
const label = computed(() => getLabel(props.value))

// 标签类型
const tagType = computed(() => getTagType(props.value) as any)
</script>
