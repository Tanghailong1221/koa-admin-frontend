<template>
  <div class="saved-search-manager">
    <!-- 保存的搜索列表 -->
    <el-select
      v-model="selectedSearchId"
      placeholder="选择已保存的搜索"
      clearable
      style="width: 100%; margin-bottom: 12px"
      @change="handleApply"
    >
      <el-option
        v-for="search in savedSearches"
        :key="search.id"
        :label="search.name"
        :value="search.id"
      >
        <div style="display: flex; justify-content: space-between; align-items: center">
          <span>{{ search.name }}</span>
          <el-button
            type="danger"
            :icon="Delete"
            size="small"
            text
            @click.stop="handleDelete(search.id)"
          />
        </div>
      </el-option>
    </el-select>

    <!-- 保存当前搜索 -->
    <el-button :icon="Plus" style="width: 100%" @click="showSaveDialog = true">
      保存当前搜索
    </el-button>

    <!-- 保存对话框 -->
    <el-dialog
      v-model="showSaveDialog"
      title="保存搜索"
      width="400px"
    >
      <el-form :model="saveForm" label-width="80px">
        <el-form-item label="名称" required>
          <el-input
            v-model="saveForm.name"
            placeholder="请输入搜索名称"
          />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="saveForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入搜索描述（可选）"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showSaveDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Delete } from '@element-plus/icons-vue'
import type { SavedSearch, FilterGroup } from './types'

interface Props {
  /** 当前过滤组 */
  currentFilterGroup: FilterGroup
  /** 存储键 */
  storageKey?: string
}

const props = withDefaults(defineProps<Props>(), {
  storageKey: 'saved-searches'
})

const emit = defineEmits<{
  apply: [filterGroup: FilterGroup]
}>()

const selectedSearchId = ref<string>()
const showSaveDialog = ref(false)
const saveForm = ref({
  name: '',
  description: ''
})

/**
 * 获取保存的搜索列表
 */
const savedSearches = computed<SavedSearch[]>(() => {
  try {
    const data = localStorage.getItem(props.storageKey)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('读取保存的搜索失败:', error)
    return []
  }
})

/**
 * 保存搜索
 */
function handleSave() {
  if (!saveForm.value.name) {
    ElMessage.warning('请输入搜索名称')
    return
  }

  const newSearch: SavedSearch = {
    id: `search-${Date.now()}`,
    name: saveForm.value.name,
    description: saveForm.value.description,
    filterGroup: props.currentFilterGroup,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }

  const searches = [...savedSearches.value, newSearch]
  localStorage.setItem(props.storageKey, JSON.stringify(searches))

  ElMessage.success('保存成功')
  showSaveDialog.value = false
  saveForm.value = { name: '', description: '' }
}

/**
 * 应用搜索
 */
function handleApply(searchId: string) {
  if (!searchId) return

  const search = savedSearches.value.find(s => s.id === searchId)
  if (search) {
    emit('apply', search.filterGroup)
    ElMessage.success(`已应用搜索: ${search.name}`)
  }
}

/**
 * 删除搜索
 */
async function handleDelete(searchId: string) {
  try {
    await ElMessageBox.confirm('确定要删除这个保存的搜索吗？', '提示', {
      type: 'warning'
    })

    const searches = savedSearches.value.filter(s => s.id !== searchId)
    localStorage.setItem(props.storageKey, JSON.stringify(searches))

    if (selectedSearchId.value === searchId) {
      selectedSearchId.value = undefined
    }

    ElMessage.success('删除成功')
  } catch (error) {
    // 用户取消
  }
}
</script>

<style scoped lang="scss">
.saved-search-manager {
  // 样式
}
</style>
