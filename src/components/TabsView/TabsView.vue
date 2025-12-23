<template>
  <div class="tabs-view-container">
    <el-scrollbar class="tabs-scrollbar">
      <div class="tabs-content">
        <div
          v-for="tab in tabs"
          :key="tab.path"
          :class="['tab-item', { active: isActive(tab.path), fixed: tab.fixed }]"
          @click="handleTabClick(tab)"
          @contextmenu.prevent="handleContextMenu($event, tab)"
        >
          <el-icon v-if="tab.icon" class="tab-icon">
            <component :is="tab.icon" />
          </el-icon>
          <span class="tab-title">{{ tab.title }}</span>
          <el-icon
            v-if="!tab.fixed && tabs.length > 1"
            class="tab-close"
            @click.stop="handleTabClose(tab)"
          >
            <Close />
          </el-icon>
        </div>
      </div>
    </el-scrollbar>

    <!-- 右键菜单 -->
    <ul
      v-show="contextMenuVisible"
      :style="{ left: contextMenuLeft + 'px', top: contextMenuTop + 'px' }"
      class="context-menu"
    >
      <li @click="handleRefresh">
        <el-icon><Refresh /></el-icon>
        <span>{{ t('common.action.refresh') }}</span>
      </li>
      <li v-if="!selectedTab?.fixed" @click="handleClose">
        <el-icon><Close /></el-icon>
        <span>{{ t('common.action.close') }}</span>
      </li>
      <li @click="handleCloseOthers">
        <el-icon><CircleClose /></el-icon>
        <span>关闭其他</span>
      </li>
      <li @click="handleCloseLeft">
        <el-icon><Back /></el-icon>
        <span>关闭左侧</span>
      </li>
      <li @click="handleCloseRight">
        <el-icon><Right /></el-icon>
        <span>关闭右侧</span>
      </li>
      <li @click="handleCloseAll">
        <el-icon><CircleCloseFilled /></el-icon>
        <span>关闭全部</span>
      </li>
      <li v-if="!selectedTab?.fixed" @click="handleToggleFixed">
        <el-icon><Lock /></el-icon>
        <span>{{ selectedTab?.fixed ? '取消固定' : '固定标签' }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from '@/composables'
import {
  Close,
  Refresh,
  CircleClose,
  CircleCloseFilled,
  Back,
  Right,
  Lock
} from '@element-plus/icons-vue'

export interface TabItem {
  path: string
  title: string
  icon?: any
  fixed?: boolean
  query?: Record<string, any>
}

interface Props {
  /** 最大标签数量 */
  maxTabs?: number
  /** 固定的标签路径 */
  fixedTabs?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  maxTabs: 10,
  fixedTabs: () => ['/']
})

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

// 标签列表
const tabs = ref<TabItem[]>([])

// 右键菜单
const contextMenuVisible = ref(false)
const contextMenuLeft = ref(0)
const contextMenuTop = ref(0)
const selectedTab = ref<TabItem>()

/**
 * 判断标签是否激活
 */
function isActive(path: string): boolean {
  return route.path === path
}

/**
 * 添加标签
 */
function addTab(tab: TabItem): void {
  // 检查是否已存在
  const existIndex = tabs.value.findIndex(item => item.path === tab.path)
  if (existIndex > -1) {
    // 更新已存在的标签
    tabs.value[existIndex] = { ...tabs.value[existIndex], ...tab }
    return
  }

  // 检查是否超过最大数量
  if (tabs.value.length >= props.maxTabs) {
    // 移除最早的非固定标签
    const removeIndex = tabs.value.findIndex(item => !item.fixed)
    if (removeIndex > -1) {
      tabs.value.splice(removeIndex, 1)
    }
  }

  // 添加新标签
  tabs.value.push(tab)
}

/**
 * 移除标签
 */
function removeTab(path: string): void {
  const index = tabs.value.findIndex(item => item.path === path)
  if (index === -1) return

  const tab = tabs.value[index]
  if (tab.fixed) return

  tabs.value.splice(index, 1)

  // 如果关闭的是当前标签，跳转到相邻标签
  if (isActive(path)) {
    const nextTab = tabs.value[index] || tabs.value[index - 1]
    if (nextTab) {
      router.push(nextTab.path)
    }
  }
}

/**
 * 点击标签
 */
function handleTabClick(tab: TabItem): void {
  if (!isActive(tab.path)) {
    router.push({ path: tab.path, query: tab.query })
  }
}

/**
 * 关闭标签
 */
function handleTabClose(tab: TabItem): void {
  removeTab(tab.path)
}

/**
 * 右键菜单
 */
function handleContextMenu(event: MouseEvent, tab: TabItem): void {
  selectedTab.value = tab
  contextMenuLeft.value = event.clientX
  contextMenuTop.value = event.clientY
  contextMenuVisible.value = true
}

/**
 * 刷新
 */
function handleRefresh(): void {
  contextMenuVisible.value = false
  const tab = selectedTab.value
  if (tab) {
    router.replace({
      path: tab.path,
      query: { ...tab.query, _t: Date.now() }
    })
  }
}

/**
 * 关闭
 */
function handleClose(): void {
  contextMenuVisible.value = false
  const tab = selectedTab.value
  if (tab && !tab.fixed) {
    removeTab(tab.path)
  }
}

/**
 * 关闭其他
 */
function handleCloseOthers(): void {
  contextMenuVisible.value = false
  const tab = selectedTab.value
  if (!tab) return

  tabs.value = tabs.value.filter(
    item => item.fixed || item.path === tab.path
  )

  // 如果当前标签被关闭，跳转到选中的标签
  if (!isActive(tab.path)) {
    router.push(tab.path)
  }
}

/**
 * 关闭左侧
 */
function handleCloseLeft(): void {
  contextMenuVisible.value = false
  const tab = selectedTab.value
  if (!tab) return

  const index = tabs.value.findIndex(item => item.path === tab.path)
  if (index === -1) return

  tabs.value = tabs.value.filter((item, i) => i >= index || item.fixed)
}

/**
 * 关闭右侧
 */
function handleCloseRight(): void {
  contextMenuVisible.value = false
  const tab = selectedTab.value
  if (!tab) return

  const index = tabs.value.findIndex(item => item.path === tab.path)
  if (index === -1) return

  tabs.value = tabs.value.filter((item, i) => i <= index || item.fixed)
}

/**
 * 关闭全部
 */
function handleCloseAll(): void {
  contextMenuVisible.value = false
  tabs.value = tabs.value.filter(item => item.fixed)

  // 跳转到第一个固定标签
  const firstFixed = tabs.value.find(item => item.fixed)
  if (firstFixed && !isActive(firstFixed.path)) {
    router.push(firstFixed.path)
  }
}

/**
 * 切换固定状态
 */
function handleToggleFixed(): void {
  contextMenuVisible.value = false
  const tab = selectedTab.value
  if (!tab) return

  const index = tabs.value.findIndex(item => item.path === tab.path)
  if (index > -1) {
    tabs.value[index].fixed = !tabs.value[index].fixed
  }
}

/**
 * 关闭右键菜单
 */
function closeContextMenu(): void {
  contextMenuVisible.value = false
}

/**
 * 从路由生成标签
 */
function generateTabFromRoute(): TabItem {
  return {
    path: route.path,
    title: (route.meta?.title as string) || route.name?.toString() || route.path,
    icon: route.meta?.icon,
    fixed: props.fixedTabs.includes(route.path),
    query: route.query as Record<string, any>
  }
}

/**
 * 初始化标签
 */
function initTabs(): void {
  // 添加固定标签
  props.fixedTabs.forEach(path => {
    const matchedRoute = router.getRoutes().find(r => r.path === path)
    if (matchedRoute) {
      addTab({
        path,
        title: (matchedRoute.meta?.title as string) || path,
        icon: matchedRoute.meta?.icon,
        fixed: true
      })
    }
  })

  // 添加当前路由
  if (!props.fixedTabs.includes(route.path)) {
    addTab(generateTabFromRoute())
  }
}

/**
 * 监听路由变化
 */
watch(
  () => route.path,
  () => {
    addTab(generateTabFromRoute())
  }
)

/**
 * 监听点击事件，关闭右键菜单
 */
onMounted(() => {
  document.addEventListener('click', closeContextMenu)
  initTabs()
})

onUnmounted(() => {
  document.removeEventListener('click', closeContextMenu)
})

// 暴露方法供外部调用
defineExpose({
  addTab,
  removeTab,
  tabs
})
</script>

<style scoped lang="scss">
.tabs-view-container {
  position: relative;
  height: 40px;
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.12);
}

.tabs-scrollbar {
  height: 100%;
  
  :deep(.el-scrollbar__wrap) {
    overflow-x: auto;
    overflow-y: hidden;
  }
}

.tabs-content {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 10px;
  white-space: nowrap;
}

.tab-item {
  display: inline-flex;
  align-items: center;
  height: 30px;
  padding: 0 12px;
  margin-right: 6px;
  font-size: 13px;
  line-height: 30px;
  color: #666;
  background-color: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.3s;
  user-select: none;

  &:hover {
    color: var(--el-color-primary);
    background-color: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary-light-5);
  }

  &.active {
    color: #fff;
    background-color: var(--el-color-primary);
    border-color: var(--el-color-primary);
  }

  &.fixed {
    .tab-close {
      display: none;
    }
  }

  .tab-icon {
    margin-right: 4px;
    font-size: 14px;
  }

  .tab-title {
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .tab-close {
    margin-left: 6px;
    font-size: 12px;
    border-radius: 50%;
    transition: all 0.3s;

    &:hover {
      color: #fff;
      background-color: rgba(0, 0, 0, 0.2);
    }
  }
}

.context-menu {
  position: fixed;
  z-index: 3000;
  min-width: 120px;
  padding: 5px 0;
  margin: 0;
  font-size: 13px;
  color: #333;
  list-style: none;
  background-color: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

  li {
    display: flex;
    align-items: center;
    padding: 8px 16px;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      color: var(--el-color-primary);
      background-color: var(--el-color-primary-light-9);
    }

    .el-icon {
      margin-right: 8px;
      font-size: 14px;
    }
  }
}
</style>
