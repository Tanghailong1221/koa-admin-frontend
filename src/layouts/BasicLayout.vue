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

// 菜单图标映射
const menuIconMap: Record<string, any> = {
  Odometer,
  TrendCharts,
  DataBoard,
  Document,
  User,
  Lock,
  Setting,
}

// 静态菜单项（用于演示，实际应该从 menuStore.menus 获取）
const staticMenuItems = [
  { path: '/', title: '仪表盘', icon: 'Odometer' },
  { path: '/data-analysis', title: '数据分析', icon: 'TrendCharts' },
  {
    path: '/data-management',
    title: '数据管理',
    icon: 'DataBoard',
    children: [
      { path: '/data-management/list', title: '数据列表', icon: 'Document' },
      { path: '/data-management/detail', title: '数据详情', icon: 'Document' },
    ],
  },
  { path: '/report-center', title: '报表中心', icon: 'Document' },
  { path: '/system/user', title: '用户管理', icon: 'User' },
  {
    path: '/system',
    title: '系统设置',
    icon: 'Setting',
    children: [
      { path: '/system/base', title: '基础设置', icon: 'Setting' },
      { path: '/system/security', title: '安全策略', icon: 'Lock' },
    ],
  },
  { path: '/security', title: '安全中心', icon: 'Lock' },
  // 模拟更多菜单，触发滚动
  { path: '/ops/monitor', title: '监控中心', icon: 'TrendCharts' },
  { path: '/ops/logs', title: '日志审计', icon: 'Document' },
  { path: '/ops/alerts', title: '告警管理', icon: 'Bell' },
  { path: '/finance/summary', title: '财务概览', icon: 'DataBoard' },
  {
    path: '/finance',
    title: '财务管理',
    icon: 'Document',
    children: [
      { path: '/finance/invoice', title: '发票管理', icon: 'Document' },
      { path: '/finance/payable', title: '应付账款', icon: 'Document' },
      { path: '/finance/receivable', title: '应收账款', icon: 'Document' },
    ],
  },
  { path: '/hr/staff', title: '员工档案', icon: 'User' },
  { path: '/hr/attendance', title: '考勤管理', icon: 'User' },
  { path: '/project/list', title: '项目管理', icon: 'DataBoard' },
  { path: '/project/kanban', title: '看板视图', icon: 'DataBoard' },
  {
    path: '/dev',
    title: '研发管理',
    icon: 'Setting',
    children: [
      { path: '/dev/req', title: '需求管理', icon: 'Document' },
      { path: '/dev/bug', title: '缺陷管理', icon: 'Document' },
      { path: '/dev/release', title: '发布计划', icon: 'Setting' },
    ],
  },
  { path: '/asset/list', title: '资产管理', icon: 'Document' },
  { path: '/asset/stock', title: '库存管理', icon: 'DataBoard' },
  { path: '/partner', title: '合作伙伴', icon: 'User' },
  { path: '/support/ticket', title: '工单中心', icon: 'Document' },
  { path: '/support/faq', title: '知识库', icon: 'Document' },
]

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
  <div class="layout">
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
        <template v-for="item in staticMenuItems" :key="item.path">
          <el-sub-menu v-if="item.children?.length" :index="item.path">
            <template #title>
              <el-icon v-if="getMenuIcon(item.icon)">
                <component :is="getMenuIcon(item.icon)" />
              </el-icon>
              <span>{{ item.title }}</span>
            </template>
            <el-menu-item
              v-for="child in item.children"
              :key="child.path"
              :index="child.path"
            >
              <el-icon v-if="getMenuIcon(child.icon)">
                <component :is="getMenuIcon(child.icon)" />
              </el-icon>
              <span>{{ child.title }}</span>
            </el-menu-item>
          </el-sub-menu>
          <el-menu-item v-else :index="item.path">
            <el-icon v-if="getMenuIcon(item.icon)">
              <component :is="getMenuIcon(item.icon)" />
            </el-icon>
            <span>{{ item.title }}</span>
          </el-menu-item>
        </template>
      </el-menu>
      
      <!-- 版本区 -->
      <div class="layout__version">
        <div class="version-card">
          <div class="version-card__label">系统版本</div>
          <div class="version-card__value">v2.5.0 Pro</div>
          <div class="version-card__glow"></div>
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

            <el-button class="header-actions__btn" text @click="themeStore.toggle()">
              <el-icon :size="18">
                <component :is="themeStore.mode === 'dark' ? Sunny : Moon" />
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
  min-height: 100vh;
  display: flex;
  background: var(--bg-primary);
  position: relative;
  overflow: hidden;
}

.layout::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(22, 93, 255, 0.15) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
  animation: float 20s ease-in-out infinite;
}

.layout::after {
  content: '';
  position: absolute;
  bottom: -30%;
  left: -10%;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(0, 229, 255, 0.1) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
  animation: float 15s ease-in-out infinite reverse;
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(30px, -30px) scale(1.1);
  }
}

.layout__sider {
  width: 240px;
  min-width: 240px;
  max-width: 240px;
  background: #fff;
  border-right: 1px solid #e5e6eb;
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: relative;
  z-index: 1;
}

.layout__logo {
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  gap: 12px;
  border-bottom: 1px solid #e5e6eb;
}

.logo-icon {
  color: #165DFF;
  flex-shrink: 0;
}

.logo-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.logo-text__main {
  font-weight: 700;
  font-size: 16px;
  color: #1f2d3d;
  line-height: 1.2;
}

.logo-text__sub {
  font-size: 12px;
  color: #86909c;
  line-height: 1.2;
}

.layout__menu {
  flex: 1;
  border-right: none;
  background: #F8FAFC;
  padding: 12px 8px;
  overflow-y: auto;
  /* 避免出现/消失滚动条时宽度抖动 */
  scrollbar-gutter: stable both-edges;
  /* Chrome/Safari 支持 overlay 时不占用布局宽度 */
  overflow-y: overlay;
  min-height: 0; /* 允许在 flex 下正确滚动 */
  width: 100%;
  box-sizing: border-box;
}

.layout__menu :deep(.el-menu) {
  background: transparent;
  border: none;
  width: 100%;
}

.layout__menu :deep(.el-menu-item) {
  color: #4e5969;
  position: relative;
  border-radius: 8px;
  margin: 4px 0;
  padding: 0 12px;
  height: 40px;
  line-height: 40px;
  transition: all 0.3s ease, transform 0.25s ease;
  overflow: hidden;
  z-index: 0;
}

.layout__menu :deep(.el-menu-item:not(.is-active):hover) {
  background: #eef4fb;
  color: #4e5969;
  transform: translateX(4px);
}

.layout__menu :deep(.el-sub-menu__title) {
  color: #4e5969;
  position: relative;
  border-radius: 8px;
  margin: 4px 0;
  padding: 0 12px;
  height: 40px;
  line-height: 40px;
  transition:
    background-color 0.25s ease,
    color 0.25s ease;
  overflow: hidden;
  z-index: 0;
}

.layout__menu :deep(.el-sub-menu__title:hover) {
  background: #eef4fb;
  color: #4e5969;
}

.layout__menu :deep(.el-menu-item.is-active) {
  color: #165DFF;
  font-weight: 600;
  box-shadow: none;
}

.layout__menu :deep(.el-menu-item > *) {
  position: relative;
  z-index: 2;
}

.layout__menu :deep(.el-menu-item .el-icon) {
  margin-right: 8px;
  font-size: 18px;
  color: inherit;
}

.layout__menu :deep(.el-sub-menu__title .el-icon) {
  margin-right: 8px;
  font-size: 18px;
  color: inherit;
}

.layout__menu :deep(.el-menu-item:not(.is-active):hover .el-icon),
.layout__menu :deep(.el-menu-item:not(.is-active):hover .el-icon svg) {
  color: #165DFF;
  fill: currentColor;
}

.layout__menu :deep(.el-sub-menu__title:not(.is-active):hover .el-icon),
.layout__menu :deep(.el-sub-menu__title:not(.is-active):hover .el-icon svg) {
  color: #165DFF;
  fill: currentColor;
}

.layout__menu :deep(.el-menu-item::after) {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, #e8f3ff 0%, #f7fbff 100%);
  border: 1px solid #cde3ff;
  border-radius: 10px;
  opacity: 0;
  transform: translateX(-8px);
  transition: opacity 0.35s ease, transform 0.35s ease;
  z-index: 0;
}

.layout__menu :deep(.el-menu-item.is-active::after) {
  opacity: 1;
  transform: translateX(0);
}

.layout__menu :deep(.el-menu-item::before) {
  content: '';
  position: absolute;
  left: 6px;
  top: 20%;
  width: 4px;
  height: 60%;
  background: linear-gradient(180deg, #5aa8ff 0%, #165DFF 100%);
  border-radius: 4px;
  opacity: 0;
  transform: scaleY(0.6);
  transition: opacity 0.35s ease, transform 0.35s ease;
  z-index: 1;
}

.layout__menu :deep(.el-menu-item.is-active::before) {
  opacity: 1;
  transform: scaleY(1);
}

.layout__menu :deep(.el-menu-item .el-sub-menu__icon-arrow) {
  z-index: 2;
}

.layout__menu :deep(.el-menu-item.is-active),
.layout__menu :deep(.el-menu-item.is-active .el-icon),
.layout__menu :deep(.el-menu-item.is-active .el-icon svg),
.layout__menu :deep(.el-menu-item.is-active span) {
  color: #165DFF !important;
  fill: currentColor;
}

/* 暗色模式适配 */
:global(html.dark) .layout__sider {
  background: #0f172a !important;
  border-right: 1px solid #1f2a40 !important;
}

:global(html.dark) .layout__logo {
  border-bottom: 1px solid #1f2a40 !important;
}

:global(html.dark) .layout__menu {
  background: #0c1324 !important;
}

:global(html.dark) .layout__menu :deep(.el-menu-item) {
  color: #cfd6e4 !important;
}

:global(html.dark) .layout__menu :deep(.el-menu-item:not(.is-active):hover) {
  background: #1a2540 !important;
  color: #cfd6e4 !important;
}

:global(html.dark) .layout__menu :deep(.el-menu-item .el-icon) {
  color: inherit;
}

:global(html.dark) .layout__menu :deep(.el-menu-item::after) {
  background: linear-gradient(90deg, rgba(22, 93, 255, 0.16) 0%, rgba(22, 93, 255, 0.08) 100%);
  border: 1px solid rgba(22, 93, 255, 0.35);
}

:global(html.dark) .layout__menu :deep(.el-menu-item::before) {
  background: linear-gradient(180deg, #5aa8ff 0%, #165DFF 100%);
}

:global(html.dark) .layout__menu :deep(.el-menu-item.is-active),
:global(html.dark) .layout__menu :deep(.el-menu-item.is-active .el-icon),
:global(html.dark) .layout__menu :deep(.el-menu-item.is-active .el-icon svg),
:global(html.dark) .layout__menu :deep(.el-menu-item.is-active span) {
  color: #5aa8ff !important;
  fill: currentColor;
}

:global(html.dark) .layout__version {
  border-top: 1px solid #1f2a40 !important;
}

:global(html.dark) .version-card {
  background: rgba(22, 93, 255, 0.12) !important;
  color: #cfd6e4 !important;
}

.layout__version {
  padding: 16px 12px;
  border-top: 1px solid #e5e6eb;
}

.version-card {
  position: relative;
  background: radial-gradient(circle at 80% 30%, rgba(0, 229, 255, 0.32), transparent 55%),
    linear-gradient(135deg, #f4f5ff 0%, #f6f7ff 40%, #f0f4ff 100%);
  border-radius: 18px;
  padding: 14px 18px;
  font-size: 12px;
  color: #4e5969;
  font-weight: 500;
  border: 1px solid rgba(152, 173, 255, 0.5);
  box-shadow: 0 8px 24px rgba(22, 93, 255, 0.08);
  overflow: hidden;
}

.version-card__label {
  font-size: 13px;
  color: #909399;
  margin-bottom: 6px;
}

.version-card__value {
  font-size: 16px;
  font-weight: 600;
  color: #165DFF;
}

.version-card__glow {
  position: absolute;
  right: -20px;
  bottom: -10px;
  width: 96px;
  height: 96px;
  background: radial-gradient(circle, rgba(0, 229, 255, 0.55) 0%, transparent 60%);
  opacity: 0.85;
  pointer-events: none;
}

.layout__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
}

.layout__header {
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 24px;
  background: var(--bg-glass);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid var(--border-color);
  color: var(--text-primary);
  font-weight: 600;
  justify-content: space-between;
  box-shadow: var(--shadow-md);
  position: relative;
}

.layout__header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--gradient-primary);
  opacity: 0.3;
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
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(22, 93, 255, 0.15);
  color: #1f2d3d;
  padding: 0;
  box-shadow: 0 4px 12px rgba(22, 93, 255, 0.1);
  transition: all 0.25s ease;
}

.header-actions__btn:hover {
  background: rgba(22, 93, 255, 0.1);
  border-color: rgba(22, 93, 255, 0.35);
  color: #165DFF;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(22, 93, 255, 0.18);
}

.header-actions__btn:active {
  transform: translateY(0);
}

.header-actions__badge :deep(.el-badge__content) {
  box-shadow: 0 2px 8px rgba(255, 87, 34, 0.35);
}

.layout__title {
  font-size: 18px;
  font-weight: 700;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.layout__tabs {
  padding: 0 16px;
  background: var(--bg-glass);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
}

.layout__main {
  flex: 1;
  padding: 24px;
  background: transparent;
  overflow-y: auto;
}
</style>

