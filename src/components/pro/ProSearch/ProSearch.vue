<template>
  <div
    class="pro-search"
    :class="{
      'pro-search--inline': mergedConfig.inline,
      'pro-search--shadow': mergedConfig.shadow,
    }"
  >
    <!-- 快捷搜索和搜索历史 -->
    <div v-if="showQuickBar" class="pro-search__quick-bar">
      <!-- 快捷搜索 -->
      <div v-if="quickSearchItems.length > 0" class="quick-search">
        <span class="quick-search__label">快捷搜索：</span>
        <el-tag
          v-for="item in quickSearchItems"
          :key="item.key"
          :type="item.type === 'default' ? undefined : item.type"
          class="quick-search__tag"
          effect="plain"
          @click="handleQuickSearch(item)"
        >
          <el-icon v-if="item.icon" class="quick-search__icon">
            <component :is="item.icon" />
          </el-icon>
          {{ item.label }}
        </el-tag>
      </div>

      <!-- 搜索历史 -->
      <div v-if="historyEnabled && searchHistory.length > 0" class="search-history">
        <el-dropdown trigger="click" @command="handleHistorySelect">
          <span class="search-history__trigger">
            <el-icon><Clock /></el-icon>
            搜索历史
            <el-icon class="el-icon--right"><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item
                v-for="(item, index) in searchHistory"
                :key="index"
                :command="index"
              >
                <span class="history-item">
                  {{ formatHistoryItem(item) }}
                </span>
              </el-dropdown-item>
              <el-dropdown-item v-if="historyConfig.showClear !== false" divided command="clear">
                <el-icon><Delete /></el-icon>
                清空历史
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <el-form
      ref="formRef"
      :model="formValues"
      :rules="formRules"
      :label-width="mergedConfig.labelWidth"
      :label-position="mergedConfig.labelPosition"
      :inline="mergedConfig.inline"
      @submit.prevent="handleSearch"
    >
      <el-row :gutter="mergedConfig.gutter">
        <template v-for="field in displayFields" :key="field.field">
          <el-col :span="getFieldSpan(field)">
            <el-form-item :label="field.label" :prop="field.field">
              <!-- 自定义插槽 -->
              <slot
                v-if="field.slotName"
                :name="field.slotName"
                :field="field"
                :value="formValues[field.field]"
                :set-value="(val: any) => setFieldValue(field.field, val)"
              />

              <!-- 输入框 -->
              <el-input
                v-else-if="field.type === 'input' || !field.type"
                v-model="formValues[field.field]"
                :placeholder="field.placeholder || `请输入${field.label}`"
                :clearable="field.clearable !== false"
                :disabled="field.disabled"
                :style="{ width: getFieldWidth(field) }"
                v-bind="field.componentProps"
              />

              <!-- 数字输入框 -->
              <el-input-number
                v-else-if="field.type === 'number'"
                v-model="formValues[field.field]"
                :placeholder="field.placeholder || `请输入${field.label}`"
                :disabled="field.disabled"
                :style="{ width: getFieldWidth(field) }"
                controls-position="right"
                v-bind="field.componentProps"
              />

              <!-- 下拉选择 -->
              <el-select
                v-else-if="field.type === 'select'"
                v-model="formValues[field.field]"
                :placeholder="field.placeholder || `请选择${field.label}`"
                :clearable="field.clearable !== false"
                :disabled="field.disabled"
                :loading="fieldLoadingMap[field.field]"
                :style="{ width: getFieldWidth(field) }"
                :multiple="field.multiple"
                :filterable="!!field.remoteSearch"
                :remote="!!field.remoteSearch"
                :remote-method="field.remoteSearch ? (query: string) => handleRemoteSearch(field, query) : undefined"
                v-bind="field.componentProps"
                @change="(val: any) => handleFieldChange(field, val)"
              >
                <el-option
                  v-for="opt in getFieldOptions(field)"
                  :key="String(opt.value)"
                  :label="opt.label"
                  :value="opt.value"
                  :disabled="opt.disabled"
                />
              </el-select>

              <!-- 日期选择 -->
              <el-date-picker
                v-else-if="field.type === 'date'"
                v-model="formValues[field.field]"
                type="date"
                :placeholder="field.placeholder || `请选择${field.label}`"
                :clearable="field.clearable !== false"
                :disabled="field.disabled"
                :format="field.format || 'YYYY-MM-DD'"
                :value-format="field.valueFormat || 'YYYY-MM-DD'"
                :style="{ width: getFieldWidth(field) }"
                v-bind="field.componentProps"
              />

              <!-- 日期范围选择 -->
              <el-date-picker
                v-else-if="field.type === 'dateRange'"
                v-model="formValues[field.field]"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                :clearable="field.clearable !== false"
                :disabled="field.disabled"
                :format="field.format || 'YYYY-MM-DD'"
                :value-format="field.valueFormat || 'YYYY-MM-DD'"
                :style="{ width: getFieldWidth(field) }"
                v-bind="field.componentProps"
              />

              <!-- 级联选择 -->
              <el-cascader
                v-else-if="field.type === 'cascader'"
                v-model="formValues[field.field]"
                :options="getFieldOptions(field) as any"
                :placeholder="field.placeholder || `请选择${field.label}`"
                :clearable="field.clearable !== false"
                :disabled="field.disabled"
                :style="{ width: getFieldWidth(field) }"
                v-bind="field.componentProps"
              />

              <!-- 树形选择 -->
              <el-tree-select
                v-else-if="field.type === 'treeSelect'"
                v-model="formValues[field.field]"
                :data="getFieldOptions(field) as any"
                :placeholder="field.placeholder || `请选择${field.label}`"
                :clearable="field.clearable !== false"
                :disabled="field.disabled"
                :style="{ width: getFieldWidth(field) }"
                v-bind="field.componentProps"
              />

              <!-- 自定义组件 -->
              <component
                v-else-if="field.type === 'custom' && field.component"
                :is="field.component"
                v-model="formValues[field.field]"
                v-bind="field.componentProps"
              />
            </el-form-item>
          </el-col>
        </template>

        <!-- 操作按钮 -->
        <el-col :span="actionSpan" class="pro-search__actions">
          <el-form-item label=" ">
            <el-button
              v-if="mergedConfig.showSearch"
              type="primary"
              :icon="Search"
              @click="handleSearch"
            >
              {{ mergedConfig.searchText }}
            </el-button>
            <el-button
              v-if="mergedConfig.showReset"
              :icon="Refresh"
              @click="handleReset"
            >
              {{ mergedConfig.resetText }}
            </el-button>
            <el-button
              v-if="mergedConfig.showExpand && canExpand"
              link
              type="primary"
              @click="toggleExpand"
            >
              {{ isExpanded ? '收起' : '展开' }}
              <el-icon>
                <ArrowUp v-if="isExpanded" />
                <ArrowDown v-else />
              </el-icon>
            </el-button>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch, onMounted } from 'vue'
import { Search, Refresh, ArrowUp, ArrowDown, Clock, Delete } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import type {
  ProSearchProps,
  ProSearchInstance,
  ProSearchOptions,
  SearchField,
  SearchFieldOption,
  QuickSearchItem,
  SearchHistoryConfig,
} from './types'

// Props
const props = withDefaults(defineProps<ProSearchProps>(), {
  fields: () => [],
  showSearch: true,
  showReset: true,
  showExpand: true,
  defaultExpandCount: 3,
  searchText: '搜索',
  resetText: '重置',
  labelWidth: '80px',
  labelPosition: 'right',
  gutter: 16,
  columns: 4,
  inline: false,
  shadow: true,
})

// Emits
const emit = defineEmits<{
  (e: 'search', values: Record<string, any>): void
  (e: 'reset'): void
  (e: 'change', values: Record<string, any>): void
  (e: 'field-change', field: string, value: any, formValues: Record<string, any>): void
}>()

// Refs
const formRef = ref<FormInstance>()
const formValues = ref<Record<string, any>>({})
const isExpanded = ref(false)

// 异步选项缓存
const asyncOptionsMap = reactive<Record<string, SearchFieldOption[]>>({})
// 字段加载状态
const fieldLoadingMap = reactive<Record<string, boolean>>({})
// 远程搜索选项缓存
const remoteOptionsMap = reactive<Record<string, SearchFieldOption[]>>({})
// 远程搜索防抖定时器
const remoteSearchTimers = reactive<Record<string, ReturnType<typeof setTimeout> | null>>({})

// ==================== 合并配置 ====================
const mergedConfig = computed<ProSearchOptions>(() => {
  const opts = (props.options || {}) as ProSearchOptions
  return {
    fields: opts.fields ?? props.fields ?? [],
    defaultValues: opts.defaultValues ?? props.defaultValues ?? {},
    showSearch: opts.showSearch ?? props.showSearch ?? true,
    showReset: opts.showReset ?? props.showReset ?? true,
    showExpand: opts.showExpand ?? props.showExpand ?? true,
    defaultExpandCount: opts.defaultExpandCount ?? props.defaultExpandCount ?? 3,
    searchText: opts.searchText ?? props.searchText ?? '搜索',
    resetText: opts.resetText ?? props.resetText ?? '重置',
    labelWidth: opts.labelWidth ?? props.labelWidth ?? '80px',
    labelPosition: opts.labelPosition ?? props.labelPosition ?? 'right',
    gutter: opts.gutter ?? props.gutter ?? 16,
    columns: opts.columns ?? props.columns ?? 4,
    inline: opts.inline ?? props.inline ?? false,
    shadow: opts.shadow ?? props.shadow ?? true,
    onSearch: opts.onSearch,
    onReset: opts.onReset,
    quickSearch: opts.quickSearch ?? [],
    history: opts.history ?? { enabled: false },
  }
})

// 快捷搜索项
const quickSearchItems = computed<QuickSearchItem[]>(() => {
  return mergedConfig.value.quickSearch || []
})

// 搜索历史配置
const historyConfig = computed<SearchHistoryConfig>(() => {
  const config = mergedConfig.value.history || {}
  return {
    enabled: config.enabled ?? false,
    maxCount: config.maxCount ?? 10,
    storageKey: config.storageKey ?? 'pro-search-history',
    showClear: config.showClear ?? true,
  }
})

// 是否启用搜索历史
const historyEnabled = computed(() => historyConfig.value.enabled)

// 搜索历史
const searchHistory = ref<Record<string, any>[]>([])

// 是否显示快捷栏
const showQuickBar = computed(() => {
  return quickSearchItems.value.length > 0 || (historyEnabled.value && searchHistory.value.length > 0)
})

// 表单验证规则
const formRules = computed<FormRules>(() => {
  const rules: FormRules = {}
  mergedConfig.value.fields.forEach((field) => {
    if (field.required) {
      rules[field.field] = [
        {
          required: true,
          message: field.requiredMessage || `请输入${field.label}`,
          trigger: field.type === 'select' ? 'change' : 'blur',
        },
      ]
    }
  })
  return rules
})

// 可见字段
const visibleFields = computed(() => {
  return mergedConfig.value.fields.filter((f) => !f.hidden)
})

// 是否可以展开
const canExpand = computed(() => {
  return visibleFields.value.length > mergedConfig.value.defaultExpandCount!
})

// 显示的字段
const displayFields = computed(() => {
  if (!mergedConfig.value.showExpand || isExpanded.value || !canExpand.value) {
    return visibleFields.value
  }
  return visibleFields.value.slice(0, mergedConfig.value.defaultExpandCount)
})

// 操作按钮占用的列数
const actionSpan = computed(() => {
  const columns = mergedConfig.value.columns || 4
  const usedSpan = displayFields.value.reduce((sum, f) => sum + (f.span || 24 / columns), 0)
  const remainSpan = 24 - (usedSpan % 24)
  return remainSpan === 24 ? 24 / columns : remainSpan
})

// 获取字段宽度
const getFieldWidth = (field: SearchField): string => {
  if (field.width) {
    return typeof field.width === 'number' ? `${field.width}px` : field.width
  }
  return '100%'
}

// 获取字段栅格
const getFieldSpan = (field: SearchField): number => {
  if (field.span) return field.span
  const columns = mergedConfig.value.columns || 4
  return 24 / columns
}

// 获取字段选项（支持异步）
const getFieldOptions = (field: SearchField): SearchFieldOption[] => {
  // 优先使用远程搜索的选项
  const remoteOpts = remoteOptionsMap[field.field]
  if (field.remoteSearch && remoteOpts && remoteOpts.length > 0) {
    return remoteOpts
  }
  // 其次使用异步获取的选项（包括联动获取的）
  const asyncOpts = asyncOptionsMap[field.field]
  if (asyncOpts && asyncOpts.length > 0) {
    return asyncOpts
  }
  return field.options || []
}

// 远程搜索处理
const handleRemoteSearch = (field: SearchField, query: string) => {
  if (!field.remoteSearch) return

  // 清除之前的定时器
  if (remoteSearchTimers[field.field]) {
    clearTimeout(remoteSearchTimers[field.field]!)
    remoteSearchTimers[field.field] = null
  }

  // 如果查询为空，清空远程选项
  if (!query) {
    remoteOptionsMap[field.field] = []
    return
  }

  // 防抖处理
  const delay = field.remoteSearchDelay ?? 300
  remoteSearchTimers[field.field] = setTimeout(async () => {
    try {
      fieldLoadingMap[field.field] = true
      const options = await field.remoteSearch!(query)
      remoteOptionsMap[field.field] = options
    } catch (err) {
      console.error(`远程搜索 ${field.field} 失败:`, err)
      remoteOptionsMap[field.field] = []
    } finally {
      fieldLoadingMap[field.field] = false
    }
  }, delay)
}

// 处理字段值变化（用于联动）
const handleFieldChange = async (field: SearchField, value: any) => {
  emit('field-change', field.field, value, { ...formValues.value })

  // 查找依赖当前字段的其他字段
  const dependentFields = mergedConfig.value.fields.filter(
    (f) => f.dependsOn?.field === field.field
  )

  for (const depField of dependentFields) {
    // 清空依赖字段的值
    if (depField.dependsOn?.clearOnChange !== false) {
      formValues.value[depField.field] = depField.multiple ? [] : undefined
    }

    // 如果有值，加载依赖字段的选项
    if (value !== undefined && value !== null && value !== '') {
      try {
        fieldLoadingMap[depField.field] = true
        const options = await depField.dependsOn!.fetchOptions(value, { ...formValues.value })
        asyncOptionsMap[depField.field] = options
      } catch (err) {
        console.error(`加载联动字段 ${depField.field} 选项失败:`, err)
        asyncOptionsMap[depField.field] = []
      } finally {
        fieldLoadingMap[depField.field] = false
      }
    } else {
      // 清空依赖字段的选项
      asyncOptionsMap[depField.field] = []
    }
  }
}

// 加载异步选项
const loadAsyncOptions = async (field: SearchField) => {
  if (!field.fetchOptions) return

  try {
    fieldLoadingMap[field.field] = true
    const options = await field.fetchOptions()
    asyncOptionsMap[field.field] = options
  } catch (err) {
    console.error(`加载 ${field.field} 选项失败:`, err)
  } finally {
    fieldLoadingMap[field.field] = false
  }
}

// 刷新选项
const refreshOptions = async (fieldName?: string) => {
  const fields = mergedConfig.value.fields.filter((f) => f.fetchOptions)

  if (fieldName) {
    const field = fields.find((f) => f.field === fieldName)
    if (field) {
      await loadAsyncOptions(field)
    }
  } else {
    await Promise.all(fields.map((f) => loadAsyncOptions(f)))
  }
}

// 设置字段值
const setFieldValue = (field: string, value: any) => {
  formValues.value[field] = value
}

// 初始化表单值
const initFormValues = () => {
  const values: Record<string, any> = {}
  const defaultValues = mergedConfig.value.defaultValues || {}

  mergedConfig.value.fields.forEach((field) => {
    // 优先使用 defaultValues，其次使用字段的 defaultValue
    if (defaultValues[field.field] !== undefined) {
      values[field.field] = defaultValues[field.field]
    } else if (field.defaultValue !== undefined) {
      values[field.field] = field.defaultValue
    } else {
      values[field.field] = undefined
    }
  })
  formValues.value = values
}

// 切换展开状态
const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}

// 验证表单
const validate = async (): Promise<boolean> => {
  if (!formRef.value) return true
  try {
    await formRef.value.validate()
    return true
  } catch {
    return false
  }
}

// 搜索
const handleSearch = async () => {
  // 验证必填字段
  const isValid = await validate()
  if (!isValid) return

  const values = { ...formValues.value }
  // 过滤掉空值
  Object.keys(values).forEach((key) => {
    if (values[key] === undefined || values[key] === '' || values[key] === null) {
      delete values[key]
    }
  })

  // 保存到搜索历史
  if (historyEnabled.value && Object.keys(values).length > 0) {
    saveToHistory(values)
  }

  emit('search', values)
  mergedConfig.value.onSearch?.(values)
}

// 保存到搜索历史
const saveToHistory = (values: Record<string, any>) => {
  const maxCount = historyConfig.value.maxCount || 10
  const storageKey = historyConfig.value.storageKey || 'pro-search-history'

  // 检查是否已存在相同的搜索
  const existIndex = searchHistory.value.findIndex(
    (item) => JSON.stringify(item) === JSON.stringify(values)
  )

  if (existIndex > -1) {
    // 移到最前面
    searchHistory.value.splice(existIndex, 1)
  }

  // 添加到最前面
  searchHistory.value.unshift({ ...values })

  // 限制数量
  if (searchHistory.value.length > maxCount) {
    searchHistory.value = searchHistory.value.slice(0, maxCount)
  }

  // 保存到 localStorage
  try {
    localStorage.setItem(storageKey, JSON.stringify(searchHistory.value))
  } catch (e) {
    console.error('保存搜索历史失败:', e)
  }
}

// 加载搜索历史
const loadHistory = () => {
  if (!historyEnabled.value) return

  const storageKey = historyConfig.value.storageKey || 'pro-search-history'
  try {
    const saved = localStorage.getItem(storageKey)
    if (saved) {
      searchHistory.value = JSON.parse(saved)
    }
  } catch (e) {
    console.error('加载搜索历史失败:', e)
  }
}

// 清空搜索历史
const clearHistory = () => {
  searchHistory.value = []
  const storageKey = historyConfig.value.storageKey || 'pro-search-history'
  try {
    localStorage.removeItem(storageKey)
  } catch (e) {
    console.error('清空搜索历史失败:', e)
  }
}

// 获取搜索历史
const getHistory = () => {
  return [...searchHistory.value]
}

// 处理历史选择
const handleHistorySelect = (command: number | string) => {
  if (command === 'clear') {
    clearHistory()
    return
  }

  const item = searchHistory.value[command as number]
  if (item) {
    setValues(item)
    handleSearch()
  }
}

// 格式化历史项显示
const formatHistoryItem = (item: Record<string, any>): string => {
  const parts: string[] = []
  const fields = mergedConfig.value.fields

  Object.entries(item).forEach(([key, value]) => {
    const field = fields.find((f) => f.field === key)
    if (field && value !== undefined && value !== null && value !== '') {
      let displayValue = value

      // 处理选项类型的显示
      if (field.options) {
        const opt = field.options.find((o) => o.value === value)
        if (opt) displayValue = opt.label
      }

      // 处理数组类型
      if (Array.isArray(value)) {
        displayValue = value.join(' ~ ')
      }

      parts.push(`${field.label}: ${displayValue}`)
    }
  })

  return parts.join(', ') || '空搜索'
}

// 处理快捷搜索
const handleQuickSearch = (item: QuickSearchItem) => {
  setValues(item.values)
  handleSearch()
}

// 应用快捷搜索
const applyQuickSearch = (key: string) => {
  const item = quickSearchItems.value.find((q) => q.key === key)
  if (item) {
    handleQuickSearch(item)
  }
}

// 重置
const handleReset = () => {
  initFormValues()
  formRef.value?.clearValidate()
  emit('reset')
  mergedConfig.value.onReset?.()
  // 重置后自动搜索
  handleSearch()
}

// 获取搜索值
const getValues = () => {
  return { ...formValues.value }
}

// 设置搜索值
const setValues = (values: Record<string, any>) => {
  Object.assign(formValues.value, values)
}

// 重置表单
const reset = () => {
  handleReset()
}

// 触发搜索
const search = () => {
  handleSearch()
}

// 监听值变化
watch(
  formValues,
  (values) => {
    emit('change', { ...values })
  },
  { deep: true }
)

// 暴露实例方法
defineExpose<ProSearchInstance>({
  getValues,
  setValues,
  reset,
  search,
  validate,
  refreshOptions,
  getHistory,
  clearHistory,
  applyQuickSearch,
})

// 初始化
onMounted(async () => {
  initFormValues()
  // 加载搜索历史
  loadHistory()
  // 加载所有异步选项
  await refreshOptions()
})
</script>

<style scoped lang="scss">
.pro-search {
  padding: 16px 16px 0;
  background-color: var(--el-bg-color);
  border-radius: 4px;
  margin-bottom: 16px;
  transition: box-shadow 0.3s ease;

  &--shadow {
    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
  }

  :deep(.el-form-item) {
    margin-bottom: 16px;
  }

  &__actions {
    display: flex;
    justify-content: flex-end;

    :deep(.el-form-item__content) {
      justify-content: flex-end;
    }
  }

  &--inline {
    :deep(.el-form-item) {
      margin-bottom: 0;
    }
  }

  &__quick-bar {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;
    padding-bottom: 12px;
    border-bottom: 1px dashed var(--el-border-color-lighter);
    flex-wrap: wrap;
    gap: 8px;

    .quick-search {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
      flex: 1;
      min-width: 0;

      &__label {
        font-size: 13px;
        color: var(--el-text-color-secondary);
        white-space: nowrap;
      }

      &__tag {
        cursor: pointer;
        transition: all 0.2s;
        flex-shrink: 0;

        &:hover {
          transform: translateY(-1px);
        }

        // 覆盖 el-tag 内部样式，确保图标和文字在同一行
        :deep(.el-tag__content) {
          display: inline-flex;
          align-items: center;
          white-space: nowrap;
        }
      }

      &__icon {
        margin-right: 4px;
        flex-shrink: 0;
        vertical-align: middle;
      }
    }

    .search-history {
      flex-shrink: 0;

      &__trigger {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 13px;
        color: var(--el-text-color-secondary);
        cursor: pointer;
        white-space: nowrap;

        &:hover {
          color: var(--el-color-primary);
        }
      }
    }
  }
}

.history-item {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
