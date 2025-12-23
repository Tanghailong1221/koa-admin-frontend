<template>
  <div class="search-example">
    <el-card header="搜索和过滤示例 / Search and Filter Example">
      <el-alert
        title="功能说明 / Description"
        type="info"
        :closable="false"
        style="margin-bottom: 20px"
      >
        <p>本示例展示了搜索和过滤功能。</p>
        <p>This example demonstrates search and filter features.</p>
      </el-alert>

      <!-- 基础搜索 -->
      <el-card header="基础搜索 / Basic Search" style="margin-bottom: 20px">
        <Search
          v-model="searchKeyword"
          :config="searchConfig"
          @search="handleSearch"
          @clear="handleClear"
        />

        <el-divider />

        <div style="margin-bottom: 10px">
          <strong>搜索关键词：</strong>{{ searchKeyword || '无' }}
        </div>
      </el-card>

      <!-- 高级过滤 -->
      <el-card header="高级过滤 / Advanced Filter" style="margin-bottom: 20px">
        <FilterBuilder
          v-model="filterConditions"
          v-model:filter-logic="filterLogic"
          :fields="fieldConfigs"
        />

        <el-divider />

        <el-button type="primary" @click="handleApplyFilter">
          应用过滤
        </el-button>
        <el-button @click="handleResetFilter">
          重置过滤
        </el-button>
      </el-card>

      <!-- 保存的搜索 -->
      <el-card header="保存的搜索 / Saved Searches" style="margin-bottom: 20px">
        <SavedSearchManager
          :current-filter-group="currentFilterGroup"
          @apply="handleApplySavedSearch"
        />
      </el-card>

      <!-- 数据表格 -->
      <el-card header="数据列表 / Data List" style="margin-bottom: 20px">
        <el-table :data="filteredData" border>
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="name" label="名称" width="150">
            <template #default="{ row }">
              <span v-html="highlightText(row.name, searchKeyword)" />
            </template>
          </el-table-column>
          <el-table-column prop="age" label="年龄" width="100" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === 'active' ? 'success' : 'info'">
                {{ row.status === 'active' ? '激活' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="email" label="邮箱" min-width="200">
            <template #default="{ row }">
              <span v-html="highlightText(row.email, searchKeyword)" />
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="创建时间" width="180" />
        </el-table>

        <div style="margin-top: 10px">
          <strong>共 {{ filteredData.length }} 条数据</strong>
        </div>
      </el-card>

      <!-- 使用说明 -->
      <el-card header="使用说明 / Usage">
        <el-collapse>
          <el-collapse-item title="基础搜索" name="1">
            <pre><code>{{ basicSearchCode }}</code></pre>
          </el-collapse-item>
          <el-collapse-item title="高级过滤" name="2">
            <pre><code>{{ advancedFilterCode }}</code></pre>
          </el-collapse-item>
          <el-collapse-item title="保存搜索" name="3">
            <pre><code>{{ savedSearchCode }}</code></pre>
          </el-collapse-item>
          <el-collapse-item title="过滤工具函数" name="4">
            <pre><code>{{ filterUtilsCode }}</code></pre>
          </el-collapse-item>
        </el-collapse>
      </el-card>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search, FilterBuilder, SavedSearchManager } from '@/components/Search'
import { FilterLogic } from '@/components/Search/types'
import type { SearchConfig, FilterCondition, FieldConfig, FilterGroup } from '@/components/Search/types'
import { applyFilter, highlightText } from '@/utils/filter-utils'

// 搜索配置
const searchConfig: SearchConfig = {
  placeholder: '搜索名称或邮箱...',
  debounce: 300,
  clearable: true,
  showSearchButton: false,
  minLength: 0
}

// 字段配置
const fieldConfigs: FieldConfig[] = [
  {
    field: 'name',
    label: '名称',
    type: 'string'
  },
  {
    field: 'age',
    label: '年龄',
    type: 'number'
  },
  {
    field: 'status',
    label: '状态',
    type: 'select',
    options: [
      { label: '激活', value: 'active' },
      { label: '禁用', value: 'inactive' }
    ]
  },
  {
    field: 'email',
    label: '邮箱',
    type: 'string'
  }
]

// 模拟数据
const mockData = [
  { id: 1, name: '张三', age: 25, status: 'active', email: 'zhangsan@example.com', createdAt: '2024-01-01 10:00:00' },
  { id: 2, name: '李四', age: 30, status: 'inactive', email: 'lisi@example.com', createdAt: '2024-01-02 11:00:00' },
  { id: 3, name: '王五', age: 28, status: 'active', email: 'wangwu@example.com', createdAt: '2024-01-03 12:00:00' },
  { id: 4, name: '赵六', age: 35, status: 'active', email: 'zhaoliu@example.com', createdAt: '2024-01-04 13:00:00' },
  { id: 5, name: '钱七', age: 22, status: 'inactive', email: 'qianqi@example.com', createdAt: '2024-01-05 14:00:00' },
  { id: 6, name: '孙八', age: 27, status: 'active', email: 'sunba@example.com', createdAt: '2024-01-06 15:00:00' },
  { id: 7, name: '周九', age: 32, status: 'inactive', email: 'zhoujiu@example.com', createdAt: '2024-01-07 16:00:00' },
  { id: 8, name: '吴十', age: 29, status: 'active', email: 'wushi@example.com', createdAt: '2024-01-08 17:00:00' }
]

const searchKeyword = ref('')
const filterConditions = ref<FilterCondition[]>([])
const filterLogic = ref<FilterLogic>(FilterLogic.AND)
const appliedFilterGroup = ref<FilterGroup | null>(null)

/**
 * 当前过滤组
 */
const currentFilterGroup = computed<FilterGroup>(() => ({
  logic: filterLogic.value,
  conditions: filterConditions.value
}))

/**
 * 过滤后的数据
 */
const filteredData = computed(() => {
  let data = mockData

  // 应用搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    data = data.filter(item =>
      item.name.toLowerCase().includes(keyword) ||
      item.email.toLowerCase().includes(keyword)
    )
  }

  // 应用过滤
  if (appliedFilterGroup.value) {
    data = applyFilter(data, appliedFilterGroup.value)
  }

  return data
})

/**
 * 搜索
 */
function handleSearch(keyword: string) {
  console.log('搜索:', keyword)
}

/**
 * 清空搜索
 */
function handleClear() {
  console.log('清空搜索')
}

/**
 * 应用过滤
 */
function handleApplyFilter() {
  appliedFilterGroup.value = currentFilterGroup.value
}

/**
 * 重置过滤
 */
function handleResetFilter() {
  filterConditions.value = []
  appliedFilterGroup.value = null
}

/**
 * 应用保存的搜索
 */
function handleApplySavedSearch(filterGroup: FilterGroup) {
  filterConditions.value = filterGroup.conditions
  filterLogic.value = filterGroup.logic
  appliedFilterGroup.value = filterGroup
}

// 代码示例
const basicSearchCode = `<template>
  <Search
    v-model="searchKeyword"
    :config="searchConfig"
    @search="handleSearch"
    @clear="handleClear"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Search } from '@/components/Search'
import type { SearchConfig } from '@/components/Search'

const searchKeyword = ref('')

const searchConfig: SearchConfig = {
  placeholder: '搜索...',
  debounce: 300,
  clearable: true,
  showSearchButton: false,
  minLength: 0
}

function handleSearch(keyword: string) {
  console.log('搜索:', keyword)
}

function handleClear() {
  console.log('清空搜索')
}
<\/script>`

const advancedFilterCode = `<template>
  <FilterBuilder
    v-model="filterConditions"
    v-model:filter-logic="filterLogic"
    :fields="fieldConfigs"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { FilterBuilder, FilterLogic } from '@/components/Search'
import type { FilterCondition, FieldConfig } from '@/components/Search'

const filterConditions = ref<FilterCondition[]>([])
const filterLogic = ref<FilterLogic>(FilterLogic.AND)

const fieldConfigs: FieldConfig[] = [
  {
    field: 'name',
    label: '名称',
    type: 'string'
  },
  {
    field: 'age',
    label: '年龄',
    type: 'number'
  },
  {
    field: 'status',
    label: '状态',
    type: 'select',
    options: [
      { label: '激活', value: 'active' },
      { label: '禁用', value: 'inactive' }
    ]
  }
]
<\/script>`

const savedSearchCode = `<template>
  <SavedSearchManager
    :current-filter-group="currentFilterGroup"
    @apply="handleApplySavedSearch"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { SavedSearchManager } from '@/components/Search'
import type { FilterGroup } from '@/components/Search'

const currentFilterGroup = computed<FilterGroup>(() => ({
  logic: filterLogic.value,
  conditions: filterConditions.value
}))

function handleApplySavedSearch(filterGroup: FilterGroup) {
  // 应用保存的搜索
  filterConditions.value = filterGroup.conditions
  filterLogic.value = filterGroup.logic
}
<\/script>`

const filterUtilsCode = `import { applyFilter, highlightText } from '@/utils/filter-utils'

// 应用过滤
const filteredData = applyFilter(data, filterGroup)

// 高亮文本
const highlighted = highlightText('Hello World', 'World')
// 结果: 'Hello <mark>World</mark>'`
</script>

<style scoped lang="scss">
.search-example {
  padding: 20px;
}

pre {
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
  overflow-x: auto;
}

code {
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
  line-height: 1.5;
}

:deep(mark) {
  background-color: #ffeb3b;
  padding: 2px 4px;
  border-radius: 2px;
}
</style>
