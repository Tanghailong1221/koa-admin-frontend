<script setup lang="ts">
import { ref, computed } from 'vue'
import { Bell, ChatDotRound, Setting, Warning, Delete, Check, Refresh } from '@element-plus/icons-vue'
import { useNotificationStore, type NotificationItem } from '@/store/notification'
import { t } from '@/locales'

const notificationStore = useNotificationStore()

const loading = ref(false)
const activeTab = ref('all')
const selectedIds = ref<number[]>([])

// 从 store 获取消息数据
const notifications = computed(() => notificationStore.notifications)
const unreadCount = computed(() => notificationStore.unreadCount)

// 根据标签筛选消息
const filteredNotifications = computed(() => {
  if (activeTab.value === 'all') return notifications.value
  if (activeTab.value === 'unread') return notifications.value.filter(n => !n.read)
  return notifications.value.filter(n => n.type === activeTab.value)
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

// 获取消息类型标签
const getTypeTag = (type: string) => {
  switch (type) {
    case 'message': return { text: t('common.notificationCenter.typeMessage'), type: 'primary' }
    case 'system': return { text: t('common.notificationCenter.typeSystem'), type: 'success' }
    case 'warning': return { text: t('common.notificationCenter.typeWarning'), type: 'warning' }
    default: return { text: t('common.notificationCenter.typeNotification'), type: 'info' }
  }
}

// 标记单条消息为已读
const markAsRead = (item: NotificationItem) => {
  notificationStore.markAsRead(item.id)
}

// 标记选中消息为已读
const markSelectedAsRead = () => {
  selectedIds.value.forEach(id => {
    notificationStore.markAsRead(id)
  })
  selectedIds.value = []
}

// 标记所有消息为已读
const markAllAsRead = () => {
  notificationStore.markAllAsRead()
}

// 删除消息
const deleteNotification = (id: number) => {
  notificationStore.deleteNotification(id)
}

// 删除选中消息
const deleteSelected = () => {
  selectedIds.value.forEach(id => {
    notificationStore.deleteNotification(id)
  })
  selectedIds.value = []
}

// 清空所有已读消息
const clearReadNotifications = () => {
  notificationStore.clearReadNotifications()
}

// 刷新列表
const refreshList = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 500)
}

// 选择变化
const handleSelectionChange = (selection: NotificationItem[]) => {
  selectedIds.value = selection.map(item => item.id)
}
</script>

<template>
  <div class="notification-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">{{ t('common.notificationCenter.title') }}</h2>
        <el-tag v-if="unreadCount > 0" type="danger" size="small">{{ t('common.notificationCenter.unreadCount', { count: unreadCount }) }}</el-tag>
      </div>
      <div class="header-right">
        <el-button :icon="Refresh" @click="refreshList">{{ t('common.notificationCenter.refresh') }}</el-button>
        <el-button type="primary" :icon="Check" :disabled="unreadCount === 0" @click="markAllAsRead">
          {{ t('common.notificationCenter.markAllRead') }}
        </el-button>
        <el-button type="danger" :icon="Delete" :disabled="notifications.filter(n => n.read).length === 0" @click="clearReadNotifications">
          {{ t('common.notificationCenter.clearRead') }}
        </el-button>
      </div>
    </div>

    <!-- 标签筛选 -->
    <div class="filter-tabs">
      <el-radio-group v-model="activeTab" size="default">
        <el-radio-button value="all">
          <span class="tab-inner">
            <span class="tab-text">{{ t('common.notificationCenter.all') }}</span>
            <span class="tab-count">{{ notifications.length }}</span>
          </span>
        </el-radio-button>
        <el-radio-button value="unread">
          <span class="tab-inner">
            <span class="tab-text">{{ t('common.notificationCenter.unread') }}</span>
            <span v-if="unreadCount > 0" class="tab-count tab-count--danger">{{ unreadCount }}</span>
            <span v-else class="tab-count-placeholder"></span>
          </span>
        </el-radio-button>
        <el-radio-button value="message">
          <span class="tab-inner">
            <span class="tab-text">{{ t('common.notificationCenter.message') }}</span>
            <span class="tab-count-placeholder"></span>
          </span>
        </el-radio-button>
        <el-radio-button value="system">
          <span class="tab-inner">
            <span class="tab-text">{{ t('common.notificationCenter.system') }}</span>
            <span class="tab-count-placeholder"></span>
          </span>
        </el-radio-button>
        <el-radio-button value="warning">
          <span class="tab-inner">
            <span class="tab-text">{{ t('common.notificationCenter.warning') }}</span>
            <span class="tab-count-placeholder"></span>
          </span>
        </el-radio-button>
      </el-radio-group>
    </div>

    <!-- 批量操作栏 -->
    <div v-if="selectedIds.length > 0" class="batch-actions">
      <span class="selected-count">{{ t('common.notificationCenter.selectedCount', { count: selectedIds.length }) }}</span>
      <el-button type="primary" size="small" @click="markSelectedAsRead">{{ t('common.notificationCenter.markSelectedRead') }}</el-button>
      <el-button type="danger" size="small" @click="deleteSelected">{{ t('common.notificationCenter.delete') }}</el-button>
    </div>

    <!-- 消息列表 -->
    <div class="notification-list" v-loading="loading">
      <el-table
        :data="filteredNotifications"
        style="width: 100%"
        height="100%"
        @selection-change="handleSelectionChange"
        row-key="id"
      >
        <template #empty>
          <div class="empty-state">
            <el-icon class="empty-icon"><Bell /></el-icon>
            <p class="empty-text">{{ t('common.notificationCenter.noMessages') }}</p>
          </div>
        </template>
        <el-table-column type="selection" width="50" />
        <el-table-column :label="t('common.notificationCenter.status')" width="80" align="center">
          <template #default="{ row }">
            <el-tag v-if="!row.read" type="danger" size="small" effect="dark">{{ t('common.notificationCenter.statusUnread') }}</el-tag>
            <el-tag v-else type="info" size="small">{{ t('common.notificationCenter.statusRead') }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="t('common.notificationCenter.type')" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="getTypeTag(row.type).type as any" size="small">
              {{ getTypeTag(row.type).text }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="t('common.notificationCenter.content')" min-width="400">
          <template #default="{ row }">
            <div class="message-cell" :class="{ 'is-unread': !row.read }">
              <div class="message-icon" :class="`message-icon--${row.type}`">
                <el-icon><component :is="getNotificationIcon(row.type)" /></el-icon>
              </div>
              <div class="message-content">
                <div class="message-title">{{ row.title }}</div>
                <div class="message-desc">{{ row.content }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="t('common.notificationCenter.time')" width="180" align="center">
          <template #default="{ row }">
            <span class="time-text">{{ row.createTime }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="t('common.notificationCenter.operation')" width="150" align="center" fixed="right">
          <template #default="{ row }">
            <el-button v-if="!row.read" type="primary" link size="small" @click="markAsRead(row)">
              {{ t('common.notificationCenter.markRead') }}
            </el-button>
            <el-button type="danger" link size="small" @click="deleteNotification(row.id)">
              {{ t('common.notificationCenter.delete') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<style scoped>
.notification-page {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 120px);
  padding: 20px;
  background: var(--el-bg-color);
  border-radius: 8px;
  overflow: hidden;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.header-right {
  display: flex;
  gap: 12px;
}

.filter-tabs {
  margin-bottom: 16px;
  flex-shrink: 0;
}

.filter-tabs :deep(.el-radio-button__inner) {
  padding: 8px 15px;
}

.tab-inner {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 18px;
}

.tab-text {
  line-height: 18px;
}

.tab-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  font-size: 11px;
  background: var(--el-fill-color-darker);
  border-radius: 9px;
  color: var(--el-text-color-secondary);
  line-height: 1;
}

.tab-count--danger {
  background: #F53F3F;
  color: #fff;
}

.tab-count-placeholder {
  display: inline-block;
  width: 18px;
  height: 18px;
}

.batch-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--el-color-primary-light-9);
  border-radius: 8px;
  margin-bottom: 16px;
  flex-shrink: 0;
}

.selected-count {
  font-size: 14px;
  color: var(--el-color-primary);
  font-weight: 500;
}

.notification-list {
  flex: 1;
  min-height: 0;
  background: var(--el-bg-color);
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.notification-list :deep(.el-table) {
  flex: 1;
}

.message-cell {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 8px 0;
}

.message-cell.is-unread .message-title {
  font-weight: 600;
}

.message-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 18px;
}

.message-icon--message {
  background: rgba(22, 93, 255, 0.1);
  color: #165DFF;
}

.message-icon--system {
  background: rgba(0, 180, 42, 0.1);
  color: #00B42A;
}

.message-icon--warning {
  background: rgba(255, 125, 0, 0.1);
  color: #FF7D00;
}

.message-content {
  flex: 1;
  min-width: 0;
}

.message-title {
  font-size: 14px;
  color: var(--el-text-color-primary);
  margin-bottom: 4px;
  line-height: 1.4;
}

.message-desc {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.time-text {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 24px;
  color: var(--el-text-color-placeholder);
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-text {
  margin: 0;
  font-size: 16px;
}
</style>
