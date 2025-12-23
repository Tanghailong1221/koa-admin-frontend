# Composables 使用文档

本目录包含可复用的组合式函数（Composables），用于增强表单管理功能。

## useFormDraft - 表单草稿

自动保存和恢复表单草稿，避免用户意外丢失数据。

### 功能特性

- ✅ 自动保存表单草稿（防抖）
- ✅ 加载已保存的草稿
- ✅ 清除草稿
- ✅ 草稿过期时间（默认 7 天）
- ✅ 排除特定字段
- ✅ 版本控制

### 基础用法

```vue
<template>
  <div>
    <!-- 草稿提示 -->
    <el-alert
      v-if="hasDraft"
      type="info"
      :closable="false"
      style="margin-bottom: 16px"
    >
      检测到未保存的草稿，
      <el-button type="text" @click="loadDraft()">加载草稿</el-button>
      或
      <el-button type="text" @click="clearDraft()">清除草稿</el-button>
    </el-alert>

    <!-- 表单 -->
    <el-form v-model="formData">
      <!-- 表单字段 -->
    </el-form>

    <!-- 操作按钮 -->
    <div>
      <el-button type="primary" @click="handleSubmit">提交</el-button>
      <el-button @click="saveDraft(true)">保存草稿</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useFormDraft } from '@/composables'

interface FormData {
  name: string
  email: string
  description: string
}

const formData = ref<FormData>({
  name: '',
  email: '',
  description: ''
})

// 使用表单草稿
const {
  hasDraft,
  saveDraft,
  loadDraft,
  clearDraft
} = useFormDraft(formData, {
  autoSave: true,        // 启用自动保存
  autoSaveDelay: 1000,   // 1 秒后保存
  showLoadTip: true,     // 加载时提示
  showSaveTip: false     // 保存时不提示
})

const handleSubmit = () => {
  // 提交成功后清除草稿
  clearDraft(false)
}
</script>
```

### 配置选项

```typescript
interface FormDraftOptions {
  /** 草稿唯一标识（默认使用路由路径） */
  key?: string
  /** 是否启用自动保存 */
  autoSave?: boolean
  /** 自动保存延迟（毫秒） */
  autoSaveDelay?: number
  /** 草稿过期时间（毫秒，默认 7 天） */
  ttl?: number
  /** 是否在加载时提示用户 */
  showLoadTip?: boolean
  /** 是否在保存时提示用户 */
  showSaveTip?: boolean
  /** 排除的字段（不保存到草稿） */
  excludeFields?: string[]
}
```

### 返回值

```typescript
{
  // 状态
  hasDraft: Ref<boolean>           // 是否有草稿
  lastSaveTime: Ref<number | null> // 最后保存时间
  isSaving: Ref<boolean>           // 是否正在保存
  
  // 方法
  saveDraft: (showTip?: boolean) => void      // 保存草稿
  loadDraft: (showTip?: boolean) => boolean   // 加载草稿
  clearDraft: (showTip?: boolean) => void     // 清除草稿
  checkDraft: () => boolean                   // 检查是否有草稿
  getDraftInfo: () => { timestamp: number; timeAgo: string } | null  // 获取草稿信息
}
```

### 高级用法

#### 排除敏感字段

```typescript
const { saveDraft, loadDraft } = useFormDraft(formData, {
  excludeFields: ['password', 'confirmPassword']
})
```

#### 自定义草稿键

```typescript
const { saveDraft, loadDraft } = useFormDraft(formData, {
  key: 'user_profile_form'
})
```

#### 获取草稿信息

```typescript
const { getDraftInfo } = useFormDraft(formData)

const draftInfo = getDraftInfo()
if (draftInfo) {
  console.log('草稿保存于:', draftInfo.timeAgo)
}
```

## useFormGuard - 表单导航守卫

防止用户在表单有未保存更改时意外离开页面。

### 功能特性

- ✅ 检测表单是否有未保存的更改
- ✅ 路由跳转时显示确认对话框
- ✅ 浏览器刷新/关闭时显示确认提示
- ✅ 提供保存草稿选项
- ✅ 表单提交后自动解除守卫

### 基础用法

```vue
<template>
  <el-form v-model="formData">
    <!-- 表单字段 -->
  </el-form>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useFormGuard } from '@/composables'

interface FormData {
  name: string
  email: string
}

const formData = ref<FormData>({
  name: '',
  email: ''
})

// 使用表单守卫
const {
  isDirty,
  setOriginalData,
  markAsSubmitted
} = useFormGuard(formData, {
  enabled: true,
  message: '表单有未保存的更改，确定要离开吗？'
})

// 加载数据后设置原始数据
onMounted(() => {
  // 假设从 API 加载数据
  const data = { name: '张三', email: 'zhangsan@example.com' }
  formData.value = data
  setOriginalData(data)
})

// 提交表单
const handleSubmit = async () => {
  // 提交逻辑
  await submitForm(formData.value)
  
  // 标记为已提交，不再提示
  markAsSubmitted()
}
</script>
```

### 配置选项

```typescript
interface FormGuardOptions {
  /** 是否启用导航守卫 */
  enabled?: boolean
  /** 确认对话框标题 */
  title?: string
  /** 确认对话框消息 */
  message?: string
  /** 确认按钮文本 */
  confirmText?: string
  /** 取消按钮文本 */
  cancelText?: string
  /** 是否显示保存草稿按钮 */
  showSaveDraft?: boolean
  /** 保存草稿按钮文本 */
  saveDraftText?: string
  /** 保存草稿回调 */
  onSaveDraft?: () => void | Promise<void>
}
```

### 返回值

```typescript
{
  // 状态
  isDirty: Ref<boolean>        // 表单是否有更改
  isSubmitting: Ref<boolean>   // 是否正在提交
  
  // 方法
  setOriginalData: (data: T) => void  // 设置原始数据
  checkDirty: () => boolean           // 检查是否有更改
  markAsSubmitted: () => void         // 标记为已提交
  reset: () => void                   // 重置守卫状态
}
```

### 高级用法

#### 结合草稿功能

```vue
<script setup lang="ts">
import { useFormDraft, useFormGuard } from '@/composables'

const formData = ref({ name: '', email: '' })

// 草稿功能
const { saveDraft, loadDraft, clearDraft } = useFormDraft(formData)

// 导航守卫（带保存草稿选项）
const { setOriginalData, markAsSubmitted } = useFormGuard(formData, {
  showSaveDraft: true,
  onSaveDraft: async () => {
    saveDraft(true)
  }
})

onMounted(() => {
  // 加载数据
  const data = loadDataFromAPI()
  formData.value = data
  setOriginalData(data)
})

const handleSubmit = async () => {
  await submitForm(formData.value)
  markAsSubmitted()
  clearDraft(false)
}
</script>
```

#### 动态启用/禁用守卫

```typescript
const { isDirty } = useFormGuard(formData, {
  enabled: computed(() => !isReadonly.value)
})
```

## 完整示例

### 表单编辑页面

```vue
<template>
  <div class="form-page">
    <!-- 草稿提示 -->
    <el-alert
      v-if="hasDraft && !draftLoaded"
      type="info"
      :closable="false"
      style="margin-bottom: 16px"
    >
      <template #title>
        检测到 {{ draftInfo?.timeAgo }} 的草稿
      </template>
      <el-button type="text" @click="handleLoadDraft">加载草稿</el-button>
      或
      <el-button type="text" @click="clearDraft()">清除草稿</el-button>
    </el-alert>

    <!-- 表单 -->
    <el-card>
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="120px"
      >
        <el-form-item label="姓名" prop="name">
          <el-input v-model="formData.name" />
        </el-form-item>
        
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="formData.email" />
        </el-form-item>
        
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="4"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            :loading="submitting"
            @click="handleSubmit"
          >
            提交
          </el-button>
          <el-button @click="saveDraft(true)">
            保存草稿
          </el-button>
          <el-button @click="handleReset">
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useFormDraft, useFormGuard } from '@/composables'

interface FormData {
  name: string
  email: string
  description: string
}

const router = useRouter()
const formRef = ref<FormInstance>()
const submitting = ref(false)
const draftLoaded = ref(false)

const formData = ref<FormData>({
  name: '',
  email: '',
  description: ''
})

const rules: FormRules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}

// 表单草稿
const {
  hasDraft,
  saveDraft,
  loadDraft,
  clearDraft,
  getDraftInfo
} = useFormDraft(formData, {
  autoSave: true,
  autoSaveDelay: 1000,
  excludeFields: ['password']
})

// 导航守卫
const {
  setOriginalData,
  markAsSubmitted
} = useFormGuard(formData, {
  message: '表单有未保存的更改，确定要离开吗？',
  showSaveDraft: true,
  onSaveDraft: async () => {
    saveDraft(true)
  }
})

const draftInfo = getDraftInfo()

// 加载草稿
const handleLoadDraft = () => {
  const loaded = loadDraft(true)
  if (loaded) {
    draftLoaded.value = true
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    submitting.value = true
    
    // 提交逻辑
    await submitFormData(formData.value)
    
    ElMessage.success('提交成功')
    
    // 标记为已提交
    markAsSubmitted()
    
    // 清除草稿
    clearDraft(false)
    
    // 跳转到列表页
    router.push('/list')
  } catch (error) {
    console.error('提交失败:', error)
  } finally {
    submitting.value = false
  }
}

// 重置表单
const handleReset = () => {
  formRef.value?.resetFields()
}

// 模拟提交
const submitFormData = async (data: FormData) => {
  return new Promise(resolve => {
    setTimeout(resolve, 1000)
  })
}

// 初始化
onMounted(() => {
  // 加载数据（如果是编辑模式）
  const data = { name: '', email: '', description: '' }
  formData.value = data
  setOriginalData(data)
})
</script>

<style scoped lang="scss">
.form-page {
  padding: 20px;
}
</style>
```

## 注意事项

### useFormDraft

1. **草稿键唯一性**：默认使用路由路径作为草稿键，如果同一路由有多个表单，需要手动指定 `key`
2. **敏感数据**：使用 `excludeFields` 排除密码等敏感字段
3. **草稿过期**：默认 7 天后草稿自动过期，可通过 `ttl` 配置
4. **版本控制**：草稿有版本号，版本不匹配时会自动忽略

### useFormGuard

1. **原始数据**：必须调用 `setOriginalData()` 设置原始数据，否则无法检测更改
2. **提交后清理**：提交成功后调用 `markAsSubmitted()` 避免误提示
3. **浏览器限制**：浏览器刷新/关闭提示由浏览器控制，无法自定义样式
4. **路由守卫**：只在 Vue Router 环境下生效

## 最佳实践

1. **结合使用**：草稿功能和导航守卫通常一起使用
2. **提交后清理**：提交成功后清除草稿和重置守卫
3. **加载时设置**：数据加载完成后立即设置原始数据
4. **排除字段**：敏感字段不要保存到草稿
5. **用户体验**：自动保存不要频繁提示，只在手动保存时提示


## useFormValidation - 表单验证增强

封装表单验证逻辑，提供更便捷的验证方法和状态管理。

### 功能特性

- ✅ 封装表单验证方法
- ✅ 字段级验证
- ✅ 防抖验证
- ✅ 清除验证
- ✅ 验证状态管理
- ✅ 错误消息管理
- ✅ 常用验证规则

### 基础用法

```vue
<template>
  <el-form ref="formRef" :model="formData" :rules="rules">
    <el-form-item label="邮箱" prop="email">
      <el-input
        v-model="formData.email"
        @blur="validateField('email')"
      />
      <div v-if="hasFieldError('email')" class="error">
        {{ getFieldError('email') }}
      </div>
    </el-form-item>

    <el-button
      type="primary"
      :loading="isValidating"
      @click="handleSubmit"
    >
      提交
    </el-button>
  </el-form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useFormValidation, ValidationRules } from '@/composables'
import type { FormInstance, FormRules } from 'element-plus'

const formRef = ref<FormInstance>()
const formData = ref({
  email: '',
  password: ''
})

const rules: FormRules = {
  email: [
    ValidationRules.required(),
    ValidationRules.email()
  ],
  password: [
    ValidationRules.required(),
    ValidationRules.minLength(8)
  ]
}

// 使用表单验证
const {
  isValidating,
  validate,
  validateField,
  clearValidate,
  getFieldError,
  hasFieldError,
  hasErrors
} = useFormValidation(formRef, {
  debounce: true,
  debounceDelay: 300
})

const handleSubmit = async () => {
  const result = await validate()
  if (result.valid) {
    console.log('验证通过')
  }
}
</script>
```

### 配置选项

```typescript
interface FormValidationOptions {
  /** 是否启用防抖验证 */
  debounce?: boolean
  /** 防抖延迟（毫秒） */
  debounceDelay?: number
  /** 验证失败回调 */
  onValidateError?: (errors: Record<string, string[]>) => void
  /** 验证成功回调 */
  onValidateSuccess?: () => void
}
```

### 返回值

```typescript
{
  // 状态
  isValidating: Ref<boolean>                      // 是否正在验证
  validationErrors: Ref<Record<string, string[]>> // 验证错误
  fieldValidationStatus: Ref<Record<string, boolean>> // 字段验证状态
  hasErrors: ComputedRef<boolean>                 // 是否有错误
  errorCount: ComputedRef<number>                 // 错误数量
  allErrors: ComputedRef<string[]>                // 所有错误消息
  
  // 方法
  validate: () => Promise<FormValidationResult>   // 验证整个表单
  validateField: (field: string | string[]) => Promise<FieldValidationResult> // 验证字段
  validateFieldDebounced: (field: string | string[]) => void // 防抖验证字段
  clearValidate: (field?: string | string[]) => void // 清除验证
  resetFields: () => void                         // 重置字段
  scrollToError: () => void                       // 滚动到错误字段
  getFieldError: (field: string) => string | undefined // 获取字段错误
  getFieldStatus: (field: string) => boolean | undefined // 获取字段状态
  hasFieldError: (field: string) => boolean       // 检查字段是否有错误
}
```

### 常用验证规则

```typescript
import { ValidationRules } from '@/composables'

const rules: FormRules = {
  // 必填
  name: [ValidationRules.required('请输入姓名')],
  
  // 邮箱
  email: [ValidationRules.email()],
  
  // 手机号
  phone: [ValidationRules.phone()],
  
  // 身份证号
  idCard: [ValidationRules.idCard()],
  
  // URL
  website: [ValidationRules.url()],
  
  // 长度范围
  username: [ValidationRules.length(3, 20)],
  
  // 最小长度
  password: [ValidationRules.minLength(8)],
  
  // 最大长度
  description: [ValidationRules.maxLength(200)],
  
  // 数字范围
  age: [ValidationRules.range(0, 150)],
  
  // 正则表达式
  code: [ValidationRules.pattern(/^[A-Z0-9]{6}$/, '请输入 6 位大写字母或数字')],
  
  // 强密码
  password: [ValidationRules.strongPassword()],
  
  // 确认密码
  confirmPassword: [ValidationRules.confirmPassword('password')],
  
  // 自定义验证
  custom: [
    ValidationRules.custom((rule, value, callback) => {
      if (value === 'admin') {
        callback(new Error('用户名不能为 admin'))
      } else {
        callback()
      }
    })
  ]
}
```

### 高级用法

#### 防抖验证

```typescript
const { validateFieldDebounced } = useFormValidation(formRef, {
  debounce: true,
  debounceDelay: 500
})

// 在输入时防抖验证
<el-input
  v-model="formData.email"
  @input="validateFieldDebounced('email')"
/>
```

#### 验证回调

```typescript
const { validate } = useFormValidation(formRef, {
  onValidateSuccess: () => {
    console.log('验证成功')
  },
  onValidateError: (errors) => {
    console.log('验证失败:', errors)
  }
})
```

## useFormSubmit - 表单提交处理

封装表单提交逻辑，提供加载状态、错误处理和成功处理。

### 功能特性

- ✅ 封装表单提交逻辑
- ✅ 加载状态管理
- ✅ 错误处理
- ✅ 成功处理
- ✅ 防止重复提交
- ✅ 自动验证

### 基础用法

```vue
<template>
  <el-form ref="formRef" :model="formData">
    <!-- 表单字段 -->
    
    <el-button
      type="primary"
      :loading="isSubmitting"
      @click="submit"
    >
      提交
    </el-button>
  </el-form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useFormSubmit } from '@/composables'
import type { FormInstance } from 'element-plus'
import { submitUserForm } from '@/api/user'

const router = useRouter()
const formRef = ref<FormInstance>()
const formData = ref({
  name: '',
  email: ''
})

// 使用表单提交
const { isSubmitting, submit } = useFormSubmit(
  formRef,
  formData,
  {
    onSubmit: async (data) => {
      return await submitUserForm(data)
    },
    onSuccess: () => {
      router.push('/list')
    },
    successMessage: '用户创建成功'
  }
)
</script>
```

### 配置选项

```typescript
interface FormSubmitOptions<T = any> {
  /** 提交函数 */
  onSubmit: (data: T) => Promise<any>
  /** 提交前验证 */
  validate?: boolean
  /** 提交成功回调 */
  onSuccess?: (result: any) => void
  /** 提交失败回调 */
  onError?: (error: any) => void
  /** 成功提示消息 */
  successMessage?: string
  /** 是否显示成功提示 */
  showSuccessMessage?: boolean
  /** 是否显示错误提示 */
  showErrorMessage?: boolean
  /** 防止重复提交 */
  preventDuplicate?: boolean
}
```

### 返回值

```typescript
{
  // 状态
  isSubmitting: Ref<boolean>    // 是否正在提交
  submitError: Ref<Error | null> // 提交错误
  submitResult: Ref<any>        // 提交结果
  
  // 方法
  submit: () => Promise<boolean> // 提交表单
  reset: () => void             // 重置提交状态
}
```

### 高级用法

#### 自定义错误处理

```typescript
const { submit } = useFormSubmit(formRef, formData, {
  onSubmit: async (data) => {
    return await submitForm(data)
  },
  onError: (error) => {
    if (error.code === 'DUPLICATE') {
      ElMessage.error('用户名已存在')
    } else {
      ElMessage.error('提交失败')
    }
  },
  showErrorMessage: false // 禁用默认错误提示
})
```

#### 结合其他 Composables

```vue
<script setup lang="ts">
import {
  useFormValidation,
  useFormSubmit,
  useFormDraft,
  useFormGuard
} from '@/composables'

const formRef = ref<FormInstance>()
const formData = ref({ name: '', email: '' })

// 验证
const { validate } = useFormValidation(formRef)

// 提交
const { isSubmitting, submit } = useFormSubmit(formRef, formData, {
  onSubmit: async (data) => {
    return await submitForm(data)
  },
  onSuccess: () => {
    clearDraft(false)
    markAsSubmitted()
  }
})

// 草稿
const { clearDraft } = useFormDraft(formData)

// 守卫
const { markAsSubmitted } = useFormGuard(formData)
</script>
```

## 完整示例：表单验证和提交

```vue
<template>
  <div class="form-page">
    <el-card>
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="120px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="formData.username"
            @blur="validateField('username')"
          />
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input
            v-model="formData.email"
            @input="validateFieldDebounced('email')"
          />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
            v-model="formData.password"
            type="password"
            show-password
          />
        </el-form-item>

        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="formData.confirmPassword"
            type="password"
            show-password
          />
        </el-form-item>

        <el-form-item>
          <el-space>
            <el-button
              type="primary"
              :loading="isSubmitting"
              @click="handleSubmit"
            >
              提交
            </el-button>
            <el-button @click="handleReset">
              重置
            </el-button>
          </el-space>
        </el-form-item>
      </el-form>

      <!-- 错误提示 -->
      <el-alert
        v-if="hasErrors"
        type="error"
        :closable="false"
        style="margin-top: 16px"
      >
        <template #title>
          表单有 {{ errorCount }} 个错误
        </template>
        <ul>
          <li v-for="(error, index) in allErrors" :key="index">
            {{ error }}
          </li>
        </ul>
      </el-alert>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  useFormValidation,
  useFormSubmit,
  useFormDraft,
  useFormGuard,
  ValidationRules
} from '@/composables'
import type { FormInstance, FormRules } from 'element-plus'
import { submitUserForm } from '@/api/user'

const router = useRouter()
const formRef = ref<FormInstance>()

const formData = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

// 验证规则
const rules: FormRules = {
  username: [
    ValidationRules.required(),
    ValidationRules.length(3, 20)
  ],
  email: [
    ValidationRules.required(),
    ValidationRules.email()
  ],
  password: [
    ValidationRules.required(),
    ValidationRules.strongPassword()
  ],
  confirmPassword: [
    ValidationRules.required(),
    ValidationRules.confirmPassword('password')
  ]
}

// 表单验证
const {
  isValidating,
  hasErrors,
  errorCount,
  allErrors,
  validate,
  validateField,
  validateFieldDebounced,
  resetFields
} = useFormValidation(formRef, {
  debounce: true,
  debounceDelay: 300
})

// 表单提交
const { isSubmitting, submit } = useFormSubmit(formRef, formData, {
  onSubmit: async (data) => {
    return await submitUserForm(data)
  },
  onSuccess: () => {
    clearDraft(false)
    markAsSubmitted()
    router.push('/users')
  },
  successMessage: '用户创建成功'
})

// 表单草稿
const { clearDraft } = useFormDraft(formData, {
  autoSave: true,
  excludeFields: ['password', 'confirmPassword']
})

// 导航守卫
const { markAsSubmitted } = useFormGuard(formData)

// 事件处理
const handleSubmit = async () => {
  await submit()
}

const handleReset = () => {
  resetFields()
}
</script>
```

## 总结

这四个 composable 可以组合使用，提供完整的表单管理功能：

1. **useFormDraft** - 自动保存草稿，避免数据丢失
2. **useFormGuard** - 防止意外离开，保护用户数据
3. **useFormValidation** - 增强验证功能，提供更好的用户体验
4. **useFormSubmit** - 简化提交逻辑，统一错误处理

通过组合这些 composable，可以快速构建功能完善、用户体验良好的表单页面。


## useTableFilter

表格过滤器 URL 同步 composable，用于将表格过滤条件同步到 URL 参数。

### 功能特性

- ✅ 监听过滤器变化，自动更新 URL 参数
- ✅ 从 URL 参数恢复过滤器状态
- ✅ 支持多种数据类型（字符串、数字、数组、日期）
- ✅ 支持自定义序列化/反序列化
- ✅ 支持防抖更新
- ✅ 支持排除特定字段
- ✅ 支持清空过滤器

### 基础用法

```vue
<template>
  <div>
    <el-input v-model="filters.keyword" placeholder="关键词" />
    <el-select v-model="filters.status" placeholder="状态">
      <el-option label="全部" :value="0" />
      <el-option label="启用" :value="1" />
      <el-option label="禁用" :value="2" />
    </el-select>
    <el-button @click="handleReset">重置</el-button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTableFilter } from '@/composables'

interface Filters {
  keyword: string
  status: number
}

const filters = ref<Filters>({
  keyword: '',
  status: 0
})

// 使用过滤器 URL 同步
const { syncToUrl, restoreFromUrl, clearFilters } = useTableFilter(filters, {
  debounce: true,
  debounceDelay: 500,
  autoRestore: true,
  autoSync: true
})

const handleReset = () => {
  clearFilters({ keyword: '', status: 0 })
}
</script>
```

### 配置选项

```typescript
interface TableFilterConfig {
  // 是否启用防抖（默认：false）
  debounce?: boolean

  // 防抖延迟（毫秒，默认：300）
  debounceDelay?: number

  // 是否在初始化时自动恢复过滤器（默认：true）
  autoRestore?: boolean

  // 是否在过滤器变化时自动同步到 URL（默认：true）
  autoSync?: boolean

  // 自定义序列化函数
  serialize?: (value: any) => string

  // 自定义反序列化函数
  deserialize?: (value: string) => any

  // 需要排除的字段（不同步到 URL）
  exclude?: string[]
}
```

### 支持的数据类型

```typescript
const filters = ref({
  // 字符串
  keyword: '',
  
  // 数字
  status: 1,
  
  // 数组
  tags: ['vue', 'react'],
  
  // 日期
  date: new Date(),
  
  // 日期范围
  dateRange: [new Date(), new Date()],
  
  // 对象
  config: { page: 1, size: 10 }
})
```

### 高级用法

#### 排除敏感字段

```typescript
const { syncToUrl } = useTableFilter(filters, {
  exclude: ['password', 'token']
})
```

#### 自定义序列化

```typescript
const { syncToUrl } = useTableFilter(filters, {
  serialize: (value) => {
    // 自定义序列化逻辑
    return btoa(JSON.stringify(value))
  },
  deserialize: (value) => {
    // 自定义反序列化逻辑
    return JSON.parse(atob(value))
  }
})
```

#### 手动控制同步

```typescript
const { syncToUrl, restoreFromUrl } = useTableFilter(filters, {
  autoSync: false,
  autoRestore: false
})

// 手动同步到 URL
syncToUrl()

// 手动从 URL 恢复
restoreFromUrl()
```

### 返回值

```typescript
{
  // 同步过滤器到 URL
  syncToUrl: () => void

  // 从 URL 恢复过滤器
  restoreFromUrl: () => void

  // 清空过滤器和 URL 参数
  clearFilters: (defaultValues?: Partial<T>) => void
}
```

### 使用场景

1. **分享过滤状态**：用户可以通过 URL 分享当前的过滤条件
2. **书签保存**：用户可以将过滤后的页面添加到书签
3. **刷新保持**：刷新页面后过滤条件不会丢失
4. **浏览器前进/后退**：支持浏览器的前进和后退按钮

### 注意事项

1. 过滤器对象必须是响应式的（使用 `ref` 或 `reactive`）
2. URL 参数会自动编码，支持中文等特殊字符
3. 建议启用防抖，避免频繁修改 URL
4. 敏感信息（如密码、token）应该使用 `exclude` 排除
5. 复杂对象会被 JSON 序列化，可能导致 URL 过长

### 完整示例

参考 `src/views/examples/TableFilterExample.vue`


## useDict - 字典管理

管理和使用字典数据，包括验证功能。

### 功能特性

- ✅ 获取字典数据
- ✅ 响应式字典状态
- ✅ 自动加载字典
- ✅ 强制刷新字典
- ✅ 根据值获取标签
- ✅ 根据标签获取值
- ✅ 字典值验证
- ✅ 创建验证规则

### 基础用法

```vue
<template>
  <div>
    <!-- 使用字典组件 -->
    <DictSelect v-model="status" type="user_status" />
    
    <!-- 显示标签 -->
    <el-tag>{{ statusDict.getLabel(status) }}</el-tag>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useDict } from '@/composables'
import { DictSelect } from '@/components/dict'

const status = ref(1)

// 使用字典
const statusDict = useDict('user_status')

// 获取标签
const label = statusDict.getLabel(1) // '启用'

// 获取值
const value = statusDict.getValue('启用') // 1

// 刷新字典
await statusDict.refresh()
</script>
```

### 字典验证

```vue
<template>
  <el-form ref="formRef" :model="formData" :rules="formRules">
    <el-form-item label="用户状态" prop="status">
      <DictSelect v-model="formData.status" type="user_status" />
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useDict } from '@/composables'
import type { FormRules } from 'element-plus'

const formData = reactive({
  status: null as number | null
})

// 使用字典
const statusDict = useDict('user_status')

// 创建验证规则
const formRules = computed<FormRules>(() => ({
  status: [
    { required: true, message: '请选择用户状态', trigger: 'change' },
    // 使用字典验证规则
    statusDict.createRule(false, '用户状态值不在允许的范围内')
  ]
}))

// 手动验证值
const isValid = statusDict.validate(1) // true
const isInvalid = statusDict.validate(999) // false

// 验证数组（多选）
const isArrayValid = statusDict.validate([1, 2]) // true
</script>
```

### 批量字典管理

```typescript
import { useDicts } from '@/composables'

// 批量加载字典
const {
  dicts,
  loading,
  loadAll,
  refreshAll,
  getDict
} = useDicts(['user_status', 'user_role', 'user_type'])

// 获取特定字典
const statusDict = getDict('user_status')

// 刷新所有字典
await refreshAll()
```

### 配置选项

```typescript
interface UseDictOptions {
  /** 是否自动加载（默认 true） */
  autoLoad?: boolean
  /** 是否强制刷新（默认 false） */
  forceRefresh?: boolean
  /** 加载完成回调 */
  onLoaded?: (items: DictItem[]) => void
  /** 加载失败回调 */
  onError?: (error: any) => void
}
```

### 返回值

```typescript
interface UseDictReturn {
  // 状态
  dict: Ref<DictItem[]>
  loading: Ref<boolean>
  error: Ref<Error | null>

  // 方法
  load: (forceRefresh?: boolean) => Promise<void>
  refresh: () => Promise<void>
  getLabel: (value: string | number) => string
  getValue: (label: string) => string | number | undefined
  getItem: (value: string | number) => DictItem | undefined
  getTagType: (value: string | number) => string
  filter: (predicate: (item: DictItem) => boolean) => DictItem[]
  find: (predicate: (item: DictItem) => boolean) => DictItem | undefined

  // 验证方法
  validate: (value: any) => boolean
  createRule: (required?: boolean, message?: string) => FormItemRule
  createRules: (required?: boolean) => FormItemRule[]
}
```

## 字典验证工具

除了 `useDict` composable，还提供了独立的验证工具函数。

### createDictRule

创建单个字典验证规则。

```typescript
import { createDictRule } from '@/utils/dict-validation'

const rule = createDictRule({
  dictType: 'user_status',
  dictData: statusDict.dict.value,
  required: true,
  message: '自定义错误消息',
  trigger: 'change'
})
```

### createDictRules

创建字典验证规则数组（用于 ProForm）。

```typescript
import { createDictRules } from '@/utils/dict-validation'

const rules = createDictRules('user_status', statusDict.dict.value, true)
```

### validateDictValue

验证单个值或数组是否在字典范围内。

```typescript
import { validateDictValue } from '@/utils/dict-validation'

// 验证单个值
const isValid = validateDictValue(1, statusDict.dict.value) // true

// 验证数组
const isArrayValid = validateDictValue([1, 2], statusDict.dict.value) // true
```

### validateDictValues

批量验证多个字段的字典值。

```typescript
import { validateDictValues } from '@/utils/dict-validation'

const result = validateDictValues(
  {
    status: 1,
    roles: [1, 2],
    userType: 999 // 无效值
  },
  {
    status: {
      dictType: 'user_status',
      dictData: statusDict.dict.value
    },
    roles: {
      dictType: 'user_role',
      dictData: roleDict.dict.value
    },
    userType: {
      dictType: 'user_type',
      dictData: userTypeDict.dict.value
    }
  }
)

if (result.valid) {
  console.log('所有字段验证通过')
} else {
  console.log('验证失败:', result.errors)
  // { userType: 'user_type的值不在允许的范围内' }
}
```

## 最佳实践

### 1. 字典验证

- 始终对使用字典值的表单字段添加验证规则
- 使用 `useDict` 的 `createRule()` 方法快速创建验证规则
- 对于多选字段，验证会自动处理数组
- 使用批量验证可以一次性验证多个字段

### 2. 错误消息

- 提供清晰的错误消息，告诉用户哪里出错了
- 可以自定义错误消息，使其更符合业务场景
- 错误消息应该是用户友好的，避免技术术语

### 3. 性能优化

- 字典数据会自动缓存，避免重复请求
- 使用 `useDicts` 批量加载多个字典，减少请求次数
- 验证使用 Set 数据结构，查找性能为 O(1)

### 4. 类型安全

- 使用 TypeScript 类型定义，确保类型安全
- 字典值支持 string 和 number 类型
- 验证时会自动处理类型转换

## 示例页面

- `src/views/examples/DictExample.vue` - 字典组件示例
- `src/views/examples/DictValidationExample.vue` - 字典验证示例

## 相关文件

- `src/composables/useDict.ts` - 字典 composable
- `src/utils/dict-validation.ts` - 字典验证工具
- `src/store/dict.ts` - 字典 store
- `src/components/dict/` - 字典组件
