# useTableFilter - 表格过滤器 URL 同步

## 概述

`useTableFilter` 是一个用于将表格过滤条件同步到 URL 参数的 composable。它可以让用户通过 URL 分享过滤后的表格状态，并在刷新页面后自动恢复过滤条件。

## 核心功能

- ✅ 自动监听过滤器变化，更新 URL 参数
- ✅ 从 URL 参数自动恢复过滤器状态
- ✅ 支持多种数据类型（字符串、数字、数组、日期、对象）
- ✅ 支持防抖更新，避免频繁修改 URL
- ✅ 支持排除敏感字段（如密码、token）
- ✅ 支持自定义序列化/反序列化
- ✅ 支持清空过滤器和 URL 参数

## 快速开始

```vue
<template>
  <div>
    <el-input v-model="filters.keyword" placeholder="关键词" />
    <el-select v-model="filters.status" placeholder="状态" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTableFilter } from '@/composables'

const filters = ref({
  keyword: '',
  status: 0
})

// 使用过滤器 URL 同步
useTableFilter(filters, {
  debounce: true,
  debounceDelay: 500
})
</script>
```

## 配置选项

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `debounce` | `boolean` | `false` | 是否启用防抖 |
| `debounceDelay` | `number` | `300` | 防抖延迟（毫秒） |
| `autoRestore` | `boolean` | `true` | 是否自动恢复过滤器 |
| `autoSync` | `boolean` | `true` | 是否自动同步到 URL |
| `serialize` | `function` | - | 自定义序列化函数 |
| `deserialize` | `function` | - | 自定义反序列化函数 |
| `exclude` | `string[]` | - | 排除的字段 |

## 返回值

| 方法 | 说明 |
|------|------|
| `syncToUrl()` | 手动同步过滤器到 URL |
| `restoreFromUrl()` | 手动从 URL 恢复过滤器 |
| `clearFilters(defaultValues?)` | 清空过滤器和 URL 参数 |

## 使用场景

1. **分享过滤状态** - 用户可以通过 URL 分享当前的过滤条件
2. **书签保存** - 用户可以将过滤后的页面添加到书签
3. **刷新保持** - 刷新页面后过滤条件不会丢失
4. **浏览器导航** - 支持浏览器的前进和后退按钮

## 示例

完整示例请参考：`src/views/examples/TableFilterExample.vue`

## 注意事项

1. 过滤器对象必须是响应式的（使用 `ref` 或 `reactive`）
2. URL 参数会自动编码，支持中文等特殊字符
3. 建议启用防抖，避免频繁修改 URL
4. 敏感信息应该使用 `exclude` 排除
5. 复杂对象会被 JSON 序列化，可能导致 URL 过长
