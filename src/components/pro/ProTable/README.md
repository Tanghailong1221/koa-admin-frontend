# ProTable 组件

ProTable 是一个功能强大的表格组件，基于 Element Plus Table 封装，提供了开箱即用的分页、排序、过滤、列配置等功能。

## 功能特性

- ✅ 自动分页
- ✅ 排序支持
- ✅ 过滤支持
- ✅ 列配置（显示/隐藏）
- ✅ 工具栏（刷新、列设置、导出）
- ✅ 加载状态
- ✅ 行选择
- ✅ 自定义渲染
- ✅ 插槽支持
- ✅ TypeScript 类型支持

## 基础用法

### 静态数据

```vue
<template>
  <ProTable
    :columns="columns"
    :data-source="dataSource"
  />
</template>

<script setup lang="ts">
import { ProTable } from '@/components/pro'
import type { ProTableColumn } from '@/components/pro'

interface User {
  id: number
  name: string
  age: number
  email: string
}

const columns: ProTableColumn<User>[] = [
  { prop: 'id', label: 'ID', width: 80 },
  { prop: 'name', label: '姓名', minWidth: 120 },
  { prop: 'age', label: '年龄', width: 100, sortable: true },
  { prop: 'email', label: '邮箱', minWidth: 200 }
]

const dataSource: User[] = [
  { id: 1, name: '张三', age: 25, email: 'zhangsan@example.com' },
  { id: 2, name: '李四', age: 30, email: 'lisi@example.com' }
]
</script>
```

### 远程数据

```vue
<template>
  <ProTable
    :columns="columns"
    :request="loadData"
  />
</template>

<script setup lang="ts">
import { ProTable } from '@/components/pro'
import type { ProTableColumn, ProTableRequest } from '@/components/pro'
import { getUserList } from '@/api/user'

interface User {
  id: number
  name: string
  age: number
  email: string
}

const columns: ProTableColumn<User>[] = [
  { prop: 'id', label: 'ID', width: 80 },
  { prop: 'name', label: '姓名', minWidth: 120 },
  { prop: 'age', label: '年龄', width: 100, sortable: true },
  { prop: 'email', label: '邮箱', minWidth: 200 }
]

const loadData: ProTableRequest<User> = async (params) => {
  const response = await getUserList(params)
  return {
    data: response.data,
    total: response.total
  }
}
</script>
```

## 高级用法

### 自定义列渲染

```vue
<template>
  <ProTable
    :columns="columns"
    :request="loadData"
  >
    <!-- 使用插槽 -->
    <template #status="{ row }">
      <el-tag :type="row.status === 1 ? 'success' : 'danger'">
        {{ row.status === 1 ? '启用' : '禁用' }}
      </el-tag>
    </template>

    <!-- 操作列 -->
    <template #actions="{ row }">
      <el-button type="primary" size="small" @click="handleEdit(row)">
        编辑
      </el-button>
      <el-button type="danger" size="small" @click="handleDelete(row)">
        删除
      </el-button>
    </template>
  </ProTable>
</template>

<script setup lang="ts">
import { h } from 'vue'
import { ElTag, ElButton } from 'element-plus'
import { ProTable } from '@/components/pro'
import type { ProTableColumn } from '@/components/pro'

interface User {
  id: number
  name: string
  status: 0 | 1
}

const columns: ProTableColumn<User>[] = [
  { prop: 'id', label: 'ID', width: 80 },
  { prop: 'name', label: '姓名', minWidth: 120 },
  {
    prop: 'status',
    label: '状态',
    width: 100,
    slotName: 'status' // 使用插槽
  },
  {
    prop: 'actions',
    label: '操作',
    width: 200,
    slotName: 'actions'
  }
]

// 或者使用 render 函数
const columnsWithRender: ProTableColumn<User>[] = [
  { prop: 'id', label: 'ID', width: 80 },
  { prop: 'name', label: '姓名', minWidth: 120 },
  {
    prop: 'status',
    label: '状态',
    width: 100,
    render: (row) => {
      return h(
        ElTag,
        { type: row.status === 1 ? 'success' : 'danger' },
        () => row.status === 1 ? '启用' : '禁用'
      )
    }
  }
]
</script>
```

### 工具栏自定义

```vue
<template>
  <ProTable
    :columns="columns"
    :request="loadData"
    :toolbar="{
      refresh: true,
      columnSetting: true,
      export: true
    }"
    @refresh="handleRefresh"
    @export="handleExport"
  >
    <!-- 工具栏左侧 -->
    <template #toolbar-left>
      <el-button type="primary" @click="handleAdd">
        新增用户
      </el-button>
      <el-button @click="handleBatchDelete">
        批量删除
      </el-button>
    </template>

    <!-- 工具栏右侧 -->
    <template #toolbar-right>
      <el-input
        v-model="searchText"
        placeholder="搜索用户"
        style="width: 200px"
        clearable
      />
    </template>
  </ProTable>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ProTable } from '@/components/pro'

const searchText = ref('')

const handleRefresh = () => {
  console.log('刷新表格')
}

const handleExport = () => {
  console.log('导出数据')
}

const handleAdd = () => {
  console.log('新增用户')
}

const handleBatchDelete = () => {
  console.log('批量删除')
}
</script>
```

### 行选择

```vue
<template>
  <ProTable
    ref="tableRef"
    :columns="columns"
    :request="loadData"
    selectable
    @selection-change="handleSelectionChange"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ProTable } from '@/components/pro'
import type { ProTableInstance } from '@/components/pro'

interface User {
  id: number
  name: string
}

const tableRef = ref<ProTableInstance<User>>()

const handleSelectionChange = (selection: User[]) => {
  console.log('选中的行:', selection)
}

// 获取选中的行
const getSelection = () => {
  const selection = tableRef.value?.getSelection()
  console.log(selection)
}

// 清空选中
const clearSelection = () => {
  tableRef.value?.clearSelection()
}

// 设置选中的行
const setSelection = (rows: User[]) => {
  tableRef.value?.setSelection(rows)
}
</script>
```

### 列配置持久化

```vue
<template>
  <ProTable
    :columns="columns"
    :request="loadData"
  />
</template>

<script setup lang="ts">
import { ProTable } from '@/components/pro'
import type { ProTableColumn } from '@/components/pro'

interface User {
  id: number
  name: string
  age: number
  email: string
}

const columns: ProTableColumn<User>[] = [
  { prop: 'id', label: 'ID', width: 80, hideable: false }, // 不可隐藏
  { prop: 'name', label: '姓名', minWidth: 120 },
  { prop: 'age', label: '年龄', width: 100, visible: true }, // 默认显示
  { prop: 'email', label: '邮箱', minWidth: 200, visible: false } // 默认隐藏
]
</script>
```

## API

### Props

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| columns | 列配置 | `ProTableColumn[]` | `[]` |
| request | 请求函数 | `ProTableRequest` | - |
| dataSource | 静态数据源 | `T[]` | - |
| pagination | 分页配置 | `boolean \| ProTablePagination` | `true` |
| toolbar | 工具栏配置 | `boolean \| ProTableToolbar` | `true` |
| border | 是否显示边框 | `boolean` | `true` |
| stripe | 是否显示斑马纹 | `boolean` | `false` |
| size | 表格大小 | `'large' \| 'default' \| 'small'` | `'default'` |
| loading | 是否显示加载状态 | `boolean` | `false` |
| rowKey | 行的唯一标识字段 | `string` | `'id'` |
| selectable | 是否可选择行 | `boolean` | `false` |
| emptyText | 空数据文本 | `string` | `'暂无数据'` |
| height | 表格高度 | `string \| number` | - |
| maxHeight | 表格最大高度 | `string \| number` | - |

### ProTableColumn

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| prop | 列的唯一标识 | `string` | - |
| label | 列标题 | `string` | - |
| width | 列宽度 | `string \| number` | - |
| minWidth | 最小列宽 | `string \| number` | - |
| fixed | 是否固定列 | `boolean \| 'left' \| 'right'` | - |
| sortable | 是否可排序 | `boolean \| 'custom'` | - |
| filterable | 是否可过滤 | `boolean` | - |
| align | 对齐方式 | `'left' \| 'center' \| 'right'` | `'left'` |
| visible | 是否显示 | `boolean` | `true` |
| render | 自定义渲染函数 | `(row, column, index) => any` | - |
| formatter | 格式化函数 | `(row, column, cellValue, index) => any` | - |
| slotName | 插槽名称 | `string` | - |
| hideable | 是否可隐藏 | `boolean` | `true` |

### ProTablePagination

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| page | 当前页码 | `number` | `1` |
| pageSize | 每页条数 | `number` | `10` |
| total | 总条数 | `number` | `0` |
| pageSizes | 每页条数选项 | `number[]` | `[10, 20, 50, 100]` |
| layout | 分页布局 | `string` | `'total, sizes, prev, pager, next, jumper'` |

### ProTableToolbar

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| refresh | 是否显示刷新按钮 | `boolean` | `true` |
| columnSetting | 是否显示列设置 | `boolean` | `true` |
| export | 是否显示导出按钮 | `boolean` | `false` |
| actions | 自定义操作插槽 | `boolean` | `false` |

### Events

| 事件名 | 说明 | 参数 |
|--------|------|------|
| selection-change | 选择变化 | `(selection: T[])` |
| sort-change | 排序变化 | `(sort: ProTableSort)` |
| filter-change | 过滤变化 | `(filters: Record<string, any>)` |
| row-click | 行点击 | `(row: T, column: any, event: Event)` |
| refresh | 刷新 | - |
| export | 导出 | - |

### Slots

| 插槽名 | 说明 | 参数 |
|--------|------|------|
| toolbar-left | 工具栏左侧 | - |
| toolbar-right | 工具栏右侧 | - |
| [column.slotName] | 列自定义内容 | `{ row, column, index }` |

### Methods

| 方法名 | 说明 | 参数 | 返回值 |
|--------|------|------|--------|
| refresh | 刷新表格 | - | `Promise<void>` |
| reset | 重置表格（回到第一页） | - | `Promise<void>` |
| getSelection | 获取选中的行 | - | `T[]` |
| clearSelection | 清空选中 | - | - |
| setSelection | 设置选中的行 | `(rows: T[])` | - |
| getData | 获取表格数据 | - | `T[]` |
| setLoading | 设置加载状态 | `(loading: boolean)` | - |

## 注意事项

1. **request 和 dataSource 二选一**：如果同时提供，优先使用 `dataSource`
2. **列配置**：`slotName` 和 `render` 二选一，优先使用 `slotName`
3. **分页**：使用 `request` 时会自动分页，使用 `dataSource` 时需要手动分页
4. **排序和过滤**：使用 `request` 时会自动发送请求，使用 `dataSource` 时需要手动处理
5. **列设置**：列的显示/隐藏状态不会自动持久化，需要配合 `useTableColumns` composable 使用

## 最佳实践

### 1. 使用 TypeScript

```typescript
import type { ProTableColumn, ProTableRequest } from '@/components/pro'

interface User {
  id: number
  name: string
  age: number
}

const columns: ProTableColumn<User>[] = [
  // ...
]

const loadData: ProTableRequest<User> = async (params) => {
  // ...
}
```

### 2. 封装 API 请求

```typescript
// api/user.ts
export const getUserList = async (params: ProTableRequestParams) => {
  const response = await request.get('/api/users', { params })
  return {
    data: response.data.list,
    total: response.data.total
  }
}

// 组件中使用
const loadData: ProTableRequest<User> = getUserList
```

### 3. 使用 ref 访问实例方法

```vue
<script setup lang="ts">
import { ref } from 'vue'
import type { ProTableInstance } from '@/components/pro'

const tableRef = ref<ProTableInstance<User>>()

const handleRefresh = () => {
  tableRef.value?.refresh()
}
</script>
```

## 示例

完整示例请参考：
- `src/views/examples/ProTableExample.vue`
