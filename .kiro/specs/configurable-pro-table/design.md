# Design Document: Configurable ProTable Component

## Overview

本设计文档描述了一个完全可配置的 ProTable 组件的架构和实现方案。该组件基于 Element Plus 的 el-table 和 el-card 封装，提供高度灵活的配置能力，支持卡片头部、工具栏、表格列、操作列、分页等所有元素的自定义配置。

### 核心设计原则

1. **配置优先**: 所有功能都可通过 props 配置开启/关闭
2. **插槽扩展**: 关键区域提供插槽支持自定义渲染
3. **方法暴露**: 提供完整的实例方法供外部调用
4. **类型安全**: 完整的 TypeScript 类型定义
5. **向后兼容**: 保持与现有 ProTable 的 API 兼容性

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        ProTable Component                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Card Header                           │   │
│  │  [Title] [Description]              [Header Extra Slot]  │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                      Toolbar                             │   │
│  │  [Left Slot/Buttons]    [Right Slot] [Refresh][Col][Export]│ │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                     el-table                             │   │
│  │  [Selection] [Columns...] [Action Column]                │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Pagination                            │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Column Setting Dialog                       │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 主要组件结构

```
src/components/pro/ProTable/
├── ProTablePlus.vue          # 主组件
├── components/
│   ├── TableToolbar.vue      # 工具栏组件
│   ├── TableColumn.vue       # 列渲染组件
│   ├── ActionColumn.vue      # 操作列组件
│   ├── ColumnSetting.vue     # 列设置对话框
│   └── ExportDropdown.vue    # 导出下拉菜单
├── composables/
│   ├── useTableData.ts       # 数据加载逻辑
│   ├── useTableColumns.ts    # 列管理逻辑
│   ├── useTableSelection.ts  # 选择逻辑
│   └── useTableExport.ts     # 导出逻辑
├── types.ts                  # 类型定义
└── index.ts                  # 导出入口
```

### 核心接口定义

```typescript
// 卡片配置
interface ProTableCardConfig {
  show?: boolean
  title?: string
  description?: string
  shadow?: 'always' | 'hover' | 'never'
  bodyStyle?: CSSProperties
}

// 工具栏配置
interface ProTableToolbarConfig {
  show?: boolean
  showRefresh?: boolean
  showColumnSetting?: boolean
  showExportAll?: boolean
  showExportPage?: boolean
  buttons?: ToolbarButton[]
}

// 工具栏按钮
interface ToolbarButton {
  key: string
  label: string
  icon?: Component
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  disabled?: boolean | ((selection: any[]) => boolean)
  show?: boolean | ((selection: any[]) => boolean)
  onClick?: (selection: any[]) => void
}

// 列配置（扩展）
interface ProTableColumnPlus<T = any> {
  prop: string
  label: string
  width?: string | number
  minWidth?: string | number
  fixed?: boolean | 'left' | 'right'
  sortable?: boolean | 'custom'
  filterable?: boolean
  filters?: { text: string; value: any }[]
  align?: 'left' | 'center' | 'right'
  visible?: boolean
  hideable?: boolean
  order?: number
  slotName?: string
  render?: (row: T, column: ProTableColumnPlus<T>, index: number) => VNode
  formatter?: (row: T, column: any, cellValue: any, index: number) => string
  children?: ProTableColumnPlus<T>[]
}

// 操作列配置
interface ProTableActionColumn {
  show?: boolean
  label?: string
  width?: string | number
  fixed?: boolean | 'left' | 'right'
  buttons?: ActionButton[]
}

// 操作按钮
interface ActionButton {
  key: string
  label: string
  icon?: Component
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  link?: boolean
  show?: boolean | ((row: any, index: number) => boolean)
  disabled?: boolean | ((row: any, index: number) => boolean)
  confirm?: string | ((row: any) => string)
  onClick?: (row: any, index: number) => void
}

// 导出配置
interface ProTableExportConfig {
  filename?: string
  formats?: ('csv' | 'excel' | 'json')[]
  onExportAll?: (data: any[], format: string) => void
  onExportPage?: (data: any[], format: string) => void
}

// 选择配置
interface ProTableSelectionConfig {
  type?: 'checkbox' | 'radio'
  selectable?: (row: any, index: number) => boolean
  reserveSelection?: boolean
}

// 分页配置
interface ProTablePaginationConfig {
  show?: boolean
  page?: number
  pageSize?: number
  total?: number
  pageSizes?: number[]
  layout?: string
  background?: boolean
}

// 主组件 Props
interface ProTablePlusProps<T = any> {
  // 数据相关
  dataSource?: T[]
  request?: ProTableRequest<T>
  rowKey?: string | ((row: T) => string)
  
  // 卡片配置
  card?: boolean | ProTableCardConfig
  
  // 工具栏配置
  toolbar?: boolean | ProTableToolbarConfig
  
  // 列配置
  columns: ProTableColumnPlus<T>[]
  
  // 操作列配置
  actionColumn?: ProTableActionColumn
  
  // 选择配置
  selection?: boolean | ProTableSelectionConfig
  
  // 分页配置
  pagination?: boolean | ProTablePaginationConfig
  
  // 导出配置
  export?: ProTableExportConfig
  
  // 列设置持久化
  persistColumnSettings?: boolean
  columnSettingsKey?: string
  
  // 表格属性
  border?: boolean
  stripe?: boolean
  size?: 'large' | 'default' | 'small'
  height?: string | number
  maxHeight?: string | number
  emptyText?: string
  loading?: boolean
}

// 实例方法
interface ProTablePlusInstance<T = any> {
  refresh: () => Promise<void>
  reset: () => Promise<void>
  getSelection: () => T[]
  clearSelection: () => void
  setSelection: (rows: T[]) => void
  getData: () => T[]
  setLoading: (loading: boolean) => void
  getTableRef: () => InstanceType<typeof ElTable> | undefined
  resetColumns: () => void
  setColumnVisible: (prop: string, visible: boolean) => void
}
```

## Data Models

### 内部状态管理

```typescript
// 表格内部状态
interface TableState<T> {
  data: T[]
  loading: boolean
  error: Error | null
  pagination: {
    page: number
    pageSize: number
    total: number
  }
  sort: {
    prop: string
    order: 'ascending' | 'descending' | null
  }
  filters: Record<string, any>
  selection: T[]
}

// 列状态
interface ColumnState {
  prop: string
  visible: boolean
  order: number
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Card Configuration Rendering
*For any* ProTable with card configuration (title, description, showCard), the rendered output SHALL correctly reflect the configuration - title and description appear when provided, card wrapper is absent when showCard is false.
**Validates: Requirements 1.1, 1.2, 1.5, 1.6**

### Property 2: Toolbar Button Visibility
*For any* toolbar configuration with showRefresh, showColumnSetting, showExportAll, showExportPage flags, the toolbar SHALL display exactly the buttons that are configured as true, and hide the entire toolbar when showToolbar is false.
**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.7**

### Property 3: Custom Toolbar Buttons Order
*For any* toolbarConfig.buttons array, the ProTable SHALL render the buttons in the exact order specified in the array.
**Validates: Requirements 2.8**

### Property 4: Column Configuration Application
*For any* column configuration with visible, hideable, sortable, filterable, and fixed properties, the el-table-column SHALL receive the correct corresponding attributes.
**Validates: Requirements 3.4, 3.5, 3.6, 3.7, 3.8**

### Property 5: Column Render Function Invocation
*For any* column with a render function, the function SHALL be called with (row, column, index) parameters and its return value SHALL be rendered in the cell.
**Validates: Requirements 3.2**

### Property 6: Column Formatter Application
*For any* column with a formatter function, the cell value SHALL be transformed by the formatter before display.
**Validates: Requirements 3.3**

### Property 7: Action Column Button Visibility
*For any* action button with show function, the button SHALL be visible only when show(row, index) returns true; for any button with disabled function, the button SHALL be disabled when disabled(row, index) returns true.
**Validates: Requirements 4.5, 4.6**

### Property 8: Action Column Buttons Rendering
*For any* actionColumn.buttons array, the ProTable SHALL render all specified buttons for each row with correct labels and handlers.
**Validates: Requirements 4.1, 4.2, 4.4**

### Property 9: Column Visibility Toggle
*For any* column toggle in the column setting dialog, the column visibility in the table SHALL immediately reflect the checkbox state.
**Validates: Requirements 5.2**

### Property 10: Column Settings Reset
*For any* column configuration, calling resetColumns SHALL restore all columns to their initial visible and order state.
**Validates: Requirements 5.4**

### Property 11: Column Settings Persistence
*For any* ProTable with persistColumnSettings=true, closing the column setting dialog SHALL save the current column state to localStorage, and reopening the table SHALL restore that state.
**Validates: Requirements 5.5**

### Property 12: Export Callback Invocation
*For any* export action, clicking export all SHALL invoke onExportAll with all data, and clicking export page SHALL invoke onExportPage with only current page data.
**Validates: Requirements 6.1, 6.2**

### Property 13: Selection State Management
*For any* row selection change, the selection-change event SHALL emit with the correct selected rows array; getSelection() SHALL return the same array; clearSelection() SHALL empty the selection.
**Validates: Requirements 7.2, 7.4, 7.5**

### Property 14: Conditional Row Selectability
*For any* row where selectionConfig.selectable(row, index) returns false, the selection checkbox SHALL be disabled.
**Validates: Requirements 7.3**

### Property 15: Data Source Rendering
*For any* dataSource array provided, the table SHALL display exactly those rows without calling the request function.
**Validates: Requirements 8.1**

### Property 16: Request Function Invocation
*For any* request function provided, it SHALL be called with correct pagination params (page, pageSize) and the response data SHALL be displayed.
**Validates: Requirements 8.2**

### Property 17: Pagination Visibility
*For any* pagination configuration, setting pagination=false SHALL hide the pagination component.
**Validates: Requirements 8.3**

### Property 18: Instance Methods Behavior
*For any* ProTable instance, refresh() SHALL reload current page, reset() SHALL go to page 1 and reload, getData() SHALL return current data array, setLoading(bool) SHALL update loading state.
**Validates: Requirements 9.1, 9.2, 9.3, 9.4**

### Property 19: Empty State Display
*For any* table with empty data array, the empty state SHALL be displayed with the configured emptyText.
**Validates: Requirements 10.1**

## Error Handling

### 数据加载错误
- 请求失败时显示错误状态，提供重试按钮
- 支持自定义错误插槽
- 错误信息通过 console.error 记录

### 配置错误
- 无效的列配置将被忽略并在控制台警告
- 缺少必需的 prop 时显示默认值

### 导出错误
- 导出失败时显示 ElMessage 错误提示
- 支持自定义错误处理回调

## Testing Strategy

### 单元测试
使用 Vitest 进行单元测试：
- 测试各个 composable 函数的逻辑
- 测试工具函数（导出、格式化等）

### 属性测试
使用 fast-check 进行属性测试：
- 测试配置渲染的正确性
- 测试数据流的一致性
- 测试状态管理的正确性

### 组件测试
使用 @vue/test-utils 进行组件测试：
- 测试插槽渲染
- 测试事件触发
- 测试实例方法

### 测试框架配置
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts']
  }
})
```

### 属性测试示例
```typescript
import * as fc from 'fast-check'
import { describe, it, expect } from 'vitest'

describe('ProTable Properties', () => {
  // Property 1: Card Configuration
  it('should render card title and description correctly', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        fc.string({ minLength: 1 }),
        (title, description) => {
          // Test implementation
        }
      ),
      { numRuns: 100 }
    )
  })
})
```
