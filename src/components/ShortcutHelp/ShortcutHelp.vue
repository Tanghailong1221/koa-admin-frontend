<template>
  <el-dialog
    v-model="visible"
    title="键盘快捷键"
    width="600px"
    :close-on-click-modal="true"
    :close-on-press-escape="true"
  >
    <div class="shortcut-help">
      <!-- 搜索框 -->
      <el-input
        v-model="searchText"
        placeholder="搜索快捷键..."
        clearable
        style="margin-bottom: 20px"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>

      <!-- 快捷键列表 -->
      <div v-if="filteredCategories.length > 0" class="shortcut-list">
        <div
          v-for="category in filteredCategories"
          :key="category.name"
          class="shortcut-category"
        >
          <h3 class="category-title">{{ category.title }}</h3>
          <div class="shortcut-items">
            <div
              v-for="shortcut in category.shortcuts"
              :key="shortcut.id"
              class="shortcut-item"
            >
              <div class="shortcut-description">
                {{ shortcut.config.description }}
              </div>
              <div class="shortcut-keys">
                <kbd
                  v-for="(key, index) in getKeys(shortcut.config.keys)"
                  :key="index"
                  class="shortcut-key"
                >
                  {{ formatKey(key) }}
                </kbd>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 无结果 -->
      <el-empty v-else description="没有找到匹配的快捷键" />
    </div>

    <template #footer>
      <el-button @click="visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { keyboardShortcutManager, ShortcutCategory, formatShortcutKey } from '@/utils/keyboard-shortcuts'
import type { ShortcutConfig } from '@/utils/keyboard-shortcuts'

const visible = ref(false)
const searchText = ref('')

interface ShortcutItem {
  id: string
  config: ShortcutConfig
}

interface CategoryGroup {
  name: string
  title: string
  shortcuts: ShortcutItem[]
}

/**
 * 分类标题映射
 */
const categoryTitles: Record<string, string> = {
  [ShortcutCategory.GENERAL]: '通用',
  [ShortcutCategory.NAVIGATION]: '导航',
  [ShortcutCategory.EDIT]: '编辑',
  [ShortcutCategory.VIEW]: '视图',
  [ShortcutCategory.OTHER]: '其他'
}

/**
 * 获取所有快捷键并按分类分组
 */
const categories = computed<CategoryGroup[]>(() => {
  const shortcuts = keyboardShortcutManager.getAll()
  const groups: Record<string, ShortcutItem[]> = {}

  // 按分类分组
  shortcuts.forEach((config, id) => {
    const category = config.category || ShortcutCategory.OTHER
    if (!groups[category]) {
      groups[category] = []
    }
    groups[category].push({ id, config })
  })

  // 转换为数组
  return Object.entries(groups).map(([name, shortcuts]) => ({
    name,
    title: categoryTitles[name] || name,
    shortcuts
  }))
})

/**
 * 过滤后的分类
 */
const filteredCategories = computed<CategoryGroup[]>(() => {
  if (!searchText.value) {
    return categories.value
  }

  const search = searchText.value.toLowerCase()
  return categories.value
    .map(category => ({
      ...category,
      shortcuts: category.shortcuts.filter(shortcut => {
        const description = shortcut.config.description.toLowerCase()
        const keys = getKeys(shortcut.config.keys).join(' ').toLowerCase()
        return description.includes(search) || keys.includes(search)
      })
    }))
    .filter(category => category.shortcuts.length > 0)
})

/**
 * 获取快捷键数组
 */
function getKeys(keys: string | string[]): string[] {
  return Array.isArray(keys) ? keys : [keys]
}

/**
 * 格式化快捷键显示
 */
function formatKey(key: string): string {
  return formatShortcutKey(key)
}

/**
 * 显示对话框
 */
function show(): void {
  visible.value = true
  searchText.value = ''
}

/**
 * 隐藏对话框
 */
function hide(): void {
  visible.value = false
}

/**
 * 监听快捷键帮助事件
 */
function handleShortcutHelp(): void {
  show()
}

onMounted(() => {
  window.addEventListener('shortcut-help', handleShortcutHelp)
})

onUnmounted(() => {
  window.removeEventListener('shortcut-help', handleShortcutHelp)
})

// 暴露方法
defineExpose({
  show,
  hide
})
</script>

<style scoped lang="scss">
.shortcut-help {
  max-height: 60vh;
  overflow-y: auto;
}

.shortcut-list {
  .shortcut-category {
    margin-bottom: 24px;

    &:last-child {
      margin-bottom: 0;
    }

    .category-title {
      margin: 0 0 12px 0;
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }

    .shortcut-items {
      .shortcut-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 12px;
        margin-bottom: 4px;
        background-color: #f5f7fa;
        border-radius: 4px;
        transition: background-color 0.3s;

        &:hover {
          background-color: #e4e7ed;
        }

        .shortcut-description {
          flex: 1;
          font-size: 14px;
          color: #606266;
        }

        .shortcut-keys {
          display: flex;
          gap: 4px;

          .shortcut-key {
            display: inline-block;
            padding: 2px 8px;
            font-size: 12px;
            font-family: 'Courier New', Courier, monospace;
            color: #303133;
            background-color: #fff;
            border: 1px solid #dcdfe6;
            border-radius: 3px;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
          }
        }
      }
    }
  }
}
</style>
