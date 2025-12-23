<template>
  <div class="pro-table-example">
    <el-card header="ProTable 示例">
      <ProTable
        ref="tableRef"
        :columns="columns"
        :request="loadData"
        selectable
        :toolbar="{
          refresh: true,
          columnSetting: true,
          export: true
        }"
        @selection-change="handleSelectionChange"
        @refresh="handleRefresh"
        @export="handleExport"
      >
        <!-- 工具栏左侧 -->
        <template #toolbar-left>
          <el-button type="primary" @click="handleAdd">
            新增用户
          </el-button>
          <el-button
            :disabled="!selectedRows.length"
            @click="handleBatchDelete"
          >
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
            @change="handleSearch"
          />
        </template>

        <!-- 状态列 -->
        <template #status="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'">
            {{ row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>

        <!-- 操作列 -->
        <template #actions="{ row }">
          <el-button
            type="primary"
            size="small"
            link
            @click="handleEdit(row)"
          >
            编辑
          </el-button>
          <el-button
            type="danger"
            size="small"
            link
            @click="handleDelete(row)"
          >
            删除
          </el-button>
        </template>
      </ProTable>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ProTable } from '@/components/pro'
import type {
  ProTableColumn,
  ProTableRequest,
  ProTableInstance
} from '@/components/pro'

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
const tableRef = ref<ProTableInstance<User>>()
const searchText = ref('')
const selectedRows = ref<User[]>([])

/**
 * 列配置
 */
const columns: ProTableColumn<User>[] = [
  {
    prop: 'id',
    label: 'ID',
    width: 80,
    hideable: false
  },
  {
    prop: 'username',
    label: '用户名',
    minWidth: 120,
    sortable: true
  },
  {
    prop: 'nickname',
    label: '昵称',
    minWidth: 120
  },
  {
    prop: 'email',
    label: '邮箱',
    minWidth: 180
  },
  {
    prop: 'phone',
    label: '手机号',
    width: 130
  },
  {
    prop: 'status',
    label: '状态',
    width: 100,
    slotName: 'status',
    sortable: true
  },
  {
    prop: 'createdAt',
    label: '创建时间',
    width: 180,
    sortable: true
  },
  {
    prop: 'actions',
    label: '操作',
    width: 150,
    fixed: 'right',
    slotName: 'actions',
    hideable: false
  }
]

/**
 * 模拟数据
 */
const mockUsers: User[] = Array.from({ length: 100 }, (_, i) => ({
  id: i + 1,
  username: `user${i + 1}`,
  nickname: `用户${i + 1}`,
  email: `user${i + 1}@example.com`,
  phone: `138${String(i + 1).padStart(8, '0')}`,
  status: Math.random() > 0.5 ? 1 : 0,
  createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 19)
    .replace('T', ' ')
}))

/**
 * 加载数据
 */
const loadData: ProTableRequest<User> = async (params) => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500))

  let filteredData = [...mockUsers]

  // 搜索过滤
  if (searchText.value) {
    const keyword = searchText.value.toLowerCase()
    filteredData = filteredData.filter(
      user =>
        user.username.toLowerCase().includes(keyword) ||
        user.nickname.toLowerCase().includes(keyword) ||
        user.email.toLowerCase().includes(keyword)
    )
  }

  // 排序
  if (params.sortBy && params.sortOrder) {
    filteredData.sort((a, b) => {
      const aVal = a[params.sortBy as keyof User]
      const bVal = b[params.sortBy as keyof User]
      const order = params.sortOrder === 'asc' ? 1 : -1
      return aVal > bVal ? order : -order
    })
  }

  // 分页
  const start = (params.page - 1) * params.pageSize
  const end = start + params.pageSize
  const data = filteredData.slice(start, end)

  return {
    data,
    total: filteredData.length,
    page: params.page,
    pageSize: params.pageSize
  }
}

/**
 * 事件处理
 */
const handleSelectionChange = (selection: User[]) => {
  selectedRows.value = selection
  console.log('选中的行:', selection)
}

const handleRefresh = () => {
  ElMessage.success('刷新成功')
}

const handleExport = () => {
  ElMessage.info('导出功能开发中...')
}

const handleSearch = () => {
  tableRef.value?.reset()
}

const handleAdd = () => {
  ElMessage.info('新增用户功能开发中...')
}

const handleEdit = (row: User) => {
  ElMessage.info(`编辑用户: ${row.username}`)
}

const handleDelete = async (row: User) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户 "${row.username}" 吗？`,
      '提示',
      {
        type: 'warning'
      }
    )
    ElMessage.success('删除成功')
    tableRef.value?.refresh()
  } catch {
    // 用户取消
  }
}

const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedRows.value.length} 个用户吗？`,
      '提示',
      {
        type: 'warning'
      }
    )
    ElMessage.success('批量删除成功')
    tableRef.value?.clearSelection()
    tableRef.value?.refresh()
  } catch {
    // 用户取消
  }
}
</script>

<style scoped lang="scss">
.pro-table-example {
  padding: 20px;
}
</style>
