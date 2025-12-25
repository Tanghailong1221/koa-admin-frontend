# ProDialog 弹窗组件

ProDialog 是一个功能丰富的弹窗组件，内置表单功能，支持新增、编辑、查看三种模式，适用于表格操作场景。

## 功能特性

- 🎯 **多种模式** - 支持新增(add)、编辑(edit)、查看(view)、自定义(custom)四种模式
- 📝 **内置表单** - 集成 ProForm 组件，支持所有表单字段类型
- 🖥️ **全屏切换** - 支持全屏显示，适合复杂表单
- 🔄 **拖拽移动** - 支持拖拽弹窗位置
- 📐 **尺寸预设** - 提供 small/default/large/xlarge/fullscreen 五种尺寸
- ✅ **表单验证** - 自动集成表单验证功能
- 🎨 **自定义内容** - 支持完全自定义弹窗内容
- 💪 **TypeScript** - 完整的类型支持

## 基础用法

```vue
<template>
  <el-button @click="handleAdd">新增</el-button>
  <el-button @click="handleEdit">编辑</el-button>
  <el-button @click="handleView">查看</el-button>

  <ProDialog
    ref="dialogRef"
    :title="{ add: '新增用户', edit: '编辑用户', view: '查看用户' }"
    :fields="fields"
    @confirm="handleConfirm"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ProDialog, DialogMode, FormFieldType } from '@/components/pro'
import type { ProDialogInstance, ProFormField } from '@/components/pro'

const dialogRef = ref<ProDialogInstance>()

const fields: ProFormField[] = [
  { name: 'username', label: '用户名', type: FormFieldType.INPUT, required: true },
  { name: 'email', label: '邮箱', type: FormFieldType.INPUT },
]

const handleAdd = () => {
  dialogRef.value?.open(DialogMode.ADD)
}

const handleEdit = () => {
  dialogRef.value?.open(DialogMode.EDIT, { username: 'admin', email: 'admin@example.com' })
}

const handleView = () => {
  dialogRef.value?.open(DialogMode.VIEW, { username: 'admin', email: 'admin@example.com' })
}

const handleConfirm = (data: any) => {
  console.log('提交数据:', data)
  dialogRef.value?.close()
}
</script>
```

## Props

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| modelValue | 是否显示弹窗 | `boolean` | `false` |
| mode | 弹窗模式 | `'add' \| 'edit' \| 'view' \| 'custom'` | `'add'` |
| title | 弹窗标题 | `string \| DialogTitleConfig` | `{ add: '新增', edit: '编辑', view: '查看' }` |
| fields | 表单字段配置 | `ProFormField[]` | `[]` |
| formData | 表单数据 | `object` | `{}` |
| formConfig | 表单配置 | `ProFormConfig` | `{}` |
| dialogConfig | 弹窗配置 | `ProDialogConfig` | `{}` |
| loading | 是否加载中 | `boolean` | `false` |
| useForm | 是否使用内置表单 | `boolean` | `true` |

## DialogConfig 配置

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| width | 弹窗宽度 | `string \| number` | - |
| size | 弹窗尺寸预设 | `'small' \| 'default' \| 'large' \| 'xlarge' \| 'fullscreen'` | `'default'` |
| draggable | 是否可拖拽 | `boolean` | `true` |
| showClose | 是否显示关闭按钮 | `boolean` | `true` |
| closeOnClickModal | 是否点击遮罩关闭 | `boolean` | `false` |
| closeOnPressEscape | 是否按 ESC 关闭 | `boolean` | `true` |
| showFullscreen | 是否显示全屏按钮 | `boolean` | `true` |
| showFooter | 是否显示底部按钮 | `boolean` | `true` |
| confirmText | 确认按钮文本 | `string` | `'确定'` |
| cancelText | 取消按钮文本 | `string` | `'取消'` |
| showConfirm | 是否显示确认按钮 | `boolean` | `true` |
| showCancel | 是否显示取消按钮 | `boolean` | `true` |
| destroyOnClose | 关闭时销毁内容 | `boolean` | `true` |

## Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:modelValue | 弹窗显示状态变化 | `(value: boolean)` |
| open | 弹窗打开 | - |
| opened | 弹窗打开动画结束 | - |
| close | 弹窗关闭 | - |
| closed | 弹窗关闭动画结束 | - |
| confirm | 确认按钮点击 | `(data: T)` |
| cancel | 取消按钮点击 | - |
| submit | 表单提交 | `(data: T)` |
| validate-error | 表单验证失败 | `(errors: any)` |

## 实例方法

通过 ref 获取组件实例后可调用以下方法：

| 方法名 | 说明 | 参数 |
|--------|------|------|
| open | 打开弹窗 | `(mode?: DialogModeValue, data?: T)` |
| close | 关闭弹窗 | - |
| getFormData | 获取表单数据 | - |
| setFormData | 设置表单数据 | `(data: Partial<T>)` |
| validate | 验证表单 | - |
| resetForm | 重置表单 | - |
| setLoading | 设置加载状态 | `(loading: boolean)` |
| setConfirmLoading | 设置确认按钮加载状态 | `(loading: boolean)` |

## 插槽

| 插槽名 | 说明 | 作用域参数 |
|--------|------|------------|
| default | 自定义内容（useForm=false 时生效） | `{ mode, data, loading }` |
| footer | 自定义底部按钮 | `{ mode, data, loading }` |
| [fieldSlotName] | 表单字段插槽（透传给 ProForm） | `{ field, value, formData }` |

## 自定义内容示例

```vue
<template>
  <ProDialog
    ref="dialogRef"
    title="自定义内容"
    :use-form="false"
    :dialog-config="{ showConfirm: false }"
  >
    <template #default="{ mode, data }">
      <div class="custom-content">
        <p>当前模式: {{ mode }}</p>
        <p>数据: {{ data }}</p>
      </div>
    </template>
  </ProDialog>
</template>
```

## 尺寸预设

| 尺寸 | 宽度 |
|------|------|
| small | 400px |
| default | 520px |
| large | 720px |
| xlarge | 960px |
| fullscreen | 100% |
