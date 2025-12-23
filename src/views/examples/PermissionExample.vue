<template>
  <div class="permission-example">
    <el-card header="权限系统示例">
      <!-- 当前权限信息 -->
      <el-descriptions title="当前权限信息" :column="2" border>
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
        <el-descriptions-item label="权限列表" :span="2">
          <el-tag
            v-for="perm in permissions"
            :key="perm"
            size="small"
            style="margin-right: 8px"
          >
            {{ perm }}
          </el-tag>
          <span v-if="permissions.length === 0" style="color: #999">
            暂无权限
          </span>
        </el-descriptions-item>
        <el-descriptions-item label="角色列表" :span="2">
          <el-tag
            v-for="role in roles"
            :key="role"
            type="success"
            size="small"
            style="margin-right: 8px"
          >
            {{ role }}
          </el-tag>
          <span v-if="roles.length === 0" style="color: #999">
            暂无角色
          </span>
        </el-descriptions-item>
      </el-descriptions>

      <el-divider />

      <!-- 权限切换 -->
      <el-space direction="vertical" style="width: 100%">
        <div>
          <strong>切换权限配置：</strong>
        </div>
        <el-space wrap>
          <el-button @click="setAdminPermissions">
            管理员权限
          </el-button>
          <el-button @click="setEditorPermissions">
            编辑权限
          </el-button>
          <el-button @click="setViewerPermissions">
            查看权限
          </el-button>
          <el-button @click="setSuperAdminPermissions">
            超级管理员
          </el-button>
          <el-button @click="clearPermissions">
            清空权限
          </el-button>
        </el-space>
      </el-space>

      <el-divider />

      <!-- 权限指令示例 -->
      <div>
        <strong>权限指令示例（v-perm）：</strong>
      </div>
      <el-space wrap style="margin-top: 16px">
        <el-button v-perm="'user:add'" type="primary">
          新增用户（需要 user:add）
        </el-button>
        <el-button v-perm="'user:edit'" type="success">
          编辑用户（需要 user:edit）
        </el-button>
        <el-button v-perm="'user:delete'" type="danger">
          删除用户（需要 user:delete）
        </el-button>
        <el-button v-perm="['user:add', 'user:edit']">
          新增或编辑（OR）
        </el-button>
        <el-button
          v-perm="{ permissions: ['user:add', 'user:edit'], mode: 'every' }"
          type="warning"
        >
          新增且编辑（AND）
        </el-button>
      </el-space>

      <el-divider />

      <!-- 角色指令示例 -->
      <div>
        <strong>角色指令示例（v-role）：</strong>
      </div>
      <el-space wrap style="margin-top: 16px">
        <el-button v-role="'admin'" type="primary">
          管理员按钮
        </el-button>
        <el-button v-role="'editor'" type="success">
          编辑按钮
        </el-button>
        <el-button v-role="'viewer'" type="info">
          查看按钮
        </el-button>
        <el-button v-role="['admin', 'editor']">
          管理员或编辑（OR）
        </el-button>
        <el-button
          v-role="{ roles: ['admin', 'editor'], mode: 'every' }"
          type="warning"
        >
          管理员且编辑（AND）
        </el-button>
      </el-space>

      <el-divider />

      <!-- 权限检查示例 -->
      <div>
        <strong>权限检查方法：</strong>
      </div>
      <el-space direction="vertical" style="margin-top: 16px; width: 100%">
        <div>
          hasPermission('user:add'):
          <el-tag :type="hasPermission('user:add') ? 'success' : 'danger'">
            {{ hasPermission('user:add') }}
          </el-tag>
        </div>
        <div>
          hasAnyPermission(['user:add', 'user:edit']):
          <el-tag
            :type="hasAnyPermission(['user:add', 'user:edit']) ? 'success' : 'danger'"
          >
            {{ hasAnyPermission(['user:add', 'user:edit']) }}
          </el-tag>
        </div>
        <div>
          hasAllPermissions(['user:add', 'user:edit']):
          <el-tag
            :type="hasAllPermissions(['user:add', 'user:edit']) ? 'success' : 'danger'"
          >
            {{ hasAllPermissions(['user:add', 'user:edit']) }}
          </el-tag>
        </div>
        <div>
          hasRole('admin'):
          <el-tag :type="hasRole('admin') ? 'success' : 'danger'">
            {{ hasRole('admin') }}
          </el-tag>
        </div>
      </el-space>

      <el-divider />

      <!-- 说明 -->
      <el-alert type="info" :closable="false">
        <template #title>功能说明</template>
        <ul style="margin: 0; padding-left: 20px">
          <li>支持单个权限检查（v-perm="'user:add'"）</li>
          <li>支持多个权限 OR 检查（v-perm="['user:add', 'user:edit']"）</li>
          <li>支持多个权限 AND 检查（v-perm="{ permissions: [...], mode: 'every' }"）</li>
          <li>支持角色检查（v-role="'admin'"）</li>
          <li>超级管理员拥有所有权限和角色</li>
          <li>提供 composable 方法进行权限检查</li>
          <li>支持权限过滤（filterByPermission）</li>
        </ul>
      </el-alert>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { usePermission } from '@/composables'

// 权限管理
const {
  permissions,
  roles,
  isSuperAdmin,
  updateConfig,
  clearConfig,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  hasRole
} = usePermission()

/**
 * 设置管理员权限
 */
const setAdminPermissions = () => {
  updateConfig({
    permissions: ['user:add', 'user:edit', 'user:delete', 'user:view'],
    roles: ['admin'],
    isSuperAdmin: false
  })
}

/**
 * 设置编辑权限
 */
const setEditorPermissions = () => {
  updateConfig({
    permissions: ['user:edit', 'user:view'],
    roles: ['editor'],
    isSuperAdmin: false
  })
}

/**
 * 设置查看权限
 */
const setViewerPermissions = () => {
  updateConfig({
    permissions: ['user:view'],
    roles: ['viewer'],
    isSuperAdmin: false
  })
}

/**
 * 设置超级管理员权限
 */
const setSuperAdminPermissions = () => {
  updateConfig({
    permissions: [],
    roles: ['super_admin'],
    isSuperAdmin: true
  })
}

/**
 * 清空权限
 */
const clearPermissions = () => {
  clearConfig()
}

// 初始化为管理员权限
setAdminPermissions()
</script>

<style scoped lang="scss">
.permission-example {
  padding: 20px;
}
</style>
