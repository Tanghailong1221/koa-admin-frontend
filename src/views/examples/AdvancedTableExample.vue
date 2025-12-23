<template>
  <div class="advanced-table-example">
    <el-card header="高级表格功能示例">
      <!-- 统计信息 -->
      <el-alert
        v-if="hasSelection"
        type="info"
        :closable="false"
        style="margin-bottom: 16px"
      >
        已选中 {{ selectionCount }} 条数据
        <el-button type="text" @click="clearSelection">清空选择</el-button>
      </el-alert>

      <!-- 表格 -->
      <ProTable
        ref="tableRef"
        :columns="columns"
        :data-source="tableData"
        :row-key="rowKey"
        selectable
        @selection-change="handleSelectionChange"
      >
        <!-- 工具栏左侧 -->
        <template #toolbar-left>
          <el-space>
            <el-button type="primary" @click="handleAdd">
              新增
            </el-button>
            <el-button
              :disabled="!hasSelection"
              @click="handleBatchDelete"
            >
              批量删除
            </el-button>
            <el-button @click="handleExport">
              导出数据
            </el-button>
          </el-space>
        </template>

        <!-- 工具栏右侧 -->
        <template #toolbar-right>
          <el-button @click="showColumnSetting = true">
            列设置
          </el-button>
        </template>

        <!-- 状态列 -->
        <template #status="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'">
            {{ row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>

        <!-- 操作列 -->
        <template #actions="{ row }">
          <el-space>
            <el-button type="primary" size="small" link @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button type="danger" size="small" link @click="handleDelete(row)">
              删除
            </el-button>
          </el-space>
        </template>
      </ProTable>

      <!-- 列设置对话框 -->
      <el-dialog
        v-model="showColumnSetting"
        title="列设置"
        width="500px"
      >
        <el-space direction="vertical" style="width: 100%">
          <div
            v-for="(col, index) in columns"
            :key="col.prop"
            class="column-setting-item"
          >
            <el-checkbox
              :model-value="col.visible !== false"
              @change="(val: any) => setColumnVisible(col.prop, val as boolean)"
            >
              {{ col.label }}
            </el-checkbox>
            <el-space>
              <el-button
                size="small"
                :disabled="index === 0"
                @click="moveColumn(index, index - 1)"
              >
                上移
              </el-button>
              <el-button
                size="small"
                :disabled="index === columns.length - 1"
                @click="moveColumn(index, index + 1)"
              >
                下移
              </el-button>
            </el-space>
          </div>
        </el-space>
        <template #footer>
          <el-space>
            <el-button @click="resetColumns">重置</el-button>
            <el-button type="primary" @click="showColumnSetting = false">
              确定
            </el-button>
          </el-space>
        </template>
      </el-dialog>

      <!-- 说明 -->
      <el-divider />
      <el-alert type="info" :closable="false">
        <template #title>功能说明</template>
        <ul style="margin: 0; padding-left: 20px">
          <li>支持跨页选择（选择的数据会保留）</li>
          <li>支持列配置持久化（刷新页面后配置会保留）</li>
          <li>支持列显示/隐藏</li>
          <li>支持列排序（上移/下移）</li>
          <li>支持数据导出（CSV/JSON）</li>
          <li>支持批量操作</li>
        </ul>
      </el-alert>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ProTable } from '@/components/pro'
import type { ProTableColumn } from '@/components/pro'
import { useTableColumns, useTableSelection } from '@/composables'
import { exportTable, ExportFormat } from '@/utils'

/**
 * 用户接口
 */
interface User {
  id: number
  username: string
  nickname: string
  email: string
  phone: string
  status: 0 | 1
  createdAt: string
}

// Refs
const tableRef = ref()
const showColumnSetting = ref(false)
const rowKey = 'id'

// 初始列配置
const initialColumns: ProTableColumn<User>[] = [
  {
    prop: 'id',
    label: 'ID',
    width: 80
  },
  {
    prop: 'username',
    label: '用户名',
    width: 120
  },
  {
    prop: 'nickname',
    label: '昵称',
    width: 120
  },
  {
    prop: 'email',
    label: '邮箱',
    width: 200
  },
  {
    prop: 'phone',
    label: '手机号',
    width: 150
  },
  {
    prop: 'status',
    label: '状态',
    width: 100,
    slot: 'status'
  },
  {
    prop: 'createdAt',
    label: '创建时间',
    width: 180
  },
  {
    prop: 'actions',
    label: '操作',
    width: 150,
    fixed: 'right',
    slot: 'actions'
  }
]

// 表格列配置
const {
  columns,
  setColumnVisible,
  moveColumn,
  reset: resetColumns
} = useTableColumns<User>(initialColumns, {
  tableId: 'advanced-table-example',
  persist: true
})

// 表格选择
const {
  selectedRows,
  selectionCount,
  hasSelection,
  clearSelection,
  getSelection
} = useTableSelection<User>({
  rowKey: 'id',
  crossPage: true
})

// 模拟数据
const tableData = ref<User[]>([
  {
    id: 1,
    username: 'admin',
    nickname: '管理员',
    email: 'admin@example.com',
    phone: '13800138000',
    status: 1,
    createdAt: '2024-01-01 10:00:00'
  },
  {
    id: 2,
    username: 'user1',
    nickname: '用户1',
    email: 'user1@example.com',
    phone: '13800138001',
    status: 1,
    createdAt: '2024-01-02 10:00:00'
  },
  {
    id: 3,
    username: 'user2',
    nickname: '用户2',
    email: 'user2@example.com',
    phone: '13800138002',
    status: 0,
    createdAt: '2024-01-03 10:00:00'
  },
  {
    id: 4,
    username: 'user3',
    nickname: '用户3',
    email: 'user3@example.com',
    phone: '13800138003',
    status: 1,
    createdAt: '2024-01-04 10:00:00'
  },
  {
    id: 5,
    username: 'user4',
    nickname: '用户4',
    email: 'user4@example.com',
    phone: '13800138004',
    status: 1,
    createdAt: '2024-01-05 10:00:00'
  }
])

/**
 * 处理选择变化
 */
const handleSelectionChange = (selection: User[]) => {
  console.log('选择变化:', selection)
}

/**
 * 处理新增
 */
const handleAdd = () => {
  ElMessage.info('新增功能')
}

/**
 * 处理编辑
 */
const handleEdit = (row: User) => {
  ElMessage.info(`编辑用户: ${row.username}`)
}

/**
 * 处理删除
 */
const handleDelete = (row: User) => {
  ElMessageBox.confirm(`确定删除用户 ${row.username} 吗？`, '提示', {
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
  }).catch(() => {
    // 取消删除
  })
}

/**
 * 处理批量删除
 */
const handleBatchDelete = () => {
  const selection = getSelection()
  ElMessageBox.confirm(`确定删除选中的 ${selection.length} 条数据吗？`, '提示', {
    type: 'warning'
  }).then(() => {
    ElMessage.success('批量删除成功')
    clearSelection()
  }).catch(() => {
    // 取消删除
  })
}

/**
 * 处理导出
 */
const handleExport = () => {
  exportTable({
    filename: 'users.csv',
    format: ExportFormat.CSV,
    columns: columns.value.filter(col => col.visible !== false && col.prop !== 'actions'),
    data: tableData.value,
    includeHeader: true
  })
  ElMessage.success('导出成功')
}
</script>

<style scoped lang="scss">
.advanced-table-example {
  padding: 20px;
}

.column-setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);

  &:last-child {
    border-bottom: none;
  }
}
</style>
