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
  Fold,
  Expand,
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
const keepAliveNames = computed(() => (tabsStore as any).keepAliveNames || [])
const isDark = computed(() => themeStore.mode === 'dark')
const isCollapsed = computed(() => themeStore.sidebarCollapsed)

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

// 切换侧边栏收缩状态
const toggleSidebar = () => {
  themeStore.toggleSidebar()
}
</script>

<template>
  <div class="layout" :class="{ 'is-dark': isDark, 'is-collapsed': isCollapsed }">
    <aside class="layout__sider">
      <!-- Logo 区 -->
      <div class="layout__logo">
        <el-icon class="logo-icon" :size="20">
          <Menu />
        </el-icon>
        <div v-show="!isCollapsed" class="logo-text">
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
        :collapse="isCollapsed"
        :collapse-transition="false"
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
              <template #title>{{ child.name }}</template>
            </el-menu-item>
          </el-sub-menu>
          <el-menu-item v-else :index="item.path">
            <el-icon v-if="getMenuIcon(item.icon)">
              <component :is="getMenuIcon(item.icon)" />
            </el-icon>
            <template #title>{{ item.name }}</template>
          </el-menu-item>
        </template>
      </el-menu>
      
      <!-- 版本区 -->
      <div v-show="!isCollapsed" class="layout__version">
        <div class="version-card">
          <div class="version-card__label">系统版本</div>
          <div class="version-card__value">v2.5.0 Pro</div>
        </div>
      </div>
    </aside>
    <section class="layout__content">
      <header class="layout__header">
        <div class="layout__header-left">
          <!-- 收缩按钮 -->
          <el-tooltip :content="isCollapsed ? '展开菜单' : '收起菜单'" placement="bottom">
            <el-button class="collapse-btn" text @click="toggleSidebar">
              <el-icon :size="18">
                <Expand v-if="isCollapsed" />
                <Fold v-else />
              </el-icon>
            </el-button>
          </el-tooltip>
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
  transition: width 0.3s ease, min-width 0.3s ease, max-width 0.3s ease, background 0.3s, border-color 0.3s;
}

/* 收缩状态 */
.layout.is-collapsed .layout__sider {
  width: 64px;
  min-width: 64px;
  max-width: 64px;
}

.layout.is-collapsed .layout__content {
  margin-left: 64px;
}

.layout__logo {
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  gap: 12px;
  border-bottom: 1px solid #e5e6eb;
  background: #fff;
  transition: padding 0.3s ease, background 0.3s, border-color 0.3s;
}

.layout.is-collapsed .layout__logo {
  padding: 0;
  justify-content: center;
}

.logo-icon {
  color: #165DFF;
  flex-shrink: 0;
}

.logo-text {
  overflow: hidden;
  white-space: nowrap;
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
  transition: background 0.3s, padding 0.3s ease;
}

.layout.is-collapsed .layout__menu {
  padding: 12px 0;
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

/* 收缩状态下的菜单样式 - 确保图标垂直居中对齐 */
.layout.is-collapsed .layout__menu :deep(.el-menu) {
  width: 100%;
}

/* 收缩状态下 el-sub-menu 需要特殊处理 */
.layout.is-collapsed .layout__menu :deep(.el-sub-menu) {
  width: 100%;
}

/* 统一收缩状态下所有菜单项的样式 */
.layout.is-collapsed .layout__menu :deep(.el-menu-item) {
  padding: 0 !important;
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  width: 56px !important;
  min-width: 56px !important;
  margin: 4px auto !important;
}

/* el-sub-menu__title 需要单独处理，因为它有不同的内部结构 */
.layout.is-collapsed .layout__menu :deep(.el-sub-menu__title) {
  padding: 0 !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  width: 56px !important;
  min-width: 56px !important;
  margin: 4px auto !important;
  box-sizing: border-box !important;
}

/* 覆盖 Element Plus 的内联 padding-left 变量 */
.layout.is-collapsed .layout__menu :deep(.el-sub-menu > .el-sub-menu__title) {
  --el-menu-base-level-padding: 0px !important;
  --el-menu-level-padding: 0px !important;
  padding-left: 0 !important;
}

/* 确保 el-sub-menu 本身不会有偏移 */
.layout.is-collapsed .layout__menu :deep(.el-sub-menu.is-opened),
.layout.is-collapsed .layout__menu :deep(.el-sub-menu) {
  padding: 0 !important;
}

/* 确保图标没有额外的 margin */
.layout.is-collapsed .layout__menu :deep(.el-menu-item .el-icon),
.layout.is-collapsed .layout__menu :deep(.el-sub-menu__title .el-icon) {
  margin: 0 !important;
}

/* 隐藏收缩状态下的箭头图标 */
.layout.is-collapsed .layout__menu :deep(.el-sub-menu__icon-arrow) {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
  margin: 0 !important;
}

/* 隐藏收缩状态下的文字 */
.layout.is-collapsed .layout__menu :deep(.el-sub-menu__title span) {
  display: none !important;
}

/* 弹出子菜单的样式 */
.layout.is-collapsed .layout__menu :deep(.el-sub-menu .el-menu-item) {
  padding-left: 20px !important;
  justify-content: flex-start !important;
  width: auto !important;
  margin: 4px 0 !important;
}

/* 收缩状态下的弹出菜单样式 */
.layout__menu :deep(.el-menu--collapse .el-sub-menu__icon-arrow) {
  display: none;
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

.layout.is-dark .collapse-btn {
  color: #f1f5f9;
}

.layout.is-dark .collapse-btn:hover {
  background: rgba(22, 93, 255, 0.2);
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
  transition: margin-left 0.3s ease;
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
  gap: 12px;
}

.layout__header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* 收缩按钮样式 */
.collapse-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  color: var(--text-primary);
  padding: 0;
  transition: all 0.25s ease;
  flex-shrink: 0;
}

.collapse-btn:hover {
  background: rgba(22, 93, 255, 0.1);
  color: #165DFF;
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
