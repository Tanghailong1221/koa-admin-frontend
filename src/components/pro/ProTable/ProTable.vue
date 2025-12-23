<template>
  <div class="pro-table">
    <!-- 工具栏 -->
    <div v-if="showToolbar" class="pro-table-toolbar">
      <div class="toolbar-left">
        <slot name="toolbar-left" />
      </div>
      <div class="toolbar-right">
        <slot name="toolbar-right" />
        <el-button
          v-if="toolbarConfig.refresh"
          :icon="Refresh"
          circle
          @click="handleRefresh"
          title="刷新"
        />
        <el-button
          v-if="toolbarConfig.columnSetting"
          :icon="Setting"
          circle
          @click="showColumnSetting = true"
          title="列设置"
        />
        <el-button
          v-if="toolbarConfig.export"
          :icon="Download"
          circle
          @click="handleExport"
          title="导出"
        />
      </div>
    </div>

    <!-- 表格 -->
    <el-table
      ref="tableRef"
      v-loading="loadingState"
      :data="tableData"
      :border="border"
      :stripe="stripe"
      :size="size"
      :height="height"
      :max-height="maxHeight"
      :row-key="rowKey"
      :empty-text="emptyText"
      @selection-change="handleSelectionChange"
      @sort-change="handleSortChange"
      @filter-change="handleFilterChange"
      @row-click="handleRowClick"
    >
      <!-- 选择列 -->
      <el-table-column
        v-if="selectable"
        type="selection"
        width="55"
        fixed="left"
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
          :align="column.align || 'left'"
          :formatter="column.formatter"
        >
          <template v-if="column.slotName" #default="scope">
            <slot
              :name="column.slotName"
              :row="scope.row"
              :column="column"
              :index="scope.$index"
            />
          </template>
          <template v-else-if="column.render" #default="scope">
            <component
              :is="column.render(scope.row, column, scope.$index)"
            />
          </template>
        </el-table-column>
      </template>
    </el-table>

    <!-- 分页 -->
    <div v-if="showPagination" class="pro-table-pagination">
      <el-pagination
        v-model:current-page="paginationState.page"
        v-model:page-size="paginationState.pageSize"
        :total="paginationState.total"
        :page-sizes="paginationState.pageSizes"
        :layout="paginationState.layout"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </div>

    <!-- 列设置对话框 -->
    <el-dialog
      v-model="showColumnSetting"
      title="列设置"
      width="500px"
    >
      <el-checkbox-group v-model="selectedColumns">
        <div
          v-for="column in hideableColumns"
          :key="column.prop"
          class="column-setting-item"
        >
          <el-checkbox :label="column.prop">
            {{ column.label }}
          </el-checkbox>
        </div>
      </el-checkbox-group>
      <template #footer>
        <el-button @click="showColumnSetting = false">取消</el-button>
        <el-button type="primary" @click="handleColumnSettingConfirm">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" generic="T extends Record<string, any>">
import { ref, computed, watch, onMounted } from 'vue'
import { ElTable, ElMessage } from 'element-plus'
import { Refresh, Setting, Download } from '@element-plus/icons-vue'
import type {
  ProTableProps,
  ProTableEmits,
  ProTableInstance,
  ProTablePagination,
  ProTableToolbar,
  ProTableSort,
  ProTableRequestParams
} from './types'

// Props
const props = withDefaults(defineProps<ProTableProps<T>>(), {
  columns: () => [],
  pagination: true,
  toolbar: true,
  border: true,
  stripe: false,
  size: 'default',
  loading: false,
  rowKey: 'id',
  selectable: false,
  emptyText: '暂无数据'
})

// Emits
const emit = defineEmits<ProTableEmits<T>>()

// Refs
const tableRef = ref<InstanceType<typeof ElTable>>()
const loadingState = ref(false)
const tableData = ref<T[]>([])
const showColumnSetting = ref(false)
const selectedColumns = ref<string[]>([])

// 分页状态
const paginationState = ref<ProTablePagination>({
  page: 1,
  pageSize: 10,
  total: 0,
  pageSizes: [10, 20, 50, 100],
  layout: 'total, sizes, prev, pager, next, jumper'
})

// 排序状态
const sortState = ref<ProTableSort>({
  prop: '',
  order: null
})

// 过滤状态
const filterState = ref<Record<string, any>>({})

// 计算属性
const showToolbar = computed(() => {
  if (typeof props.toolbar === 'boolean') {
    return props.toolbar
  }
  return true
})

const toolbarConfig = computed<ProTableToolbar>(() => {
  if (typeof props.toolbar === 'boolean') {
    return {
      refresh: true,
      columnSetting: true,
      export: false,
      actions: false
    }
  }
  return {
    refresh: true,
    columnSetting: true,
    export: false,
    actions: false,
    ...props.toolbar
  }
})

const showPagination = computed(() => {
  if (typeof props.pagination === 'boolean') {
    return props.pagination
  }
  return true
})

// 可隐藏的列
const hideableColumns = computed(() => {
  return props.columns.filter(col => col.hideable !== false)
})

// 可见的列
const visibleColumns = computed(() => {
  return props.columns.filter(col => {
    if (col.visible === false) return false
    if (col.hideable === false) return true
    return selectedColumns.value.includes(col.prop)
  })
})

// 初始化分页配置
const initPagination = () => {
  if (typeof props.pagination === 'object') {
    paginationState.value = {
      ...paginationState.value,
      ...props.pagination
    }
  }
}

// 初始化列选择
const initColumnSelection = () => {
  selectedColumns.value = props.columns
    .filter(col => col.visible !== false && col.hideable !== false)
    .map(col => col.prop)
}

// 加载数据
const loadData = async () => {
  if (props.dataSource) {
    // 使用静态数据
    tableData.value = props.dataSource
    paginationState.value.total = props.dataSource.length
    return
  }

  if (!props.request) {
    return
  }

  try {
    loadingState.value = true

    // 构建请求参数
    const params: ProTableRequestParams = {
      page: paginationState.value.page,
      pageSize: paginationState.value.pageSize,
      filters: filterState.value
    }

    // 添加排序参数
    if (sortState.value.prop && sortState.value.order) {
      params.sortBy = sortState.value.prop
      params.sortOrder = sortState.value.order === 'ascending' ? 'asc' : 'desc'
    }

    // 调用请求函数
    const response = await props.request(params)

    // 更新数据
    tableData.value = response.data
    paginationState.value.total = response.total

    if (response.page !== undefined) {
      paginationState.value.page = response.page
    }
    if (response.pageSize !== undefined) {
      paginationState.value.pageSize = response.pageSize
    }
  } catch (error) {
    console.error('加载表格数据失败:', error)
    ElMessage.error('加载数据失败')
  } finally {
    loadingState.value = false
  }
}

// 事件处理
const handleRefresh = () => {
  emit('refresh')
  loadData()
}

const handleExport = () => {
  emit('export')
}

const handleSelectionChange = (selection: T[]) => {
  emit('selection-change', selection)
}

const handleSortChange = ({ prop, order }: any) => {
  sortState.value = { prop, order }
  emit('sort-change', sortState.value)
  loadData()
}

const handleFilterChange = (filters: Record<string, any>) => {
  filterState.value = filters
  emit('filter-change', filters)
  loadData()
}

const handleRowClick = (row: T, column: any, event: Event) => {
  emit('row-click', row, column, event)
}

const handlePageChange = (page: number) => {
  paginationState.value.page = page
  loadData()
}

const handleSizeChange = (pageSize: number) => {
  paginationState.value.pageSize = pageSize
  paginationState.value.page = 1
  loadData()
}

const handleColumnSettingConfirm = () => {
  showColumnSetting.value = false
}

// 实例方法
const refresh = async () => {
  await loadData()
}

const reset = async () => {
  paginationState.value.page = 1
  sortState.value = { prop: '', order: null }
  filterState.value = {}
  await loadData()
}

const getSelection = (): T[] => {
  return tableRef.value?.getSelectionRows() || []
}

const clearSelection = () => {
  tableRef.value?.clearSelection()
}

const setSelection = (rows: T[]) => {
  rows.forEach(row => {
    tableRef.value?.toggleRowSelection(row, true)
  })
}

const getData = () => {
  return tableData.value as T[]
}

const setLoading = (loading: boolean) => {
  loadingState.value = loading
}

// 暴露实例方法
defineExpose<ProTableInstance<T>>({
  refresh,
  reset,
  getSelection,
  clearSelection,
  setSelection,
  getData,
  setLoading
})

// 监听 loading 属性
watch(() => props.loading, (val) => {
  loadingState.value = val
})

// 监听 dataSource 变化
watch(() => props.dataSource, () => {
  if (props.dataSource) {
    loadData()
  }
}, { deep: true })

// 初始化
onMounted(() => {
  initPagination()
  initColumnSelection()
  loadData()
})
</script>

<style scoped lang="scss">
.pro-table {
  width: 100%;

  &-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding: 12px;
    background-color: var(--el-bg-color);
    border-radius: 4px;

    .toolbar-left,
    .toolbar-right {
      display: flex;
      gap: 8px;
      align-items: center;
    }
  }

  &-pagination {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
    padding: 12px;
  }
}

.column-setting-item {
  padding: 8px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);

  &:last-child {
    border-bottom: none;
  }
}
</style>
