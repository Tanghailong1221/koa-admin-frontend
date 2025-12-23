# ProTable 虚拟滚动

## 概述

ProTableVirtual 是 ProTable 的虚拟滚动版本，专门用于处理大数据集（10000+ 行）。通过只渲染可见区域的行，大幅提升性能。

## 功能特性

- ✅ 虚拟滚动（只渲染可见行）
- ✅ 支持大数据集（10000+ 行）
- ✅ 流畅的滚动体验
- ✅ 行选择功能
- ✅ 列配置
- ✅ 工具栏
- ✅ 分页支持
- ✅ 自定义渲染

## 性能对比

| 数据量 | 普通表格 | 虚拟滚动表格 |
|--------|----------|--------------|
| 100 行 | 流畅 | 流畅 |
| 1000 行 | 卡顿 | 流畅 |
| 10000 行 | 严重卡顿 | 流畅 |
| 100000 行 | 无法渲染 | 流畅 |

## 基础用法

```vue
<template>
  <pro-table-virtual
    :columns="columns"
    :data="data"
    height="600px"
    :item-height="50"
    :keeps="30"
  />
</template>

<script setup lang="ts">
import ProTableVirtual from '@/components/pro/ProTable/ProTableVirtual.vue'

const columns = [
  { prop: 'id', label: 'ID', width: '80px' },
  { prop: 'name', label: '姓名', width: '120px' },
  { prop: 'email', label: '邮箱', width: '200px' },
  { prop: 'phone', label: '电话', width: '150px' }
]

// 生成大量数据
const data = Array.from({ length: 10000 }, (_, i) => ({
  id: i + 1,
  name: `用户${i + 1}`,
  email: `user${i + 1}@example.com`,
  phone: `138${String(i).padStart(8, '0')}`
}))
</script>
```

## Props

### columns
- 类型: `ProTableColumn[]`
- 必填: 是
- 说明: 列配置

```typescript
interface ProTableColumn {
  prop: string          // 字段名
  label: string         // 列标题
  width?: string        // 列宽度
  minWidth?: string     // 最小宽度
  visible?: boolean     // 是否可见
  render?: (row: any) => VNode | string  // 自定义渲染
}
```

### data
- 类型: `any[]`
- 默认值: `[]`
- 说明: 表格数据

### request
- 类型: `(params: any) => Promise<{ data: any[]; total: number }>`
- 说明: 异步加载数据的函数

### rowKey
- 类型: `string`
- 默认值: `'id'`
- 说明: 行数据的唯一标识字段

### height
- 类型: `string`
- 默认值: `'600px'`
- 说明: 表格高度（必须设置固定高度）

### itemHeight
- 类型: `number`
- 默认值: `50`
- 说明: 每行的高度（像素）

### keeps
- 类型: `number`
- 默认值: `30`
- 说明: 渲染的行数（建议设置为可见行数的 2-3 倍）

### pagination
- 类型: `boolean`
- 默认值: `true`
- 说明: 是否显示分页

### selection
- 类型: `boolean`
- 默认值: `false`
- 说明: 是否显示选择列

### toolbar
- 类型: `boolean`
- 默认值: `true`
- 说明: 是否显示工具栏

### showRefresh
- 类型: `boolean`
- 默认值: `true`
- 说明: 是否显示刷新按钮

### showColumnSetting
- 类型: `boolean`
- 默认值: `true`
- 说明: 是否显示列设置按钮

## Events

### refresh
- 说明: 点击刷新按钮时触发
- 参数: 无

### selectionChange
- 说明: 选择项变化时触发
- 参数: `selection: any[]` - 选中的行数据

## Methods

### refresh()
- 说明: 刷新表格数据
- 返回值: `Promise<void>`

```typescript
const tableRef = ref()

// 刷新数据
tableRef.value.refresh()
```

### getSelectedRows()
- 说明: 获取选中的行
- 返回值: `any[]`

```typescript
const selected = tableRef.value.getSelectedRows()
console.log('选中的行:', selected)
```

### clearSelection()
- 说明: 清空选择
- 返回值: `void`

```typescript
tableRef.value.clearSelection()
```

## 示例

### 基础表格

```vue
<template>
  <pro-table-virtual
    :columns="columns"
    :data="data"
    height="600px"
  />
</template>

<script setup lang="ts">
const columns = [
  { prop: 'id', label: 'ID', width: '80px' },
  { prop: 'name', label: '姓名', width: '120px' },
  { prop: 'age', label: '年龄', width: '80px' },
  { prop: 'address', label: '地址', minWidth: '200px' }
]

const data = Array.from({ length: 10000 }, (_, i) => ({
  id: i + 1,
  name: `用户${i + 1}`,
  age: 20 + (i % 50),
  address: `地址${i + 1}`
}))
</script>
```

### 带选择功能

```vue
<template>
  <pro-table-virtual
    ref="tableRef"
    :columns="columns"
    :data="data"
    selection
    @selection-change="handleSelectionChange"
  />
  
  <div style="margin-top: 16px">
    <el-button @click="getSelection">获取选中</el-button>
    <el-button @click="clearSelection">清空选择</el-button>
  </div>
</template>

<script setup lang="ts">
const tableRef = ref()

const handleSelectionChange = (selection: any[]) => {
  console.log('选中的行:', selection)
}

const getSelection = () => {
  const selected = tableRef.value.getSelectedRows()
  ElMessage.success(`已选中 ${selected.length} 行`)
}

const clearSelection = () => {
  tableRef.value.clearSelection()
}
</script>
```

### 自定义渲染

```vue
<template>
  <pro-table-virtual
    :columns="columns"
    :data="data"
  />
</template>

<script setup lang="ts">
import { h } from 'vue'
import { ElTag } from 'element-plus'

const columns = [
  { prop: 'id', label: 'ID', width: '80px' },
  { prop: 'name', label: '姓名', width: '120px' },
  {
    prop: 'status',
    label: '状态',
    width: '100px',
    render: (row: any) => {
      const type = row.status === 1 ? 'success' : 'danger'
      const text = row.status === 1 ? '启用' : '禁用'
      return h(ElTag, { type }, () => text)
    }
  }
]

const data = Array.from({ length: 10000 }, (_, i) => ({
  id: i + 1,
  name: `用户${i + 1}`,
  status: i % 2
}))
</script>
```

### 异步加载

```vue
<template>
  <pro-table-virtual
    :columns="columns"
    :request="loadData"
    pagination
  />
</template>

<script setup lang="ts">
const columns = [
  { prop: 'id', label: 'ID', width: '80px' },
  { prop: 'name', label: '姓名', width: '120px' }
]

const loadData = async (params: any) => {
  // 模拟 API 请求
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const { page, pageSize } = params
  const start = (page - 1) * pageSize
  const data = Array.from({ length: pageSize }, (_, i) => ({
    id: start + i + 1,
    name: `用户${start + i + 1}`
  }))
  
  return {
    data,
    total: 10000
  }
}
</script>
```

## 性能优化建议

### 1. 合理设置 keeps

```typescript
// 计算公式：keeps = Math.ceil(容器高度 / 行高) * 2
const containerHeight = 600  // 容器高度
const itemHeight = 50        // 行高
const keeps = Math.ceil(containerHeight / itemHeight) * 2  // 24
```

### 2. 固定行高

```vue
<!-- 所有行使用相同高度 -->
<pro-table-virtual
  :item-height="50"
  :keeps="30"
/>
```

### 3. 避免复杂渲染

```typescript
// ❌ 不好 - 复杂的渲染逻辑
render: (row) => {
  return h('div', [
    h('img', { src: row.avatar }),
    h('span', row.name),
    h('button', { onClick: () => handleClick(row) }, '操作')
  ])
}

// ✅ 好 - 简单的渲染
render: (row) => row.name
```

### 4. 使用分页

```vue
<!-- 即使是虚拟滚动，也建议使用分页 -->
<pro-table-virtual
  :request="loadData"
  pagination
  :page-size="100"
/>
```

## 注意事项

### 1. 必须设置固定高度

```vue
<!-- ❌ 错误 - 没有设置高度 -->
<pro-table-virtual :columns="columns" :data="data" />

<!-- ✅ 正确 - 设置固定高度 -->
<pro-table-virtual
  :columns="columns"
  :data="data"
  height="600px"
/>
```

### 2. 行高必须一致

虚拟滚动要求所有行的高度一致，不支持动态行高。

### 3. 性能权衡

虚拟滚动适合大数据集，但对于小数据集（< 1000 行），普通表格可能更简单。

### 4. 功能限制

相比普通表格，虚拟滚动表格有一些功能限制：
- 不支持树形数据
- 不支持合并单元格
- 不支持动态行高
- 不支持展开行

## 常见问题

### Q1: 为什么滚动时有闪烁？

**A**: 可能是 `keeps` 设置太小。增加 `keeps` 的值：

```vue
<pro-table-virtual
  :keeps="50"  <!-- 增加渲染的行数 -->
/>
```

### Q2: 如何处理不同高度的行？

**A**: 虚拟滚动不支持动态行高。如果需要不同高度，建议使用普通表格。

### Q3: 性能还是不够好怎么办？

**A**: 
1. 减少列数
2. 简化渲染逻辑
3. 使用分页
4. 增加 `itemHeight`

### Q4: 如何实现无限滚动？

**A**: 监听滚动事件，到达底部时加载更多数据：

```vue
<template>
  <pro-table-virtual
    ref="tableRef"
    :data="data"
    @scroll="handleScroll"
  />
</template>

<script setup lang="ts">
const handleScroll = (event: any) => {
  const { scrollTop, scrollHeight, clientHeight } = event.target
  if (scrollTop + clientHeight >= scrollHeight - 100) {
    loadMore()
  }
}

const loadMore = () => {
  // 加载更多数据
}
</script>
```

## 相关资源

- [vue-virtual-scroll-list](https://github.com/tangbc/vue-virtual-scroll-list)
- [ProTable 文档](./pro-table.md)
- [性能优化指南](./performance-optimization.md)
