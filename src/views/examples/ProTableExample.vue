<template>
  <div class="pro-table-example">
    <!-- 功能说明 -->
    <el-alert
      title="ProSearch + ProTablePlus 功能演示"
      type="info"
      :closable="false"
      show-icon
      class="feature-alert"
    >
      <template #default>
        <div class="feature-list">
          <span><el-tag size="small">远程搜索</el-tag></span>
          <span><el-tag size="small">字段联动</el-tag></span>
          <span><el-tag size="small">快捷搜索</el-tag></span>
          <span><el-tag size="small">搜索历史</el-tag></span>
          <span><el-tag size="small">行内编辑</el-tag></span>
          <span><el-tag size="small">全屏模式</el-tag></span>
          <span><el-tag size="small">打印功能</el-tag></span>
          <span><el-tag size="small">列设置</el-tag></span>
          <span><el-tag size="small">数据导出</el-tag></span>
        </div>
      </template>
    </el-alert>

    <!-- 搜索表单 -->
    <ProSearch
      ref="searchRef"
      :options="searchOptions"
      @search="handleSearch"
      @reset="handleSearchReset"
      @field-change="handleFieldChange"
    />

    <!-- 数据表格 -->
    <ProTablePlus
      ref="tableRef"
      :options="tableOptions"
      @selection-change="handleSelectionChange"
      @refresh="handleRefresh"
      @inline-edit="handleInlineEdit"
    >
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
        <el-button :icon="Refresh" @click="handleClearCache">
          清空缓存
        </el-button>
      </template>

      <!-- 工具栏右侧额外按钮 -->
      <template #toolbar-right>
        <el-button :icon="QuestionFilled" circle @click="showHelp" />
      </template>

      <!-- 状态列 -->
      <template #status="{ row }">
        <el-tag :type="row.status === 1 ? 'success' : 'danger'">
          {{ row.status === 1 ? '启用' : '禁用' }}
        </el-tag>
      </template>

      <!-- 省份列 -->
      <template #province="{ row }">
        <el-tag type="info" effect="plain">{{ row.province }}</el-tag>
      </template>

      <!-- 自定义操作列 -->
      <template #action="{ row }">
        <el-button type="primary" link size="small" @click="handleEdit(row)">
          编辑
        </el-button>
        <el-button type="warning" link size="small" @click="handleView(row)">
          查看
        </el-button>
        <el-popconfirm
          :title="`确定要删除用户 '${row.username}' 吗？`"
          @confirm="handleDelete(row)"
        >
          <template #reference>
            <el-button type="danger" link size="small">删除</el-button>
          </template>
        </el-popconfirm>
      </template>
    </ProTablePlus>

    <!-- 帮助对话框 -->
    <el-dialog v-model="helpDialogVisible" title="功能说明" width="600px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="远程搜索">
          在"用户搜索"字段输入关键字，会自动远程搜索匹配的用户
        </el-descriptions-item>
        <el-descriptions-item label="字段联动">
          选择"省份"后，"城市"字段会自动加载对应的城市选项
        </el-descriptions-item>
        <el-descriptions-item label="快捷搜索">
          点击搜索栏上方的标签可快速应用预设的搜索条件
        </el-descriptions-item>
        <el-descriptions-item label="搜索历史">
          搜索后会自动记录历史，点击"搜索历史"可快速选择
        </el-descriptions-item>
        <el-descriptions-item label="行内编辑">
          点击"昵称"、"邮箱"列的内容可直接编辑，"状态"列可切换开关
        </el-descriptions-item>
        <el-descriptions-item label="全屏模式">
          点击工具栏的全屏按钮可进入全屏模式，按 ESC 退出
        </el-descriptions-item>
        <el-descriptions-item label="打印功能">
          点击工具栏的打印按钮可打印当前表格数据
        </el-descriptions-item>
        <el-descriptions-item label="列设置">
          点击工具栏的设置按钮可调整列的显示/隐藏和顺序
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Delete, Star, Refresh, QuestionFilled, Location } from '@element-plus/icons-vue'
import {
  ProTablePlus,
  ProSearch,
  defineProTableOptions,
  defineSearchOptions,
} from '@/components/pro'
import type { ProTablePlusInstance, ProSearchInstance } from '@/components/pro'

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
  province: string
  city: string
  role: string
  createdAt: string
}

// Refs
const tableRef = ref<ProTablePlusInstance<User>>()
const searchRef = ref<ProSearchInstance>()
const helpDialogVisible = ref(false)

// 搜索参数
const searchParams = ref<Record<string, any>>({})

/**
 * 模拟数据
 */
const roles = ['admin', 'user', 'guest']
const mockUsers: User[] = Array.from({ length: 100 }, (_, i) => ({
  id: i + 1,
  username: `user${i + 1}`,
  nickname: `用户${i + 1}`,
  email: `user${i + 1}@example.com`,
  phone: `138${String(i + 1).padStart(8, '0')}`,
  status: (Math.random() > 0.5 ? 1 : 0) as 0 | 1,
  province: ['广东省', '浙江省', '江苏省'][i % 3] as string,
  city: ['广州市', '杭州市', '南京市'][i % 3] as string,
  role: roles[i % 3] as string,
  createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 19)
    .replace('T', ' '),
}))

/**
 * 模拟省份数据
 */
const provinces = [
  { label: '广东省', value: 'guangdong' },
  { label: '浙江省', value: 'zhejiang' },
  { label: '江苏省', value: 'jiangsu' },
]

/**
 * 模拟城市数据
 */
const cityMap: Record<string, { label: string; value: string }[]> = {
  guangdong: [
    { label: '广州市', value: 'guangzhou' },
    { label: '深圳市', value: 'shenzhen' },
    { label: '东莞市', value: 'dongguan' },
  ],
  zhejiang: [
    { label: '杭州市', value: 'hangzhou' },
    { label: '宁波市', value: 'ningbo' },
    { label: '温州市', value: 'wenzhou' },
  ],
  jiangsu: [
    { label: '南京市', value: 'nanjing' },
    { label: '苏州市', value: 'suzhou' },
    { label: '无锡市', value: 'wuxi' },
  ],
}

/**
 * 模拟异步获取角色选项
 */
const fetchRoleOptions = async () => {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return [
    { label: '管理员', value: 'admin' },
    { label: '普通用户', value: 'user' },
    { label: '访客', value: 'guest' },
  ]
}

/**
 * 模拟远程搜索用户
 */
const remoteSearchUser = async (query: string) => {
  await new Promise((resolve) => setTimeout(resolve, 300))
  if (!query) return []
  return mockUsers
    .filter((u) => u.username.includes(query) || u.nickname.includes(query))
    .slice(0, 10)
    .map((u) => ({ label: `${u.nickname} (${u.username})`, value: u.id }))
}

/**
 * 搜索表单配置 - 展示所有 ProSearch 功能
 */
const searchOptions = defineSearchOptions({
  fields: [
    {
      field: 'keyword',
      label: '用户搜索',
      type: 'select',
      placeholder: '输入用户名或昵称搜索',
      // 远程搜索功能
      remoteSearch: remoteSearchUser,
      remoteSearchDelay: 300,
    },
    {
      field: 'province',
      label: '省份',
      type: 'select',
      placeholder: '请选择省份',
      options: provinces,
    },
    {
      field: 'city',
      label: '城市',
      type: 'select',
      placeholder: '请先选择省份',
      // 字段联动功能
      dependsOn: {
        field: 'province',
        fetchOptions: async (provinceValue) => {
          await new Promise((resolve) => setTimeout(resolve, 200))
          return cityMap[provinceValue] || []
        },
        clearOnChange: true,
      },
    },
    {
      field: 'role',
      label: '角色',
      type: 'select',
      placeholder: '请选择角色',
      // 异步获取选项
      fetchOptions: fetchRoleOptions,
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
    {
      field: 'dateRange',
      label: '创建时间',
      type: 'dateRange',
      span: 8,
    },
  ],
  // 默认值
  defaultValues: {
    status: 1,
  },
  showSearch: true,
  showReset: true,
  showExpand: true,
  defaultExpandCount: 3,
  labelWidth: '80px',
  columns: 4,
  shadow: true,
  // 快捷搜索功能
  quickSearch: [
    {
      key: 'active',
      label: '启用用户',
      values: { status: 1 },
      type: 'success',
      icon: Star,
    },
    {
      key: 'inactive',
      label: '禁用用户',
      values: { status: 0 },
      type: 'danger',
    },
    {
      key: 'guangdong',
      label: '广东用户',
      values: { province: 'guangdong' },
      type: 'primary',
      icon: Location,
    },
    {
      key: 'admin',
      label: '管理员',
      values: { role: 'admin' },
      type: 'warning',
    },
  ],
  // 搜索历史功能
  history: {
    enabled: true,
    maxCount: 5,
    storageKey: 'pro-table-search-history',
    showClear: true,
  },
})

/**
 * 表格配置 - 展示所有 ProTablePlus 功能
 */
const tableOptions = defineProTableOptions<User>({
  // 卡片配置
  card: {
    show: true,
    title: '用户管理',
    description: '完整功能演示：行内编辑、全屏、打印、导出、列设置等',
    shadow: 'hover',
  },

  // 工具栏配置 - 启用所有功能
  toolbar: {
    show: true,
    showRefresh: true,
    showColumnSetting: true,
    showExportAll: true,
    showExportPage: true,
    showFullscreen: true,
    showPrint: true,
  },

  // 列配置 - 展示行内编辑功能
  columns: [
    {
      prop: 'id',
      label: 'ID',
      width: 80,
      hideable: false,
      sortable: true,
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
      // 行内编辑 - 输入框
      inlineEdit: {
        type: 'input',
        editable: true,
        onSave: async (row, _field, value) => {
          await new Promise((resolve) => setTimeout(resolve, 500))
          ElMessage.success(`保存成功: ${row.username} 的昵称改为 ${value}`)
          return true
        },
      },
    },
    {
      prop: 'email',
      label: '邮箱',
      minWidth: 180,
      // 行内编辑 - 输入框
      inlineEdit: {
        type: 'input',
        editable: true,
        onSave: async (row, _field, value) => {
          await new Promise((resolve) => setTimeout(resolve, 300))
          ElMessage.success(`${row.username} 的邮箱已更新为 ${value}`)
          return true
        },
      },
    },
    {
      prop: 'phone',
      label: '手机号',
      width: 130,
    },
    {
      prop: 'province',
      label: '省份',
      width: 100,
      slotName: 'province',
    },
    {
      prop: 'role',
      label: '角色',
      width: 100,
      // 行内编辑 - 下拉选择
      inlineEdit: {
        type: 'select',
        editable: true,
        options: [
          { label: '管理员', value: 'admin' },
          { label: '普通用户', value: 'user' },
          { label: '访客', value: 'guest' },
        ],
        onSave: async (row, _field, value) => {
          await new Promise((resolve) => setTimeout(resolve, 300))
          const roleMap: Record<string, string> = { admin: '管理员', user: '普通用户', guest: '访客' }
          ElMessage.success(`${row.username} 的角色已更改为 ${roleMap[value]}`)
          return true
        },
      },
      formatter: (row) => {
        const roleMap: Record<string, string> = { admin: '管理员', user: '普通用户', guest: '访客' }
        return roleMap[row.role] || row.role
      },
    },
    {
      prop: 'status',
      label: '状态',
      width: 100,
      slotName: 'status',
      sortable: true,
      // 行内编辑 - 开关
      inlineEdit: {
        type: 'switch',
        editable: true,
        onSave: async (row, _field, value) => {
          await new Promise((resolve) => setTimeout(resolve, 300))
          ElMessage.success(`${row.username} 状态已${value ? '启用' : '禁用'}`)
          return true
        },
      },
    },
    {
      prop: 'createdAt',
      label: '创建时间',
      width: 180,
      sortable: true,
    },
  ],

  // 操作列配置
  actionColumn: {
    show: true,
    label: '操作',
    width: 180,
    fixed: 'right',
  },

  // 选择配置
  selection: true,

  // 分页配置
  pagination: {
    show: true,
    pageSize: 10,
    pageSizes: [10, 20, 50, 100],
    layout: 'total, sizes, prev, pager, next, jumper',
    background: true,
  },

  // 导出配置
  export: {
    filename: 'users-export',
    formats: ['csv', 'json'],
  },

  // 数据缓存配置
  cache: {
    enabled: true,
    ttl: 5 * 60 * 1000, // 5分钟
    keyPrefix: 'pro-table-cache',
  },

  // 列设置持久化
  persistColumnSettings: true,
  columnSettingsKey: 'pro-table-example-columns',

  // 数据请求
  request: async (params) => {
    await new Promise((resolve) => setTimeout(resolve, 500))

    let filteredData = [...mockUsers]

    const { keyword, province, city, role, status, dateRange } = searchParams.value

    // 关键字搜索
    if (keyword) {
      const user = mockUsers.find((u) => u.id === keyword)
      if (user) {
        filteredData = filteredData.filter((u) => u.id === keyword)
      }
    }

    // 省份筛选
    if (province) {
      const provinceMap: Record<string, string> = {
        guangdong: '广东省',
        zhejiang: '浙江省',
        jiangsu: '江苏省',
      }
      filteredData = filteredData.filter((user) => user.province === provinceMap[province])
    }

    // 城市筛选
    if (city) {
      const cityNameMap: Record<string, string> = {
        guangzhou: '广州市',
        shenzhen: '深圳市',
        dongguan: '东莞市',
        hangzhou: '杭州市',
        ningbo: '宁波市',
        wenzhou: '温州市',
        nanjing: '南京市',
        suzhou: '苏州市',
        wuxi: '无锡市',
      }
      filteredData = filteredData.filter((user) => user.city === cityNameMap[city])
    }

    // 角色筛选
    if (role) {
      filteredData = filteredData.filter((user) => user.role === role)
    }

    // 状态筛选
    if (status !== undefined && status !== '') {
      filteredData = filteredData.filter((user) => user.status === status)
    }

    // 日期范围筛选
    if (dateRange && dateRange.length === 2) {
      const [start, end] = dateRange as [string, string]
      filteredData = filteredData.filter((user) => {
        const date = user.createdAt.split(' ')[0]
        return date && date >= start && date <= end
      })
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
  },
})

/**
 * 搜索事件处理
 */
const handleSearch = (values: Record<string, any>) => {
  console.log('搜索条件:', values)
  searchParams.value = values
  tableRef.value?.reset()
}

const handleSearchReset = () => {
  searchParams.value = {}
}

const handleFieldChange = (field: string, value: any, formValues: Record<string, any>) => {
  console.log('字段变化:', { field, value, formValues })
}

/**
 * 表格事件处理
 */
const handleSelectionChange = (selection: User[]) => {
  console.log('选中的行:', selection)
}

const handleRefresh = () => {
  ElMessage.success('刷新成功')
}

const handleAdd = () => {
  ElMessage.info('新增用户功能开发中...')
}

const handleEdit = (row: User) => {
  ElMessage.info(`编辑用户: ${row.username}`)
}

const handleView = (row: User) => {
  ElMessageBox.alert(
    `
    <div style="line-height: 2;">
      <p><strong>ID:</strong> ${row.id}</p>
      <p><strong>用户名:</strong> ${row.username}</p>
      <p><strong>昵称:</strong> ${row.nickname}</p>
      <p><strong>邮箱:</strong> ${row.email}</p>
      <p><strong>手机:</strong> ${row.phone}</p>
      <p><strong>省份:</strong> ${row.province}</p>
      <p><strong>城市:</strong> ${row.city}</p>
      <p><strong>角色:</strong> ${row.role}</p>
      <p><strong>状态:</strong> ${row.status === 1 ? '启用' : '禁用'}</p>
      <p><strong>创建时间:</strong> ${row.createdAt}</p>
    </div>
    `,
    '用户详情',
    {
      dangerouslyUseHTMLString: true,
      confirmButtonText: '关闭',
    }
  )
}

const handleDelete = (row: User) => {
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

const handleInlineEdit = (row: User, field: string, value: any, oldValue: any) => {
  console.log('行内编辑:', { row, field, value, oldValue })
}

const handleClearCache = () => {
  tableRef.value?.clearCache()
  ElMessage.success('缓存已清空')
}

const showHelp = () => {
  helpDialogVisible.value = true
}

// 使用 searchRef 的示例方法
const applyQuickSearchByCode = (key: string) => {
  searchRef.value?.applyQuickSearch(key)
}

const getSearchHistory = () => {
  const history = searchRef.value?.getHistory()
  console.log('搜索历史:', history)
  return history
}

// 暴露给模板使用（避免 unused 警告）
defineExpose({
  applyQuickSearchByCode,
  getSearchHistory,
})
</script>

<style scoped lang="scss">
.pro-table-example {
  padding: 16px;

  .feature-alert {
    margin-bottom: 16px;

    .feature-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 8px;
    }
  }
}
</style>
