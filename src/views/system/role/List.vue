<template>
  <div class="role-list">
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
        <el-button v-perm="['role:create']" type="primary" :icon="Plus" @click="handleAdd">
          新增角色
        </el-button>
        <el-button
          v-perm="['role:delete']"
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
        <el-button v-perm="['role:detail']" type="primary" link size="small" @click="handleView(row)">
          详情
        </el-button>
        <el-button v-perm="['role:update']" type="primary" link size="small" @click="handleEdit(row)">
          编辑
        </el-button>
        <el-button v-perm="['role:permission']" type="warning" link size="small" @click="handlePermission(row)">
          权限
        </el-button>
        <el-popconfirm
          v-if="row.roleCode !== 'admin'"
          :title="`确定要删除角色 '${row.roleName}' 吗？`"
          @confirm="handleDelete(row)"
        >
          <template #reference>
            <el-button v-perm="['role:delete']" type="danger" link size="small">删除</el-button>
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
import { getRoleList } from '@/api/role'
import type { RoleInfo } from '@/types'

// Refs
const tableRef = ref<ProTablePlusInstance<RoleInfo>>()
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
      placeholder: '角色名称/角色编码',
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
const tableOptions = defineProTableOptions<RoleInfo>({
  card: {
    show: true,
    title: '角色管理',
    description: '管理系统角色和权限分配',
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
    { prop: 'roleName', label: '角色名称', minWidth: 150, sortable: true },
    { prop: 'roleCode', label: '角色编码', minWidth: 150 },
    { prop: 'status', label: '状态', width: 100, slotName: 'status', sortable: true },
    { prop: 'remark', label: '备注', minWidth: 200 },
    { prop: 'createdAt', label: '创建时间', width: 180, sortable: true },
  ],
  actionColumn: {
    show: true,
    label: '操作',
    width: 220,
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
    filename: 'roles-export',
    formats: ['csv', 'json'],
  },
  request: async (params) => {
    const { keyword } = searchParams.value
    const res = await getRoleList({
      page: params.page,
      size: params.pageSize,
      keyword,
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
const handleSelectionChange = (selection: RoleInfo[]) => {
  console.log('选中的角色:', selection)
}

const handleRefresh = () => {
  ElMessage.success('刷新成功')
}

const handleAdd = () => {
  ElMessage.info('新增角色功能开发中...')
}

const handleEdit = (row: RoleInfo) => {
  ElMessage.info(`编辑角色: ${row.roleName}`)
}

const handleView = (row: RoleInfo) => {
  ElMessageBox.alert(
    `
    <div style="line-height: 2;">
      <p><strong>ID:</strong> ${row.id}</p>
      <p><strong>角色名称:</strong> ${row.roleName}</p>
      <p><strong>角色编码:</strong> ${row.roleCode}</p>
      <p><strong>状态:</strong> ${row.status === 1 ? '启用' : '禁用'}</p>
      <p><strong>备注:</strong> ${row.remark || '-'}</p>
      <p><strong>创建时间:</strong> ${row.createdAt || '-'}</p>
    </div>
    `,
    '角色详情',
    {
      dangerouslyUseHTMLString: true,
      confirmButtonText: '关闭',
    }
  )
}

const handlePermission = (row: RoleInfo) => {
  ElMessage.info(`配置角色 ${row.roleName} 的权限`)
}

const handleDelete = (row: RoleInfo) => {
  ElMessage.success(`删除角色 ${row.roleName} 成功`)
  tableRef.value?.refresh()
}

const handleBatchDelete = async (selection: RoleInfo[]) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selection.length} 个角色吗？`,
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
.role-list {
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
