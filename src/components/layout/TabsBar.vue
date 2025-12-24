<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTabsStore } from '@/store/tabs'
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const tabs = useTabsStore()

const scrollContainer = ref<HTMLElement | null>(null)
const showLeftArrow = ref(false)
const showRightArrow = ref(false)

tabs.initHome(route)
tabs.addTab(route)

watch(
  () => route.fullPath,
  () => {
    tabs.addTab(route)
    nextTick(() => {
      scrollToActiveTab()
      updateArrows()
    })
  }
)

// 更新箭头显示状态
const updateArrows = () => {
  if (!scrollContainer.value) return
  const { scrollLeft, scrollWidth, clientWidth } = scrollContainer.value
  showLeftArrow.value = scrollLeft > 0
  showRightArrow.value = scrollLeft + clientWidth < scrollWidth - 1
}

// 滚动到激活的标签
const scrollToActiveTab = () => {
  if (!scrollContainer.value) return
  const activeTab = scrollContainer.value.querySelector('.tab-item.is-active') as HTMLElement
  if (activeTab) {
    const containerRect = scrollContainer.value.getBoundingClientRect()
    const tabRect = activeTab.getBoundingClientRect()
    if (tabRect.left < containerRect.left) {
      scrollContainer.value.scrollLeft -= containerRect.left - tabRect.left + 20
    } else if (tabRect.right > containerRect.right) {
      scrollContainer.value.scrollLeft += tabRect.right - containerRect.right + 20
    }
  }
}

// 左滑
const scrollLeft = () => {
  if (!scrollContainer.value) return
  scrollContainer.value.scrollLeft -= 200
  setTimeout(updateArrows, 300)
}

// 右滑
const scrollRight = () => {
  if (!scrollContainer.value) return
  scrollContainer.value.scrollLeft += 200
  setTimeout(updateArrows, 300)
}

const handleTabClick = (path: string) => {
  tabs.setActive(path)
  router.push(path)
}

const handleTabRemove = (path: string, e: Event) => {
  e.stopPropagation()
  const next = tabs.removeTab(path)
  if (next) {
    router.push(next)
  }
  nextTick(updateArrows)
}

const handleCommand = (command: string) => {
  if (command === 'close-current') {
    if (route.fullPath !== '/' && tabs.visited.find(v => v.path === route.fullPath)?.closable) {
      const next = tabs.removeTab(route.fullPath)
      router.push(next)
    }
  }
  if (command === 'close-others') {
    const next = tabs.removeOthers(route.fullPath)
    router.push(next)
  }
  if (command === 'close-all') {
    const next = tabs.removeAll()
    router.push(next)
  }
  nextTick(updateArrows)
}

// 初始化时更新箭头
nextTick(() => {
  updateArrows()
  if (scrollContainer.value) {
    scrollContainer.value.addEventListener('scroll', updateArrows)
  }
})
</script>

<template>
  <div class="tabs-bar">
    <!-- 左箭头 -->
    <div v-show="showLeftArrow" class="tabs-bar__arrow tabs-bar__arrow--left" @click="scrollLeft">
      <el-icon><ArrowLeft /></el-icon>
    </div>
    
    <!-- 标签滚动区域 -->
    <div ref="scrollContainer" class="tabs-bar__scroll">
      <div class="tabs-bar__content">
        <div
          v-for="item in tabs.visited"
          :key="item.path"
          class="tab-item"
          :class="{ 'is-active': tabs.activePath === item.path }"
          @click="handleTabClick(item.path)"
        >
          <span class="tab-item__title">{{ item.title }}</span>
          <span
            v-if="item.closable"
            class="tab-item__close"
            @click="handleTabRemove(item.path, $event)"
          >×</span>
        </div>
      </div>
    </div>
    
    <!-- 右箭头 -->
    <div v-show="showRightArrow" class="tabs-bar__arrow tabs-bar__arrow--right" @click="scrollRight">
      <el-icon><ArrowRight /></el-icon>
    </div>
    
    <!-- 操作按钮 -->
    <div class="tabs-bar__actions">
      <el-dropdown trigger="click" @command="handleCommand">
        <el-button class="tabs-bar__more" size="small">
          <span>操作</span>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="close-current">关闭当前</el-dropdown-item>
            <el-dropdown-item command="close-others">关闭其他</el-dropdown-item>
            <el-dropdown-item command="close-all">关闭全部</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<style scoped>
.tabs-bar {
  display: flex;
  align-items: center;
  height: 32px;
  padding: 4px 0;
  position: relative;
}

.tabs-bar__arrow {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-secondary);
  background: var(--bg-glass);
  border-radius: 4px;
  flex-shrink: 0;
  transition: all 0.2s;
  z-index: 2;
}

.tabs-bar__arrow:hover {
  color: var(--color-primary);
  background: var(--bg-glass-hover);
}

.tabs-bar__arrow--left {
  margin-right: 4px;
}

.tabs-bar__arrow--right {
  margin-left: 4px;
}

.tabs-bar__scroll {
  flex: 1;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-behavior: smooth;
  min-width: 0;
}

.tabs-bar__scroll::-webkit-scrollbar {
  display: none;
}

.tabs-bar__scroll {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.tabs-bar__content {
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
}

.tab-item {
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 8px;
  font-size: 12px;
  color: var(--text-secondary);
  background: var(--bg-glass);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.tab-item:hover {
  color: var(--text-primary);
  background: var(--bg-glass-hover);
  border-color: var(--border-color-hover);
}

.tab-item.is-active {
  color: #fff;
  background: var(--color-primary, #165DFF);
  border-color: var(--color-primary, #165DFF);
}

.tab-item__title {
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tab-item__close {
  margin-left: 4px;
  width: 14px;
  height: 14px;
  line-height: 12px;
  text-align: center;
  border-radius: 50%;
  font-size: 14px;
  transition: all 0.2s;
}

.tab-item__close:hover {
  background: rgba(0, 0, 0, 0.15);
}

.tab-item.is-active .tab-item__close:hover {
  background: rgba(255, 255, 255, 0.25);
}

.tabs-bar__actions {
  flex-shrink: 0;
  margin-left: 8px;
  padding-left: 8px;
  border-left: 1px solid var(--border-color);
}

.tabs-bar__more {
  height: 24px;
  padding: 0 8px;
  font-size: 12px;
  background: var(--bg-glass);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  color: var(--text-secondary);
}

.tabs-bar__more:hover {
  color: var(--color-primary);
  border-color: var(--color-primary);
  background: var(--bg-glass-hover);
}
</style>
