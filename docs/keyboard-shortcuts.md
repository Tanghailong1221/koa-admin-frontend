# 键盘快捷键功能文档

## 概述

键盘快捷键功能基于 mousetrap 库实现，提供了完整的快捷键管理系统，支持全局快捷键和页面级快捷键。

## 功能特性

### 1. 快捷键管理器

- ✅ 注册/注销快捷键
- ✅ 启用/禁用快捷键
- ✅ 快捷键分类管理
- ✅ 快捷键作用域控制
- ✅ 多快捷键组合支持

### 2. 全局快捷键

- ✅ Ctrl+S / Cmd+S - 保存
- ✅ Esc - 关闭对话框/抽屉
- ✅ F5 - 刷新页面
- ✅ Ctrl+/ / Cmd+/ - 显示帮助
- ✅ Alt+Left - 后退
- ✅ Alt+Right - 前进
- ✅ Ctrl+H / Cmd+H - 返回首页
- ✅ Ctrl+K / Cmd+K - 搜索
- ✅ Ctrl+B / Cmd+B - 切换侧边栏
- ✅ Ctrl+, / Cmd+, - 设置

### 3. 快捷键帮助

- ✅ 快捷键帮助对话框
- ✅ 按分类显示快捷键
- ✅ 搜索快捷键
- ✅ 格式化快捷键显示

## 使用方法

### 1. 设置全局快捷键

在 `main.ts` 中设置：

```typescript
import { setupGlobalShortcuts } from '@/utils/global-shortcuts'
import router from '@/router'

// 设置全局快捷键
setupGlobalShortcuts(router)
```

### 2. 注册页面级快捷键

使用 `useKeyboardShortcut` composable：

```vue
<script setup lang="ts">
import { onMounted } from 'vue'
import { useKeyboardShortcut } from '@/composables'
import { ShortcutCategory } from '@/utils/keyboard-shortcuts'

const { register } = useKeyboardShortcut()

onMounted(() => {
  // 注册快捷键
  register('my-shortcut', {
    keys: 'ctrl+1',
    description: '执行操作',
    category: ShortcutCategory.OTHER,
    callback: () => {
      console.log('执行操作')
      return false  // 阻止默认行为
    }
  })
})

// 组件卸载时会自动注销快捷键
</script>
```

### 3. 使用简化版 API

```vue
<script setup lang="ts">
import { useShortcut } from '@/composables'

// 简化版：直接注册快捷键
useShortcut('ctrl+s', () => {
  console.log('保存')
  return false
}, {
  description: '保存',
  category: 'general'
})

// 多个快捷键
useShortcut(['ctrl+s', 'command+s'], () => {
  console.log('保存')
  return false
})
</script>
```

### 4. 显示快捷键帮助

```vue
<template>
  <ShortcutHelp ref="shortcutHelpRef" />
  
  <el-button @click="showHelp">
    显示快捷键帮助
  </el-button>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ShortcutHelp } from '@/components/ShortcutHelp'

const shortcutHelpRef = ref()

function showHelp() {
  shortcutHelpRef.value?.show()
}
</script>
```

### 5. 监听全局快捷键事件

全局快捷键会触发自定义事件：

```typescript
// 监听保存事件
window.addEventListener('shortcut-save', () => {
  console.log('保存')
})

// 监听关闭事件
window.addEventListener('shortcut-escape', () => {
  console.log('关闭')
})

// 监听搜索事件
window.addEventListener('shortcut-search', () => {
  console.log('搜索')
})
```

## API 文档

### KeyboardShortcutManager

#### 方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| register | id: string, config: ShortcutConfig | void | 注册快捷键 |
| unregister | id: string | void | 注销快捷键 |
| enable | id: string | void | 启用快捷键 |
| disable | id: string | void | 禁用快捷键 |
| getAll | - | Map<string, ShortcutConfig> | 获取所有快捷键 |
| getByCategory | category: string | ShortcutConfig[] | 按分类获取快捷键 |
| clear | - | void | 清空所有快捷键 |
| reset | - | void | 重置 mousetrap |

### ShortcutConfig

```typescript
interface ShortcutConfig {
  /** 快捷键组合 */
  keys: string | string[]
  /** 描述 */
  description: string
  /** 回调函数 */
  callback: (e: KeyboardEvent) => void | boolean
  /** 分类 */
  category?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 作用域 */
  scope?: 'global' | 'input' | 'textarea'
}
```

### ShortcutCategory

```typescript
const ShortcutCategory = {
  GENERAL: 'general',      // 通用
  NAVIGATION: 'navigation', // 导航
  EDIT: 'edit',            // 编辑
  VIEW: 'view',            // 视图
  OTHER: 'other'           // 其他
}
```

### useKeyboardShortcut

```typescript
const {
  register,      // 注册快捷键
  unregister,    // 注销快捷键
  enable,        // 启用快捷键
  disable,       // 禁用快捷键
  getAll,        // 获取所有快捷键
  getByCategory  // 按分类获取快捷键
} = useKeyboardShortcut()
```

### useShortcut

```typescript
useShortcut(
  keys: string | string[],
  callback: (e: KeyboardEvent) => void | boolean,
  options?: {
    description?: string
    category?: string
    disabled?: boolean
  }
)
```

## 快捷键格式

### 1. 单个按键

```typescript
'a'        // 字母 a
'1'        // 数字 1
'enter'    // 回车
'esc'      // Esc
'space'    // 空格
```

### 2. 组合键

```typescript
'ctrl+s'         // Ctrl + S
'command+s'      // Cmd + S (Mac)
'shift+a'        // Shift + A
'alt+left'       // Alt + 左箭头
'ctrl+shift+p'   // Ctrl + Shift + P
```

### 3. 多个快捷键

```typescript
['ctrl+s', 'command+s']  // Ctrl+S 或 Cmd+S
```

### 4. 特殊键

```typescript
'mod+s'    // Ctrl+S (Windows/Linux) 或 Cmd+S (Mac)
'up'       // 上箭头
'down'     // 下箭头
'left'     // 左箭头
'right'    // 右箭头
'f1-f12'   // 功能键
```

## 最佳实践

### 1. 快捷键命名

使用有意义的 ID：

```typescript
register('page-save', { ... })        // 页面保存
register('dialog-close', { ... })     // 对话框关闭
register('table-refresh', { ... })    // 表格刷新
```

### 2. 快捷键分类

合理使用分类：

```typescript
register('save', {
  keys: 'ctrl+s',
  description: '保存',
  category: ShortcutCategory.GENERAL  // 通用类
})

register('go-back', {
  keys: 'alt+left',
  description: '后退',
  category: ShortcutCategory.NAVIGATION  // 导航类
})
```

### 3. 阻止默认行为

返回 `false` 阻止默认行为：

```typescript
register('save', {
  keys: 'ctrl+s',
  description: '保存',
  callback: () => {
    save()
    return false  // 阻止浏览器的保存对话框
  }
})
```

### 4. 作用域控制

控制快捷键的作用范围：

```typescript
register('submit', {
  keys: 'enter',
  description: '提交',
  scope: 'input',  // 只在输入框中生效
  callback: () => {
    submit()
    return false
  }
})
```

### 5. 组件卸载清理

使用 `useKeyboardShortcut` 会自动清理：

```typescript
// 推荐：使用 composable
const { register } = useKeyboardShortcut()
register('my-shortcut', { ... })
// 组件卸载时自动注销

// 不推荐：直接使用管理器
keyboardShortcutManager.register('my-shortcut', { ... })
// 需要手动注销
```

## 注意事项

1. **快捷键冲突**：避免与浏览器或系统快捷键冲突
2. **跨平台**：使用 `mod` 代替 `ctrl` 或 `command`
3. **用户体验**：提供快捷键帮助，让用户知道有哪些快捷键
4. **禁用状态**：在某些场景下禁用快捷键（如模态框打开时）
5. **清理资源**：组件卸载时注销快捷键

## 示例页面

完整的示例页面位于 `src/views/examples/KeyboardShortcutExample.vue`，包含：
- 全局快捷键列表
- 页面级快捷键演示
- 快捷键管理功能
- 快捷键帮助对话框
- 代码示例

## 验证的需求

- ✅ **需求 15.4**：键盘快捷键（全局快捷键、快捷键帮助）

---

**更新时间**：2025-12-23
**版本**：1.0.0
