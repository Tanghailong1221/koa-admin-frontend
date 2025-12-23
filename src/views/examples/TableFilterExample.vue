<template>
  <div class="table-filter-example">
    <el-card header="表格过滤器 URL 同步示例">
      <el-alert
        type="info"
        :closable="false"
        style="margin-bottom: 20px"
      >
        <p>此示例演示了表格过滤器与 URL 参数的同步功能：</p>
        <ul>
          <li>修改过滤条件时，URL 参数会自动更新</li>
          <li>刷新页面或分享 URL 时，过滤条件会自动恢复</li>
          <li>支持多种数据类型：字符串、数字、数组、日期等</li>
          <li>支持防抖更新，避免频繁修改 URL</li>
        </ul>
      </el-alert>

      <!-- 过滤器表单 -->
      <el-form :model="filters" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="关键词">
              <el-input
                v-model="filters.keyword"
                placeholder="请输入关键词"
                clearable
              />
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item label="状态">
              <el-select
                v-model="filters.status"
                placeholder="请选择状态"
                clearable
              >
                <el-option label="全部" :value="0" />
                <el-option label="启用" :value="1" />
                <el-option label="禁用" :value="2" />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item label="分类">
              <el-select
                v-model="filters.category"
                placeholder="请选择分类"
                clearable
              >
                <el-option label="前端" value="frontend" />
                <el-option label="后端" value="backend" />
                <el-option label="运维" value="devops" />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item label="标签">
              <el-select
                v-model="filters.tags"
                placeholder="请选择标签"
                multiple
                clearable
              >
                <el-option label="Vue" value="vue" />
                <el-option label="React" value="react" />
                <el-option label="Angular" value="angular" />
                <el-option label="Node.js" value="nodejs" />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item label="日期范围">
              <el-date-picker
                v-model="filters.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                clearable
              />
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item label="价格范围">
              <el-slider
                v-model="filters.priceRange"
                range
                :min="0"
                :max="1000"
                :step="10"
              />
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item>
              <el-button type="primary" @click="handleSearch">
                搜索
              </el-button>
              <el-button @click="handleReset">
                重置
              </el-button>
              <el-button @click="handleCopyUrl">
                复制 URL
              </el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <!-- 当前 URL 参数 -->
      <el-divider content-position="left">当前 URL 参数</el-divider>
      <el-input
        :model-value="currentUrl"
        type="textarea"
        :rows="3"
        readonly
      />

      <!-- 当前过滤器状态 -->
      <el-divider content-position="left">当前过滤器状态</el-divider>
      <pre>{{ JSON.stringify(filters, null, 2) }}</pre>

      <!-- 表格数据 -->
      <el-divider content-position="left">表格数据</el-divider>
      <el-table :data="filteredData" border>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="名称" min-width="120" />
        <el-table-column prop="category" label="分类" width="100" />
        <el-table-column prop="tags" label="标签" width="200">
          <template #default="{ row }">
            <el-tag
              v-for="tag in row.tags"
              :key="tag"
              size="small"
              style="margin-right: 5px"
            >
              {{ tag }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="price" label="价格" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTableFilter } from '@/composables'
import { ElMessage } from 'element-plus'

/**
 * 过滤器类型
 */
interface Filters {
  keyword: string
  status: number
  category: string
  tags: string[]
  dateRange: [Date, Date] | null
  priceRange: [number, number]
}

/**
 * 表格数据类型
 */
interface TableData {
  id: number
  name: string
  category: string
  tags: string[]
  price: number
  status: number
  createTime: string
}

// 过滤器
const filters = ref<Filters>({
  keyword: '',
  status: 0,
  category: '',
  tags: [],
  dateRange: null,
  priceRange: [0, 1000]
})

// 使用过滤器 URL 同步
const { syncToUrl, clearFilters } = useTableFilter(filters, {
  debounce: true,
  debounceDelay: 500,
  autoRestore: true,
  autoSync: true
})

// 模拟表格数据
const tableData = ref<TableData[]>([
  {
    id: 1,
    name: 'Vue 3 项目',
    category: 'frontend',
    tags: ['vue', 'typescript'],
    price: 100,
    status: 1,
    createTime: '2024-01-01 10:00:00'
  },
  {
    id: 2,
    name: 'React 项目',
    category: 'frontend',
    tags: ['react', 'javascript'],
    price: 200,
    status: 1,
    createTime: '2024-01-02 11:00:00'
  },
  {
    id: 3,
    name: 'Node.js 项目',
    category: 'backend',
    tags: ['nodejs', 'express'],
    price: 300,
    status: 2,
    createTime: '2024-01-03 12:00:00'
  },
  {
    id: 4,
    name: 'Angular 项目',
    category: 'frontend',
    tags: ['angular', 'typescript'],
    price: 150,
    status: 1,
    createTime: '2024-01-04 13:00:00'
  },
  {
    id: 5,
    name: 'Docker 部署',
    category: 'devops',
    tags: ['docker', 'kubernetes'],
    price: 500,
    status: 1,
    createTime: '2024-01-05 14:00:00'
  }
])

// 过滤后的数据
const filteredData = computed(() => {
  return tableData.value.filter(item => {
    // 关键词过滤
    if (filters.value.keyword) {
      const keyword = filters.value.keyword.toLowerCase()
      if (!item.name.toLowerCase().includes(keyword)) {
        return false
      }
    }

    // 状态过滤
    if (filters.value.status !== 0 && item.status !== filters.value.status) {
      return false
    }

    // 分类过滤
    if (filters.value.category && item.category !== filters.value.category) {
      return false
    }

    // 标签过滤
    if (filters.value.tags.length > 0) {
      const hasTag = filters.value.tags.some(tag => item.tags.includes(tag))
      if (!hasTag) {
        return false
      }
    }

    // 价格范围过滤
    if (
      item.price < filters.value.priceRange[0] ||
      item.price > filters.value.priceRange[1]
    ) {
      return false
    }

    // 日期范围过滤
    if (filters.value.dateRange) {
      const itemDate = new Date(item.createTime)
      const [start, end] = filters.value.dateRange
      if (itemDate < start || itemDate > end) {
        return false
      }
    }

    return true
  })
})

// 当前 URL
const currentUrl = computed(() => {
  return window.location.href
})

/**
 * 搜索
 */
const handleSearch = () => {
  syncToUrl()
  ElMessage.success('已应用过滤条件')
}

/**
 * 重置
 */
const handleReset = () => {
  clearFilters({
    keyword: '',
    status: 0,
    category: '',
    tags: [],
    dateRange: null,
    priceRange: [0, 1000]
  })
  ElMessage.success('已重置过滤条件')
}

/**
 * 复制 URL
 */
const handleCopyUrl = async () => {
  try {
    await navigator.clipboard.writeText(window.location.href)
    ElMessage.success('URL 已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}
</script>

<style scoped lang="scss">
.table-filter-example {
  padding: 20px;

  :deep(.el-alert) {
    ul {
      margin: 10px 0 0 20px;
      padding: 0;
    }

    li {
      margin: 5px 0;
    }
  }

  pre {
    background-color: #f5f7fa;
    padding: 15px;
    border-radius: 4px;
    overflow-x: auto;
  }
}
</style>
