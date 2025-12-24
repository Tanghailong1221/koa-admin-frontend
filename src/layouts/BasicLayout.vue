<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Menu,
  Odometer,
  TrendCharts,
  DataBoard,
  Document,
  User,
  Lock,
  Setting,
  Bell,
  Sunny,
  Moon,
} from '@element-plus/icons-vue'
import { useMenuStore } from '@/store/menu'
import { useTabsStore } from '@/store/tabs'
import { useThemeStore } from '@/store/theme'
import Breadcrumbs from '@/components/layout/Breadcrumbs.vue'
import TabsBar from '@/components/layout/TabsBar.vue'
import UserDropdown from '@/components/layout/UserDropdown.vue'

const route = useRoute()
const router = useRouter()
const menuStore = useMenuStore()
const tabsStore = useTabsStore()
const themeStore = useThemeStore()

const active = computed(() => route.path)
const keepAliveNames = computed(() => tabsStore.keepAliveNames)
const isDark = computed(() => themeStore.mode === 'dark')

// 菜单图标映射
const menuIconMap: Record<string, any> = {
  Odometer,
  TrendCharts,
  DataBoard,
  Document,
  User,
  Lock,
  Setting,
  Grid: DataBoard,
  Edit: Document,
  CircleCheck: Lock,
  Sunny,
  Filter: Document,
  Collection: DataBoard,
  Picture: Document,
  Monitor: TrendCharts,
  Key: Lock,
  UserFilled: User,
}

// 使用动态菜单
const menuItems = computed(() => menuStore.menus || [])

const handleSelect = (index: string) => {
  router.push(index)
}

// 获取菜单图标
const getMenuIcon = (iconName?: string) => {
  if (!iconName) return null
  return menuIconMap[iconName]
}
</script>

<template>
  <div class="layout" :class="{ 'is-dark': isDark }">
    <aside class="layout__sider">
      <!-- Logo 区 -->
      <div class="layout__logo">
        <el-icon class="logo-icon" :size="20">
          <Menu />
        </el-icon>
        <div class="logo-text">
          <div class="logo-text__main">科技管理系统</div>
          <div class="logo-text__sub">Enterprise Admin</div>
        </div>
      </div>
      
      <!-- 菜单区 -->
      <el-menu
        :default-active="active"
        class="layout__menu"
        router
        :unique-opened="true"
        @select="handleSelect"
      >
        <template v-for="item in menuItems" :key="item.path">
          <el-sub-menu v-if="item.children?.length" :index="item.path">
            <template #title>
              <el-icon v-if="getMenuIcon(item.icon)">
                <component :is="getMenuIcon(item.icon)" />
              </el-icon>
              <span>{{ item.name }}</span>
            </template>
            <el-menu-item
              v-for="child in item.children"
              :key="child.path"
              :index="child.path"
            >
              <el-icon v-if="getMenuIcon(child.icon)">
                <component :is="getMenuIcon(child.icon)" />
              </el-icon>
              <span>{{ child.name }}</span>
            </el-menu-item>
          </el-sub-menu>
          <el-menu-item v-else :index="item.path">
            <el-icon v-if="getMenuIcon(item.icon)">
              <component :is="getMenuIcon(item.icon)" />
            </el-icon>
            <span>{{ item.name }}</span>
          </el-menu-item>
        </template>
      </el-menu>
      
      <!-- 版本区 -->
      <div class="layout__version">
        <div class="version-card">
          <div class="version-card__label">系统版本</div>
          <div class="version-card__value">v2.5.0 Pro</div>
        </div>
      </div>
    </aside>
    <section class="layout__content">
      <header class="layout__header">
        <div class="layout__header-left">
          <span class="layout__title">KOA Admin 前端框架</span>
          <Breadcrumbs />
        </div>
        <div class="layout__header-right">
          <div class="header-actions">
            <el-badge :value="3" class="header-actions__badge" type="danger">
              <el-button class="header-actions__btn" text>
                <el-icon><Bell /></el-icon>
              </el-button>
            </el-badge>

            <el-button class="header-actions__btn" text @click="themeStore.toggle($event)">
              <el-icon :size="18">
                <component :is="isDark ? Sunny : Moon" />
              </el-icon>
            </el-button>
          </div>
          <UserDropdown />
        </div>
      </header>
      <div class="layout__tabs">
        <TabsBar />
      </div>
      <main class="layout__main">
        <RouterView v-slot="{ Component, route: r }">
          <KeepAlive :include="keepAliveNames">
            <component :is="Component" :key="r.fullPath" />
          </KeepAlive>
        </RouterView>
      </main>
    </section>
  </div>
</template>

<style scoped>
.layout {
  height: 100vh;
  display: flex;
  background: var(--bg-primary);
  position: relative;
  overflow: hidden;
}

/* ========== 亮色模式（默认） ========== */
.layout__sider {
  width: 240px;
  min-width: 240px;
  max-width: 240px;
  background: #fff;
  border-right: 1px solid #e5e6eb;
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 1000;
  overflow: hidden;
  transition: background 0.3s, border-color 0.3s;
}

.layout__logo {
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  gap: 12px;
  border-bottom: 1px solid #e5e6eb;
  background: #fff;
  transition: background 0.3s, border-color 0.3s;
}

.logo-icon {
  color: #165DFF;
  flex-shrink: 0;
}

.logo-text__main {
  font-weight: 700;
  font-size: 16px;
  color: #1f2d3d;
  line-height: 1.2;
  transition: color 0.3s;
}

.logo-text__sub {
  font-size: 12px;
  color: #86909c;
  line-height: 1.2;
  transition: color 0.3s;
}

.layout__menu {
  flex: 1;
  border-right: none;
  background: #F8FAFC;
  padding: 12px 8px;
  overflow-y: auto;
  min-height: 0;
  width: 100%;
  box-sizing: border-box;
  transition: background 0.3s;
}

.layout__menu :deep(.el-menu) {
  background: transparent;
  border: none;
}

.layout__menu :deep(.el-menu-item) {
  color: #4e5969;
  border-radius: 8px;
  margin: 4px 0;
  height: 40px;
  line-height: 40px;
  transition: all 0.3s;
}

.layout__menu :deep(.el-menu-item:hover) {
  background: #eef4fb;
}

.layout__menu :deep(.el-menu-item.is-active) {
  color: #165DFF;
  background: linear-gradient(90deg, #e8f3ff 0%, #f7fbff 100%);
  font-weight: 600;
}

.layout__menu :deep(.el-sub-menu__title) {
  color: #4e5969;
  border-radius: 8px;
  margin: 4px 0;
  height: 40px;
  line-height: 40px;
  transition: all 0.3s;
}

.layout__menu :deep(.el-sub-menu__title:hover) {
  background: #eef4fb;
}

.layout__menu :deep(.el-sub-menu .el-menu) {
  background: transparent;
}

.layout__menu :deep(.el-sub-menu .el-menu-item) {
  padding-left: 48px !important;
}

.layout__version {
  padding: 16px 12px;
  border-top: 1px solid #e5e6eb;
  background: #fff;
  transition: background 0.3s, border-color 0.3s;
}

.version-card {
  background: linear-gradient(135deg, #f4f5ff 0%, #f0f4ff 100%);
  border-radius: 12px;
  padding: 12px 16px;
  border: 1px solid rgba(152, 173, 255, 0.3);
  transition: all 0.3s;
}

.version-card__label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
  transition: color 0.3s;
}

.version-card__value {
  font-size: 14px;
  font-weight: 600;
  color: #165DFF;
  transition: color 0.3s;
}

/* ========== 暗色模式 ========== */
.layout.is-dark .layout__sider {
  background: #0f172a;
  border-right-color: #1e293b;
}

.layout.is-dark .layout__logo {
  background: #0f172a;
  border-bottom-color: #1e293b;
}

.layout.is-dark .logo-text__main {
  color: #f1f5f9;
}

.layout.is-dark .logo-text__sub {
  color: #94a3b8;
}

.layout.is-dark .layout__menu {
  background: #0c1324;
}

.layout.is-dark .layout__menu :deep(.el-menu-item) {
  color: #cbd5e1;
}

.layout.is-dark .layout__menu :deep(.el-menu-item:hover) {
  background: #1e293b;
  color: #f1f5f9;
}

.layout.is-dark .layout__menu :deep(.el-menu-item.is-active) {
  color: #60a5fa;
  background: linear-gradient(90deg, rgba(22, 93, 255, 0.15) 0%, rgba(22, 93, 255, 0.05) 100%);
}

.layout.is-dark .layout__menu :deep(.el-sub-menu__title) {
  color: #cbd5e1;
}

.layout.is-dark .layout__menu :deep(.el-sub-menu__title:hover) {
  background: #1e293b;
  color: #f1f5f9;
}

.layout.is-dark .layout__menu :deep(.el-sub-menu .el-menu-item) {
  color: #cbd5e1;
}

.layout.is-dark .layout__menu :deep(.el-sub-menu .el-menu-item:hover) {
  background: #1e293b;
  color: #f1f5f9;
}

.layout.is-dark .layout__version {
  background: #0f172a;
  border-top-color: #1e293b;
}

.layout.is-dark .version-card {
  background: linear-gradient(135deg, rgba(22, 93, 255, 0.1) 0%, rgba(22, 93, 255, 0.05) 100%);
  border-color: rgba(22, 93, 255, 0.2);
}

.layout.is-dark .version-card__label {
  color: #94a3b8;
}

.layout.is-dark .version-card__value {
  color: #60a5fa;
}

.layout.is-dark .header-actions__btn {
  background: rgba(30, 41, 59, 0.8);
  border-color: #334155;
  color: #f1f5f9;
}

.layout.is-dark .header-actions__btn:hover {
  background: rgba(22, 93, 255, 0.2);
  border-color: #3b82f6;
  color: #60a5fa;
}

/* ========== 内容区域 ========== */
.layout__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
  margin-left: 240px;
  height: 100vh;
  overflow: hidden;
}

.layout__header {
  height: 64px;
  min-height: 64px;
  display: flex;
  align-items: center;
  padding: 0 24px;
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-color);
  color: var(--text-primary);
  font-weight: 600;
  justify-content: space-between;
  box-shadow: var(--shadow-sm);
  flex-shrink: 0;
}

.layout__header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.layout__header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-actions__btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  padding: 0;
  transition: all 0.25s ease;
}

.header-actions__btn:hover {
  background: rgba(22, 93, 255, 0.1);
  border-color: #165DFF;
  color: #165DFF;
}

.layout__title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
}

.layout__tabs {
  padding: 0 16px;
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

.layout__main {
  flex: 1;
  padding: 6px;
  background: transparent;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;
}
</style>
