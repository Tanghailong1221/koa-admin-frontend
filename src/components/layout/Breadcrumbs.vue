<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const crumbs = computed(() =>
  route.matched
    .filter(r => r.meta?.title && r.path !== '/')
    .map(r => ({ title: r.meta?.title as string, path: r.path }))
)

const handleClick = (path: string) => {
  if (path) router.push(path)
}
</script>

<template>
  <el-breadcrumb separator="/">
    <el-breadcrumb-item v-for="item in crumbs" :key="item.path" @click="handleClick(item.path)">
      <span class="breadcrumb__link">{{ item.title }}</span>
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<style scoped>
.breadcrumb__link {
  cursor: pointer;
  color: var(--text-secondary);
  transition: color 0.3s ease;
  padding: 4px 8px;
  border-radius: var(--radius-sm);
}

.breadcrumb__link:hover {
  color: var(--color-accent-cyan);
  background: var(--bg-glass);
}

:deep(.el-breadcrumb__inner) {
  color: var(--text-secondary);
  font-weight: 500;
}

:deep(.el-breadcrumb__separator) {
  color: var(--text-tertiary);
  margin: 0 8px;
}
</style>

