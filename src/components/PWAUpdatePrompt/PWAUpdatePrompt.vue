<template>
  <el-dialog
    v-model="visible"
    title="应用更新"
    width="400px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
  >
    <div class="update-content">
      <el-icon :size="48" color="#409EFF" class="update-icon">
        <RefreshRight />
      </el-icon>
      <p class="update-message">
        检测到新版本，请更新以获得最佳体验
      </p>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleLater">稍后</el-button>
        <el-button type="primary" @click="handleUpdate">立即更新</el-button>
      </div>
    </template>
  </el-dialog>

  <!-- 离线提示 -->
  <el-alert
    v-if="!isOnline"
    title="您当前处于离线状态"
    type="warning"
    :closable="false"
    class="offline-alert"
  >
    <template #default>
      应用将使用缓存数据，部分功能可能不可用
    </template>
  </el-alert>

  <!-- 离线就绪提示 -->
  <el-notification
    v-if="showOfflineReady"
    title="离线就绪"
    message="应用已准备好离线使用"
    type="success"
    :duration="3000"
  />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { RefreshRight } from '@element-plus/icons-vue'
import { usePWA } from '@/composables/usePWA'
import { ElMessage } from 'element-plus'

const { updateInfo, offlineReady, isOnline, activateUpdate } = usePWA()

const visible = ref(false)
const showOfflineReady = ref(false)

// 监听更新信息
watch(
  () => updateInfo.value.updateAvailable,
  (available) => {
    if (available) {
      visible.value = true
    }
  }
)

// 监听离线就绪状态
watch(
  offlineReady,
  (ready) => {
    if (ready) {
      showOfflineReady.value = true
      setTimeout(() => {
        showOfflineReady.value = false
      }, 3000)
    }
  },
  { immediate: true }
)

/**
 * 处理更新
 */
const handleUpdate = async () => {
  try {
    await activateUpdate()
    ElMessage.success('正在更新应用...')
    visible.value = false
    // Service Worker 会自动重新加载页面
  } catch (error) {
    console.error('Update failed:', error)
    ElMessage.error('更新失败，请稍后重试')
  }
}

/**
 * 稍后更新
 */
const handleLater = () => {
  visible.value = false
  // 5 分钟后再次提示
  setTimeout(() => {
    if (updateInfo.value.updateAvailable) {
      visible.value = true
    }
  }, 5 * 60 * 1000)
}
</script>

<style scoped lang="scss">
.update-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;

  .update-icon {
    margin-bottom: 16px;
  }

  .update-message {
    margin: 0;
    font-size: 14px;
    color: var(--el-text-color-regular);
    text-align: center;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.offline-alert {
  position: fixed;
  top: 60px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2000;
  width: 90%;
  max-width: 600px;
}
</style>
