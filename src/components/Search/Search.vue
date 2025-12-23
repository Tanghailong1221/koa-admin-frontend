<template>
  <div class="pro-search">
    <el-input
      v-model="searchText"
      :placeholder="placeholder"
      :clearable="clearable"
      @input="handleInput"
      @clear="handleClear"
      @keyup.enter="handleSearch"
    >
      <template #prefix>
        <el-icon><Search /></el-icon>
      </template>
      <template v-if="showSearchButton" #append>
        <el-button :icon="Search" @click="handleSearch">
          搜索
        </el-button>
      </template>
    </el-input>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { useDebounceFn } from '@vueuse/core'
import type { SearchConfig } from './types'

interface Props {
  /** 搜索值 */
  modelValue?: string
  /** 搜索配置 */
  config?: SearchConfig
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  config: () => ({
    placeholder: '请输入搜索关键词',
    debounce: 300,
    clearable: true,
    showSearchButton: false,
    minLength: 0
  })
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  search: [value: string]
  clear: []
}>()

const searchText = ref(props.modelValue)

// 合并配置
const placeholder = props.config?.placeholder || '请输入搜索关键词'
const clearable = props.config?.clearable ?? true
const showSearchButton = props.config?.showSearchButton ?? false
const minLength = props.config?.minLength ?? 0
const debounceDelay = props.config?.debounce ?? 300

/**
 * 防抖搜索
 */
const debouncedSearch = useDebounceFn((value: string) => {
  if (minLength > 0 && value.length > 0 && value.length < minLength) {
    return
  }
  emit('update:modelValue', value)
  emit('search', value)
}, debounceDelay)

/**
 * 输入变化
 */
function handleInput(value: string) {
  searchText.value = value
  debouncedSearch(value)
}

/**
 * 搜索
 */
function handleSearch() {
  const value = searchText.value
  if (minLength > 0 && value.length > 0 && value.length < minLength) {
    return
  }
  emit('update:modelValue', value)
  emit('search', value)
}

/**
 * 清空
 */
function handleClear() {
  searchText.value = ''
  emit('update:modelValue', '')
  emit('clear')
}

/**
 * 监听 modelValue 变化
 */
watch(
  () => props.modelValue,
  (newValue) => {
    searchText.value = newValue || ''
  }
)
</script>

<style scoped lang="scss">
.pro-search {
  width: 100%;
}
</style>
