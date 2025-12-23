# ProForm 组件

ProForm 是一个功能强大的表单组件，基于 Element Plus Form 封装，通过配置化的方式快速构建表单，支持多种字段类型、验证、布局等功能。

## 功能特性

- ✅ 配置化表单生成
- ✅ 多种字段类型（input、select、date、upload 等）
- ✅ 表单验证（内置和自定义规则）
- ✅ 多种布局（水平、垂直、内联）
- ✅ 栅格布局支持
- ✅ 字段依赖（条件显示）
- ✅ 自定义渲染
- ✅ 插槽支持
- ✅ TypeScript 类型支持
- ✅ 只读模式

## 基础用法

### 简单表单

```vue
<template>
  <ProForm
    v-model="formData"
    :fields="fields"
    @submit="handleSubmit"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ProForm } from '@/components/pro'
import type { ProFormField } from '@/components/pro'
import { FormFieldType } from '@/components/pro'

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
    placeholder: '请输入用户名'
  },
  {
    name: 'email',
    label: '邮箱',
    type: FormFieldType.INPUT,
    required: true,
    rules: [
      { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
    ]
  },
  {
    name: 'age',
    label: '年龄',
    type: FormFieldType.NUMBER,
    fieldProps: {
      min: 0,
      max: 150
    }
  }
]

const handleSubmit = (data: UserForm) => {
  console.log('提交数据:', data)
}
</script>
```

## 字段类型

### Input 输入框

```typescript
{
  name: 'username',
  label: '用户名',
  type: FormFieldType.INPUT,
  placeholder: '请输入用户名',
  fieldProps: {
    maxlength: 20,
    showWordLimit: true
  }
}
```

### Textarea 文本域

```typescript
{
  name: 'description',
  label: '描述',
  type: FormFieldType.TEXTAREA,
  fieldProps: {
    rows: 4,
    maxlength: 200,
    showWordLimit: true
  }
}
```

### Number 数字输入框

```typescript
{
  name: 'age',
  label: '年龄',
  type: FormFieldType.NUMBER,
  fieldProps: {
    min: 0,
    max: 150,
    step: 1
  }
}
```

### Select 选择器

```typescript
{
  name: 'gender',
  label: '性别',
  type: FormFieldType.SELECT,
  fieldProps: {
    options: [
      { label: '男', value: 1 },
      { label: '女', value: 2 }
    ]
  }
}
```

### Radio 单选框

```typescript
{
  name: 'status',
  label: '状态',
  type: FormFieldType.RADIO,
  fieldProps: {
    options: [
      { label: '启用', value: 1 },
      { label: '禁用', value: 0 }
    ]
  }
}
```

### Checkbox 多选框

```typescript
{
  name: 'hobbies',
  label: '爱好',
  type: FormFieldType.CHECKBOX,
  defaultValue: [],
  fieldProps: {
    options: [
      { label: '读书', value: 'reading' },
      { label: '运动', value: 'sports' },
      { label: '音乐', value: 'music' }
    ]
  }
}
```

### Date 日期选择器

```typescript
{
  name: 'birthday',
  label: '生日',
  type: FormFieldType.DATE,
  fieldProps: {
    format: 'YYYY-MM-DD',
    valueFormat: 'YYYY-MM-DD'
  }
}
```

### DateRange 日期范围

```typescript
{
  name: 'dateRange',
  label: '日期范围',
  type: FormFieldType.DATERANGE,
  defaultValue: [],
  fieldProps: {
    format: 'YYYY-MM-DD',
    valueFormat: 'YYYY-MM-DD'
  }
}
```

### Switch 开关

```typescript
{
  name: 'enabled',
  label: '启用',
  type: FormFieldType.SWITCH,
  defaultValue: true
}
```

## 高级用法

### 表单验证

```vue
<template>
  <ProForm
    v-model="formData"
    :fields="fields"
    :rules="rules"
    @submit="handleSubmit"
  />
</template>

<script setup lang="ts">
import type { FormRules } from 'element-plus'

const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    {
      pattern: /^1[3-9]\d{9}$/,
      message: '请输入正确的手机号',
      trigger: 'blur'
    }
  ]
}
</script>
```

### 字段依赖（条件显示）

```typescript
const fields: ProFormField[] = [
  {
    name: 'type',
    label: '类型',
    type: FormFieldType.SELECT,
    fieldProps: {
      options: [
        { label: '个人', value: 'personal' },
        { label: '企业', value: 'company' }
      ]
    }
  },
  {
    name: 'companyName',
    label: '公司名称',
    type: FormFieldType.INPUT,
    // 只有当 type 为 'company' 时才显示
    dependencies: [
      {
        field: 'type',
        value: 'company',
        operator: 'eq'
      }
    ]
  }
]
```

### 自定义渲染

```vue
<template>
  <ProForm
    v-model="formData"
    :fields="fields"
  >
    <!-- 使用插槽 -->
    <template #customField="{ field, value, formData }">
      <div class="custom-field">
        <span>当前值: {{ value }}</span>
        <el-button @click="handleCustomAction">自定义操作</el-button>
      </div>
    </template>
  </ProForm>
</template>

<script setup lang="ts">
import { h } from 'vue'
import { ElButton } from 'element-plus'

const fields: ProFormField[] = [
  {
    name: 'custom',
    label: '自定义字段',
    type: FormFieldType.CUSTOM,
    slotName: 'customField'
  },
  {
    name: 'renderField',
    label: 'Render 字段',
    type: FormFieldType.CUSTOM,
    render: (value, formData) => {
      return h(ElButton, {
        onClick: () => console.log(value, formData)
      }, () => '点击我')
    }
  }
]
</script>
```

### 栅格布局

```typescript
const fields: ProFormField[] = [
  {
    name: 'username',
    label: '用户名',
    type: FormFieldType.INPUT,
    span: 12 // 占据 12 列（50%）
  },
  {
    name: 'email',
    label: '邮箱',
    type: FormFieldType.INPUT,
    span: 12 // 占据 12 列（50%）
  },
  {
    name: 'address',
    label: '地址',
    type: FormFieldType.TEXTAREA,
    span: 24 // 占据 24 列（100%）
  }
]

const config: ProFormConfig = {
  gutter: 20 // 栅格间隔
}
```

### 字段提示和说明

```typescript
const fields: ProFormField[] = [
  {
    name: 'password',
    label: '密码',
    type: FormFieldType.INPUT,
    tooltip: '密码长度至少 8 位，包含字母和数字',
    extra: '建议使用强密码以保护账户安全',
    fieldProps: {
      type: 'password',
      showPassword: true
    }
  }
]
```

### 字段值变化回调

```typescript
const fields: ProFormField[] = [
  {
    name: 'province',
    label: '省份',
    type: FormFieldType.SELECT,
    fieldProps: {
      options: provinces
    },
    onChange: (value, formData) => {
      // 省份变化时，重置城市
      formData.city = ''
      // 加载对应省份的城市列表
      loadCities(value)
    }
  },
  {
    name: 'city',
    label: '城市',
    type: FormFieldType.SELECT,
    fieldProps: {
      options: cities
    }
  }
]
```

### 表单布局

```vue
<template>
  <!-- 水平布局（默认） -->
  <ProForm
    v-model="formData"
    :fields="fields"
    :config="{ layout: 'horizontal', labelWidth: '100px' }"
  />

  <!-- 垂直布局 -->
  <ProForm
    v-model="formData"
    :fields="fields"
    :config="{ layout: 'vertical' }"
  />

  <!-- 内联布局 -->
  <ProForm
    v-model="formData"
    :fields="fields"
    :config="{ layout: 'inline' }"
  />
</template>
```

### 只读模式

```vue
<template>
  <ProForm
    v-model="formData"
    :fields="fields"
    readonly
  />
</template>
```

## API

### Props

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| fields | 表单字段配置 | `ProFormField[]` | `[]` |
| modelValue | 表单数据 | `T` | `{}` |
| config | 表单配置 | `ProFormConfig` | - |
| rules | 表单验证规则 | `FormRules` | - |
| loading | 是否显示加载状态 | `boolean` | `false` |
| readonly | 是否只读模式 | `boolean` | `false` |

### ProFormField

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| name | 字段名称 | `string` | - |
| label | 字段标签 | `string` | - |
| type | 字段类型 | `FormFieldTypeValue` | - |
| defaultValue | 默认值 | `any` | - |
| placeholder | 占位符 | `string` | - |
| required | 是否必填 | `boolean` | `false` |
| disabled | 是否禁用 | `boolean` | `false` |
| readonly | 是否只读 | `boolean` | `false` |
| hidden | 是否隐藏 | `boolean` | `false` |
| rules | 验证规则 | `FormItemRule[]` | - |
| tooltip | 字段提示 | `string` | - |
| extra | 字段说明 | `string` | - |
| span | 栅格布局（1-24） | `number` | `24` |
| dependencies | 字段依赖 | `Dependency[]` | - |
| fieldProps | 字段特定配置 | `Record<string, any>` | - |
| render | 自定义渲染函数 | `(value, formData) => any` | - |
| slotName | 插槽名称 | `string` | - |
| onChange | 值变化回调 | `(value, formData) => void` | - |

### ProFormConfig

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| layout | 表单布局 | `'horizontal' \| 'vertical' \| 'inline'` | `'horizontal'` |
| labelWidth | 标签宽度 | `string \| number` | `'100px'` |
| labelPosition | 标签位置 | `'left' \| 'right' \| 'top'` | `'right'` |
| gutter | 栅格间隔 | `number` | `20` |
| showReset | 是否显示重置按钮 | `boolean` | `true` |
| showCancel | 是否显示取消按钮 | `boolean` | `false` |
| submitText | 提交按钮文本 | `string` | `'提交'` |
| resetText | 重置按钮文本 | `string` | `'重置'` |
| cancelText | 取消按钮文本 | `string` | `'取消'` |

### Events

| 事件名 | 说明 | 参数 |
|--------|------|------|
| update:modelValue | 表单数据更新 | `(value: T)` |
| submit | 表单提交 | `(value: T)` |
| reset | 表单重置 | - |
| cancel | 表单取消 | - |
| field-change | 字段值变化 | `(field: string, value: any)` |
| validate-error | 验证失败 | `(errors: any)` |

### Slots

| 插槽名 | 说明 | 参数 |
|--------|------|------|
| [field.slotName] | 字段自定义内容 | `{ field, value, formData }` |
| actions | 表单操作按钮 | - |

### Methods

| 方法名 | 说明 | 参数 | 返回值 |
|--------|------|------|--------|
| validate | 验证整个表单 | - | `Promise<boolean>` |
| validateField | 验证指定字段 | `(field: string \| string[])` | `Promise<boolean>` |
| resetFields | 重置表单 | - | - |
| clearValidate | 清空验证 | `(field?: string \| string[])` | - |
| getFormData | 获取表单数据 | - | `T` |
| setFormData | 设置表单数据 | `(data: Partial<T>)` | - |
| setFieldValue | 设置字段值 | `(field: string, value: any)` | - |
| getFieldValue | 获取字段值 | `(field: string)` | `any` |
| setFieldProps | 设置字段属性 | `(field: string, props: Partial<ProFormField>)` | - |
| setLoading | 设置加载状态 | `(loading: boolean)` | - |

## 字段类型常量

```typescript
import { FormFieldType } from '@/components/pro'

FormFieldType.INPUT          // 输入框
FormFieldType.TEXTAREA       // 文本域
FormFieldType.NUMBER         // 数字输入框
FormFieldType.SELECT         // 选择器
FormFieldType.RADIO          // 单选框
FormFieldType.CHECKBOX       // 多选框
FormFieldType.DATE           // 日期选择器
FormFieldType.DATERANGE      // 日期范围
FormFieldType.TIME           // 时间选择器
FormFieldType.TIMERANGE      // 时间范围
FormFieldType.DATETIME       // 日期时间选择器
FormFieldType.DATETIMERANGE  // 日期时间范围
FormFieldType.SWITCH         // 开关
FormFieldType.SLIDER         // 滑块
FormFieldType.RATE           // 评分
FormFieldType.COLOR          // 颜色选择器
FormFieldType.UPLOAD         // 上传
FormFieldType.CUSTOM         // 自定义
```

## 最佳实践

### 1. 使用 TypeScript

```typescript
import type { ProFormField } from '@/components/pro'
import { FormFieldType } from '@/components/pro'

interface UserForm {
  username: string
  email: string
  age: number
}

const fields: ProFormField<UserForm>[] = [
  // ...
]
```

### 2. 表单验证

```typescript
// 使用字段的 rules 属性
{
  name: 'email',
  label: '邮箱',
  type: FormFieldType.INPUT,
  rules: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}

// 或使用表单的 rules 属性
const rules: FormRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}
```

### 3. 使用 ref 访问实例方法

```vue
<script setup lang="ts">
import { ref } from 'vue'
import type { ProFormInstance } from '@/components/pro'

const formRef = ref<ProFormInstance<UserForm>>()

const handleSubmit = async () => {
  const valid = await formRef.value?.validate()
  if (valid) {
    const data = formRef.value?.getFormData()
    console.log(data)
  }
}
</script>
```

## 示例

完整示例请参考：
- `src/views/examples/ProFormExample.vue`
