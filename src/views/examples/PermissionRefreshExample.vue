<template>
  <div class="permission-refresh-example">
    <el-card header="权限动态刷新示例 / Permission Refresh Example">
      <el-alert
        title="功能说明 / Description"
        type="info"
        :closable="false"
        style="margin-bottom: 20px"
      >
        <p>本示例展示了权限动态刷新功能，可以在不刷新页面的情况下切换用户权限。</p>
        <p>This example demonstrates permission refresh feature, allowing permission changes without page reload.</p>
      </el-alert>

      <!-- 当前权限状态 -->
      <el-card header="当前权限状态 / Current Permission Status" style="margin-bottom: 20px">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="是否超级管理员">
            <el-tag :type="isSuperAdmin ? 'success' : 'info'">
              {{ isSuperAdmin ? '是' : '否' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="权限数量">
            {{ permissions.length }}
          </el-descriptions-item>
          <el-descriptions-item label="角色数量">
            {{ roles.length }}
          </el-descriptions-item>
          <el-descriptions-item label="刷新状态">
            <el-tag :type="isRefreshing ? 'warning' : 'success'">
              {{ isRefreshing ? '刷新中...' : '就绪' }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>

        <el-divider />

        <div style="margin-bottom: 10px">
          <strong>当前权限列表：</strong>
        </div>
        <el-space wrap>
          <el-tag v-for="perm in permissions" :key="perm" type="success">
            {{ perm }}
          </el-tag>
          <el-tag v-if="permissions.length === 0" type="info">无权限</el-tag>
        </el-space>

        <el-divider />

        <div style="margin-bottom: 10px">
          <strong>当前角色列表：</strong>
        </div>
        <el-space wrap>
          <el-tag v-for="role in roles" :key="role" type="primary">
            {{ role }}
          </el-tag>
          <el-tag v-if="roles.length === 0" type="info">无角色</el-tag>
        </el-space>
      </el-card>

      <!-- 权限切换 -->
      <el-card header="权限切换 / Permission Switch" style="margin-bottom: 20px">
        <el-space wrap>
          <el-button type="primary" @click="switchToAdmin">
            切换到管理员
          </el-button>
          <el-button type="success" @click="switchToUser">
            切换到普通用户
          </el-button>
          <el-button type="warning" @click="switchToGuest">
            切换到访客
          </el-button>
          <el-button type="danger" @click="clearPermissions">
            清空权限
          </el-button>
          <el-button
            type="info"
            :loading="isRefreshing"
            :disabled="!canRefresh"
            @click="handleRefresh"
          >
            手动刷新权限
          </el-button>
        </el-space>
      </el-card>

      <!-- 权限指令测试 -->
      <el-card header="权限指令测试 / Permission Directive Test" style="margin-bottom: 20px">
        <el-alert
          title="提示"
          type="warning"
          :closable="false"
          style="margin-bottom: 15px"
        >
          切换权限后，下面的按钮会根据权限自动显示/隐藏
        </el-alert>

        <div style="margin-bottom: 15px">
          <h4>单个权限测试：</h4>
          <el-space wrap>
            <el-button v-perm="'user:add'" type="primary">
              新增用户 (user:add)
            </el-button>
            <el-button v-perm="'user:edit'" type="success">
              编辑用户 (user:edit)
            </el-button>
            <el-button v-perm="'user:delete'" type="danger">
              删除用户 (user:delete)
            </el-button>
            <el-button v-perm="'user:view'" type="info">
              查看用户 (user:view)
            </el-button>
          </el-space>
        </div>

        <el-divider />

        <div style="margin-bottom: 15px">
          <h4>多个权限测试（OR）：</h4>
          <el-space wrap>
            <el-button v-perm="['user:add', 'user:edit']" type="primary">
              新增或编辑 (user:add OR user:edit)
            </el-button>
            <el-button v-perm="['user:delete', 'user:view']" type="warning">
              删除或查看 (user:delete OR user:view)
            </el-button>
          </el-space>
        </div>

        <el-divider />

        <div style="margin-bottom: 15px">
          <h4>多个权限测试（AND）：</h4>
          <el-space wrap>
            <el-button
              v-perm="{ permissions: ['user:add', 'user:edit'], mode: 'every' }"
              type="primary"
            >
              新增且编辑 (user:add AND user:edit)
            </el-button>
            <el-button
              v-perm="{ permissions: ['user:delete', 'user:view'], mode: 'every' }"
              type="danger"
            >
              删除且查看 (user:delete AND user:view)
            </el-button>
          </el-space>
        </div>

        <el-divider />

        <div>
          <h4>角色测试：</h4>
          <el-space wrap>
            <el-button v-role="'admin'" type="primary">
              管理员按钮 (admin)
            </el-button>
            <el-button v-role="'user'" type="success">
              用户按钮 (user)
            </el-button>
            <el-button v-role="'guest'" type="info">
              访客按钮 (guest)
            </el-button>
            <el-button v-role="['admin', 'user']" type="warning">
              管理员或用户 (admin OR user)
            </el-button>
          </el-space>
        </div>
      </el-card>

      <!-- 使用说明 -->
      <el-card header="使用说明 / Usage">
        <el-collapse>
          <el-collapse-item title="初始化权限刷新管理器" name="1">
            <pre><code>{{ initCode }}</code></pre>
          </el-collapse-item>
          <el-collapse-item title="切换权限" name="2">
            <pre><code>{{ switchCode }}</code></pre>
          </el-collapse-item>
          <el-collapse-item title="使用 Composable" name="3">
            <pre><code>{{ composableCode }}</code></pre>
          </el-collapse-item>
          <el-collapse-item title="动态路由生成" name="4">
            <pre><code>{{ routeCode }}</code></pre>
          </el-collapse-item>
        </el-collapse>
      </el-card>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { usePermission, usePermissionRefresh } from '@/composables'

// 权限管理
const {
  permissions,
  roles,
  isSuperAdmin,
  updateConfig
} = usePermission()

// 权限刷新
const { isRefreshing, canRefresh, refresh } = usePermissionRefresh()

/**
 * 切换到管理员
 */
function switchToAdmin() {
  updateConfig({
    permissions: ['user:add', 'user:edit', 'user:delete', 'user:view'],
    roles: ['admin'],
    isSuperAdmin: false
  })
  ElMessage.success('已切换到管理员权限')
  handleRefresh()
}

/**
 * 切换到普通用户
 */
function switchToUser() {
  updateConfig({
    permissions: ['user:view', 'user:edit'],
    roles: ['user'],
    isSuperAdmin: false
  })
  ElMessage.success('已切换到普通用户权限')
  handleRefresh()
}

/**
 * 切换到访客
 */
function switchToGuest() {
  updateConfig({
    permissions: ['user:view'],
    roles: ['guest'],
    isSuperAdmin: false
  })
  ElMessage.success('已切换到访客权限')
  handleRefresh()
}

/**
 * 清空权限
 */
function clearPermissions() {
  updateConfig({
    permissions: [],
    roles: [],
    isSuperAdmin: false
  })
  ElMessage.warning('已清空所有权限')
  handleRefresh()
}

/**
 * 手动刷新权限
 */
async function handleRefresh() {
  try {
    await refresh()
    ElMessage.success('权限刷新成功')
  } catch (error) {
    ElMessage.error('权限刷新失败')
    console.error(error)
  }
}

// 代码示例
const initCode = `// main.ts
import { setupPermissionRefresh } from '@/utils/permission-refresh'
import router from '@/router'

// 初始化权限刷新管理器
setupPermissionRefresh({
  router,
  generateRoutes: (permissions, roles) => {
    // 根据权限和角色生成动态路由
    return dynamicRoutes.filter(route => {
      // 检查路由权限
      return checkRoutePermission(route, permissions, roles)
    })
  },
  onBeforeRefresh: async () => {
    // 刷新前的操作，如显示加载提示
    console.log('开始刷新权限...')
  },
  onAfterRefresh: async () => {
    // 刷新后的操作，如隐藏加载提示
    console.log('权限刷新完成')
  },
  redirectToHome: true,
  homePath: '/'
})`

const switchCode = `import { usePermission, usePermissionRefresh } from '@/composables'

const { updateConfig } = usePermission()
const { refresh } = usePermissionRefresh()

// 切换权限
async function switchRole(role: string) {
  // 1. 更新权限配置
  updateConfig({
    permissions: getPermissionsByRole(role),
    roles: [role],
    isSuperAdmin: role === 'superadmin'
  })

  // 2. 刷新权限（重新生成路由、重新评估指令）
  await refresh()
}`

const composableCode = `<template>
  <el-button
    :loading="isRefreshing"
    :disabled="!canRefresh"
    @click="handleRefresh"
  >
    刷新权限
  </el-button>
</template>

<script setup lang="ts">
import { usePermissionRefresh } from '@/composables'

const { isRefreshing, canRefresh, refresh } = usePermissionRefresh()

async function handleRefresh() {
  await refresh()
}
<\/script>`

const routeCode = `// 动态路由生成函数
function generateRoutes(permissions: string[], roles: string[]) {
  const routes: RouteRecordRaw[] = []

  // 根据权限生成路由
  if (permissions.includes('user:view')) {
    routes.push({
      path: '/users',
      name: 'Users',
      component: () => import('@/views/users/index.vue'),
      meta: {
        title: '用户管理',
        dynamic: true  // 标记为动态路由
      }
    })
  }

  if (permissions.includes('role:view')) {
    routes.push({
      path: '/roles',
      name: 'Roles',
      component: () => import('@/views/roles/index.vue'),
      meta: {
        title: '角色管理',
        dynamic: true
      }
    })
  }

  return routes
}`
</script>

<style scoped lang="scss">
.permission-refresh-example {
  padding: 20px;
}

pre {
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
  overflow-x: auto;
}

code {
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
  line-height: 1.5;
}

h4 {
  margin-bottom: 10px;
  color: #303133;
}
</style>
