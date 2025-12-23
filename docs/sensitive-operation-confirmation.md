# 敏感操作确认系统

## 概述

敏感操作确认系统用于防止用户误操作，特别是对于删除、清空、重置等不可逆的危险操作。系统提供多种确认方式，包括基础确认、二次确认文本、密码确认等。

## 功能特性

### 1. useConfirm Composable

提供便捷的确认对话框方法，基于 Element Plus 的 MessageBox 组件。

**主要方法：**
- `confirm()` - 基础确认对话框
- `confirmWarning()` - 警告确认对话框
- `confirmDanger()` - 危险操作确认（需要输入确认文本）
- `confirmPassword()` - 密码确认对话框
- `confirmDelete()` - 删除确认对话框

### 2. ConfirmDialog 组件

可复用的确认对话框组件，支持更多自定义选项。

**特性：**
- 自定义标题、消息、描述
- 多种图标类型（warning、question、info、success）
- 二次确认文本输入
- 密码确认输入
- 自定义内容插槽
- 加载状态管理
- 完整的回调支持

## 使用方法

### 1. 基础确认

```typescript
import { useConfirm } from '@/composables'

const { confirm } = useConfirm()

async function handleDelete() {
  const result = await confirm({
    title: '确认删除',
    message: '确定要删除此项吗？',
    type: 'warning'
  })

  if (result.confirmed) {
    // 执行删除操作
    await deleteItem()
  }
}
```

### 2. 删除确认

```typescript
import { useConfirm } from '@/composables'

const { confirmDelete } = useConfirm()

async function handleDelete() {
  const result = await confirmDelete('用户 "张三"')

  if (result.confirmed) {
    // 执行删除操作
    await deleteUser()
  }
}
```

### 3. 危险操作确认（需要输入确认文本）

对于特别危险的操作（如清空数据、删除数据库），要求用户输入确认文本：

```typescript
import { useConfirm } from '@/composables'

const { confirmDanger } = useConfirm()

async function handleClearData() {
  const result = await confirmDanger(
    '此操作将清空所有数据，不可撤销',
    '清空数据',
    '清空'  // 用户需要输入这个文本才能确认
  )

  if (result.confirmed) {
    console.log('用户输入的确认文本:', result.confirmText)
    // 执行清空操作
    await clearAllData()
  }
}
```

### 4. 密码确认

对于敏感操作（如修改邮箱、修改密码、注销账号），要求用户输入密码：

```typescript
import { useConfirm } from '@/composables'

const { confirmPassword } = useConfirm()

async function handleChangeEmail() {
  const result = await confirmPassword('修改邮箱需要验证您的密码')

  if (result.confirmed) {
    console.log('用户密码:', result.password)
    // 验证密码并执行操作
    await changeEmail(result.password)
  }
}
```

### 5. 使用 ConfirmDialog 组件

```vue
<template>
  <el-button @click="showDialog">删除</el-button>

  <ConfirmDialog
    ref="dialogRef"
    title="确认删除"
    message="确定要删除此用户吗？"
    confirm-button-type="danger"
    :on-confirm="handleConfirm"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ConfirmDialog } from '@/components/ConfirmDialog'

const dialogRef = ref()

function showDialog() {
  dialogRef.value?.show()
}

async function handleConfirm() {
  // 执行删除操作
  await deleteUser()
}
</script>
```

### 6. 二次确认文本（组件方式）

```vue
<template>
  <ConfirmDialog
    ref="dialogRef"
    title="危险操作"
    message="此操作不可撤销"
    confirm-button-type="danger"
    :require-confirm-text="true"
    confirm-text-value="确认删除"
    :on-confirm="handleConfirm"
  />
</template>

<script setup lang="ts">
async function handleConfirm(data: any) {
  console.log('用户输入的确认文本:', data.confirmText)
  // 执行操作
}
</script>
```

### 7. 密码确认（组件方式）

```vue
<template>
  <ConfirmDialog
    ref="dialogRef"
    title="密码确认"
    message="此操作需要验证您的密码"
    confirm-button-type="warning"
    :require-password="true"
    :on-confirm="handleConfirm"
  />
</template>

<script setup lang="ts">
async function handleConfirm(data: any) {
  console.log('用户密码:', data.password)
  // 验证密码并执行操作
}
</script>
```

## API 文档

### useConfirm

#### confirm(options)

显示确认对话框。

**参数：**
```typescript
interface ConfirmOptions {
  title?: string                    // 标题
  message?: string                  // 消息
  confirmButtonText?: string        // 确认按钮文本
  cancelButtonText?: string         // 取消按钮文本
  type?: 'warning' | 'info' | 'success' | 'error'
  showCancelButton?: boolean        // 是否显示取消按钮
  requireConfirmText?: boolean      // 是否需要二次确认文本
  confirmText?: string              // 二次确认文本
  requirePassword?: boolean         // 是否需要密码确认
  customContent?: VNode | string    // 自定义内容
}
```

**返回值：**
```typescript
interface ConfirmResult {
  confirmed: boolean      // 是否确认
  confirmText?: string    // 确认文本（如果需要）
  password?: string       // 密码（如果需要）
  action: Action          // 操作类型
}
```

#### confirmWarning(message, title?)

显示警告确认对话框。

#### confirmDanger(message, title?, confirmText?)

显示危险操作确认对话框（需要输入确认文本）。

#### confirmPassword(message, title?)

显示密码确认对话框。

#### confirmDelete(itemName?)

显示删除确认对话框。

### ConfirmDialog 组件

#### Props

```typescript
interface ConfirmDialogProps {
  title?: string                    // 标题
  message?: string                  // 消息
  description?: string              // 描述
  width?: string | number           // 对话框宽度
  confirmText?: string              // 确认按钮文本
  cancelText?: string               // 取消按钮文本
  confirmButtonType?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  iconType?: 'warning' | 'question' | 'info' | 'success'
  showIcon?: boolean                // 是否显示图标
  requireConfirmText?: boolean      // 是否需要二次确认文本
  confirmTextValue?: string         // 二次确认文本
  requirePassword?: boolean         // 是否需要密码确认
  onConfirm?: (data?: any) => Promise<void> | void
  onCancel?: () => void
}
```

#### Methods

```typescript
// 显示对话框
dialogRef.value?.show()

// 隐藏对话框
dialogRef.value?.hide()
```

#### Events

```typescript
// 确认事件
@confirm="handleConfirm"

// 取消事件
@cancel="handleCancel"
```

## 使用场景

### 1. 删除操作

```typescript
// 删除单个项目
const result = await confirmDelete('用户 "张三"')

// 删除多个项目
const result = await confirmDelete('选中的 5 个用户')

// 删除重要数据
const result = await confirmDanger(
  '此操作将删除数据库，不可撤销',
  '删除数据库',
  '删除'
)
```

### 2. 清空操作

```typescript
const result = await confirmDanger(
  '此操作将清空所有数据，不可撤销',
  '清空数据',
  '清空'
)
```

### 3. 重置操作

```typescript
const result = await confirmDanger(
  '此操作将重置系统到初始状态',
  '重置系统',
  '重置'
)
```

### 4. 修改敏感信息

```typescript
// 修改邮箱
const result = await confirmPassword('修改邮箱需要验证您的密码')
if (result.confirmed) {
  await changeEmail(newEmail, result.password)
}

// 修改密码
const result = await confirmPassword('修改密码需要验证您的当前密码')
if (result.confirmed) {
  await changePassword(result.password, newPassword)
}
```

### 5. 注销账号

```typescript
const result = await confirmPassword('注销账号需要验证您的密码')
if (result.confirmed) {
  await deleteAccount(result.password)
}
```

### 6. 批量操作

```typescript
const result = await confirm({
  title: '批量删除',
  message: `确定要删除选中的 ${selectedCount} 个用户吗？`,
  type: 'warning'
})
```

## 最佳实践

### 1. 根据操作危险程度选择确认方式

- **低风险操作**：基础确认
- **中风险操作**：警告确认
- **高风险操作**：删除确认（需要输入"删除"）
- **极高风险操作**：危险操作确认（需要输入自定义文本）
- **敏感操作**：密码确认

### 2. 提供清晰的提示信息

```typescript
// ❌ 不好的提示
const result = await confirm({ message: '确定吗？' })

// ✅ 好的提示
const result = await confirmDelete('用户 "张三"')
const result = await confirmDanger(
  '此操作将清空所有数据，不可撤销。清空后无法恢复，请谨慎操作。',
  '清空数据',
  '清空'
)
```

### 3. 使用合适的确认文本

```typescript
// 对于删除操作
confirmText: '删除'

// 对于清空操作
confirmText: '清空'

// 对于重置操作
confirmText: '重置'

// 对于确认操作
confirmText: '确认'
```

### 4. 记录敏感操作

```typescript
const result = await confirmDanger('删除数据库', '删除数据库', '删除')
if (result.confirmed) {
  // 记录操作日志
  await logOperation({
    action: 'delete_database',
    user: currentUser,
    timestamp: Date.now(),
    confirmText: result.confirmText
  })
  
  // 执行操作
  await deleteDatabase()
}
```

### 5. 验证密码

```typescript
const result = await confirmPassword('修改邮箱需要验证您的密码')
if (result.confirmed) {
  // 验证密码
  const isValid = await verifyPassword(result.password)
  if (!isValid) {
    ElMessage.error('密码错误')
    return
  }
  
  // 执行操作
  await changeEmail(newEmail)
}
```

### 6. 处理错误

```typescript
try {
  const result = await confirmDelete('用户')
  if (result.confirmed) {
    await deleteUser()
    ElMessage.success('删除成功')
  }
} catch (error) {
  console.error('删除失败:', error)
  ElMessage.error('删除失败，请重试')
}
```

## 注意事项

1. **不要滥用确认对话框**：只对真正需要确认的操作使用确认对话框
2. **提供清晰的提示**：让用户明确知道操作的后果
3. **使用合适的确认级别**：根据操作的危险程度选择合适的确认方式
4. **记录敏感操作**：对于重要操作，记录操作日志
5. **验证用户输入**：对于密码确认，务必在服务器端验证密码
6. **提供撤销机制**：如果可能，提供撤销操作的方式

## 相关资源

- [Element Plus MessageBox](https://element-plus.org/zh-CN/component/message-box.html)
- [UX Best Practices for Confirmation Dialogs](https://uxdesign.cc/confirmation-dialogs-best-practices-4c0c5e0e5e5e)
