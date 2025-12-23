<template>
  <div class="filter-builder">
    <!-- 过滤条件列表 -->
    <div v-if="conditions.length > 0" class="filter-conditions">
      <div
        v-for="(condition, index) in conditions"
        :key="index"
        class="filter-condition"
      >
        <!-- 字段选择 -->
        <el-select
          v-model="condition.field"
          placeholder="选择字段"
          style="width: 150px"
          @change="handleFieldChange(index)"
        >
          <el-option
            v-for="field in fields"
            :key="field.field"
            :label="field.label"
            :value="field.field"
          />
        </el-select>

        <!-- 操作符选择 -->
        <el-select
          v-model="condition.operator"
          placeholder="选择操作符"
          style="width: 120px"
        >
          <el-option
            v-for="op in getOperators(condition.field)"
            :key="op.value"
            :label="op.label"
            :value="op.value"
          />
        </el-select>

        <!-- 值输入 -->
        <component
          :is="getValueComponent(condition.field)"
          v-model="condition.value"
          :placeholder="getValuePlaceholder(condition.field)"
          :options="getFieldOptions(condition.field)"
          style="flex: 1; min-width: 200px"
        />

        <!-- 删除按钮 -->
        <el-button
          type="danger"
          :icon="Delete"
          circle
          @click="handleRemove(index)"
        />
      </div>
    </div>

    <!-- 添加条件按钮 -->
    <el-button :icon="Plus" @click="handleAdd">
      添加条件
    </el-button>

    <!-- 逻辑选择 -->
    <el-radio-group v-if="conditions.length > 1" v-model="logic" style="margin-left: 10px">
      <el-radio-button :value="FilterLogic.AND">且（AND）</el-radio-button>
      <el-radio-button :value="FilterLogic.OR">或（OR）</el-radio-button>
    </el-radio-group>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Plus, Delete } from '@element-plus/icons-vue'
import { FilterOperator, FilterLogic } from './types'
import type { FilterCondition, FieldConfig } from './types'

interface Props {
  /** 字段配置 */
  fields: FieldConfig[]
  /** 过滤条件 */
  modelValue?: FilterCondition[]
  /** 逻辑关系 */
  filterLogic?: FilterLogic
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  filterLogic: FilterLogic.AND
})

const emit = defineEmits<{
  'update:modelValue': [conditions: FilterCondition[]]
  'update:filterLogic': [logic: FilterLogic]
}>()

const conditions = ref<FilterCondition[]>(props.modelValue || [])
const logic = ref<FilterLogic>(props.filterLogic)

/**
 * 操作符选项
 */
const operatorOptions = {
  string: [
    { label: '等于', value: FilterOperator.EQUAL },
    { label: '不等于', value: FilterOperator.NOT_EQUAL },
    { label: '包含', value: FilterOperator.CONTAINS },
    { label: '不包含', value: FilterOperator.NOT_CONTAINS },
    { label: '开始于', value: FilterOperator.STARTS_WITH },
    { label: '结束于', value: FilterOperator.ENDS_WITH },
    { label: '为空', value: FilterOperator.IS_NULL },
    { label: '不为空', value: FilterOperator.IS_NOT_NULL }
  ],
  number: [
    { label: '等于', value: FilterOperator.EQUAL },
    { label: '不等于', value: FilterOperator.NOT_EQUAL },
    { label: '大于', value: FilterOperator.GREATER_THAN },
    { label: '大于等于', value: FilterOperator.GREATER_THAN_OR_EQUAL },
    { label: '小于', value: FilterOperator.LESS_THAN },
    { label: '小于等于', value: FilterOperator.LESS_THAN_OR_EQUAL },
    { label: '介于', value: FilterOperator.BETWEEN },
    { label: '为空', value: FilterOperator.IS_NULL },
    { label: '不为空', value: FilterOperator.IS_NOT_NULL }
  ],
  date: [
    { label: '等于', value: FilterOperator.EQUAL },
    { label: '不等于', value: FilterOperator.NOT_EQUAL },
    { label: '大于', value: FilterOperator.GREATER_THAN },
    { label: '小于', value: FilterOperator.LESS_THAN },
    { label: '介于', value: FilterOperator.BETWEEN },
    { label: '为空', value: FilterOperator.IS_NULL },
    { label: '不为空', value: FilterOperator.IS_NOT_NULL }
  ],
  boolean: [
    { label: '等于', value: FilterOperator.EQUAL }
  ],
  select: [
    { label: '等于', value: FilterOperator.EQUAL },
    { label: '不等于', value: FilterOperator.NOT_EQUAL },
    { label: '在...之中', value: FilterOperator.IN },
    { label: '不在...之中', value: FilterOperator.NOT_IN }
  ]
}

/**
 * 获取字段配置
 */
function getFieldConfig(field: string): FieldConfig | undefined {
  return props.fields.find(f => f.field === field)
}

/**
 * 获取操作符列表
 */
function getOperators(field: string) {
  const fieldConfig = getFieldConfig(field)
  if (!fieldConfig) return []

  // 如果字段配置了自定义操作符，使用自定义的
  if (fieldConfig.operators && fieldConfig.operators.length > 0) {
    return operatorOptions[fieldConfig.type].filter(op =>
      fieldConfig.operators!.includes(op.value as FilterOperator)
    )
  }

  return operatorOptions[fieldConfig.type] || []
}

/**
 * 获取值输入组件
 */
function getValueComponent(field: string) {
  const fieldConfig = getFieldConfig(field)
  if (!fieldConfig) return 'el-input'

  switch (fieldConfig.type) {
    case 'number':
      return 'el-input-number'
    case 'date':
      return 'el-date-picker'
    case 'boolean':
      return 'el-switch'
    case 'select':
      return 'el-select'
    default:
      return 'el-input'
  }
}

/**
 * 获取值占位符
 */
function getValuePlaceholder(field: string): string {
  const fieldConfig = getFieldConfig(field)
  return fieldConfig ? `请输入${fieldConfig.label}` : '请输入值'
}

/**
 * 获取字段选项
 */
function getFieldOptions(field: string) {
  const fieldConfig = getFieldConfig(field)
  return fieldConfig?.options || []
}

/**
 * 添加条件
 */
function handleAdd() {
  const firstField = props.fields[0]
  if (!firstField) return

  conditions.value.push({
    field: firstField.field,
    operator: FilterOperator.EQUAL,
    value: '',
    label: firstField.label
  })

  emitChange()
}

/**
 * 删除条件
 */
function handleRemove(index: number) {
  conditions.value.splice(index, 1)
  emitChange()
}

/**
 * 字段变化
 */
function handleFieldChange(index: number) {
  const condition = conditions.value[index]
  if (!condition) return

  const fieldConfig = getFieldConfig(condition.field)
  if (fieldConfig) {
    condition.label = fieldConfig.label
    condition.operator = FilterOperator.EQUAL
    condition.value = ''
  }
  emitChange()
}

/**
 * 触发变化事件
 */
function emitChange() {
  emit('update:modelValue', conditions.value)
  emit('update:filterLogic', logic.value)
}

/**
 * 监听 modelValue 变化
 */
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      conditions.value = newValue
    }
  }
)

/**
 * 监听 filterLogic 变化
 */
watch(
  () => props.filterLogic,
  (newValue) => {
    logic.value = newValue
  }
)

/**
 * 监听 logic 变化
 */
watch(logic, () => {
  emitChange()
})
</script>

<style scoped lang="scss">
.filter-builder {
  .filter-conditions {
    margin-bottom: 12px;

    .filter-condition {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }
  }
}
</style>
