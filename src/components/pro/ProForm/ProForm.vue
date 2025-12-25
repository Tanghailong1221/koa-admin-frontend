<template>
  <el-form
    ref="formRef"
    :model="formData"
    :rules="mergedRules"
    :label-width="formConfig.labelWidth"
    :label-position="formConfig.labelPosition"
    :label-suffix="formConfig.labelSuffix"
    :require-asterisk-position="formConfig.requireAsteriskPosition"
    :show-message="formConfig.showMessage"
    :inline-message="formConfig.inlineMessage"
    :status-icon="formConfig.statusIcon"
    :disabled="formConfig.disabled || readonly"
    :class="['pro-form', `pro-form--${formConfig.layout}`]"
  >
    <el-row :gutter="formConfig.gutter">
      <template v-for="field in visibleFields" :key="field.name">
        <el-col :span="field.span || 24">
          <el-form-item
            :prop="field.name"
            :label="field.label"
            :required="field.required"
          >
            <!-- 标签提示 -->
            <template v-if="field.tooltip" #label>
              {{ field.label }}
              <el-tooltip :content="field.tooltip" placement="top">
                <el-icon class="field-tooltip-icon">
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </template>

            <!-- 自定义插槽 -->
            <template v-if="field.slotName">
              <slot
                :name="field.slotName"
                :field="field"
                :value="formData[field.name]"
                :form-data="formData"
              />
            </template>

            <!-- 自定义渲染 -->
            <template v-else-if="field.render">
              <component
                :is="field.render(formData[field.name], formData)"
              />
            </template>

            <!-- Input 输入框 -->
            <template v-else-if="field.type === FormFieldType.INPUT">
              <el-input
                v-model="formData[field.name]"
                :placeholder="field.placeholder || `请输入${field.label}`"
                :disabled="field.disabled"
                :readonly="field.readonly"
                v-bind="field.fieldProps"
                @change="handleFieldChange(field.name, $event)"
              />
            </template>

            <!-- Textarea 文本域 -->
            <template v-else-if="field.type === FormFieldType.TEXTAREA">
              <el-input
                v-model="formData[field.name]"
                type="textarea"
                :placeholder="field.placeholder || `请输入${field.label}`"
                :disabled="field.disabled"
                :readonly="field.readonly"
                :rows="field.fieldProps?.rows || 4"
                v-bind="field.fieldProps"
                @change="handleFieldChange(field.name, $event)"
              />
            </template>

            <!-- Number 数字输入框 -->
            <template v-else-if="field.type === FormFieldType.NUMBER">
              <el-input-number
                v-model="formData[field.name]"
                :placeholder="field.placeholder"
                :disabled="field.disabled"
                v-bind="field.fieldProps"
                @change="handleFieldChange(field.name, $event)"
              />
            </template>

            <!-- Select 下拉选择 -->
            <template v-else-if="field.type === FormFieldType.SELECT">
              <el-select
                v-model="formData[field.name]"
                :placeholder="field.placeholder || `请选择${field.label}`"
                :disabled="field.disabled"
                v-bind="field.fieldProps"
                @change="handleFieldChange(field.name, $event)"
              >
                <el-option
                  v-for="opt in (field.fieldProps?.options || [])"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                  :disabled="opt.disabled"
                />
              </el-select>
            </template>

            <!-- Radio 单选框 -->
            <template v-else-if="field.type === FormFieldType.RADIO">
              <el-radio-group
                v-model="formData[field.name]"
                :disabled="field.disabled"
                v-bind="field.fieldProps"
                @change="handleFieldChange(field.name, $event)"
              >
                <el-radio
                  v-for="opt in (field.fieldProps?.options || [])"
                  :key="opt.value"
                  :value="opt.value"
                  :disabled="opt.disabled"
                >
                  {{ opt.label }}
                </el-radio>
              </el-radio-group>
            </template>

            <!-- Checkbox 多选框 -->
            <template v-else-if="field.type === FormFieldType.CHECKBOX">
              <el-checkbox-group
                v-model="formData[field.name]"
                :disabled="field.disabled"
                v-bind="field.fieldProps"
                @change="handleFieldChange(field.name, $event)"
              >
                <el-checkbox
                  v-for="opt in (field.fieldProps?.options || [])"
                  :key="opt.value"
                  :value="opt.value"
                  :disabled="opt.disabled"
                >
                  {{ opt.label }}
                </el-checkbox>
              </el-checkbox-group>
            </template>

            <!-- Switch 开关 -->
            <template v-else-if="field.type === FormFieldType.SWITCH">
              <el-switch
                v-model="formData[field.name]"
                :disabled="field.disabled"
                :active-text="field.fieldProps?.activeText"
                :inactive-text="field.fieldProps?.inactiveText"
                :active-value="field.fieldProps?.activeValue"
                :inactive-value="field.fieldProps?.inactiveValue"
                v-bind="field.fieldProps"
                @change="handleFieldChange(field.name, $event)"
              />
            </template>

            <!-- Date 日期选择 -->
            <template v-else-if="field.type === FormFieldType.DATE">
              <el-date-picker
                v-model="formData[field.name]"
                type="date"
                :placeholder="field.placeholder || `请选择${field.label}`"
                :disabled="field.disabled"
                v-bind="field.fieldProps"
                @change="handleFieldChange(field.name, $event)"
              />
            </template>

            <!-- DateRange 日期范围 -->
            <template v-else-if="field.type === FormFieldType.DATERANGE">
              <el-date-picker
                v-model="formData[field.name]"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                :disabled="field.disabled"
                v-bind="field.fieldProps"
                @change="handleFieldChange(field.name, $event)"
              />
            </template>

            <!-- DateTime 日期时间 -->
            <template v-else-if="field.type === FormFieldType.DATETIME">
              <el-date-picker
                v-model="formData[field.name]"
                type="datetime"
                :placeholder="field.placeholder || `请选择${field.label}`"
                :disabled="field.disabled"
                v-bind="field.fieldProps"
                @change="handleFieldChange(field.name, $event)"
              />
            </template>

            <!-- DateTimeRange 日期时间范围 -->
            <template v-else-if="field.type === FormFieldType.DATETIMERANGE">
              <el-date-picker
                v-model="formData[field.name]"
                type="datetimerange"
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                :disabled="field.disabled"
                v-bind="field.fieldProps"
                @change="handleFieldChange(field.name, $event)"
              />
            </template>

            <!-- Time 时间选择 -->
            <template v-else-if="field.type === FormFieldType.TIME">
              <el-time-picker
                v-model="formData[field.name]"
                :placeholder="field.placeholder || `请选择${field.label}`"
                :disabled="field.disabled"
                v-bind="field.fieldProps"
                @change="handleFieldChange(field.name, $event)"
              />
            </template>

            <!-- TimeRange 时间范围 -->
            <template v-else-if="field.type === FormFieldType.TIMERANGE">
              <el-time-picker
                v-model="formData[field.name]"
                is-range
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                :disabled="field.disabled"
                v-bind="field.fieldProps"
                @change="handleFieldChange(field.name, $event)"
              />
            </template>

            <!-- Slider 滑块 -->
            <template v-else-if="field.type === FormFieldType.SLIDER">
              <el-slider
                v-model="formData[field.name]"
                :disabled="field.disabled"
                v-bind="field.fieldProps"
                @change="handleFieldChange(field.name, $event)"
              />
            </template>

            <!-- Rate 评分 -->
            <template v-else-if="field.type === FormFieldType.RATE">
              <el-rate
                v-model="formData[field.name]"
                :disabled="field.disabled"
                v-bind="field.fieldProps"
                @change="handleFieldChange(field.name, $event)"
              />
            </template>

            <!-- Color 颜色选择 -->
            <template v-else-if="field.type === FormFieldType.COLOR">
              <el-color-picker
                v-model="formData[field.name]"
                :disabled="field.disabled"
                v-bind="field.fieldProps"
                @change="handleFieldChange(field.name, $event)"
              />
            </template>

            <!-- 默认 Input -->
            <template v-else>
              <el-input
                v-model="formData[field.name]"
                :placeholder="field.placeholder || `请输入${field.label}`"
                :disabled="field.disabled"
                :readonly="field.readonly"
                v-bind="field.fieldProps"
                @change="handleFieldChange(field.name, $event)"
              />
            </template>

            <!-- 字段说明 -->
            <div v-if="field.extra" class="field-extra">
              {{ field.extra }}
            </div>
          </el-form-item>
        </el-col>
      </template>
    </el-row>

    <!-- 表单操作按钮 -->
    <el-form-item v-if="!readonly && (formConfig.showSubmit || formConfig.showReset || formConfig.showCancel)" class="form-actions">
      <el-button
        v-if="formConfig.showSubmit"
        type="primary"
        :loading="loadingState"
        @click="handleSubmit"
      >
        {{ formConfig.submitText }}
      </el-button>
      <el-button
        v-if="formConfig.showReset"
        @click="handleReset"
      >
        {{ formConfig.resetText }}
      </el-button>
      <el-button
        v-if="formConfig.showCancel"
        @click="handleCancel"
      >
        {{ formConfig.cancelText }}
      </el-button>
      <slot name="actions" />
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts" generic="T extends Record<string, any>">
import { ref, computed, watch, onMounted } from 'vue'
import { ElForm, ElMessage } from 'element-plus'
import { QuestionFilled } from '@element-plus/icons-vue'
import type {
  ProFormProps,
  ProFormEmits,
  ProFormInstance,
  ProFormField,
  ProFormConfig,
} from './types'
import { FormFieldType } from './types'

// Props
const props = withDefaults(defineProps<ProFormProps<T>>(), {
  fields: () => [],
  modelValue: () => ({}) as any,
  config: () => ({}),
  loading: false,
  readonly: false
})

// Emits
const emit = defineEmits<ProFormEmits<T>>()

// Refs
const formRef = ref<InstanceType<typeof ElForm>>()
const formData = ref({ ...props.modelValue }) as any
const loadingState = ref(false)

// 表单配置
const formConfig = computed<Required<ProFormConfig>>(() => ({
  layout: 'horizontal',
  labelWidth: '100px',
  labelPosition: 'right',
  labelSuffix: ':',
  requireAsteriskPosition: 'left',
  showMessage: true,
  inlineMessage: false,
  statusIcon: false,
  disabled: false,
  gutter: 20,
  showSubmit: true,
  showReset: true,
  showCancel: false,
  submitText: '提交',
  resetText: '重置',
  cancelText: '取消',
  ...props.config
}))

// 合并验证规则
const mergedRules = computed(() => {
  const rules: Record<string, any> = { ...props.rules }
  
  props.fields.forEach(field => {
    if (field.rules) {
      rules[field.name] = field.rules
    } else if (field.required) {
      rules[field.name] = [
        {
          required: true,
          message: `请输入${field.label}`,
          trigger: ['blur', 'change']
        }
      ]
    }
  })
  
  return rules
})

// 可见字段
const visibleFields = computed(() => {
  return props.fields.filter(field => {
    if (field.hidden) return false
    
    if (field.dependencies && field.dependencies.length > 0) {
      return field.dependencies.every(dep => {
        const depValue = formData.value[dep.field]
        const operator = dep.operator || 'eq'
        
        switch (operator) {
          case 'eq': return depValue === dep.value
          case 'ne': return depValue !== dep.value
          case 'gt': return depValue > dep.value
          case 'gte': return depValue >= dep.value
          case 'lt': return depValue < dep.value
          case 'lte': return depValue <= dep.value
          case 'in': return Array.isArray(dep.value) && dep.value.includes(depValue)
          case 'notIn': return Array.isArray(dep.value) && !dep.value.includes(depValue)
          default: return true
        }
      })
    }
    
    return true
  })
})

// 事件处理
const handleFieldChange = (field: string, value: any) => {
  emit('field-change', field, value)
  
  const fieldConfig = props.fields.find(f => f.name === field)
  if (fieldConfig?.onChange) {
    fieldConfig.onChange(value, formData.value)
  }
}

const handleSubmit = async () => {
  try {
    const valid = await validate()
    if (valid) {
      emit('submit', formData.value)
    }
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

const handleReset = () => {
  resetFields()
  emit('reset')
}

const handleCancel = () => {
  emit('cancel')
}

// 实例方法
const validate = async (): Promise<boolean> => {
  if (!formRef.value) return false
  
  try {
    await formRef.value.validate()
    return true
  } catch (error) {
    emit('validate-error', error)
    ElMessage.error('表单验证失败，请检查输入')
    return false
  }
}

const validateField = async (field: string | string[]): Promise<boolean> => {
  if (!formRef.value) return false
  
  try {
    await formRef.value.validateField(field)
    return true
  } catch {
    return false
  }
}

const resetFields = () => {
  formRef.value?.resetFields()
  
  props.fields.forEach(field => {
    if (field.defaultValue !== undefined) {
      formData.value[field.name] = field.defaultValue
    }
  })
}

const clearValidate = (field?: string | string[]) => {
  formRef.value?.clearValidate(field)
}

const getFormData = () => {
  return { ...formData.value }
}

const setFormData = (data: Partial<T>) => {
  Object.assign(formData.value, data)
}

const setFieldValue = (field: string, value: any) => {
  formData.value[field] = value
}

const getFieldValue = (field: string) => {
  return formData.value[field]
}

const setFieldProps = (field: string, fieldProps: Partial<ProFormField<T>>) => {
  // 动态设置字段属性的逻辑可以在这里实现
  console.log('setFieldProps', field, fieldProps)
}

const setLoading = (loading: boolean) => {
  loadingState.value = loading
}

// 暴露实例方法
defineExpose<ProFormInstance<T>>({
  validate,
  validateField,
  resetFields,
  clearValidate,
  getFormData,
  setFormData,
  setFieldValue,
  getFieldValue,
  setFieldProps,
  setLoading
})

// 监听 modelValue 变化
watch(() => props.modelValue, (val) => {
  formData.value = { ...val }
}, { deep: true })

// 监听 formData 变化
watch(formData, (val) => {
  emit('update:modelValue', val as T)
}, { deep: true })

// 监听 loading 属性
watch(() => props.loading, (val) => {
  loadingState.value = val
})

// 初始化
onMounted(() => {
  props.fields.forEach(field => {
    if (field.defaultValue !== undefined && formData.value[field.name] === undefined) {
      formData.value[field.name] = field.defaultValue
    }
  })
})
</script>

<style scoped lang="scss">
.pro-form {
  width: 100%;

  &--inline {
    :deep(.el-form-item) {
      display: inline-block;
      margin-right: 16px;
    }
  }

  .field-tooltip-icon {
    margin-left: 4px;
    color: var(--el-text-color-secondary);
    cursor: help;
  }

  .field-extra {
    margin-top: 4px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
    line-height: 1.5;
  }

  .form-actions {
    margin-top: 24px;

    :deep(.el-form-item__content) {
      justify-content: flex-start;
    }

    .el-button {
      margin-right: 12px;
    }
  }

  // 让 Select 和 DatePicker 宽度 100%
  :deep(.el-select),
  :deep(.el-date-editor),
  :deep(.el-input-number) {
    width: 100%;
  }
}
</style>
