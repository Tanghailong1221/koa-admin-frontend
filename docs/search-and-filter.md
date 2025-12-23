# 搜索和过滤功能文档

## 概述

搜索和过滤系统提供了完整的数据搜索和过滤功能，包括基础搜索、高级过滤、保存搜索等。

## 功能特性

### 1. 基础搜索

- ✅ 搜索输入框
- ✅ 防抖处理
- ✅ 清空按钮
- ✅ 搜索按钮（可选）
- ✅ 最小搜索长度
- ✅ 结果高亮

### 2. 高级过滤

- ✅ 多条件过滤
- ✅ AND/OR 逻辑
- ✅ 过滤器构建器
- ✅ 多种操作符（等于、不等于、大于、小于、包含等）
- ✅ 多种字段类型（字符串、数字、日期、布尔、选择）

### 3. 保存搜索

- ✅ 保存过滤配置
- ✅ 快速应用
- ✅ 管理已保存搜索
- ✅ 本地存储

### 4. URL 搜索参数

- ✅ 解析 URL 参数
- ✅ 应用搜索条件
- ✅ 更新 URL

## 使用方法

### 1. 基础搜索

```vue
<template>
  <Search
    v-model="searchKeyword"
    :config="searchConfig"
    @search="handleSearch"
    @clear="handleClear"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Search } from '@/components/Search'

const searchKeyword = ref('')

const searchConfig = {
  placeholder: '搜索...',
  debounce: 300,
  clearable: true
}
</script>
```

### 2. 高级过滤

```vue
<template>
  <FilterBuilder
    v-model="filterConditions"
    v-model:filter-logic="filterLogic"
    :fields="fieldConfigs"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { FilterBuilder, FilterLogic } from '@/components/Search'

const filterConditions = ref([])
const filterLogic = ref(FilterLogic.AND)

const fieldConfigs = [
  { field: 'name', label: '名称', type: 'string' },
  { field: 'age', label: '年龄', type: 'number' }
]
</script>
```

### 3. 应用过滤

```typescript
import { applyFilter } from '@/utils/filter-utils'

const filteredData = applyFilter(data, filterGroup)
```

### 4. 高亮文本

```typescript
import { highlightText } from '@/utils/filter-utils'

const highlighted = highlightText('Hello World', 'World')
// 结果: 'Hello <mark>World</mark>'
```

## 验证的需求

- ✅ **需求 20.1**：搜索组件（搜索输入框、防抖处理）
- ✅ **需求 20.2**：高级过滤（多条件过滤、AND/OR 逻辑）
- ✅ **需求 20.3**：结果高亮
- ✅ **需求 20.4**：保存搜索
- ✅ **需求 20.5**：URL 搜索参数

---

**更新时间**：2025-12-23
**版本**：1.0.0
