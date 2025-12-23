# 权限管理器使用文档

## 概述

权限管理器（PermissionManager）提供了完整的权限检查和管理功能，支持：
- 权限检查（单个/多个）
- 角色检查（单个/多个）
- AND/OR 逻辑
- 超级管理员
- 权限过滤

## 基础用法

### 1. 设置权限配置

```typescript
import { permissionManager } from '@/utils/permission-manager'

// 设置权限配置
permissionManager.setConfig({
  permissions: ['user:add', 'user:edit', 'user:delete'],
  roles: ['admin', 'editor'],
  isSuperAdmin: false
})
```

### 2. 检查权限

```typescript
// 检查单个权限
if (permissionManager.hasPermission('user:add')) {
  // 有权限
}

// 检查任一权限（OR）
if (permissionManager.hasAnyPermission(['user:add', 'user:edit'])) {
  // 有任一权限
}

// 检查所有权限（AND）
if (permissionManager.hasAllPermissions(['user:add', 'user:edit'])) {
  // 有所有权限
}
```

### 3. 检查角色

```typescript
// 检查单个角色
if (permissionManager.hasRole('admin')) {
  // 有角色
}

// 检查任一角色（OR）
if (permissionManager.hasAnyRole(['admin', 'editor'])) {
  // 有任一角色
}

// 检查所有角色（AND）
if (permissionManager.hasAllRoles(['admin', 'editor'])) {
  // 有所有角色
}
```

## 使用 Composable

推荐使用 `usePermission` composable，提供响应式的权限状态：

```vue
<script setup lang="ts">
import { usePermission } from '@/composables'

const {
  permissions,
  roles,
  isSuperAdmin,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions
} = usePermission()

// 检查权限
if (hasPermission('user:add')) {
  // 有权限
}
</script>
```

## 使用指令

### v-perm 指令

```vue
<template>
  <!-- 单个权限 -->
  <el-button v-perm="'user:add'">新增</el-button>

  <!-- 多个权限（OR） -->
  <el-button v-perm="['user:add', 'user:edit']">新增或编辑</el-button>

  <!-- 多个权限（AND） -->
  <el-button
    v-perm="{ permissions: ['user:add', 'user:edit'], mode: 'every' }"
  >
    新增且编辑
  </el-button>
</template>
```

### v-role 指令

```vue
<template>
  <!-- 单个角色 -->
  <el-button v-role="'admin'">管理员按钮</el-button>

  <!-- 多个角色（OR） -->
  <el-button v-role="['admin', 'editor']">管理员或编辑</el-button>

  <!-- 多个角色（AND） -->
  <el-button
    v-role="{ roles: ['admin', 'editor'], mode: 'every' }"
  >
    管理员且编辑
  </el-button>
</template>
```

## 权限过滤

### 过滤菜单项

```typescript
interface MenuItem {
  name: string
  permission?: string | string[]
}

const menuItems: MenuItem[] = [
  { name: '用户管理', permission: 'user:view' },
  { name: '新增用户', permission: 'user:add' },
  { name: '编辑用户', permission: 'user:edit' }
]

// 过滤有权限的菜单项
const filteredItems = permissionManager.filterByPermission(menuItems)
```

### 过滤路由

```typescript
interface Route {
  path: string
  role?: string | string[]
}

const routes: Route[] = [
  { path: '/admin', role: 'admin' },
  { path: '/editor', role: 'editor' },
  { path: '/viewer', role: 'viewer' }
]

// 过滤有角色的路由
const filteredRoutes = permissionManager.filterByRole(routes)
```

## 超级管理员

超级管理员拥有所有权限和角色：

```typescript
permissionManager.setConfig({
  permissions: [],
  roles: ['super_admin'],
  isSuperAdmin: true
})

// 超级管理员检查任何权限都返回 true
permissionManager.hasPermission('any:permission') // true
permissionManager.hasRole('any:role') // true
```

## 动态权限管理

```typescript
// 添加权限
permissionManager.addPermission('user:export')
permissionManager.addPermissions(['user:import', 'user:batch'])

// 移除权限
permissionManager.removePermission('user:export')
permissionManager.removePermissions(['user:import', 'user:batch'])

// 添加角色
permissionManager.addRole('manager')
permissionManager.addRoles(['supervisor', 'operator'])

// 移除角色
permissionManager.removeRole('manager')
permissionManager.removeRoles(['supervisor', 'operator'])
```

## 权限模式

```typescript
import { PermissionMode } from '@/utils/permission-manager'

// SOME 模式（OR）- 满足任一权限即可
permissionManager.checkPermissions(
  ['user:add', 'user:edit'],
  PermissionMode.SOME
)

// EVERY 模式（AND）- 必须满足所有权限
permissionManager.checkPermissions(
  ['user:add', 'user:edit'],
  PermissionMode.EVERY
)
```

## 集成到 Auth Store

```typescript
// src/store/auth.ts
import { defineStore } from 'pinia'
import { permissionManager } from '@/utils/permission-manager'

export const useAuthStore = defineStore('auth', {
  actions: {
    async login(credentials) {
      const response = await loginApi(credentials)
      
      // 设置权限配置
      permissionManager.setConfig({
        permissions: response.permissions,
        roles: response.roles,
        isSuperAdmin: response.isSuperAdmin
      })
    },
    
    logout() {
      // 清空权限配置
      permissionManager.clearConfig()
    }
  }
})
```

## 注意事项

1. **权限格式**：建议使用 `resource:action` 格式，如 `user:add`、`user:edit`
2. **超级管理员**：超级管理员拥有所有权限，无需配置具体权限列表
3. **指令移除**：没有权限的元素会被从 DOM 中移除，不是隐藏
4. **响应式**：使用 `usePermission` composable 可以获得响应式的权限状态
5. **性能**：权限检查使用 Set 数据结构，性能优秀

## API 参考

### PermissionManager

#### 方法

- `setConfig(config)` - 设置权限配置
- `clearConfig()` - 清空权限配置
- `hasPermission(permission)` - 检查单个权限
- `hasAnyPermission(permissions)` - 检查任一权限（OR）
- `hasAllPermissions(permissions)` - 检查所有权限（AND）
- `checkPermissions(permissions, mode)` - 检查权限（支持模式）
- `hasRole(role)` - 检查单个角色
- `hasAnyRole(roles)` - 检查任一角色（OR）
- `hasAllRoles(roles)` - 检查所有角色（AND）
- `checkRoles(roles, mode)` - 检查角色（支持模式）
- `isSuperAdminUser()` - 检查是否为超级管理员
- `filterByPermission(items, mode)` - 过滤有权限的项目
- `filterByRole(items, mode)` - 过滤有角色的项目
- `getPermissions()` - 获取所有权限
- `getRoles()` - 获取所有角色
- `addPermission(permission)` - 添加权限
- `addPermissions(permissions)` - 添加多个权限
- `removePermission(permission)` - 移除权限
- `removePermissions(permissions)` - 移除多个权限
- `addRole(role)` - 添加角色
- `addRoles(roles)` - 添加多个角色
- `removeRole(role)` - 移除角色
- `removeRoles(roles)` - 移除多个角色

### usePermission

#### 返回值

- `permissions` - 权限列表（响应式）
- `roles` - 角色列表（响应式）
- `isSuperAdmin` - 是否为超级管理员（响应式）
- `hasAnyPermissions` - 是否有任何权限（计算属性）
- `hasAnyRoles` - 是否有任何角色（计算属性）
- `updateConfig(config)` - 更新权限配置
- `clearConfig()` - 清空权限配置
- `hasPermission(permission)` - 检查权限
- `hasAnyPermission(permissions)` - 检查任一权限
- `hasAllPermissions(permissions)` - 检查所有权限
- `checkPermissions(permissions, mode)` - 检查权限（支持模式）
- `hasRole(role)` - 检查角色
- `hasAnyRole(roles)` - 检查任一角色
- `hasAllRoles(roles)` - 检查所有角色
- `checkRoles(roles, mode)` - 检查角色（支持模式）
- `filterByPermission(items, mode)` - 过滤有权限的项目
- `filterByRole(items, mode)` - 过滤有角色的项目
