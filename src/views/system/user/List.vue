<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { fetchUserList, type UserListItem } from '@/api/user'

const loading = ref(false)
const tableData = ref<UserListItem[]>([])

const query = reactive({
  username: '',
  pageNum: 1,
  pageSize: 10,
  total: 0,
})

const loadData = async () => {
  loading.value = true
  try {
    const res = await fetchUserList({
      username: query.username || undefined,
      pageNum: query.pageNum,
      pageSize: query.pageSize,
    })
    query.total = res.total
    tableData.value = res.list
  } catch (error: any) {
    ElMessage.error(error?.message || '加载失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  query.pageNum = 1
  loadData()
}

const handlePageChange = (page: number) => {
  query.pageNum = page
  loadData()
}

const handleSizeChange = (size: number) => {
  query.pageSize = size
  loadData()
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <el-card>
    <template #header>用户管理</template>
    <div class="toolbar">
      <el-input
        v-model="query.username"
        placeholder="用户名"
        clearable
        class="toolbar__input"
        @keyup.enter.native="handleSearch"
      />
      <el-button type="primary" @click="handleSearch">搜索</el-button>
    </div>
    <el-table v-loading="loading" :data="tableData" border stripe>
      <el-table-column prop="username" label="用户名" width="160" />
      <el-table-column prop="nickname" label="昵称" width="160" />
      <el-table-column prop="roleName" label="角色" width="160" />
      <el-table-column prop="orgName" label="组织" width="160" />
      <el-table-column prop="phone" label="手机" width="160" />
      <el-table-column prop="email" label="邮箱" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'">
            {{ row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="180" />
      <el-table-column label="操作" width="160">
        <template #default>
          <el-button type="primary" text size="small" v-perm="['user:detail']">详情</el-button>
          <el-button type="primary" text size="small" v-perm="['user:update']">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="pager">
      <el-pagination
        layout="total, sizes, prev, pager, next, jumper"
        :current-page="query.pageNum"
        :page-size="query.pageSize"
        :total="query.total"
        :page-sizes="[10, 20, 50]"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </div>
  </el-card>
</template>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}
.toolbar__input {
  width: 200px;
}
.pager {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
}
</style>

