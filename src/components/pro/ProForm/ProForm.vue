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

            <!-- 内置字段类型 -->
            <template v-else>
              <component
                :is="getFieldComponent(field.type)"
                v-model="formData[field.name]"
                v-bind="getFieldProps(field)"
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
    <el-form-item v-if="!readonly" class="form-actions">
      <el-button
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
  FormFieldTypeValue
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
const fieldPropsMap = ref<Map<string, Partial<ProFormField<T>>>>(new Map())

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

// 可见字段（根据依赖条件过滤）
const visibleFields = computed(() => {
  return props.fields.filter(field => {
    // 隐藏字段
    if (field.hidden) return false
    
    // 检查依赖条件
    if (field.dependencies && field.dependencies.length > 0) {
      return field.dependencies.every(dep => {
        const depValue = formData.value[dep.field]
        const operator = dep.operator || 'eq'
        
        switch (operator) {
          case 'eq':
            return depValue === dep.value
          case 'ne':
            return depValue !== dep.value
          case 'gt':
            return depValue > dep.value
          case 'gte':
            return depValue >= dep.value
          case 'lt':
            return depValue < dep.value
          case 'lte':
            return depValue <= dep.value
          case 'in':
            return Array.isArray(dep.value) && dep.value.includes(depValue)
          case 'notIn':
            return Array.isArray(dep.value) && !dep.value.includes(depValue)
          default:
            return true
        }
      })
    }
    
    return true
  })
})

// 获取字段组件
const getFieldComponent = (type: FormFieldTypeValue) => {
  const componentMap: Record<FormFieldTypeValue, string> = {
    [FormFieldType.INPUT]: 'el-input',
    [FormFieldType.TEXTAREA]: 'el-input',
    [FormFieldType.NUMBER]: 'el-input-number',
    [FormFieldType.SELECT]: 'el-select',
    [FormFieldType.RADIO]: 'el-radio-group',
    [FormFieldType.CHECKBOX]: 'el-checkbox-group',
    [FormFieldType.DATE]: 'el-date-picker',
    [FormFieldType.DATERANGE]: 'el-date-picker',
    [FormFieldType.TIME]: 'el-time-picker',
    [FormFieldType.TIMERANGE]: 'el-time-picker',
    [FormFieldType.DATETIME]: 'el-date-picker',
    [FormFieldType.DATETIMERANGE]: 'el-date-picker',
    [FormFieldType.SWITCH]: 'el-switch',
    [FormFieldType.SLIDER]: 'el-slider',
    [FormFieldType.RATE]: 'el-rate',
    [FormFieldType.COLOR]: 'el-color-picker',
    [FormFieldType.UPLOAD]: 'el-upload',
    [FormFieldType.CUSTOM]: 'div'
  }
  
  return componentMap[type] || 'el-input'
}

// 获取字段属性
const getFieldProps = (field: ProFormField<T>) => {
  const baseProps: Record<string, any> = {
    placeholder: field.placeholder || `请输入${field.label}`,
    disabled: field.disabled,
    readonly: field.readonly,
    ...field.fieldProps
  }
  
  // 合并动态设置的属性
  const dynamicProps = fieldPropsMap.value.get(field.name)
  if (dynamicProps) {
    Object.assign(baseProps, dynamicProps)
  }
  
  // 根据类型添加特定属性
  switch (field.type) {
    case FormFieldType.TEXTAREA:
      baseProps.type = 'textarea'
      baseProps.rows = baseProps.rows || 4
      break
    case FormFieldType.DATERANGE:
      baseProps.type = 'daterange'
      baseProps.rangeSeparator = '至'
      baseProps.startPlaceholder = '开始日期'
      baseProps.endPlaceholder = '结束日期'
      break
    case FormFieldType.TIMERANGE:
      baseProps.isRange = true
      baseProps.rangeSeparator = '至'
      baseProps.startPlaceholder = '开始时间'
      baseProps.endPlaceholder = '结束时间'
      break
    case FormFieldType.DATETIME:
      baseProps.type = 'datetime'
      break
    case FormFieldType.DATETIMERANGE:
      baseProps.type = 'datetimerange'
      baseProps.rangeSeparator = '至'
      baseProps.startPlaceholder = '开始时间'
      baseProps.endPlaceholder = '结束时间'
      break
  }
  
  return baseProps
}

// 事件处理
const handleFieldChange = (field: string, value: any) => {
  emit('field-change', field, value)
  
  // 触发字段的 onChange 回调
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
  } catch (error) {
    return false
  }
}

const resetFields = () => {
  formRef.value?.resetFields()
  
  // 重置为默认值
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

const setFieldProps = (field: string, props: Partial<ProFormField<T>>) => {
  fieldPropsMap.value.set(field, props)
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
  // 设置默认值
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
}
</style>
