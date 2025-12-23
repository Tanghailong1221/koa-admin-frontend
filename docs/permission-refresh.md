# 权限动态刷新功能文档

## 概述

权限动态刷新功能允许在不刷新页面的情况下切换用户权限，自动重新生成动态路由并重新评估权限指令。这对于需要切换角色或权限的应用非常有用。

## 功能特性

### 1. 权限刷新管理器

- ✅ 监听权限变化
- ✅ 重新生成动态路由
- ✅ 重新评估权限指令
- ✅ 检查当前页面权限
- ✅ 自动重定向无权限页面
- ✅ 刷新前后回调支持

### 2. 权限指令增强

- ✅ 支持权限刷新事件
- ✅ 使用 `display: none` 而不是移除元素
- ✅ 自动监听 `permission-refresh` 事件
- ✅ 自动更新元素显示状态

### 3. Composable 支持

- ✅ `usePermissionRefresh` composable
- ✅ 响应式刷新状态
- ✅ 简单的刷新方法

## 使用方法

### 1. 初始化权限刷新管理器

在 `main.ts` 中初始化：

```typescript
import { setupPermissionRefresh } from '@/utils/permission-refresh'
import router from '@/router'

// 初始化权限刷新管理器
setupPermissionRefresh({
  router,
  generateRoutes: (permissions, roles) => {
    // 根据权限和角色生成动态路由
    return dynamicRoutes.filter(route => {
      return checkRoutePermission(route, permissions, roles)
    })
  },
  onBeforeRefresh: async () => {
    // 刷新前的操作
    console.log('开始刷新权限...')
  },
  onAfterRefresh: async () => {
    // 刷新后的操作
    console.log('权限刷新完成')
  },
  redirectToHome: true,  // 无权限时重定向到首页
  homePath: '/'
})
```

### 2. 切换权限

```typescript
import { usePermission, usePermissionRefresh } from '@/composables'

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

  // 2. 刷新权限
  await refresh()
}
```

### 3. 使用 Composable

```vue
<template>
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
</script>
```

### 4. 动态路由生成

```typescript
// 动态路由生成函数
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
}
```

## API 文档

### PermissionRefreshManager

#### 配置选项

```typescript
interface PermissionRefreshConfig {
  /** 路由实例 */
  router: Router
  /** 动态路由生成函数 */
  generateRoutes?: (permissions: string[], roles: string[]) => RouteRecordRaw[]
  /** 刷新前回调 */
  onBeforeRefresh?: () => void | Promise<void>
  /** 刷新后回调 */
  onAfterRefresh?: () => void | Promise<void>
  /** 是否自动重定向到首页 */
  redirectToHome?: boolean
  /** 首页路径 */
  homePath?: string
}
```

#### 方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| refresh | - | Promise<void> | 刷新权限 |
| isRefreshingPermission | - | boolean | 是否正在刷新 |

### usePermissionRefresh

#### 返回值

```typescript
{
  /** 是否正在刷新 */
  isRefreshing: Ref<boolean>
  /** 是否可以刷新 */
  canRefresh: ComputedRef<boolean>
  /** 刷新权限 */
  refresh: () => Promise<void>
}
```

## 工作原理

### 1. 权限刷新流程

```
1. 调用 refresh() 方法
   ↓
2. 执行 onBeforeRefresh 回调
   ↓
3. 重新生成动态路由
   - 移除旧的动态路由
   - 添加新的动态路由
   ↓
4. 检查当前页面权限
   - 有权限：触发指令刷新
   - 无权限：重定向到首页
   ↓
5. 触发 permission-refresh 事件
   ↓
6. 权限指令自动更新显示状态
   ↓
7. 执行 onAfterRefresh 回调
```

### 2. 指令刷新机制

权限指令（`v-perm` 和 `v-role`）会监听 `permission-refresh` 事件：

```typescript
// 监听权限刷新事件
window.addEventListener('permission-refresh', handler)

// 刷新时重新检查权限
function handler() {
  const hasPermission = checkPermission(value)
  updateElementVisibility(el, hasPermission)
}
```

### 3. 动态路由管理

动态路由需要标记 `meta.dynamic = true`：

```typescript
{
  path: '/users',
  name: 'Users',
  component: () => import('@/views/users/index.vue'),
  meta: {
    title: '用户管理',
    dynamic: true  // 标记为动态路由
  }
}
```

刷新时会移除所有标记为 `dynamic` 的路由，然后重新添加。

## 最佳实践

### 1. 路由权限配置

在路由 meta 中配置权限：

```typescript
{
  path: '/users',
  name: 'Users',
  component: () => import('@/views/users/index.vue'),
  meta: {
    title: '用户管理',
    permission: 'user:view',  // 单个权限
    // 或
    permission: ['user:view', 'user:edit'],  // 多个权限（OR）
    // 或
    role: 'admin',  // 角色权限
    dynamic: true
  }
}
```

### 2. 权限切换时机

建议在以下场景触发权限刷新：

- 用户切换角色
- 用户权限被修改
- 用户登录/登出
- 定期刷新权限（如每 30 分钟）

### 3. 错误处理

```typescript
async function switchRole(role: string) {
  try {
    // 更新权限
    updateConfig({
      permissions: getPermissionsByRole(role),
      roles: [role]
    })

    // 刷新权限
    await refresh()

    ElMessage.success('权限切换成功')
  } catch (error) {
    console.error('权限切换失败:', error)
    ElMessage.error('权限切换失败，请重试')
  }
}
```

### 4. 加载状态

使用 `isRefreshing` 显示加载状态：

```vue
<el-button
  :loading="isRefreshing"
  :disabled="!canRefresh"
  @click="handleRefresh"
>
  {{ isRefreshing ? '刷新中...' : '刷新权限' }}
</el-button>
```

## 注意事项

1. **动态路由标记**：所有动态生成的路由必须标记 `meta.dynamic = true`
2. **指令行为变化**：权限指令现在使用 `display: none` 而不是移除元素
3. **刷新频率**：避免频繁刷新权限，建议添加防抖或节流
4. **路由守卫**：确保路由守卫中也检查权限
5. **持久化**：权限配置应该持久化到 localStorage 或 sessionStorage

## 示例页面

完整的示例页面位于 `src/views/examples/PermissionRefreshExample.vue`，包含：
- 权限状态显示
- 权限切换按钮
- 权限指令测试
- 代码示例

## 验证的需求

- ✅ **需求 5.4**：权限动态刷新（监听权限变化、重新生成路由、重新评估指令）

---

**更新时间**：2025-12-23
**版本**：1.0.0
