<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Document } from '@element-plus/icons-vue'

const route = useRoute()
const pageTitle = computed(() => route.meta?.title || '页面开发中')
</script>

<template>
  <div class="placeholder-page">
    <div class="placeholder-content">
      <el-icon class="placeholder-icon"><Document /></el-icon>
      <h2 class="placeholder-title">{{ pageTitle }}</h2>
      <p class="placeholder-desc">该功能正在开发中，敬请期待...</p>
    </div>
  </div>
</template>

<style scoped>
.placeholder-page {
  display: flex;
  align-items: center;
  justify-content: center;
  height: calc(100vh - 180px);
  background: var(--el-bg-color);
  border-radius: 8px;
}

.placeholder-content {
  text-align: center;
  padding: 40px;
}

.placeholder-icon {
  font-size: 64px;
  color: var(--el-color-primary);
  margin-bottom: 24px;
}

.placeholder-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0 0 12px;
}

.placeholder-desc {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin: 0;
}
</style>
