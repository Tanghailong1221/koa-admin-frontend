<template>
  <div class="pro-table-plus-example">
    <ProTablePlus
      ref="tableRef"
      :columns="columns"
      :request="loadData"
      :card="cardConfig"
      :toolbar="toolbarConfig"
      :action-column="actionColumnConfig"
      :selection="true"
      :pagination="paginationConfig"
      :export="exportConfig"
      persist-column-settings
      column-settings-key="user-table-columns"
      @selection-change="handleSelectionChange"
      @refresh="handleRefresh"
    >
      <!-- 卡片头部额外内容 -->
      <template #card-header-extra>
        <el-tag type="success">在线</el-tag>
      </template>

      <!-- 工具栏左侧 -->
      <template #toolbar-left="{ selection }">
        <el-button type="primary" :icon="Plus" @click="handleAdd">
          新增用户
        </el-button>
        <el-button
          type="danger"
          :icon="Delete"
          :disabled="!selection.length"
          @click="handleBatchDelete(selection)"
        >
          批量删除 {{ selection.length ? `(${selection.length})` : '' }}
        </el-button>
      </template>

      <!-- 工具栏右侧 -->
      <template #toolbar-right>
        <el-input
          v-model="searchText"
          placeholder="搜索用户名/昵称"
          style="width: 200px"
          clearable
          :prefix-icon="Search"
          @change="handleSearch"
        />
      </template>

      <!-- 状态列 -->
      <template #status="{ row }">
        <el-tag :type="row.status === 1 ? 'success' : 'danger'">
          {{ row.status === 1 ? '启用' : '禁用' }}
        </el-tag>
      </template>

      <!-- 头像列 -->
      <template #avatar="{ row }">
        <el-avatar :size="32" :src="row.avatar">
          {{ row.nickname?.charAt(0) }}
        </el-avatar>
      </template>

      <!-- 自定义操作列 -->
      <template #action="{ row, index }">
        <el-button type="primary" link size="small" @click="handleView(row)">
          查看
        </el-button>
        <el-button type="primary" link size="small" @click="handleEdit(row)">
          编辑
        </el-button>
        <el-popconfirm
          title="确定要删除该用户吗？"
          @confirm="handleDelete(row, index)"
        >
          <template #reference>
            <el-button type="danger" link size="small">删除</el-button>
          </template>
        </el-popconfirm>
      </template>
    </ProTablePlus>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Delete, Search } from '@element-plus/icons-vue'
import { ProTablePlus } from '@/components/pro'
import type {
  ProTableColumnPlus,
  ProTableCardConfig,
  ProTableToolbarConfig,
  ProTableActionColumn,
  ProTablePaginationConfig,
  ProTableExportConfig,
  ProTableRequest,
  ProTablePlusInstance,
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
  avatar?: string
  status: 0 | 1
  role: string
  createdAt: string
}

// Refs
const tableRef = ref<ProTablePlusInstance<User>>()
const searchText = ref('')
const selectedRows = ref<User[]>([])

/**
 * 卡片配置
 */
const cardConfig: ProTableCardConfig = {
  show: true,
  title: '用户管理',
  description: '管理系统中的所有用户账户',
  shadow: 'hover',
}

/**
 * 工具栏配置
 */
const toolbarConfig: ProTableToolbarConfig = {
  show: true,
  showRefresh: true,
  showColumnSetting: true,
  showExportAll: true,
  showExportPage: true,
}

/**
 * 操作列配置
 */
const actionColumnConfig: ProTableActionColumn<User> = {
  show: true,
  label: '操作',
  width: 180,
  fixed: 'right',
}

/**
 * 分页配置
 */
const paginationConfig: ProTablePaginationConfig = {
  show: true,
  pageSize: 10,
  pageSizes: [10, 20, 50, 100],
  layout: 'total, sizes, prev, pager, next, jumper',
  background: true,
}

/**
 * 导出配置
 */
const exportConfig: ProTableExportConfig = {
  filename: 'users',
  formats: ['csv', 'json'],
}

/**
 * 列配置
 */
const columns: ProTableColumnPlus<User>[] = [
  {
    prop: 'id',
    label: 'ID',
    width: 80,
    hideable: false,
    sortable: true,
  },
  {
    prop: 'avatar',
    label: '头像',
    width: 80,
    slotName: 'avatar',
    hideable: false,
  },
  {
    prop: 'username',
    label: '用户名',
    minWidth: 120,
    sortable: true,
  },
  {
    prop: 'nickname',
    label: '昵称',
    minWidth: 120,
  },
  {
    prop: 'email',
    label: '邮箱',
    minWidth: 180,
  },
  {
    prop: 'phone',
    label: '手机号',
    width: 130,
  },
  {
    prop: 'role',
    label: '角色',
    width: 100,
    formatter: (row) => {
      const roleMap: Record<string, string> = {
        admin: '管理员',
        user: '普通用户',
        guest: '访客',
      }
      return roleMap[row.role] || row.role
    },
  },
  {
    prop: 'status',
    label: '状态',
    width: 100,
    slotName: 'status',
    sortable: true,
  },
  {
    prop: 'createdAt',
    label: '创建时间',
    width: 180,
    sortable: true,
  },
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
  avatar: i % 3 === 0 ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}` : undefined,
  status: Math.random() > 0.3 ? 1 : 0,
  role: ['admin', 'user', 'guest'][i % 3] as string,
  createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 19)
    .replace('T', ' '),
}))

/**
 * 加载数据
 */
const loadData: ProTableRequest<User> = async (params) => {
  // 模拟网络延迟
  await new Promise((resolve) => setTimeout(resolve, 500))

  let filteredData = [...mockUsers]

  // 搜索过滤
  if (searchText.value) {
    const keyword = searchText.value.toLowerCase()
    filteredData = filteredData.filter(
      (user) =>
        user.username.toLowerCase().includes(keyword) ||
        user.nickname.toLowerCase().includes(keyword)
    )
  }

  // 排序
  if (params.sortBy && params.sortOrder) {
    filteredData.sort((a, b) => {
      const aVal = a[params.sortBy as keyof User]
      const bVal = b[params.sortBy as keyof User]
      const order = params.sortOrder === 'asc' ? 1 : -1
      if (aVal === undefined || bVal === undefined) return 0
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
    pageSize: params.pageSize,
  }
}

/**
 * 事件处理
 */
const handleSelectionChange = (selection: User[]) => {
  selectedRows.value = selection
}

const handleRefresh = () => {
  ElMessage.success('刷新成功')
}

const handleSearch = () => {
  tableRef.value?.reset()
}

const handleAdd = () => {
  ElMessage.info('新增用户功能开发中...')
}

const handleView = (row: User) => {
  ElMessage.info(`查看用户: ${row.username}`)
}

const handleEdit = (row: User) => {
  ElMessage.info(`编辑用户: ${row.username}`)
}

const handleDelete = async (row: User, _index: number) => {
  ElMessage.success(`删除用户 ${row.username} 成功`)
  tableRef.value?.refresh()
}

const handleBatchDelete = async (selection: User[]) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selection.length} 个用户吗？`,
      '批量删除',
      { type: 'warning' }
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
.pro-table-plus-example {
  padding: 16px;
}
</style>
