<template>
  <div class="user-list">
    <!-- 搜索表单 -->
    <ProSearch
      ref="searchRef"
      :options="searchOptions"
      @search="handleSearch"
      @reset="handleSearchReset"
    />

    <!-- 数据表格 -->
    <ProTablePlus
      ref="tableRef"
      :options="tableOptions"
      @selection-change="handleSelectionChange"
      @refresh="handleRefresh"
    >
      <!-- 工具栏左侧 -->
      <template #toolbar-left="{ selection }">
        <el-button v-perm="['user:create']" type="primary" :icon="Plus" @click="handleAdd">
          新增用户
        </el-button>
        <el-button
          v-perm="['user:delete']"
          type="danger"
          :icon="Delete"
          :disabled="!selection.length"
          @click="handleBatchDelete(selection)"
        >
          批量删除 {{ selection.length ? `(${selection.length})` : '' }}
        </el-button>
      </template>

      <!-- 状态列 -->
      <template #status="{ row }">
        <el-tag :type="row.status === 1 ? 'success' : 'danger'">
          {{ row.status === 1 ? '启用' : '禁用' }}
        </el-tag>
      </template>

      <!-- 操作列 -->
      <template #action="{ row }">
        <el-button v-perm="['user:detail']" type="primary" link size="small" @click="handleView(row)">
          详情
        </el-button>
        <el-button v-perm="['user:update']" type="primary" link size="small" @click="handleEdit(row)">
          编辑
        </el-button>
        <el-popconfirm
          v-if="row.username !== 'admin'"
          :title="`确定要删除用户 '${row.username}' 吗？`"
          @confirm="handleDelete(row)"
        >
          <template #reference>
            <el-button v-perm="['user:delete']" type="danger" link size="small">删除</el-button>
          </template>
        </el-popconfirm>
      </template>
    </ProTablePlus>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Delete } from '@element-plus/icons-vue'
import {
  ProTablePlus,
  ProSearch,
  defineProTableOptions,
  defineSearchOptions,
} from '@/components/pro'
import type { ProTablePlusInstance, ProSearchInstance } from '@/components/pro'
import { getUserList } from '@/api/user'
import type { UserInfo } from '@/types'

// Refs
const tableRef = ref<ProTablePlusInstance<UserInfo>>()
const searchRef = ref<ProSearchInstance>()

// 搜索参数
const searchParams = ref<Record<string, any>>({})

/**
 * 搜索表单配置
 */
const searchOptions = defineSearchOptions({
  fields: [
    {
      field: 'keyword',
      label: '关键字',
      type: 'input',
      placeholder: '用户名/昵称/手机号',
    },
    {
      field: 'status',
      label: '状态',
      type: 'select',
      placeholder: '请选择状态',
      options: [
        { label: '启用', value: 1 },
        { label: '禁用', value: 0 },
      ],
    },
  ],
  showSearch: true,
  showReset: true,
  showExpand: false,
  labelWidth: '80px',
  columns: 4,
})

/**
 * 表格配置
 */
const tableOptions = defineProTableOptions<UserInfo>({
  card: {
    show: true,
    title: '用户管理',
    description: '管理系统用户账号',
  },
  toolbar: {
    show: true,
    showRefresh: true,
    showColumnSetting: true,
    showExportAll: true,
    showExportPage: true,
  },
  columns: [
    { prop: 'id', label: 'ID', width: 80, sortable: true },
    { prop: 'username', label: '用户名', minWidth: 120, sortable: true },
    { prop: 'nickname', label: '昵称', minWidth: 120 },
    { prop: 'roleName', label: '角色', width: 120 },
    { prop: 'orgName', label: '组织', width: 150 },
    { prop: 'phone', label: '手机号', width: 130 },
    { prop: 'email', label: '邮箱', minWidth: 180 },
    { prop: 'status', label: '状态', width: 100, slotName: 'status', sortable: true },
    { prop: 'createdAt', label: '创建时间', width: 180, sortable: true },
  ],
  actionColumn: {
    show: true,
    label: '操作',
    width: 180,
    fixed: 'right',
  },
  selection: true,
  pagination: {
    show: true,
    pageSize: 10,
    pageSizes: [10, 20, 50, 100],
    layout: 'total, sizes, prev, pager, next, jumper',
    background: true,
  },
  export: {
    filename: 'users-export',
    formats: ['csv', 'json'],
  },
  request: async (params) => {
    const { keyword, status } = searchParams.value
    const res = await getUserList({
      page: params.page,
      size: params.pageSize,
      keyword,
      status,
    })
    return {
      data: res.list || [],
      total: res.total || 0,
      page: params.page,
      pageSize: params.pageSize,
    }
  },
})

/**
 * 搜索事件处理
 */
const handleSearch = (values: Record<string, any>) => {
  searchParams.value = values
  tableRef.value?.reset()
}

const handleSearchReset = () => {
  searchParams.value = {}
}

/**
 * 表格事件处理
 */
const handleSelectionChange = (selection: UserInfo[]) => {
  console.log('选中的用户:', selection)
}

const handleRefresh = () => {
  ElMessage.success('刷新成功')
}

const handleAdd = () => {
  ElMessage.info('新增用户功能开发中...')
}

const handleEdit = (row: UserInfo) => {
  ElMessage.info(`编辑用户: ${row.username}`)
}

const handleView = (row: UserInfo) => {
  ElMessageBox.alert(
    `
    <div style="line-height: 2;">
      <p><strong>ID:</strong> ${row.id}</p>
      <p><strong>用户名:</strong> ${row.username}</p>
      <p><strong>昵称:</strong> ${row.nickname || '-'}</p>
      <p><strong>角色:</strong> ${row.roleName || '-'}</p>
      <p><strong>组织:</strong> ${row.orgName || '-'}</p>
      <p><strong>手机:</strong> ${row.phone || '-'}</p>
      <p><strong>邮箱:</strong> ${row.email || '-'}</p>
      <p><strong>状态:</strong> ${row.status === 1 ? '启用' : '禁用'}</p>
      <p><strong>创建时间:</strong> ${row.createdAt || '-'}</p>
    </div>
    `,
    '用户详情',
    {
      dangerouslyUseHTMLString: true,
      confirmButtonText: '关闭',
    }
  )
}

const handleDelete = (row: UserInfo) => {
  ElMessage.success(`删除用户 ${row.username} 成功`)
  tableRef.value?.refresh()
}

const handleBatchDelete = async (selection: UserInfo[]) => {
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

// 暴露给模板使用
defineExpose({
  searchRef,
  tableRef,
})
</script>

<style scoped lang="scss">
.user-list {
  padding: 12px;
  height: calc(100vh - 120px); // 头部64 + tabs约40 + main padding 12 + 额外4
  display: flex;
  flex-direction: column;
  overflow: hidden;

  // ProSearch 组件不需要 flex-grow
  :deep(.pro-search) {
    flex-shrink: 0;
  }

  // ProTablePlus 容器填充剩余空间
  :deep(.pro-table-plus-container) {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;

    .pro-table-plus,
    .el-card {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
    }

    .el-card__body {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
    }
  }
}
</style>
