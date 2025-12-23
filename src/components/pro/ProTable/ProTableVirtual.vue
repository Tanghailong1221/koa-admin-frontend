<template>
  <div class="pro-table-virtual">
    <!-- 工具栏 -->
    <div v-if="toolbar" class="pro-table-toolbar">
      <div class="toolbar-left">
        <slot name="toolbar-left" />
      </div>
      <div class="toolbar-right">
        <el-button
          v-if="showRefresh"
          :icon="Refresh"
          circle
          @click="handleRefresh"
        />
        <el-button
          v-if="showColumnSetting"
          :icon="Setting"
          circle
          @click="columnSettingVisible = true"
        />
        <slot name="toolbar-right" />
      </div>
    </div>

    <!-- 虚拟滚动表格 -->
    <div class="virtual-table-container" :style="{ height: height }">
      <!-- 表头 -->
      <div class="virtual-table-header">
        <div class="virtual-table-row">
          <div
            v-if="selection"
            class="virtual-table-cell selection-cell"
            :style="{ width: '55px' }"
          >
            <el-checkbox
              v-model="selectAll"
              :indeterminate="indeterminate"
              @change="handleSelectAll"
            />
          </div>
          <div
            v-for="column in visibleColumns"
            :key="column.prop"
            class="virtual-table-cell"
            :style="{ width: column.width || 'auto', minWidth: column.minWidth || '100px' }"
          >
            {{ column.label }}
          </div>
        </div>
      </div>

      <!-- 虚拟滚动内容 -->
      <virtual-list
        ref="virtualListRef"
        :data-key="rowKey"
        :data-sources="dataSource"
        :data-component="itemComponent"
        :estimate-size="itemHeight"
        :keeps="keeps"
        class="virtual-table-body"
        @scroll="handleScroll"
      />
    </div>

    <!-- 分页 -->
    <div v-if="pagination" class="pro-table-pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="pageSizes"
        :total="total"
        :layout="paginationLayout"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 列设置对话框 -->
    <el-dialog
      v-model="columnSettingVisible"
      title="列设置"
      width="500px"
    >
      <el-checkbox-group v-model="selectedColumns">
        <div v-for="column in columns" :key="column.prop" class="column-setting-item">
          <el-checkbox :label="column.prop">
            {{ column.label }}
          </el-checkbox>
        </div>
      </el-checkbox-group>
      <template #footer>
        <el-button @click="columnSettingVisible = false">取消</el-button>
        <el-button type="primary" @click="handleColumnSettingConfirm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, defineComponent, h } from 'vue'
import { Refresh, Setting } from '@element-plus/icons-vue'
import VirtualList from 'vue-virtual-scroll-list'
import type { ProTableColumn } from './types'

interface Props {
  columns: ProTableColumn[]
  data?: any[]
  request?: (params: any) => Promise<{ data: any[]; total: number }>
  rowKey?: string
  height?: string
  itemHeight?: number
  keeps?: number
  pagination?: boolean
  selection?: boolean
  toolbar?: boolean
  showRefresh?: boolean
  showColumnSetting?: boolean
  pageSizes?: number[]
  paginationLayout?: string
}

const props = withDefaults(defineProps<Props>(), {
  rowKey: 'id',
  height: '600px',
  itemHeight: 50,
  keeps: 30,
  pagination: true,
  selection: false,
  toolbar: true,
  showRefresh: true,
  showColumnSetting: true,
  pageSizes: () => [10, 20, 50, 100],
  paginationLayout: 'total, sizes, prev, pager, next, jumper'
})

const emit = defineEmits<{
  refresh: []
  selectionChange: [selection: any[]]
}>()

// 数据
const dataSource = ref<any[]>([])
const total = ref(0)
const loading = ref(false)

// 分页
const currentPage = ref(1)
const pageSize = ref(20)

// 选择
const selectedRows = ref<any[]>([])
const selectAll = ref(false)
const indeterminate = ref(false)

// 列设置
const columnSettingVisible = ref(false)
const selectedColumns = ref<string[]>([])

// 虚拟列表引用
const virtualListRef = ref()

// 可见列
const visibleColumns = computed(() => {
  return props.columns.filter((col) => {
    if (col.visible === false) return false
    if (selectedColumns.value.length === 0) return true
    return selectedColumns.value.includes(col.prop)
  })
})

// 初始化选中的列
watch(
  () => props.columns,
  (columns) => {
    if (selectedColumns.value.length === 0) {
      selectedColumns.value = columns.map((col) => col.prop)
    }
  },
  { immediate: true }
)

// 创建行组件
const itemComponent = defineComponent({
  props: {
    index: Number,
    source: Object
  },
  setup(itemProps) {
    const row = computed(() => itemProps.source)
    const isSelected = computed(() => {
      return selectedRows.value.some(
        (item) => item[props.rowKey] === row.value[props.rowKey]
      )
    })

    const handleSelect = () => {
      const index = selectedRows.value.findIndex(
        (item) => item[props.rowKey] === row.value[props.rowKey]
      )
      if (index > -1) {
        selectedRows.value.splice(index, 1)
      } else {
        selectedRows.value.push(row.value)
      }
      updateSelectAllState()
      emit('selectionChange', selectedRows.value)
    }

    return () =>
      h(
        'div',
        {
          class: 'virtual-table-row',
          style: {
            height: `${props.itemHeight}px`
          }
        },
        [
          // 选择列
          props.selection &&
            h(
              'div',
              {
                class: 'virtual-table-cell selection-cell',
                style: { width: '55px' }
              },
              [
                h('el-checkbox', {
                  modelValue: isSelected.value,
                  onChange: handleSelect
                })
              ]
            ),
          // 数据列
          ...visibleColumns.value.map((column) =>
            h(
              'div',
              {
                class: 'virtual-table-cell',
                style: {
                  width: column.width || 'auto',
                  minWidth: column.minWidth || '100px'
                }
              },
              column.render
                ? column.render(row.value)
                : row.value[column.prop]
            )
          )
        ]
      )
  }
})

// 加载数据
const loadData = async () => {
  if (props.data) {
    dataSource.value = props.data
    total.value = props.data.length
    return
  }

  if (!props.request) return

  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value
    }
    const result = await props.request(params)
    dataSource.value = result.data
    total.value = result.total
  } catch (error) {
    console.error('加载数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 刷新
const handleRefresh = () => {
  loadData()
  emit('refresh')
}

// 分页变化
const handleSizeChange = () => {
  currentPage.value = 1
  loadData()
}

const handleCurrentChange = () => {
  loadData()
}

// 全选
const handleSelectAll = (val: boolean) => {
  if (val) {
    selectedRows.value = [...dataSource.value]
  } else {
    selectedRows.value = []
  }
  emit('selectionChange', selectedRows.value)
}

// 更新全选状态
const updateSelectAllState = () => {
  const selectedCount = selectedRows.value.length
  const totalCount = dataSource.value.length
  selectAll.value = selectedCount === totalCount && totalCount > 0
  indeterminate.value = selectedCount > 0 && selectedCount < totalCount
}

// 列设置确认
const handleColumnSettingConfirm = () => {
  columnSettingVisible.value = false
}

// 滚动事件
const handleScroll = () => {
  // 可以在这里处理滚动事件
}

// 初始化
loadData()

// 监听数据变化
watch(() => props.data, loadData)

// 暴露方法
defineExpose({
  refresh: loadData,
  getSelectedRows: () => selectedRows.value,
  clearSelection: () => {
    selectedRows.value = []
    selectAll.value = false
    indeterminate.value = false
  }
})
</script>

<style scoped lang="scss">
.pro-table-virtual {
  .pro-table-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    background: #fff;
    border: 1px solid #ebeef5;
    border-bottom: none;

    .toolbar-left,
    .toolbar-right {
      display: flex;
      gap: 8px;
    }
  }

  .virtual-table-container {
    border: 1px solid #ebeef5;
    background: #fff;
    overflow: hidden;

    .virtual-table-header {
      border-bottom: 1px solid #ebeef5;
      background: #f5f7fa;
    }

    .virtual-table-row {
      display: flex;
      align-items: center;
      border-bottom: 1px solid #ebeef5;

      &:hover {
        background: #f5f7fa;
      }
    }

    .virtual-table-cell {
      padding: 12px;
      flex-shrink: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;

      &.selection-cell {
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }

    .virtual-table-body {
      overflow-y: auto;
    }
  }

  .pro-table-pagination {
    display: flex;
    justify-content: flex-end;
    padding: 16px;
    background: #fff;
    border: 1px solid #ebeef5;
    border-top: none;
  }

  .column-setting-item {
    padding: 8px 0;
  }
}
</style>
