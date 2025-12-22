<script setup lang="ts">
import { watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTabsStore } from '@/store/tabs'

const route = useRoute()
const router = useRouter()
const tabs = useTabsStore()

tabs.initHome(route)
tabs.addTab(route)

watch(
  () => route.fullPath,
  () => {
    tabs.addTab(route)
  }
)

const handleTabClick = (pane: any) => {
  const path = pane.props.name as string
  tabs.setActive(path)
  router.push(path)
}

const handleTabRemove = (path: string) => {
  const next = tabs.removeTab(path)
  if (next) {
    router.push(next)
  }
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
}
</script>

<template>
  <div class="tabs">
    <el-tabs
      v-model="tabs.activePath"
      type="card"
      @tab-click="handleTabClick"
      @tab-remove="handleTabRemove"
    >
      <el-tab-pane
        v-for="item in tabs.visited"
        :key="item.path"
        :name="item.path"
        :label="item.title"
        :closable="item.closable"
      />
    </el-tabs>
    <el-dropdown trigger="click" @command="handleCommand">
      <el-button class="tabs__more" size="small">标签操作</el-button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="close-current">关闭当前</el-dropdown-item>
          <el-dropdown-item command="close-others">关闭其他</el-dropdown-item>
          <el-dropdown-item command="close-all">关闭全部</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<style scoped>
.tabs {
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.tabs :deep(.el-tabs__header) {
  margin: 0;
  border: none;
}

.tabs :deep(.el-tabs__nav-wrap) {
  background: transparent;
}

.tabs :deep(.el-tabs__item) {
  background: var(--bg-glass);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  padding: 8px 16px;
  margin-right: 8px;
  transition: all 0.3s ease;
}

.tabs :deep(.el-tabs__item:hover) {
  background: var(--bg-glass-hover);
  border-color: var(--border-color-hover);
  color: var(--text-primary);
}

.tabs :deep(.el-tabs__item.is-active) {
  background: var(--gradient-primary);
  border-color: transparent;
  color: var(--text-primary);
  box-shadow: var(--shadow-glow-cyan);
}

.tabs :deep(.el-tabs__item .el-icon-close) {
  color: var(--text-tertiary);
  transition: color 0.3s ease;
}

.tabs :deep(.el-tabs__item .el-icon-close:hover) {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
}

.tabs__more {
  flex-shrink: 0;
  background: var(--bg-glass);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  transition: all 0.3s ease;
}

.tabs__more:hover {
  background: var(--bg-glass-hover);
  border-color: var(--border-color-hover);
  box-shadow: var(--shadow-sm);
}
</style>

