<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
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
  Search,
  FullScreen,
  ArrowRight,
  ChatDotRound,
  ChatDotSquare,
  Warning,
  Delete,
  Check,
  OfficeBuilding,
  Postcard,
  Avatar,
  Connection,
  House,
  SetUp,
  Notebook,
  Timer,
  Monitor,
  Coin,
  Location,
  Folder,
  Printer,
  Link,
  Tools,
  Wallet,
  List,
  Checked,
  Tickets,
  Edit,
  Key,
  Cpu,
  Promotion,
  DataAnalysis,
  PieChart,
} from '@element-plus/icons-vue'
import { useMenuStore } from '@/store/menu'
import { useTabsStore } from '@/store/tabs'
import { useThemeStore } from '@/store/theme'
import { t } from '@/locales'
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
  Bell,
  Sunny,
  Menu,
  OfficeBuilding,
  Postcard,
  Avatar,
  ChatDotRound,
  Connection,
  House,
  SetUp,
  Notebook,
  Timer,
  Monitor,
  Coin,
  Location,
  Folder,
  Printer,
  Link,
  Tools,
  Wallet,
  List,
  Checked,
  Tickets,
  Edit,
  Key,
  Warning,
  Cpu,
  Promotion,
  DataAnalysis,
  PieChart,
  ChatDotSquare,
  UserFilled: User,
  Grid: DataBoard,
  CircleCheck: Lock,
  Filter: Document,
  Collection: DataBoard,
  Picture: Document,
  Platform: DataBoard,
}

// 使用动态菜单
const menuItems = computed(() => menuStore.menus || [])

// 面包屑导航 - 从菜单数据中获取完整路径
const breadcrumbs = computed(() => {
  const currentPath = route.path

  // 递归查找当前路径在菜单中的位置
  const findMenuPath = (
    items: any[],
    targetPath: string,
    parentPath: Array<{ title: string; path: string }> = []
  ): Array<{ title: string; path: string }> | null => {
    for (const item of items) {
      const currentPathArr = [...parentPath, { title: item.name, path: item.path }]

      if (item.path === targetPath) {
        return currentPathArr
      }

      if (item.children?.length) {
        const found = findMenuPath(item.children, targetPath, currentPathArr)
        if (found) return found
      }
    }
    return null
  }

  const menuPath = findMenuPath(menuItems.value, currentPath)
  if (menuPath) {
    return menuPath
  }

  // 如果在菜单中找不到，回退到路由匹配
  return route.matched
    .filter(r => r.meta?.title && r.path !== '/')
    .map(r => ({ title: r.meta?.title as string, path: r.path }))
})

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

// ==================== 菜单搜索 ====================
const showMenuSearch = ref(false)
const menuSearchKeyword = ref('')
const menuSearchInputRef = ref<HTMLInputElement>()

// 扁平化菜单用于搜索
const flatMenuItems = computed(() => {
  const result: Array<{ name: string; path: string; parent?: string }> = []
  const flatten = (items: any[], parent?: string) => {
    items.forEach(item => {
      if (item.children?.length) {
        flatten(item.children, item.name)
      } else {
        result.push({ name: item.name, path: item.path, parent })
      }
    })
  }
  flatten(menuItems.value)
  return result
})

// 搜索结果
const menuSearchResults = computed(() => {
  if (!menuSearchKeyword.value) return flatMenuItems.value.slice(0, 10)
  const keyword = menuSearchKeyword.value.toLowerCase()
  return flatMenuItems.value.filter(item => 
    item.name.toLowerCase().includes(keyword) || 
    (item.parent && item.parent.toLowerCase().includes(keyword))
  ).slice(0, 10)
})

const openMenuSearch = () => {
  showMenuSearch.value = true
  menuSearchKeyword.value = ''
  setTimeout(() => {
    menuSearchInputRef.value?.focus()
  }, 100)
}

const closeMenuSearch = () => {
  showMenuSearch.value = false
  menuSearchKeyword.value = ''
}

const selectMenuItem = (item: { path: string }) => {
  router.push(item.path)
  closeMenuSearch()
}

// 快捷键 Ctrl+K 打开搜索
const handleKeydown = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault()
    openMenuSearch()
  }
  if (e.key === 'Escape' && showMenuSearch.value) {
    closeMenuSearch()
  }
}

// ==================== 消息通知 ====================
import { useNotificationStore, type NotificationItem } from '@/store/notification'

const notificationStore = useNotificationStore()

const showNotificationPopover = ref(false)
const notificationActiveTab = ref('all')

// 从 store 获取消息数据
const notifications = computed(() => notificationStore.notifications)
const unreadCount = computed(() => notificationStore.unreadCount)

// 根据标签筛选消息
const filteredNotifications = computed(() => {
  if (notificationActiveTab.value === 'all') return notifications.value.slice(0, 5)
  if (notificationActiveTab.value === 'unread') return notifications.value.filter(n => !n.read).slice(0, 5)
  return notifications.value.filter(n => n.type === notificationActiveTab.value).slice(0, 5)
})

// 获取消息图标
const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'message': return ChatDotRound
    case 'system': return Setting
    case 'warning': return Warning
    default: return Bell
  }
}

// 获取消息图标颜色
const getNotificationIconColor = (type: string) => {
  switch (type) {
    case 'message': return '#165DFF'
    case 'system': return '#00B42A'
    case 'warning': return '#FF7D00'
    default: return '#86909c'
  }
}

// 标记单条消息为已读
const markAsRead = (item: NotificationItem) => {
  notificationStore.markAsRead(item.id)
}

// 标记所有消息为已读
const markAllAsRead = () => {
  notificationStore.markAllAsRead()
}

// 删除消息
const deleteNotification = (id: number) => {
  notificationStore.deleteNotification(id)
}

// 清空所有已读消息
const clearReadNotifications = () => {
  notificationStore.clearReadNotifications()
}

// 跳转到消息中心
const goToNotificationCenter = () => {
  showNotificationPopover.value = false
  router.push('/system/notification')
}

// ==================== 字体大小设置 ====================
const showFontSizePopover = ref(false)
const fontSizeOptions = computed(() => [
  { label: t('common.layout.fontSmall'), value: 'small', size: '12px' },
  { label: t('common.layout.fontDefault'), value: 'default', size: '14px' },
  { label: t('common.layout.fontLarge'), value: 'large', size: '16px' },
])
const currentFontSize = ref(localStorage.getItem('fontSize') || 'default')

const fontSizeMap: Record<string, string> = {
  small: '12px',
  default: '14px',
  large: '16px',
}

const setFontSize = (size: string) => {
  currentFontSize.value = size
  const fontSize = fontSizeMap[size] || '14px'
  document.documentElement.style.setProperty('--app-font-size', fontSize)
  document.documentElement.style.fontSize = fontSize
  localStorage.setItem('fontSize', size)
  showFontSizePopover.value = false
}

// 初始化字体大小
const initFontSize = () => {
  const saved = localStorage.getItem('fontSize') || 'default'
  setFontSize(saved)
}

// ==================== 国际化切换 ====================
import { setLocale as setI18nLocale, getLocale, type SupportLocale } from '@/locales'

const localeOptions = [
  { label: '简体中文', value: 'zh-CN' as SupportLocale },
  { label: 'English', value: 'en-US' as SupportLocale },
]
const currentLocale = ref<SupportLocale>(getLocale())

const setLocale = (locale: SupportLocale) => {
  currentLocale.value = locale
  setI18nLocale(locale)
  // 刷新页面以应用新语言（Element Plus 需要重新加载）
  window.location.reload()
}

// ==================== 网页全屏 ====================
const isPageFullscreen = ref(false)

const togglePageFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    isPageFullscreen.value = true
  } else {
    document.exitFullscreen()
    isPageFullscreen.value = false
  }
}

const handleFullscreenChange = () => {
  isPageFullscreen.value = !!document.fullscreenElement
}

// ==================== 生命周期 ====================
onMounted(() => {
  initFontSize()
  document.addEventListener('keydown', handleKeydown)
  document.addEventListener('fullscreenchange', handleFullscreenChange)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
})
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
          <div class="logo-text__main">{{ t('common.layout.systemName') }}</div>
          <div class="logo-text__sub">{{ t('common.layout.systemSubName') }}</div>
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
          <div class="version-card__label">{{ t('common.layout.systemVersion') }}</div>
          <div class="version-card__value">v2.5.0 Pro</div>
        </div>
      </div>
    </aside>
    <section class="layout__content">
      <header class="layout__header">
        <div class="layout__header-left">
          <!-- 收缩按钮 -->
          <el-tooltip :content="isCollapsed ? t('common.layout.expandMenu') : t('common.layout.collapseMenu')" placement="bottom">
            <el-button class="collapse-btn" text @click="toggleSidebar">
              <el-icon :size="18">
                <Expand v-if="isCollapsed" />
                <Fold v-else />
              </el-icon>
            </el-button>
          </el-tooltip>
          <!-- 面包屑导航 -->
          <div class="breadcrumb-nav">
            <template v-for="(item, index) in breadcrumbs" :key="item.path">
              <span class="breadcrumb-item">{{ item.title }}</span>
              <span v-if="index < breadcrumbs.length - 1" class="breadcrumb-separator">/</span>
            </template>
          </div>
        </div>
        <div class="layout__header-right">
          <div class="header-actions">
            <!-- 菜单搜索 -->
            <el-tooltip :content="t('common.layout.searchMenu') + ' (Ctrl+K)'" placement="bottom">
              <el-button class="header-actions__btn" text @click="openMenuSearch">
                <el-icon :size="18"><Search /></el-icon>
              </el-button>
            </el-tooltip>

            <!-- 消息通知 -->
            <el-popover
              v-model:visible="showNotificationPopover"
              placement="bottom-end"
              :width="380"
              trigger="click"
              popper-class="notification-popover"
            >
              <template #reference>
                <el-badge :value="unreadCount" :hidden="unreadCount === 0" class="header-actions__badge" type="danger">
                  <el-button class="header-actions__btn" text>
                    <el-icon><Bell /></el-icon>
                  </el-button>
                </el-badge>
              </template>
              
              <!-- 通知弹窗内容 -->
              <div class="notification-panel">
                <!-- 头部 -->
                <div class="notification-panel__header">
                  <span class="header-title">{{ t('common.layout.notification') }}</span>
                  <div class="header-actions-group">
                    <el-button v-if="unreadCount > 0" type="primary" link size="small" @click="markAllAsRead">
                      <el-icon><Check /></el-icon>
                      {{ t('common.layout.markAllRead') }}
                    </el-button>
                    <el-button type="info" link size="small" @click="clearReadNotifications">
                      <el-icon><Delete /></el-icon>
                      {{ t('common.layout.clearRead') }}
                    </el-button>
                  </div>
                </div>
                
                <!-- 标签页 -->
                <div class="notification-panel__tabs">
                  <div 
                    class="tab-item" 
                    :class="{ 'is-active': notificationActiveTab === 'all' }"
                    @click="notificationActiveTab = 'all'"
                  >
                    {{ t('common.layout.all') }}
                    <span v-if="notifications.length" class="tab-count">{{ notifications.length }}</span>
                  </div>
                  <div 
                    class="tab-item" 
                    :class="{ 'is-active': notificationActiveTab === 'unread' }"
                    @click="notificationActiveTab = 'unread'"
                  >
                    {{ t('common.layout.unread') }}
                    <span v-if="unreadCount" class="tab-count tab-count--primary">{{ unreadCount }}</span>
                  </div>
                  <div 
                    class="tab-item" 
                    :class="{ 'is-active': notificationActiveTab === 'message' }"
                    @click="notificationActiveTab = 'message'"
                  >
                    {{ t('common.layout.message') }}
                  </div>
                  <div 
                    class="tab-item" 
                    :class="{ 'is-active': notificationActiveTab === 'system' }"
                    @click="notificationActiveTab = 'system'"
                  >
                    {{ t('common.layout.system') }}
                  </div>
                </div>
                
                <!-- 消息列表 -->
                <div class="notification-panel__body">
                  <template v-if="filteredNotifications.length > 0">
                    <div 
                      v-for="item in filteredNotifications" 
                      :key="item.id"
                      class="notification-item"
                      :class="{ 'is-unread': !item.read }"
                      @click="markAsRead(item)"
                    >
                      <div class="notification-item__icon" :style="{ background: getNotificationIconColor(item.type) + '15', color: getNotificationIconColor(item.type) }">
                        <el-icon><component :is="getNotificationIcon(item.type)" /></el-icon>
                      </div>
                      <div class="notification-item__content">
                        <div class="notification-item__title">
                          {{ item.title }}
                          <span v-if="!item.read" class="unread-dot"></span>
                        </div>
                        <div class="notification-item__desc">{{ item.content }}</div>
                        <div class="notification-item__time">{{ item.time }}</div>
                      </div>
                      <div class="notification-item__actions">
                        <el-button 
                          type="danger" 
                          link 
                          size="small"
                          @click.stop="deleteNotification(item.id)"
                        >
                          <el-icon><Delete /></el-icon>
                        </el-button>
                      </div>
                    </div>
                  </template>
                  <div v-else class="notification-empty">
                    <el-icon class="empty-icon"><Bell /></el-icon>
                    <p>{{ t('common.layout.noMessages') }}</p>
                  </div>
                </div>
                
                <!-- 底部 -->
                <div class="notification-panel__footer">
                  <el-button type="primary" link @click="goToNotificationCenter">{{ t('common.layout.viewAllMessages') }}</el-button>
                </div>
              </div>
            </el-popover>

            <!-- 字体大小 -->
            <el-popover
              v-model:visible="showFontSizePopover"
              placement="bottom-end"
              :width="200"
              trigger="click"
              popper-class="font-size-popover"
            >
              <template #reference>
                <el-button class="header-actions__btn header-actions__btn--font" text>
                  <span class="font-icon">A</span>
                </el-button>
              </template>
              <div class="font-size-panel">
                <div class="font-size-panel__title">{{ t('common.layout.fontSize') }}</div>
                <div class="font-size-panel__options">
                  <div
                    v-for="opt in fontSizeOptions"
                    :key="opt.value"
                    class="font-size-option"
                    :class="{ 'is-active': currentFontSize === opt.value }"
                    @click="setFontSize(opt.value)"
                  >
                    <span class="option-preview" :style="{ fontSize: opt.size }">A</span>
                    <span class="option-label">{{ opt.label }}</span>
                    <span class="option-size">{{ opt.size }}</span>
                    <el-icon v-if="currentFontSize === opt.value" class="option-check"><Check /></el-icon>
                  </div>
                </div>
              </div>
            </el-popover>

            <!-- 国际化切换 -->
            <el-tooltip :content="t('common.layout.language')" placement="bottom">
              <el-dropdown trigger="click" @command="setLocale">
                <el-button class="header-actions__btn header-actions__btn--text" text>
                  {{ currentLocale === 'zh-CN' ? '中' : 'En' }}
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item
                      v-for="opt in localeOptions"
                      :key="opt.value"
                      :command="opt.value"
                      :class="{ 'is-active': currentLocale === opt.value }"
                    >
                      {{ opt.label }}
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </el-tooltip>

            <!-- 网页全屏 -->
            <el-tooltip :content="isPageFullscreen ? t('common.layout.exitFullscreen') : t('common.layout.fullscreen')" placement="bottom">
              <el-button class="header-actions__btn" text @click="togglePageFullscreen">
                <el-icon :size="18"><FullScreen /></el-icon>
              </el-button>
            </el-tooltip>

            <!-- 主题切换 -->
            <el-tooltip :content="isDark ? t('common.layout.lightMode') : t('common.layout.darkMode')" placement="bottom">
              <el-button class="header-actions__btn" text @click="themeStore.toggle($event)">
                <el-icon :size="18">
                  <component :is="isDark ? Sunny : Moon" />
                </el-icon>
              </el-button>
            </el-tooltip>
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

    <!-- 菜单搜索对话框 -->
    <Teleport to="body">
      <Transition name="search-fade">
        <div v-if="showMenuSearch" class="menu-search-overlay" @click.self="closeMenuSearch">
          <div class="menu-search-modal">
            <!-- 搜索头部 -->
            <div class="menu-search__header">
              <div class="search-input-wrapper">
                <el-icon class="search-icon"><Search /></el-icon>
                <input
                  ref="menuSearchInputRef"
                  v-model="menuSearchKeyword"
                  type="text"
                  :placeholder="t('common.layout.searchMenuPlaceholder')"
                  class="search-input"
                  @keydown.enter="menuSearchResults.length && selectMenuItem(menuSearchResults[0]!)"
                  @keydown.esc="closeMenuSearch"
                />
              </div>
              <div class="search-tips">
                <span class="tip-item">
                  <kbd>↵</kbd> {{ t('common.layout.select') }}
                </span>
                <span class="tip-item">
                  <kbd>ESC</kbd> {{ t('common.layout.close') }}
                </span>
              </div>
            </div>
            
            <!-- 搜索结果 -->
            <div class="menu-search__body">
              <div v-if="menuSearchResults.length > 0" class="search-results">
                <div class="results-title">
                  <el-icon><Document /></el-icon>
                  <span>{{ menuSearchKeyword ? t('common.layout.searchResult') : t('common.layout.quickAccess') }}</span>
                </div>
                <div
                  v-for="(item, index) in menuSearchResults"
                  :key="item.path"
                  class="search-result-item"
                  :class="{ 'is-first': index === 0 }"
                  @click="selectMenuItem(item)"
                >
                  <div class="result-icon">
                    <el-icon><Document /></el-icon>
                  </div>
                  <div class="result-content">
                    <span class="result-name">{{ item.name }}</span>
                    <span v-if="item.parent" class="result-path">{{ item.parent }}</span>
                  </div>
                  <div class="result-arrow">
                    <el-icon><ArrowRight /></el-icon>
                  </div>
                </div>
              </div>
              <div v-else class="search-empty">
                <el-icon class="empty-icon"><Search /></el-icon>
                <p class="empty-text">{{ t('common.layout.noMatchMenu') }}</p>
                <p class="empty-hint">{{ t('common.layout.tryOtherKeyword') }}</p>
              </div>
            </div>
            
            <!-- 底部提示 -->
            <div class="menu-search__footer">
              <span class="footer-tip">
                <kbd>Ctrl</kbd> + <kbd>K</kbd> {{ t('common.layout.quickOpenSearch') }}
              </span>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
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

/* 面包屑导航 */
.breadcrumb-nav {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.breadcrumb-item {
  color: var(--text-secondary);

  &:last-child {
    color: var(--text-primary);
    font-weight: 500;
  }
}

.breadcrumb-separator {
  color: var(--text-tertiary);
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

/* 头部操作按钮文字样式 */
.header-actions__btn--text {
  font-size: 14px;
  font-weight: 600;
}

/* 下拉菜单激活项 */
:deep(.el-dropdown-menu__item.is-active) {
  color: #165DFF;
  background-color: rgba(22, 93, 255, 0.1);
}

/* ========== 菜单搜索弹窗 ========== */
.search-fade-enter-active,
.search-fade-leave-active {
  transition: opacity 0.2s ease;
}

.search-fade-enter-active .menu-search-modal,
.search-fade-leave-active .menu-search-modal {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.search-fade-enter-from,
.search-fade-leave-to {
  opacity: 0;
}

.search-fade-enter-from .menu-search-modal,
.search-fade-leave-to .menu-search-modal {
  transform: scale(0.95) translateY(-20px);
  opacity: 0;
}

.menu-search-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 9999;
  display: flex;
  justify-content: center;
  padding-top: 10vh;
}

.menu-search-modal {
  width: 560px;
  max-width: 90vw;
  background: var(--el-bg-color);
  border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: 70vh;
}

.menu-search__header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  background: linear-gradient(to bottom, var(--el-bg-color), var(--el-fill-color-lighter));
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--el-bg-color);
  border: 2px solid var(--el-border-color);
  border-radius: 12px;
  transition: all 0.2s ease;
}

.search-input-wrapper:focus-within {
  border-color: #165DFF;
  box-shadow: 0 0 0 4px rgba(22, 93, 255, 0.1);
}

.search-input-wrapper .search-icon {
  font-size: 20px;
  color: #165DFF;
}

.search-input-wrapper .search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 16px;
  background: transparent;
  color: var(--el-text-color-primary);
}

.search-input-wrapper .search-input::placeholder {
  color: var(--el-text-color-placeholder);
}

.search-tips {
  display: flex;
  gap: 16px;
  margin-top: 12px;
  justify-content: center;
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.tip-item kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  font-size: 11px;
  font-family: inherit;
  background: var(--el-fill-color);
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.menu-search__body {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.results-title {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.search-result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s ease;
  margin-bottom: 4px;
}

.search-result-item:hover {
  background: linear-gradient(135deg, rgba(22, 93, 255, 0.08) 0%, rgba(22, 93, 255, 0.04) 100%);
}

.search-result-item.is-first {
  background: linear-gradient(135deg, rgba(22, 93, 255, 0.1) 0%, rgba(22, 93, 255, 0.05) 100%);
  border: 1px solid rgba(22, 93, 255, 0.2);
}

.result-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #165DFF 0%, #4080FF 100%);
  border-radius: 8px;
  color: #fff;
  font-size: 16px;
  flex-shrink: 0;
}

.result-content {
  flex: 1;
  min-width: 0;
}

.result-name {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  margin-bottom: 2px;
}

.result-path {
  display: block;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.result-arrow {
  color: var(--el-text-color-placeholder);
  font-size: 14px;
  opacity: 0;
  transform: translateX(-4px);
  transition: all 0.15s ease;
}

.search-result-item:hover .result-arrow {
  opacity: 1;
  transform: translateX(0);
  color: #165DFF;
}

.search-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  color: var(--el-text-color-placeholder);
  margin-bottom: 16px;
}

.empty-text {
  font-size: 16px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  margin: 0 0 8px;
}

.empty-hint {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin: 0;
}

.menu-search__footer {
  padding: 12px 24px;
  border-top: 1px solid var(--el-border-color-lighter);
  background: var(--el-fill-color-lighter);
  text-align: center;
}

.footer-tip {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.footer-tip kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 18px;
  padding: 0 5px;
  font-size: 11px;
  font-family: inherit;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 3px;
  margin: 0 2px;
}

/* ========== 消息通知面板 ========== */
.notification-panel {
  margin: -12px;
}

.notification-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.notification-panel__header .header-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.notification-panel__header .header-actions-group {
  display: flex;
  gap: 8px;
}

.notification-panel__tabs {
  display: flex;
  padding: 0 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  background: var(--el-fill-color-lighter);
}

.notification-panel__tabs .tab-item {
  padding: 12px 16px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
  cursor: pointer;
  position: relative;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.notification-panel__tabs .tab-item:hover {
  color: var(--el-text-color-primary);
}

.notification-panel__tabs .tab-item.is-active {
  color: #165DFF;
  font-weight: 500;
}

.notification-panel__tabs .tab-item.is-active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 16px;
  right: 16px;
  height: 2px;
  background: #165DFF;
  border-radius: 1px;
}

.notification-panel__tabs .tab-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  font-size: 11px;
  background: var(--el-fill-color);
  border-radius: 9px;
  color: var(--el-text-color-secondary);
}

.notification-panel__tabs .tab-count--primary {
  background: #165DFF;
  color: #fff;
}

.notification-panel__body {
  max-height: 360px;
  overflow-y: auto;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 20px;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 1px solid var(--el-border-color-extra-light);
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-item:hover {
  background: var(--el-fill-color-lighter);
}

.notification-item.is-unread {
  background: rgba(22, 93, 255, 0.03);
}

.notification-item.is-unread:hover {
  background: rgba(22, 93, 255, 0.06);
}

.notification-item__icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 18px;
}

.notification-item__content {
  flex: 1;
  min-width: 0;
}

.notification-item__title {
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.notification-item__title .unread-dot {
  width: 6px;
  height: 6px;
  background: #F53F3F;
  border-radius: 50%;
  flex-shrink: 0;
}

.notification-item__desc {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  line-height: 1.5;
  margin-bottom: 6px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.notification-item__time {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}

.notification-item__actions {
  opacity: 0;
  transition: opacity 0.2s;
}

.notification-item:hover .notification-item__actions {
  opacity: 1;
}

.notification-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  color: var(--el-text-color-placeholder);
}

.notification-empty .empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.notification-empty p {
  margin: 0;
  font-size: 14px;
}

.notification-panel__footer {
  padding: 12px 20px;
  text-align: center;
  border-top: 1px solid var(--el-border-color-lighter);
  background: var(--el-fill-color-lighter);
}

/* ========== 字体大小面板 ========== */
.header-actions__btn--font {
  font-size: 16px;
  font-weight: 700;
}

.header-actions__btn--font .font-icon {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 18px;
  font-weight: 700;
}

.font-size-panel {
  margin: -12px;
}

.font-size-panel__title {
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.font-size-panel__options {
  padding: 8px;
}

.font-size-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.font-size-option:hover {
  background: var(--el-fill-color-light);
}

.font-size-option.is-active {
  background: rgba(22, 93, 255, 0.1);
}

.font-size-option .option-preview {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--el-fill-color);
  border-radius: 6px;
  font-family: Georgia, 'Times New Roman', serif;
  font-weight: 700;
  color: var(--el-text-color-primary);
}

.font-size-option.is-active .option-preview {
  background: #165DFF;
  color: #fff;
}

.font-size-option .option-label {
  flex: 1;
  font-size: 14px;
  color: var(--el-text-color-primary);
}

.font-size-option .option-size {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.font-size-option .option-check {
  color: #165DFF;
  font-size: 16px;
}
</style>
