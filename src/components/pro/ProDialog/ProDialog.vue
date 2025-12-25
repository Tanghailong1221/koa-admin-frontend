<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    :width="dialogWidth"
    :draggable="config.draggable"
    :show-close="config.showClose"
    :close-on-click-modal="config.closeOnClickModal"
    :close-on-press-escape="config.closeOnPressEscape"
    :before-close="handleBeforeClose"
    :destroy-on-close="config.destroyOnClose"
    :center="config.center"
    :align-center="config.alignCenter"
    :class="dialogClass"
    :z-index="config.zIndex"
    :lock-scroll="config.lockScroll"
    :append-to-body="config.appendToBody"
    @open="handleOpen"
    @opened="handleOpened"
    @close="handleClose"
    @closed="handleClosed"
  >
    <!-- 自定义头部 -->
    <template #header>
      <div class="pro-dialog__header">
        <div class="pro-dialog__header-left">
          <div class="pro-dialog__icon" :class="`pro-dialog__icon--${currentMode}`">
            <el-icon v-if="currentMode === 'add'"><Plus /></el-icon>
            <el-icon v-else-if="currentMode === 'edit'"><Edit /></el-icon>
            <el-icon v-else-if="currentMode === 'view'"><View /></el-icon>
            <el-icon v-else><Document /></el-icon>
          </div>
          <div class="pro-dialog__title-wrapper">
            <span class="pro-dialog__title">{{ dialogTitle }}</span>
            <span v-if="config.subtitle" class="pro-dialog__subtitle">{{ config.subtitle }}</span>
          </div>
        </div>
        <div class="pro-dialog__header-right">
          <el-button
            v-if="config.showReset && !isViewMode"
            class="reset-btn"
            type="warning"
            text
            bg
            @click="handleReset"
          >
            <el-icon><RefreshLeft /></el-icon>
            <span>重置</span>
          </el-button>
        </div>
      </div>
    </template>

    <!-- 弹窗内容 -->
    <div v-loading="loadingState" class="pro-dialog__body" :class="{ 'is-view-mode': isViewMode }">
      <template v-if="useForm && fields.length > 0">
        <el-form
          ref="formRef"
          :model="formModel"
          :rules="formRules"
          :label-width="mergedFormConfig.labelWidth"
          :label-position="mergedFormConfig.labelPosition"
          :disabled="isViewMode"
          class="pro-dialog__form"
        >
          <el-row :gutter="16">
            <template v-for="field in fields" :key="field.name">
              <el-col :span="field.span || 24">
                <el-form-item :prop="field.name" :label="field.label" :required="field.required">
                  <!-- Input -->
                  <el-input
                    v-if="field.type === 'input'"
                    v-model="formModel[field.name]"
                    :placeholder="field.placeholder || `请输入${field.label}`"
                    :disabled="field.disabled || isViewMode"
                    :clearable="true"
                  />
                  <!-- Textarea -->
                  <el-input
                    v-else-if="field.type === 'textarea'"
                    v-model="formModel[field.name]"
                    type="textarea"
                    :placeholder="field.placeholder || `请输入${field.label}`"
                    :disabled="field.disabled || isViewMode"
                    :rows="field.fieldProps?.rows || 4"
                  />
                  <!-- Number -->
                  <el-input-number
                    v-else-if="field.type === 'number'"
                    v-model="formModel[field.name]"
                    :placeholder="field.placeholder"
                    :disabled="field.disabled || isViewMode"
                    class="w-full"
                  />
                  <!-- Select -->
                  <el-select
                    v-else-if="field.type === 'select'"
                    v-model="formModel[field.name]"
                    :placeholder="field.placeholder || `请选择${field.label}`"
                    :disabled="field.disabled || isViewMode"
                    :clearable="true"
                    class="w-full"
                  >
                    <el-option
                      v-for="opt in getOptions(field)"
                      :key="opt.value"
                      :label="opt.label"
                      :value="opt.value"
                      :disabled="opt.disabled"
                    />
                  </el-select>
                  <!-- Radio -->
                  <el-radio-group
                    v-else-if="field.type === 'radio'"
                    v-model="formModel[field.name]"
                    :disabled="field.disabled || isViewMode"
                  >
                    <el-radio
                      v-for="opt in getOptions(field)"
                      :key="opt.value"
                      :value="opt.value"
                      :disabled="opt.disabled"
                    >{{ opt.label }}</el-radio>
                  </el-radio-group>
                  <!-- Checkbox -->
                  <el-checkbox-group
                    v-else-if="field.type === 'checkbox'"
                    v-model="formModel[field.name]"
                    :disabled="field.disabled || isViewMode"
                  >
                    <el-checkbox
                      v-for="opt in getOptions(field)"
                      :key="opt.value"
                      :value="opt.value"
                      :disabled="opt.disabled"
                    >{{ opt.label }}</el-checkbox>
                  </el-checkbox-group>
                  <!-- Switch -->
                  <el-switch
                    v-else-if="field.type === 'switch'"
                    v-model="formModel[field.name]"
                    :disabled="field.disabled || isViewMode"
                    :active-value="field.fieldProps?.activeValue ?? 1"
                    :inactive-value="field.fieldProps?.inactiveValue ?? 0"
                  />
                  <!-- Date -->
                  <el-date-picker
                    v-else-if="field.type === 'date'"
                    v-model="formModel[field.name]"
                    type="date"
                    :placeholder="field.placeholder || `请选择${field.label}`"
                    :disabled="field.disabled || isViewMode"
                    class="w-full"
                  />
                  <!-- DateTime -->
                  <el-date-picker
                    v-else-if="field.type === 'datetime'"
                    v-model="formModel[field.name]"
                    type="datetime"
                    :placeholder="field.placeholder || `请选择${field.label}`"
                    :disabled="field.disabled || isViewMode"
                    class="w-full"
                  />
                  <!-- Default Input -->
                  <el-input
                    v-else
                    v-model="formModel[field.name]"
                    :placeholder="field.placeholder || `请输入${field.label}`"
                    :disabled="field.disabled || isViewMode"
                    :clearable="true"
                  />
                </el-form-item>
              </el-col>
            </template>
          </el-row>
        </el-form>
      </template>
      <template v-else>
        <slot :mode="currentMode" :data="formModel" :loading="loadingState" />
      </template>
    </div>

    <!-- 底部按钮 -->
    <template v-if="config.showFooter" #footer>
      <div class="pro-dialog__footer">
        <slot name="footer" :mode="currentMode" :data="formModel" :loading="confirmLoadingState">
          <template v-if="isViewMode">
            <el-button type="primary" @click="handleCancel">
              <el-icon><Close /></el-icon>关闭
            </el-button>
          </template>
          <template v-else>
            <el-button @click="handleCancel">
              <el-icon><Close /></el-icon>{{ config.cancelText }}
            </el-button>
            <el-button v-if="config.showConfirm" type="primary" :loading="confirmLoadingState" @click="handleConfirm">
              <el-icon v-if="!confirmLoadingState"><Check /></el-icon>{{ config.confirmText }}
            </el-button>
          </template>
        </slot>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts" generic="T extends Record<string, any>">
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { Plus, Edit, View, Document, RefreshLeft, Close, Check } from '@element-plus/icons-vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import type { ProFormConfig, ProFormField } from '../ProForm/types'
import type {
  ProDialogProps,
  ProDialogEmits,
  ProDialogInstance,
  ProDialogConfig,
  DialogModeValue,
  DialogTitleConfig,
} from './types'
import { DialogMode, DialogSize, DialogSizeMap } from './types'

const props = withDefaults(defineProps<ProDialogProps<T>>(), {
  modelValue: false,
  mode: DialogMode.ADD,
  title: () => ({ add: '新增', edit: '编辑', view: '查看' }),
  fields: () => [],
  formData: () => ({}) as T,
  formConfig: () => ({}),
  dialogConfig: () => ({}),
  loading: false,
  useForm: true,
})

const emit = defineEmits<ProDialogEmits<T>>()

const formRef = ref<FormInstance>()
const dialogVisible = ref(false)
const currentMode = ref<DialogModeValue>(props.mode)
const loadingState = ref(false)
const confirmLoadingState = ref(false)

// 使用 reactive 创建表单模型 - 关键修改
const formModel = reactive<Record<string, any>>({})
// 保存初始数据用于重置
let savedInitialData: Record<string, any> = {}

// 获取选项
const getOptions = (field: ProFormField) => {
  return field.fieldProps?.options || []
}

const config = computed<Required<ProDialogConfig>>(() => ({
  width: undefined as any,
  size: DialogSize.DEFAULT,
  draggable: true,
  showClose: true,
  closeOnClickModal: false,
  closeOnPressEscape: true,
  showFullscreen: false,
  showFooter: true,
  confirmText: '确定',
  cancelText: '取消',
  showConfirm: true,
  showCancel: true,
  confirmLoading: false,
  beforeClose: undefined as any,
  destroyOnClose: true,
  center: false,
  alignCenter: true,
  customClass: '',
  zIndex: undefined as any,
  lockScroll: true,
  appendToBody: true,
  showReset: true,
  subtitle: '',
  ...props.dialogConfig,
}))

const formRules = computed<FormRules>(() => {
  const rules: FormRules = {}
  props.fields.forEach(field => {
    if (field.rules) {
      rules[field.name] = field.rules
    } else if (field.required) {
      rules[field.name] = [{ required: true, message: `请输入${field.label}`, trigger: ['blur', 'change'] }]
    }
  })
  return rules
})

const mergedFormConfig = computed<ProFormConfig>(() => ({
  labelWidth: '100px',
  labelPosition: 'right',
  ...props.formConfig,
}))

const dialogWidth = computed(() => {
  if (config.value.width) return config.value.width
  return DialogSizeMap[config.value.size] || DialogSizeMap[DialogSize.DEFAULT]
})

const dialogTitle = computed(() => {
  if (typeof props.title === 'string') return props.title
  const titleConfig = props.title as DialogTitleConfig
  switch (currentMode.value) {
    case DialogMode.ADD: return titleConfig.add || '新增'
    case DialogMode.EDIT: return titleConfig.edit || '编辑'
    case DialogMode.VIEW: return titleConfig.view || '查看'
    case DialogMode.CUSTOM: return titleConfig.custom || ''
    default: return ''
  }
})

const dialogClass = computed(() => {
  const classes = ['pro-dialog', `pro-dialog--${currentMode.value}`]
  if (config.value.customClass) classes.push(config.value.customClass)
  return classes.join(' ')
})

const isViewMode = computed(() => currentMode.value === DialogMode.VIEW)

// 初始化表单数据
const initFormModel = (data?: T) => {
  // 清空现有数据
  Object.keys(formModel).forEach(key => {
    delete formModel[key]
  })
  
  // 设置默认值
  props.fields.forEach(field => {
    if (field.defaultValue !== undefined) {
      formModel[field.name] = field.defaultValue
    } else if (field.type === 'checkbox') {
      formModel[field.name] = []
    } else {
      formModel[field.name] = undefined
    }
  })
  
  // 覆盖传入的数据
  if (data) {
    Object.keys(data).forEach(key => {
      formModel[key] = data[key]
    })
  }
  
  // 保存初始数据
  savedInitialData = JSON.parse(JSON.stringify(formModel))
}

const handleOpen = () => emit('open')
const handleOpened = () => emit('opened')
const handleClose = () => emit('close')
const handleClosed = () => {
  emit('closed')
  if (config.value.destroyOnClose) {
    Object.keys(formModel).forEach(key => {
      delete formModel[key]
    })
    savedInitialData = {}
  }
}

const handleBeforeClose = (done: () => void) => {
  if (config.value.beforeClose) config.value.beforeClose(done)
  else done()
}

const handleCancel = () => {
  emit('cancel')
  dialogVisible.value = false
}

const handleConfirm = async () => {
  if (props.useForm && formRef.value) {
    try {
      await formRef.value.validate()
      emit('confirm', { ...formModel } as T)
    } catch (error) {
      emit('validate-error', error)
    }
  } else {
    emit('confirm', { ...formModel } as T)
  }
}

const handleReset = () => {
  // 清空现有数据
  Object.keys(formModel).forEach(key => {
    delete formModel[key]
  })
  
  if (currentMode.value === DialogMode.ADD) {
    // 新增模式：重置为默认值
    props.fields.forEach(field => {
      if (field.defaultValue !== undefined) {
        formModel[field.name] = field.defaultValue
      } else if (field.type === 'checkbox') {
        formModel[field.name] = []
      } else {
        formModel[field.name] = undefined
      }
    })
  } else {
    // 编辑模式：重置为初始数据
    Object.keys(savedInitialData).forEach(key => {
      formModel[key] = savedInitialData[key]
    })
  }
  
  nextTick(() => {
    formRef.value?.clearValidate()
    ElMessage.success('表单已重置')
  })
}

const open = (mode?: DialogModeValue, data?: T) => {
  if (mode) currentMode.value = mode
  initFormModel(data)
  dialogVisible.value = true
  nextTick(() => formRef.value?.clearValidate())
}

const close = () => { dialogVisible.value = false }
const getFormData = () => ({ ...formModel } as T)
const setFormData = (data: Partial<T>) => {
  Object.keys(data).forEach(key => {
    formModel[key] = (data as any)[key]
  })
}
const validate = async (): Promise<boolean> => {
  if (formRef.value) {
    try { await formRef.value.validate(); return true } catch { return false }
  }
  return true
}
const resetForm = () => {
  formRef.value?.resetFields()
  Object.keys(formModel).forEach(key => {
    delete formModel[key]
  })
}
const setLoading = (loading: boolean) => { loadingState.value = loading }
const setConfirmLoading = (loading: boolean) => { confirmLoadingState.value = loading }

defineExpose<ProDialogInstance<T>>({
  open, close, getFormData, setFormData, validate, resetForm, setLoading, setConfirmLoading,
})

watch(() => props.modelValue, (val) => {
  if (val && !dialogVisible.value) {
    initFormModel(props.formData)
  }
  dialogVisible.value = val
}, { immediate: true })

watch(dialogVisible, (val) => {
  if (val !== props.modelValue) emit('update:modelValue', val)
})

watch(() => props.mode, (val) => { currentMode.value = val })
watch(() => props.loading, (val) => { loadingState.value = val })
watch(() => props.dialogConfig?.confirmLoading, (val) => { confirmLoadingState.value = val || false })
</script>

<style lang="scss">
.pro-dialog {
  border-radius: 16px !important;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15), 0 8px 20px rgba(0, 0, 0, 0.1) !important;

  .el-dialog__header {
    padding: 20px 24px 16px;
    margin-right: 0;
    border-bottom: 1px solid var(--el-border-color-lighter);
    background: linear-gradient(180deg, var(--el-bg-color) 0%, var(--el-fill-color-lighter) 100%);
  }

  .el-dialog__body { padding: 24px; }

  .el-dialog__footer {
    padding: 16px 24px 20px;
    border-top: 1px solid var(--el-border-color-lighter);
    background: var(--el-fill-color-lighter);
  }

  .el-dialog__headerbtn {
    top: 18px;
    right: 18px;
    width: 34px;
    height: 34px;
    border-radius: 8px;
    transition: all 0.25s ease;

    &:hover {
      background: var(--el-color-danger-light-9);
      .el-dialog__close { color: var(--el-color-danger); }
    }
  }
}

.pro-dialog--add .el-dialog__header {
  background: linear-gradient(180deg, #f0fdf4 0%, var(--el-fill-color-lighter) 100%);
}

.pro-dialog--edit .el-dialog__header {
  background: linear-gradient(180deg, #eff6ff 0%, var(--el-fill-color-lighter) 100%);
}

.pro-dialog--view .el-dialog__header {
  background: linear-gradient(180deg, #fffbeb 0%, var(--el-fill-color-lighter) 100%);
}

.dark {
  .pro-dialog .el-dialog__header,
  .pro-dialog--add .el-dialog__header,
  .pro-dialog--edit .el-dialog__header,
  .pro-dialog--view .el-dialog__header {
    background: linear-gradient(180deg, var(--el-bg-color) 0%, var(--el-bg-color-overlay) 100%);
  }
  .pro-dialog .el-dialog__footer { background: var(--el-bg-color-overlay); }
}
</style>

<style scoped lang="scss">
.w-full { width: 100%; }

.pro-dialog__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding-right: 36px;
}

.pro-dialog__header-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.pro-dialog__icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);

  &--add {
    background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
    color: #16a34a;
  }

  &--edit {
    background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
    color: #2563eb;
  }

  &--view {
    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
    color: #d97706;
  }

  &--custom {
    background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%);
    color: #9333ea;
  }
}

.pro-dialog__title-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.pro-dialog__title {
  font-size: 17px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.pro-dialog__subtitle {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.pro-dialog__header-right {
  .reset-btn {
    height: 32px;
    padding: 0 14px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;

    .el-icon { margin-right: 4px; }
  }
}

.pro-dialog__body {
  min-height: 100px;
  max-height: 65vh;
  overflow-y: auto;

  &.is-view-mode {
    background: var(--el-fill-color-lighter);
    border-radius: 12px;
    padding: 20px;
    margin: -4px;
  }
}

.pro-dialog__form {
  :deep(.el-form-item) { margin-bottom: 20px; }
  :deep(.el-form-item__label) { font-weight: 500; }
  :deep(.el-input__wrapper),
  :deep(.el-select__wrapper),
  :deep(.el-textarea__inner) { border-radius: 8px; }
}

.pro-dialog__footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;

  .el-button {
    min-width: 90px;
    height: 38px;
    border-radius: 8px;
    font-weight: 500;
    .el-icon { margin-right: 6px; }
  }
}

.dark .pro-dialog__icon {
  &--add { background: linear-gradient(135deg, rgba(22, 163, 74, 0.25) 0%, rgba(22, 163, 74, 0.15) 100%); }
  &--edit { background: linear-gradient(135deg, rgba(37, 99, 235, 0.25) 0%, rgba(37, 99, 235, 0.15) 100%); }
  &--view { background: linear-gradient(135deg, rgba(217, 119, 6, 0.25) 0%, rgba(217, 119, 6, 0.15) 100%); }
  &--custom { background: linear-gradient(135deg, rgba(147, 51, 234, 0.25) 0%, rgba(147, 51, 234, 0.15) 100%); }
}
</style>
