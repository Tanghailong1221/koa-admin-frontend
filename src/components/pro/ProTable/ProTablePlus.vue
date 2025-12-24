<template>
  <div
    ref="containerRef"
    class="pro-table-plus-container"
    :class="{ 'is-fullscreen': isFullscreen }"
  >
    <component :is="showCard ? 'el-card' : 'div'" v-bind="cardProps" class="pro-table-plus">
      <!-- 卡片头部 - 只有当有标题或描述时才显示 -->
      <template v-if="showCard && showCardHeader" #header>
        <slot name="card-header">
          <div class="pro-table-plus__header">
            <div class="header-left">
              <div v-if="cardTitle" class="header-title">{{ cardTitle }}</div>
              <div v-if="cardDescription" class="header-description">{{ cardDescription }}</div>
            </div>
            <div class="header-right">
              <slot name="card-header-extra" />
            </div>
          </div>
        </slot>
      </template>

      <!-- 工具栏 -->
      <TableToolbar
        :config="toolbarConfig"
        :selection="selection"
        :is-fullscreen="isFullscreen"
        @refresh="handleRefresh"
        @column-setting="showColumnSettingDialog = true"
        @export-all="handleExportAll"
        @export-page="handleExportPage"
        @fullscreen="toggleFullscreen"
        @print="handlePrint"
      >
        <template #left>
          <slot name="toolbar-left" :selection="selection" />
        </template>
        <template #right>
          <slot name="toolbar-right" :selection="selection" />
        </template>
      </TableToolbar>

      <!-- 表格 -->
      <el-table
        ref="tableRef"
        v-loading="loadingState"
        :data="tableData"
        :border="border"
        :stripe="stripe"
        :size="size"
        :height="tableHeight"
        :max-height="computedMaxHeight"
        :row-key="rowKey"
        :empty-text="emptyText"
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
        @filter-change="handleFilterChange"
        @row-click="handleRowClick"
      >
        <!-- 选择列 -->
        <el-table-column
          v-if="showSelection"
          type="selection"
          width="55"
          fixed="left"
          :selectable="selectionSelectable"
        />

        <!-- 数据列 -->
        <template v-for="column in visibleColumns" :key="column.prop">
          <el-table-column
            :prop="column.prop"
            :label="column.label"
            :width="column.width"
            :min-width="column.minWidth"
            :fixed="column.fixed"
            :sortable="column.sortable"
            :filters="column.filters"
            :filter-method="column.filterable ? undefined : undefined"
            :align="column.align || 'left'"
          >
            <template #default="scope">
              <!-- 行内编辑 -->
              <InlineEditCell
                v-if="column.inlineEdit"
                :value="scope.row[column.prop]"
                :row="scope.row"
                :field="column.prop"
                :index="scope.$index"
                :config="column.inlineEdit"
                @save="(val) => handleInlineEditSave(scope.row, column.prop, val)"
              >
                <template v-if="column.slotName">
                  <slot
                    :name="column.slotName"
                    :row="scope.row"
                    :column="column"
                    :index="scope.$index"
                  />
                </template>
              </InlineEditCell>
              <!-- 插槽渲染 -->
              <slot
                v-else-if="column.slotName"
                :name="column.slotName"
                :row="scope.row"
                :column="column"
                :index="scope.$index"
              />
              <!-- render 函数渲染 -->
              <component
                v-else-if="column.render"
                :is="column.render(scope.row, column, scope.$index)"
              />
              <!-- formatter 格式化 -->
              <span v-else-if="column.formatter">
                {{ column.formatter(scope.row, column, scope.row[column.prop], scope.$index) }}
              </span>
              <!-- 默认渲染 -->
              <span v-else>{{ scope.row[column.prop] }}</span>
            </template>
          </el-table-column>
        </template>

        <!-- 操作列 -->
        <el-table-column
          v-if="showActionColumn"
          :label="actionColumnConfig.label || '操作'"
          :width="actionColumnConfig.width || 150"
          :fixed="actionColumnConfig.fixed ?? 'right'"
        >
          <template #default="scope">
            <slot name="action" :row="scope.row" :index="scope.$index">
              <ActionColumn
                :buttons="actionColumnConfig.buttons"
                :row="scope.row"
                :index="scope.$index"
              />
            </slot>
          </template>
        </el-table-column>

        <!-- 空状态插槽 -->
        <template #empty>
          <slot name="empty">
            <el-empty :description="emptyText" />
          </slot>
        </template>
      </el-table>

      <!-- 分页 -->
      <div v-if="showPagination" class="pro-table-plus__pagination">
        <el-pagination
          v-model:current-page="paginationState.page"
          v-model:page-size="paginationState.pageSize"
          :total="paginationState.total"
          :page-sizes="paginationSizes"
          :layout="paginationLayout"
          :background="paginationBackground"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>

      <!-- 列设置对话框 -->
      <ColumnSetting
        v-model="showColumnSettingDialog"
        :columns="columns"
        :column-states="columnStates"
        @visible-change="handleColumnVisibleChange"
        @order-change="handleColumnOrderChange"
        @reset="handleColumnReset"
      />

      <!-- 错误状态 -->
      <div v-if="errorState" class="pro-table-plus__error">
        <slot name="error" :error="errorState" :retry="handleRefresh">
          <el-result icon="error" title="加载失败" :sub-title="errorState.message">
            <template #extra>
              <el-button type="primary" @click="handleRefresh">重试</el-button>
            </template>
          </el-result>
        </slot>
      </div>
    </component>
  </div>
</template>

<script setup lang="ts" generic="T extends Record<string, any>">
import { ref, computed, reactive, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElTable, ElMessage } from 'element-plus'
import TableToolbar from './components/TableToolbar.vue'
import ActionColumn from './components/ActionColumn.vue'
import ColumnSetting from './components/ColumnSetting.vue'
import InlineEditCell from './components/InlineEditCell.vue'
import { useTableData } from './composables/useTableData'
import { useTableColumns } from './composables/useTableColumns'
import { useTableSelection } from './composables/useTableSelection'
import { useTableExport } from './composables/useTableExport'
import { useThemeStore } from '@/store/theme'
import type {
  ProTablePlusProps,
  ProTablePlusInstance,
  ProTablePlusOptions,
  ProTableCardConfig,
  ProTableToolbarConfig,
  ProTableActionColumn,
  ProTableSelectionConfig,
  ProTablePaginationConfig,
  ProTableColumnPlus,
  ProTableCacheConfig,
  ExportFormat,
} from './types-plus'

// Props
const props = withDefaults(defineProps<ProTablePlusProps<T>>(), {
  columns: () => [],
  card: true,
  toolbar: true,
  pagination: true,
  border: true,
  stripe: false,
  size: 'default',
  loading: false,
  rowKey: 'id',
  selection: false,
  emptyText: '暂无数据',
  persistColumnSettings: false,
  columnSettingsKey: 'pro-table-columns',
})

// Emits
const emit = defineEmits<{
  (e: 'selection-change', selection: T[]): void
  (e: 'sort-change', sort: { prop: string; order: 'ascending' | 'descending' | null }): void
  (e: 'filter-change', filters: Record<string, any>): void
  (e: 'row-click', row: T, column: any, event: Event): void
  (e: 'refresh'): void
  (e: 'export-all', data: T[], format: ExportFormat): void
  (e: 'export-page', data: T[], format: ExportFormat): void
  (e: 'inline-edit', row: T, field: string, value: any, oldValue: any): void
}>()

// Refs
const tableRef = ref<InstanceType<typeof ElTable>>()
const showColumnSettingDialog = ref(false)
const isFullscreen = ref(false)
const previousSidebarState = ref(false) // 记录全屏前的侧边栏状态

// Route & Theme Store
const route = useRoute()
const themeStore = useThemeStore()

// 数据缓存
const dataCache = reactive<Map<string, { data: any; timestamp: number }>>(new Map())

// ==================== 合并配置（options 优先） ====================
const mergedConfig = computed<ProTablePlusOptions<T>>(() => {
  const opts = (props.options || {}) as ProTablePlusOptions<T>
  return {
    dataSource: opts.dataSource ?? props.dataSource,
    request: opts.request ?? props.request,
    rowKey: opts.rowKey ?? props.rowKey ?? 'id',
    card: opts.card ?? props.card ?? true,
    toolbar: opts.toolbar ?? props.toolbar ?? true,
    columns: opts.columns ?? props.columns ?? [],
    actionColumn: opts.actionColumn ?? props.actionColumn,
    selection: opts.selection ?? props.selection ?? false,
    pagination: opts.pagination ?? props.pagination ?? true,
    export: opts.export ?? props.export,
    persistColumnSettings: opts.persistColumnSettings ?? props.persistColumnSettings ?? false,
    columnSettingsKey: opts.columnSettingsKey ?? props.columnSettingsKey ?? 'pro-table-columns',
    border: opts.border ?? props.border ?? true,
    stripe: opts.stripe ?? props.stripe ?? false,
    size: opts.size ?? props.size ?? 'default',
    height: opts.height ?? props.height,
    maxHeight: opts.maxHeight ?? props.maxHeight,
    emptyText: opts.emptyText ?? props.emptyText ?? '暂无数据',
    loading: opts.loading ?? props.loading ?? false,
    cache: opts.cache ?? { enabled: false },
    autoHeight: opts.autoHeight ?? true,
  }
})

// ==================== 缓存配置 ====================
const cacheConfig = computed<ProTableCacheConfig>(() => {
  const config = mergedConfig.value.cache || {}
  return {
    enabled: config.enabled ?? false,
    ttl: config.ttl ?? 5 * 60 * 1000, // 默认 5 分钟
    keyPrefix: config.keyPrefix ?? 'pro-table-cache',
  }
})

// 清空缓存
const clearCache = () => {
  dataCache.clear()
}

// 缓存相关方法（供外部使用）
const generateCacheKey = (params: any): string => {
  const prefix = cacheConfig.value.keyPrefix || 'pro-table-cache'
  return `${prefix}-${JSON.stringify(params)}`
}

const getCachedData = (key: string): any | null => {
  const cached = dataCache.get(key)
  if (!cached) return null

  const ttl = cacheConfig.value.ttl || 5 * 60 * 1000
  if (Date.now() - cached.timestamp > ttl) {
    dataCache.delete(key)
    return null
  }

  return cached.data
}

const setCachedData = (key: string, data: any) => {
  dataCache.set(key, { data, timestamp: Date.now() })
}

// ==================== 从合并配置中提取各项 ====================
const columns = computed(() => mergedConfig.value.columns as ProTableColumnPlus<T>[])
const rowKey = computed(() => mergedConfig.value.rowKey)
const border = computed(() => mergedConfig.value.border)
const stripe = computed(() => mergedConfig.value.stripe)
const size = computed(() => mergedConfig.value.size)
const height = computed(() => mergedConfig.value.height)
const maxHeight = computed(() => mergedConfig.value.maxHeight)
const emptyText = computed(() => mergedConfig.value.emptyText)

// 自动计算表格高度（如果启用 autoHeight）
const autoHeight = computed(() => mergedConfig.value.autoHeight ?? true)

// 容器引用，用于动态计算高度
const containerRef = ref<HTMLElement>()
const calculatedHeight = ref<number | undefined>(undefined)

// 计算表格高度
const tableHeight = computed(() => {
  if (isFullscreen.value) {
    return 'calc(100vh - 200px)'
  }
  // 如果设置了固定高度，使用固定高度
  if (height.value) {
    return height.value
  }
  // 如果启用自动高度
  if (autoHeight.value) {
    // 如果已计算出高度，使用计算的高度
    if (calculatedHeight.value) {
      return `${calculatedHeight.value}px`
    }
    // 否则使用默认的 calc 值作为 fallback
    return 'calc(100vh - 380px)'
  }
  return undefined
})

// 动态计算表格高度
const calculateTableHeight = () => {
  if (!autoHeight.value || !containerRef.value) return

  // 获取视口高度
  const viewportHeight = window.innerHeight
  // 获取容器距离视口顶部的距离
  const containerRect = containerRef.value.getBoundingClientRect()
  const containerTop = containerRect.top

  // 计算可用高度：视口高度 - 容器顶部距离 - 底部边距(24px) - 分页高度(60px) - 工具栏高度(50px) - card padding(40px)
  // 简化计算：视口高度 - 容器顶部 - 固定偏移量
  const offset = 180 // 分页 + 工具栏 + padding + 边距
  const availableHeight = viewportHeight - containerTop - offset

  // 设置最小高度为 200px
  calculatedHeight.value = Math.max(200, availableHeight)
}

// 防抖处理
let resizeTimer: ReturnType<typeof setTimeout> | null = null
const handleResize = () => {
  if (resizeTimer) clearTimeout(resizeTimer)
  resizeTimer = setTimeout(() => {
    calculateTableHeight()
  }, 100)
}

// 计算最大高度（当不使用固定高度时）
const computedMaxHeight = computed(() => {
  if (isFullscreen.value) {
    return undefined
  }
  // 如果设置了 maxHeight，使用设置的值
  if (maxHeight.value) {
    return maxHeight.value
  }
  return undefined
})

// ==================== 卡片配置 ====================
const showCard = computed(() => {
  const card = mergedConfig.value.card
  if (typeof card === 'boolean') return card
  return card?.show !== false
})

const cardConfig = computed<ProTableCardConfig>(() => {
  const card = mergedConfig.value.card
  if (typeof card === 'boolean') return {}
  return card || {}
})

const cardTitle = computed(() => cardConfig.value.title)
const cardDescription = computed(() => cardConfig.value.description)

// 是否显示卡片头部（只有当有标题或描述时才显示）
const showCardHeader = computed(() => {
  return !!(cardTitle.value || cardDescription.value)
})

const cardProps = computed(() => ({
  shadow: cardConfig.value.shadow ?? 'hover',
  bodyStyle: cardConfig.value.bodyStyle,
}))

// ==================== 工具栏配置 ====================
const toolbarConfig = computed<ProTableToolbarConfig | boolean>(() => {
  const toolbar = mergedConfig.value.toolbar
  if (typeof toolbar === 'boolean') return toolbar
  return toolbar || {}
})

// ==================== 操作列配置 ====================
const showActionColumn = computed(() => {
  const actionColumn = mergedConfig.value.actionColumn
  if (!actionColumn) return false
  return actionColumn.show !== false
})

const actionColumnConfig = computed<ProTableActionColumn>(() => {
  return mergedConfig.value.actionColumn || {}
})

// ==================== 选择配置 ====================
const showSelection = computed(() => {
  const sel = mergedConfig.value.selection
  if (typeof sel === 'boolean') return sel
  return true
})

const selectionConfig = computed<ProTableSelectionConfig<T> | undefined>(() => {
  const sel = mergedConfig.value.selection
  if (typeof sel === 'boolean') return undefined
  return sel
})

// ==================== 分页配置 ====================
const showPagination = computed(() => {
  const pag = mergedConfig.value.pagination
  if (typeof pag === 'boolean') return pag
  return pag?.show !== false
})

const paginationConfig = computed<ProTablePaginationConfig>(() => {
  const pag = mergedConfig.value.pagination
  if (typeof pag === 'boolean') return {}
  return pag || {}
})

const paginationSizes = computed(() => paginationConfig.value.pageSizes || [10, 20, 50, 100])
const paginationLayout = computed(() => paginationConfig.value.layout || 'total, sizes, prev, pager, next, jumper')
const paginationBackground = computed(() => paginationConfig.value.background !== false)

// ==================== Composables ====================

// 数据管理
const {
  data: tableData,
  loading: loadingState,
  error: errorState,
  pagination: paginationState,
  loadData,
  refresh,
  reset,
  setLoading,
  handlePageChange,
  handleSizeChange,
  handleSortChange: onSortChange,
  handleFilterChange: onFilterChange,
} = useTableData<T>({
  dataSource: computed(() => mergedConfig.value.dataSource),
  request: mergedConfig.value.request,
  paginationConfig: computed(() => mergedConfig.value.pagination),
  immediate: false,
})

// 列管理
const {
  columnStates,
  visibleColumns,
  setColumnVisible,
  setColumnOrder,
  resetColumns,
} = useTableColumns<T>({
  columns: columns,
  persistColumnSettings: mergedConfig.value.persistColumnSettings,
  columnSettingsKey: mergedConfig.value.columnSettingsKey,
})

// 选择管理
const {
  selection,
  getSelection,
  clearSelection,
  setSelection,
  handleSelectionChange: onSelectionChange,
  isRowSelectable,
} = useTableSelection<T>({
  selectionConfig: selectionConfig,
  tableRef,
})

// 导出管理
const { exportAll, exportPage } = useTableExport<T>({
  exportConfig: computed(() => mergedConfig.value.export),
  columns: visibleColumns,
  pageData: tableData,
})

// ==================== 事件处理 ====================

const handleSelectionChange = (rows: T[]) => {
  onSelectionChange(rows)
  emit('selection-change', rows)
}

const handleSortChange = (sortInfo: { prop: string; order: 'ascending' | 'descending' | null }) => {
  onSortChange(sortInfo)
  emit('sort-change', sortInfo)
}

const handleFilterChange = (filters: Record<string, any>) => {
  onFilterChange(filters)
  emit('filter-change', filters)
}

const handleRowClick = (row: T, column: any, event: Event) => {
  emit('row-click', row, column, event)
}

const handleRefresh = () => {
  emit('refresh')
  refresh()
}

const handleExportAll = () => {
  exportAll('csv')
  emit('export-all', tableData.value, 'csv')
}

const handleExportPage = () => {
  exportPage('csv')
  emit('export-page', tableData.value, 'csv')
}

const handleColumnVisibleChange = (prop: string, visible: boolean) => {
  setColumnVisible(prop, visible)
}

const handleColumnOrderChange = (props: string[]) => {
  setColumnOrder(props)
}

const handleColumnReset = () => {
  resetColumns()
}

const selectionSelectable = (row: T, index: number) => {
  return isRowSelectable(row, index)
}

// 全屏切换
const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
  if (isFullscreen.value) {
    // 进入全屏：记住当前侧边栏状态，然后收缩
    previousSidebarState.value = themeStore.sidebarCollapsed
    if (!themeStore.sidebarCollapsed) {
      themeStore.setSidebarCollapsed(true)
    }
    document.body.style.overflow = 'hidden'
  } else {
    // 退出全屏：恢复之前的侧边栏状态
    if (!previousSidebarState.value) {
      themeStore.setSidebarCollapsed(false)
    }
    document.body.style.overflow = ''
  }
}

// 退出全屏的辅助函数
const exitFullscreen = () => {
  if (isFullscreen.value) {
    isFullscreen.value = false
    // 恢复之前的侧边栏状态
    if (!previousSidebarState.value) {
      themeStore.setSidebarCollapsed(false)
    }
    document.body.style.overflow = ''
  }
}

// 监听路由变化，自动退出全屏
watch(
  () => route.path,
  () => {
    exitFullscreen()
  }
)

// 行内编辑保存
const handleInlineEditSave = (row: T, field: string, value: any) => {
  const oldValue = row[field]
  ;(row as any)[field] = value
  emit('inline-edit', row, field, value, oldValue)
}

// ESC 退出全屏
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && isFullscreen.value) {
    exitFullscreen()
  }
}

// 打印表格
const handlePrint = () => {
  if (!tableRef.value) {
    ElMessage.warning('表格未加载完成')
    return
  }

  const tableEl = tableRef.value.$el as HTMLElement
  if (!tableEl) return

  // 创建打印窗口
  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    ElMessage.error('无法打开打印窗口，请检查浏览器设置')
    return
  }

  // 获取表格标题
  const title = cardTitle.value || '数据表格'

  // 构建打印内容
  const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          padding: 20px;
        }
        h1 {
          text-align: center;
          margin-bottom: 20px;
          font-size: 18px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px 12px;
          text-align: left;
        }
        th {
          background-color: #f5f7fa;
          font-weight: 600;
        }
        tr:nth-child(even) {
          background-color: #fafafa;
        }
        .print-info {
          text-align: right;
          font-size: 12px;
          color: #999;
          margin-top: 20px;
        }
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <table>
        <thead>
          <tr>
            ${visibleColumns.value.map((col) => `<th>${col.label}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${tableData.value
            .map(
              (row) => `
            <tr>
              ${visibleColumns.value
                .map((col) => {
                  let value = row[col.prop]
                  if (col.formatter) {
                    value = col.formatter(row, col, value, 0)
                  }
                  return `<td>${value ?? ''}</td>`
                })
                .join('')}
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
      <div class="print-info">
        打印时间: ${new Date().toLocaleString()} | 共 ${tableData.value.length} 条数据
      </div>
      <script>
        window.onload = function() {
          window.print();
          window.onafterprint = function() {
            window.close();
          };
        };
      <\/script>
    </body>
    </html>
  `

  printWindow.document.write(printContent)
  printWindow.document.close()
}

// ==================== 实例方法 ====================

const getData = () => tableData.value

const getTableRef = () => tableRef.value

defineExpose<ProTablePlusInstance<T>>({
  refresh,
  reset,
  getSelection,
  clearSelection,
  setSelection,
  getData,
  setLoading,
  getTableRef,
  resetColumns,
  setColumnVisible,
  toggleFullscreen,
  isFullscreen: () => isFullscreen.value,
  print: handlePrint,
  clearCache,
  // 缓存相关方法
  generateCacheKey,
  getCachedData,
  setCachedData,
})

// ==================== 生命周期 ====================

onMounted(() => {
  loadData()
  document.addEventListener('keydown', handleKeydown)
  // 计算表格高度
  if (autoHeight.value) {
    // 延迟计算，确保 DOM 已渲染
    setTimeout(() => {
      calculateTableHeight()
    }, 100)
    window.addEventListener('resize', handleResize)
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('resize', handleResize)
  if (resizeTimer) clearTimeout(resizeTimer)
  if (isFullscreen.value) {
    // 恢复之前的侧边栏状态
    if (!previousSidebarState.value) {
      themeStore.setSidebarCollapsed(false)
    }
    document.body.style.overflow = ''
  }
})
</script>

<style scoped lang="scss">
.pro-table-plus-container {
  &.is-fullscreen {
    position: fixed;
    top: 0;
    left: 64px; /* 收缩后的菜单栏宽度 */
    right: 0;
    bottom: 0;
    z-index: 9999;
    background-color: var(--el-bg-color);
    padding: 16px;
    overflow: auto;

    .pro-table-plus {
      height: 100%;
    }
  }

  // 覆盖 el-card 的样式，与 ProSearch 保持一致
  :deep(.el-card) {
    border-radius: 4px;
    border: none;
    transition: box-shadow 0.3s ease;

    &.is-hover-shadow {
      box-shadow: none;

      &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }
    }

    &.is-always-shadow {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    &.is-never-shadow {
      box-shadow: none;
    }
  }
}

.pro-table-plus {
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-left {
      .header-title {
        font-size: 16px;
        font-weight: 600;
        color: var(--el-text-color-primary);
      }

      .header-description {
        margin-top: 4px;
        font-size: 12px;
        color: var(--el-text-color-secondary);
      }
    }
  }

  &__pagination {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
    padding: 12px 0;
  }

  &__error {
    padding: 40px 0;
  }
}
</style>
