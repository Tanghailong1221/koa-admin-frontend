<template>
  <div class="pwa-example">
    <el-card header="PWA 功能示例">
      <el-space direction="vertical" :size="20" style="width: 100%">
        <!-- 在线状态 -->
        <el-alert
          :title="isOnline ? '在线' : '离线'"
          :type="isOnline ? 'success' : 'warning'"
          :closable="false"
        >
          <template #default>
            当前网络状态：{{ isOnline ? '已连接' : '未连接' }}
          </template>
        </el-alert>

        <!-- 离线就绪状态 -->
        <el-alert
          v-if="offlineReady"
          title="离线就绪"
          type="success"
          :closable="false"
        >
          <template #default>
            应用已准备好离线使用，即使断网也能访问已缓存的内容
          </template>
        </el-alert>

        <!-- 更新信息 -->
        <el-card v-if="updateInfo.updateAvailable" shadow="never">
          <template #header>
            <div class="card-header">
              <span>应用更新</span>
              <el-tag type="warning">有新版本</el-tag>
            </div>
          </template>
          <el-space direction="vertical">
            <p>检测到新版本，建议立即更新以获得最佳体验</p>
            <el-button type="primary" @click="handleUpdate">
              立即更新
            </el-button>
          </el-space>
        </el-card>

        <!-- 安装提示 -->
        <el-card v-if="canInstall" shadow="never">
          <template #header>
            <div class="card-header">
              <span>安装应用</span>
              <el-tag type="success">可安装</el-tag>
            </div>
          </template>
          <el-space direction="vertical">
            <p>将应用安装到您的设备，获得类似原生应用的体验</p>
            <el-button type="success" @click="handleInstall">
              安装到设备
            </el-button>
          </el-space>
        </el-card>

        <!-- PWA 功能列表 -->
        <el-card shadow="never">
          <template #header>
            <span>PWA 功能特性</span>
          </template>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="Service Worker">
              {{ serviceWorkerStatus }}
            </el-descriptions-item>
            <el-descriptions-item label="离线支持">
              {{ offlineReady ? '已启用' : '未启用' }}
            </el-descriptions-item>
            <el-descriptions-item label="应用安装">
              {{ canInstall ? '可安装' : '已安装或不支持' }}
            </el-descriptions-item>
            <el-descriptions-item label="自动更新">
              已启用
            </el-descriptions-item>
            <el-descriptions-item label="缓存策略">
              NetworkFirst / CacheFirst / StaleWhileRevalidate
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 操作按钮 -->
        <el-card shadow="never">
          <template #header>
            <span>PWA 操作</span>
          </template>
          <el-space wrap>
            <el-button @click="handleCheckUpdate">
              检查更新
            </el-button>
            <el-button @click="handleToggleNetwork">
              模拟{{ isOnline ? '离线' : '在线' }}
            </el-button>
            <el-button type="danger" @click="handleUnregister">
              卸载 Service Worker
            </el-button>
          </el-space>
        </el-card>

        <!-- 缓存信息 -->
        <el-card shadow="never">
          <template #header>
            <span>缓存信息</span>
          </template>
          <el-space direction="vertical" style="width: 100%">
            <!-- 离线缓存统计 -->
            <el-descriptions :column="2" border>
              <el-descriptions-item label="缓存数量">
                {{ cacheStats.count }}
              </el-descriptions-item>
              <el-descriptions-item label="缓存大小">
                {{ cacheSizeFormatted }}
              </el-descriptions-item>
              <el-descriptions-item label="最旧缓存" :span="2">
                {{
                  cacheStats.oldestTimestamp
                    ? new Date(cacheStats.oldestTimestamp).toLocaleString()
                    : '无'
                }}
              </el-descriptions-item>
              <el-descriptions-item label="最新缓存" :span="2">
                {{
                  cacheStats.newestTimestamp
                    ? new Date(cacheStats.newestTimestamp).toLocaleString()
                    : '无'
                }}
              </el-descriptions-item>
            </el-descriptions>

            <el-space wrap>
              <el-button @click="handleRefreshStats">
                刷新统计
              </el-button>
              <el-button @click="handleShowCaches">
                查看缓存列表
              </el-button>
              <el-button type="warning" @click="handleClearCaches">
                清除所有缓存
              </el-button>
            </el-space>

            <el-alert
              v-if="cacheInfo"
              :title="`Service Worker 缓存数量：${cacheInfo.length}`"
              type="info"
              :closable="false"
            >
              <template #default>
                <ul>
                  <li v-for="cache in cacheInfo" :key="cache">
                    {{ cache }}
                  </li>
                </ul>
              </template>
            </el-alert>
          </el-space>
        </el-card>

        <!-- 使用说明 -->
        <el-card shadow="never">
          <template #header>
            <span>使用说明</span>
          </template>
          <el-timeline>
            <el-timeline-item timestamp="步骤 1" placement="top">
              <p>构建生产版本：<code>npm run build</code></p>
            </el-timeline-item>
            <el-timeline-item timestamp="步骤 2" placement="top">
              <p>预览构建结果：<code>npm run preview</code></p>
            </el-timeline-item>
            <el-timeline-item timestamp="步骤 3" placement="top">
              <p>在浏览器中访问应用，检查 PWA 功能</p>
            </el-timeline-item>
            <el-timeline-item timestamp="步骤 4" placement="top">
              <p>在开发者工具中查看 Service Worker 和缓存</p>
            </el-timeline-item>
            <el-timeline-item timestamp="步骤 5" placement="top">
              <p>测试离线功能：切换到离线模式，刷新页面</p>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-space>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePWA, useInstallPrompt } from '@/composables/usePWA'
import { useOfflineCache } from '@/composables/useOfflineCache'
import { ElMessage, ElMessageBox } from 'element-plus'

const { updateInfo, offlineReady, isOnline, update, activateUpdate, unregister } = usePWA()
const { canInstall, promptInstall } = useInstallPrompt()
const {
  cacheStats,
  hasCache,
  cacheSizeFormatted,
  refreshStats,
  clearAllCache: clearOfflineCache
} = useOfflineCache()

const cacheInfo = ref<string[] | null>(null)

// Service Worker 状态
const serviceWorkerStatus = computed(() => {
  if (!('serviceWorker' in navigator)) {
    return '不支持'
  }
  if (updateInfo.value.registration) {
    return '已注册'
  }
  return '未注册'
})

/**
 * 检查更新
 */
const handleCheckUpdate = async () => {
  try {
    await update()
    if (!updateInfo.value.updateAvailable) {
      ElMessage.success('当前已是最新版本')
    }
  } catch (error) {
    console.error('Check update failed:', error)
    ElMessage.error('检查更新失败')
  }
}

/**
 * 激活更新
 */
const handleUpdate = async () => {
  try {
    await activateUpdate()
    ElMessage.success('正在更新应用...')
  } catch (error) {
    console.error('Update failed:', error)
    ElMessage.error('更新失败')
  }
}

/**
 * 安装应用
 */
const handleInstall = async () => {
  try {
    const accepted = await promptInstall()
    if (accepted) {
      ElMessage.success('应用安装成功')
    } else {
      ElMessage.info('用户取消了安装')
    }
  } catch (error) {
    console.error('Install failed:', error)
    ElMessage.error('安装失败')
  }
}

/**
 * 模拟网络切换
 */
const handleToggleNetwork = () => {
  ElMessage.warning('请在浏览器开发者工具中切换网络状态')
}

/**
 * 卸载 Service Worker
 */
const handleUnregister = async () => {
  try {
    await ElMessageBox.confirm(
      '卸载 Service Worker 将清除所有缓存，确定要继续吗？',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const result = await unregister()
    if (result) {
      ElMessage.success('Service Worker 已卸载')
      // 刷新页面
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } else {
      ElMessage.error('卸载失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Unregister failed:', error)
      ElMessage.error('卸载失败')
    }
  }
}

/**
 * 刷新统计
 */
const handleRefreshStats = async () => {
  await refreshStats()
  ElMessage.success('统计信息已刷新')
}

/**
 * 查看缓存列表
 */
const handleShowCaches = async () => {
  try {
    if (!('caches' in window)) {
      ElMessage.warning('浏览器不支持 Cache API')
      return
    }

    const cacheNames = await caches.keys()
    cacheInfo.value = cacheNames
    ElMessage.success(`找到 ${cacheNames.length} 个缓存`)
  } catch (error) {
    console.error('Show caches failed:', error)
    ElMessage.error('获取缓存列表失败')
  }
}

/**
 * 清除所有缓存
 */
const handleClearCaches = async () => {
  try {
    await ElMessageBox.confirm(
      '清除所有缓存后，应用将重新下载资源，确定要继续吗？',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // 清除 Service Worker 缓存
    if ('caches' in window) {
      const cacheNames = await caches.keys()
      await Promise.all(cacheNames.map((name) => caches.delete(name)))
    }

    // 清除离线缓存
    await clearOfflineCache()

    cacheInfo.value = null
    ElMessage.success('所有缓存已清除')

    // 刷新页面
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Clear caches failed:', error)
      ElMessage.error('清除缓存失败')
    }
  }
}
</script>

<style scoped lang="scss">
.pwa-example {
  padding: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  code {
    padding: 2px 6px;
    background-color: var(--el-fill-color-light);
    border-radius: 4px;
    font-family: 'Courier New', monospace;
    font-size: 14px;
  }

  ul {
    margin: 0;
    padding-left: 20px;

    li {
      margin: 4px 0;
    }
  }
}
</style>
