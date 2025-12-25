<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { useAuthStore } from '@/store/auth'
import { useMenuStore } from '@/store/menu'
import { useTabsStore } from '@/store/tabs'

const auth = useAuthStore()
const menuStore = useMenuStore()
const tabsStore = useTabsStore()
const router = useRouter()

const displayName = computed(() => auth.userInfo?.nickname || auth.userInfo?.username || '用户')
const avatar = computed(() => auth.userInfo?.avatar)

const handleCommand = async (cmd: string) => {
  if (cmd === 'logout') {
    try {
      await ElMessageBox.confirm('确定退出登录吗？', '提示', {
        confirmButtonText: '退出',
        cancelButtonText: '取消',
        type: 'warning',
      })
    } catch {
      return
    }
    await auth.logout()
    menuStore.reset()
    tabsStore.reset()
    router.replace({ name: 'Login' })
  }
}
</script>

<template>
  <div class="header-actions">
    <el-dropdown trigger="click" @command="handleCommand">
      <span class="user">
        <el-avatar v-if="avatar" :src="avatar" size="small" />
        <el-avatar v-else size="small" icon="UserFilled" />
        <span class="user__name">{{ displayName }}</span>
      </span>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="logout">退出登录</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<style scoped>
.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--text-primary);
  cursor: pointer;
  padding: 6px 12px;
  border-radius: var(--radius-md);
  transition: all 0.3s ease;
}

.user:hover {
  background: var(--bg-glass-hover);
  box-shadow: var(--shadow-sm);
}

.user__name {
  font-size: 14px;
  font-weight: 500;
}
</style>

