# 快速开始指南

本指南帮助你快速了解和使用已实现的功能。

## 📦 安装依赖

```bash
npm install crypto-js
```

## 🚀 核心功能使用

### 1. 缓存管理器

```typescript
import { CacheManager } from '@/utils/cache'

// 创建缓存管理器
const cache = new CacheManager({
  storage: localStorage,
  prefix: 'app_',
  encrypt: true,
  encryptionKey: 'your-secret-key'
})

// 设置缓存（7 天过期）
cache.set('user', { name: '张三' }, 7 * 24 * 60 * 60 * 1000)

// 获取缓存
const user = cache.get('user')

// 清除缓存
cache.remove('user')
```

### 2. Pinia 持久化

```typescript
// main.ts
import { createPinia } from 'pinia'
import { createPersistedState } from '@/plugins/pinia-persistence'

const pinia = createPinia()
pinia.use(createPersistedState())

// store/user.ts
export const useUserStore = defineStore('user', {
  state: () => ({
    name: '',
    token: ''
  }),
  persist: {
    enabled: true,
    encrypt: true,
    paths: ['token'] // 只持久化 token
  }
})
```

### 3. HTTP 客户端

```typescript
import request from '@/utils/request'

// 自动重试、去重、离线队列
const response = await request.get('/api/users')

// 禁用重试
const response = await request.get('/api/users', {
  _noRetry: true
})

// 允许重复请求
const response = await request.get('/api/users', {
  _allowDuplicate: true
})
```

### 4. 错误处理

```vue
<template>
  <!-- 使用 ErrorBoundary 包裹组件 -->
  <ErrorBoundary>
    <YourComponent />
  </ErrorBoundary>
</template>

<script setup lang="ts">
import ErrorBoundary from '@/components/ErrorBoundary.vue'
import { reportError } from '@/utils/setup-error-handler'

// 手动报告错误
try {
  // 业务逻辑
} catch (error) {
  reportError(error)
}
</script>
```

## 🎨 ProComponents 使用

### ProTable 组件

```vue
<template>
  <ProTable
    :columns="columns"
    :request="loadData"
    selectable
    @selection-change="handleSelectionChange"
  >
    <!-- 工具栏左侧 -->
    <template #toolbar-left>
      <el-button type="primary" @click="handleAdd">新增</el-button>
    </template>

    <!-- 自定义列 -->
    <template #status="{ row }">
      <el-tag :type="row.status === 1 ? 'success' : 'danger'">
        {{ row.status === 1 ? '启用' : '禁用' }}
      </el-tag>
    </template>
  </ProTable>
</template>

<script setup lang="ts">
import { ProTable } from '@/components/pro'
import type { ProTableColumn, ProTableRequest } from '@/components/pro'

interface User {
  id: number
  name: string
  status: 0 | 1
}

const columns: ProTableColumn<User>[] = [
  { prop: 'id', label: 'ID', width: 80 },
  { prop: 'name', label: '姓名', minWidth: 120 },
  { prop: 'status', label: '状态', width: 100, slotName: 'status' }
]

const loadData: ProTableRequest<User> = async (params) => {
  const response = await getUserList(params)
  return {
    data: response.data,
    total: response.total
  }
}

const handleSelectionChange = (selection: User[]) => {
  console.log('选中的行:', selection)
}

const handleAdd = () => {
  console.log('新增用户')
}
</script>
```

### ProForm 组件

```vue
<template>
  <ProForm
    v-model="formData"
    :fields="fields"
    :config="{ layout: 'horizontal', labelWidth: '120px' }"
    @submit="handleSubmit"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ProForm, FormFieldType } from '@/components/pro'
import type { ProFormField } from '@/components/pro'

interface UserForm {
  username: string
  email: string
  age: number
}

const formData = ref<UserForm>({
  username: '',
  email: '',
  age: 0
})

const fields: ProFormField<UserForm>[] = [
  {
    name: 'username',
    label: '用户名',
    type: FormFieldType.INPUT,
    required: true,
    span: 12
  },
  {
    name: 'email',
    label: '邮箱',
    type: FormFieldType.INPUT,
    required: true,
    span: 12,
    rules: [
      { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
    ]
  },
  {
    name: 'age',
    label: '年龄',
    type: FormFieldType.NUMBER,
    span: 12,
    fieldProps: { min: 0, max: 150 }
  }
]

const handleSubmit = (data: UserForm) => {
  console.log('提交数据:', data)
}
</script>
```

## 📝 表单管理 Composables

### 完整的表单管理

```vue
<template>
  <div>
    <!-- 草稿提示 -->
    <el-alert v-if="hasDraft" type="info">
      检测到未保存的草稿，
      <el-button type="text" @click="loadDraft()">加载草稿</el-button>
    </el-alert>

    <!-- 表单 -->
    <el-form ref="formRef" :model="formData" :rules="rules">
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

      <el-form-item>
        <el-button
          type="primary"
          :loading="isSubmitting"
          @click="submit"
        >
          提交
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  useFormDraft,
  useFormGuard,
  useFormValidation,
  useFormSubmit,
  ValidationRules
} from '@/composables'
import type { FormInstance, FormRules } from 'element-plus'

const router = useRouter()
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
    ValidationRules.strongPassword()
  ]
}

// 1. 表单草稿（自动保存）
const { hasDraft, loadDraft, clearDraft } = useFormDraft(formData, {
  autoSave: true,
  autoSaveDelay: 1000,
  excludeFields: ['password']
})

// 2. 导航守卫（防止意外离开）
const { setOriginalData, markAsSubmitted } = useFormGuard(formData, {
  message: '表单有未保存的更改，确定要离开吗？',
  showSaveDraft: true,
  onSaveDraft: () => saveDraft(true)
})

// 3. 表单验证（防抖验证）
const { validateFieldDebounced } = useFormValidation(formRef, {
  debounce: true,
  debounceDelay: 300
})

// 4. 表单提交（自动验证、错误处理）
const { isSubmitting, submit } = useFormSubmit(formRef, formData, {
  onSubmit: async (data) => {
    return await submitForm(data)
  },
  onSuccess: () => {
    clearDraft(false)
    markAsSubmitted()
    router.push('/list')
  },
  successMessage: '提交成功'
})

onMounted(() => {
  setOriginalData(formData.value)
})
</script>
```

## 📚 常用验证规则

```typescript
import { ValidationRules } from '@/composables'
import type { FormRules } from 'element-plus'

const rules: FormRules = {
  // 必填
  name: [ValidationRules.required('请输入姓名')],
  
  // 邮箱
  email: [ValidationRules.email()],
  
  // 手机号
  phone: [ValidationRules.phone()],
  
  // 身份证号
  idCard: [ValidationRules.idCard()],
  
  // 长度范围
  username: [ValidationRules.length(3, 20)],
  
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

## 🎯 示例页面

项目中包含了完整的示例页面，可以直接查看和运行：

1. **ProTable 示例**：`src/views/examples/ProTableExample.vue`
2. **ProForm 示例**：`src/views/examples/ProFormExample.vue`
3. **表单草稿示例**：`src/views/examples/FormDraftExample.vue`
4. **表单验证示例**：`src/views/examples/FormValidationExample.vue`

## 📖 详细文档

- **HTTP 客户端**：`src/utils/http/README.md`
- **错误处理系统**：`src/utils/README-error-handling.md`
- **Pinia 插件**：`src/plugins/README.md`
- **Composables**：`src/composables/README.md`
- **ProTable**：`src/components/pro/ProTable/README.md`
- **ProForm**：`src/components/pro/ProForm/README.md`

## 💡 最佳实践

### 1. 组合使用功能

不要单独使用某个功能，而是组合使用以获得最佳体验：

```typescript
// ✅ 好的做法
const { hasDraft, loadDraft, clearDraft } = useFormDraft(formData)
const { setOriginalData, markAsSubmitted } = useFormGuard(formData)
const { validate } = useFormValidation(formRef)
const { submit } = useFormSubmit(formRef, formData, { ... })

// ❌ 不好的做法
// 只使用一个功能，缺少其他保护
const { submit } = useFormSubmit(formRef, formData, { ... })
```

### 2. 使用 TypeScript

充分利用 TypeScript 的类型检查：

```typescript
// ✅ 好的做法
interface UserForm {
  username: string
  email: string
}

const formData = ref<UserForm>({ ... })
const fields: ProFormField<UserForm>[] = [ ... ]

// ❌ 不好的做法
const formData = ref({ ... }) // 缺少类型定义
```

### 3. 错误处理

始终使用 ErrorBoundary 包裹可能出错的组件：

```vue
<!-- ✅ 好的做法 -->
<ErrorBoundary>
  <ComplexComponent />
</ErrorBoundary>

<!-- ❌ 不好的做法 -->
<ComplexComponent />
```

### 4. 敏感数据

不要将敏感数据保存到草稿：

```typescript
// ✅ 好的做法
useFormDraft(formData, {
  excludeFields: ['password', 'confirmPassword']
})

// ❌ 不好的做法
useFormDraft(formData) // 密码也会被保存
```

## 🔧 故障排除

### 1. 缓存管理器加密失败

**问题**：加密数据时报错

**解决**：确保安装了 `crypto-js` 依赖

```bash
npm install crypto-js
```

### 2. 表单验证不生效

**问题**：表单验证规则不生效

**解决**：确保传递了 `formRef` 并且表单有 `rules` 属性

```vue
<el-form ref="formRef" :model="formData" :rules="rules">
```

### 3. 草稿不保存

**问题**：表单草稿没有自动保存

**解决**：检查 `autoSave` 配置是否启用

```typescript
useFormDraft(formData, {
  autoSave: true,
  autoSaveDelay: 1000
})
```

## 📞 获取帮助

如果遇到问题，可以：

1. 查看详细文档（每个功能都有 README）
2. 查看示例代码（`src/views/examples/`）
3. 查看进度报告（`PROGRESS.md`）
4. 查看工作总结（`SUMMARY.md`）

---

**祝你使用愉快！** 🎉
