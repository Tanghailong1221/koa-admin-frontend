<template>
  <div class="data-permission-example">
    <el-card header="数据级权限拦截器示例">
      <el-alert
        title="功能说明"
        type="info"
        :closable="false"
        style="margin-bottom: 20px"
      >
        <p>数据级权限拦截器会自动在 HTTP 请求中注入用户的组织和角色过滤条件。</p>
        <p>超级管理员可以查看所有数据，普通用户只能查看自己权限范围内的数据。</p>
      </el-alert>

      <!-- 当前权限配置 -->
      <el-card header="当前权限配置" style="margin-bottom: 20px">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="用户 ID">
            {{ currentConfig?.userId || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="用户名">
            {{ currentConfig?.username || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="部门 ID">
            {{ currentConfig?.deptId || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="角色 ID">
            {{ currentConfig?.roleIds?.join(', ') || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="角色代码">
            {{ currentConfig?.roleCodes?.join(', ') || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="超级管理员">
            <el-tag :type="currentConfig?.isSuperAdmin ? 'success' : 'info'">
              {{ currentConfig?.isSuperAdmin ? '是' : '否' }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 模拟不同角色 -->
      <el-card header="模拟不同角色" style="margin-bottom: 20px">
        <el-space wrap>
          <el-button type="primary" @click="simulateRole('super_admin')">
            超级管理员
          </el-button>
          <el-button type="success" @click="simulateRole('dept_admin')">
            部门管理员
          </el-button>
          <el-button type="warning" @click="simulateRole('normal_user')">
            普通用户
          </el-button>
          <el-button @click="clearRole">清空角色</el-button>
        </el-space>
      </el-card>

      <!-- 拦截器控制 -->
      <el-card header="拦截器控制" style="margin-bottom: 20px">
        <el-space wrap>
          <el-button
            :type="interceptorEnabled ? 'success' : 'info'"
            @click="toggleInterceptor"
          >
            {{ interceptorEnabled ? '拦截器已启用' : '拦截器已禁用' }}
          </el-button>
          <el-button @click="showWhitelistDialog = true">
            配置白名单
          </el-button>
          <el-button @click="showBlacklistDialog = true">
            配置黑名单
          </el-button>
        </el-space>
      </el-card>

      <!-- 测试请求 -->
      <el-card header="测试请求">
        <el-space direction="vertical" style="width: 100%">
          <el-button type="primary" @click="testGetRequest" :loading="loading">
            测试 GET 请求（用户列表）
          </el-button>
          <el-button type="success" @click="testPostRequest" :loading="loading">
            测试 POST 请求（创建用户）
          </el-button>
          <el-button type="warning" @click="testWhitelistRequest" :loading="loading">
            测试白名单请求（公开接口）
          </el-button>
        </el-space>

        <!-- 请求结果 -->
        <el-card v-if="requestInfo" header="请求信息" style="margin-top: 20px">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="请求方法">
              <el-tag>{{ requestInfo.method }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="请求 URL">
              {{ requestInfo.url }}
            </el-descriptions-item>
            <el-descriptions-item label="注入的权限参数">
              <pre style="margin: 0">{{ JSON.stringify(requestInfo.params, null, 2) }}</pre>
            </el-descriptions-item>
            <el-descriptions-item label="响应状态">
              <el-tag :type="requestInfo.success ? 'success' : 'danger'">
                {{ requestInfo.success ? '成功' : '失败' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item v-if="requestInfo.message" label="响应消息">
              {{ requestInfo.message }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-card>
    </el-card>

    <!-- 白名单配置对话框 -->
    <el-dialog
      v-model="showWhitelistDialog"
      title="配置白名单"
      width="600px"
    >
      <el-form label-width="100px">
        <el-form-item label="白名单 URL">
          <el-input
            v-model="newWhitelistUrl"
            placeholder="输入 URL，支持通配符 *"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="addWhitelist">添加</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="whitelistUrls" border>
        <el-table-column prop="url" label="URL" />
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button
              type="danger"
              size="small"
              @click="removeWhitelist(row.url)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!-- 黑名单配置对话框 -->
    <el-dialog
      v-model="showBlacklistDialog"
      title="配置黑名单"
      width="600px"
    >
      <el-form label-width="100px">
        <el-form-item label="黑名单 URL">
          <el-input
            v-model="newBlacklistUrl"
            placeholder="输入 URL，支持通配符 *"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="addBlacklist">添加</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="blacklistUrls" border>
        <el-table-column prop="url" label="URL" />
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button
              type="danger"
              size="small"
              @click="removeBlacklist(row.url)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!-- 使用说明 -->
    <el-card header="使用说明" style="margin-top: 20px">
      <el-collapse>
        <el-collapse-item title="基础用法" name="1">
          <pre><code>{{ basicUsageCode }}</code></pre>
        </el-collapse-item>
        <el-collapse-item title="配置白名单" name="2">
          <pre><code>{{ whitelistCode }}</code></pre>
        </el-collapse-item>
        <el-collapse-item title="自定义过滤器" name="3">
          <pre><code>{{ customFilterCode }}</code></pre>
        </el-collapse-item>
      </el-collapse>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { dataPermissionInterceptor } from '@/utils/request'
import type { DataPermissionConfig } from '@/utils/http/data-permission-interceptor'
import { DataPermissionType } from '@/utils/http/data-permission-interceptor'
import request from '@/utils/request'

// 当前权限配置
const currentConfig = ref<DataPermissionConfig | null>(null)

// 拦截器状态
const interceptorEnabled = ref(true)

// 加载状态
const loading = ref(false)

// 请求信息
const requestInfo = ref<any>(null)

// 白名单对话框
const showWhitelistDialog = ref(false)
const newWhitelistUrl = ref('')
const whitelistUrls = ref<{ url: string }[]>([
  { url: '/user/login' },
  { url: '/user/logout' },
  { url: '/user/refresh-token' },
  { url: '/captcha' },
  { url: '/public' }
])

// 黑名单对话框
const showBlacklistDialog = ref(false)
const newBlacklistUrl = ref('')
const blacklistUrls = ref<{ url: string }[]>([])

/**
 * 模拟不同角色
 */
function simulateRole(role: string) {
  switch (role) {
    case 'super_admin':
      currentConfig.value = {
        userId: 1,
        username: 'admin',
        deptId: 1,
        roleIds: [1],
        roleCodes: ['super_admin'],
        dataPermissionType: DataPermissionType.ALL,
        isSuperAdmin: true
      }
      ElMessage.success('已切换到超级管理员角色')
      break

    case 'dept_admin':
      currentConfig.value = {
        userId: 2,
        username: 'dept_admin',
        deptId: 10,
        deptIds: [10, 11, 12],
        roleIds: [2],
        roleCodes: ['dept_admin'],
        dataPermissionType: DataPermissionType.DEPT_AND_CHILD,
        isSuperAdmin: false
      }
      ElMessage.success('已切换到部门管理员角色')
      break

    case 'normal_user':
      currentConfig.value = {
        userId: 3,
        username: 'user',
        deptId: 10,
        roleIds: [3],
        roleCodes: ['user'],
        dataPermissionType: DataPermissionType.SELF,
        isSuperAdmin: false
      }
      ElMessage.success('已切换到普通用户角色')
      break
  }

  // 更新拦截器配置
  dataPermissionInterceptor.setPermissionConfig(currentConfig.value)
}

/**
 * 清空角色
 */
function clearRole() {
  currentConfig.value = null
  dataPermissionInterceptor.setPermissionConfig(null)
  ElMessage.info('已清空角色配置')
}

/**
 * 切换拦截器
 */
function toggleInterceptor() {
  if (interceptorEnabled.value) {
    dataPermissionInterceptor.disable()
    interceptorEnabled.value = false
    ElMessage.info('拦截器已禁用')
  } else {
    dataPermissionInterceptor.enable()
    interceptorEnabled.value = true
    ElMessage.success('拦截器已启用')
  }
}

/**
 * 添加白名单
 */
function addWhitelist() {
  if (!newWhitelistUrl.value) {
    ElMessage.warning('请输入 URL')
    return
  }

  whitelistUrls.value.push({ url: newWhitelistUrl.value })
  dataPermissionInterceptor.addWhitelist(newWhitelistUrl.value)
  newWhitelistUrl.value = ''
  ElMessage.success('已添加到白名单')
}

/**
 * 移除白名单
 */
function removeWhitelist(url: string) {
  const index = whitelistUrls.value.findIndex(item => item.url === url)
  if (index > -1) {
    whitelistUrls.value.splice(index, 1)
    dataPermissionInterceptor.removeWhitelist(url)
    ElMessage.success('已从白名单移除')
  }
}

/**
 * 添加黑名单
 */
function addBlacklist() {
  if (!newBlacklistUrl.value) {
    ElMessage.warning('请输入 URL')
    return
  }

  blacklistUrls.value.push({ url: newBlacklistUrl.value })
  dataPermissionInterceptor.addBlacklist(newBlacklistUrl.value)
  newBlacklistUrl.value = ''
  ElMessage.success('已添加到黑名单')
}

/**
 * 移除黑名单
 */
function removeBlacklist(url: string) {
  const index = blacklistUrls.value.findIndex(item => item.url === url)
  if (index > -1) {
    blacklistUrls.value.splice(index, 1)
    dataPermissionInterceptor.removeBlacklist(url)
    ElMessage.success('已从黑名单移除')
  }
}

/**
 * 测试 GET 请求
 */
async function testGetRequest() {
  if (!currentConfig.value) {
    ElMessage.warning('请先选择一个角色')
    return
  }

  loading.value = true
  requestInfo.value = null

  try {
    // 模拟请求
    const params = {
      page: 1,
      pageSize: 10
    }

    // 显示请求信息（模拟）
    requestInfo.value = {
      method: 'GET',
      url: '/api/v1/user/list',
      params: {
        ...params,
        ...(currentConfig.value.isSuperAdmin ? {} : {
          userId: currentConfig.value.userId,
          deptId: currentConfig.value.deptId,
          roleIds: currentConfig.value.roleIds
        })
      },
      success: true,
      message: '请求成功（模拟）'
    }

    ElMessage.success('GET 请求测试成功')
  } catch (error: any) {
    requestInfo.value = {
      method: 'GET',
      url: '/api/v1/user/list',
      params: {},
      success: false,
      message: error.message
    }
    ElMessage.error('请求失败')
  } finally {
    loading.value = false
  }
}

/**
 * 测试 POST 请求
 */
async function testPostRequest() {
  if (!currentConfig.value) {
    ElMessage.warning('请先选择一个角色')
    return
  }

  loading.value = true
  requestInfo.value = null

  try {
    // 模拟请求
    const data = {
      name: '张三',
      email: 'zhangsan@example.com'
    }

    // 显示请求信息（模拟）
    requestInfo.value = {
      method: 'POST',
      url: '/api/v1/user/create',
      params: {
        ...data,
        ...(currentConfig.value.isSuperAdmin ? {} : {
          userId: currentConfig.value.userId,
          deptId: currentConfig.value.deptId,
          roleIds: currentConfig.value.roleIds
        })
      },
      success: true,
      message: '请求成功（模拟）'
    }

    ElMessage.success('POST 请求测试成功')
  } catch (error: any) {
    requestInfo.value = {
      method: 'POST',
      url: '/api/v1/user/create',
      params: {},
      success: false,
      message: error.message
    }
    ElMessage.error('请求失败')
  } finally {
    loading.value = false
  }
}

/**
 * 测试白名单请求
 */
async function testWhitelistRequest() {
  loading.value = true
  requestInfo.value = null

  try {
    // 显示请求信息（模拟）
    requestInfo.value = {
      method: 'GET',
      url: '/api/v1/public/news',
      params: {
        page: 1,
        pageSize: 10
        // 白名单请求不会注入权限参数
      },
      success: true,
      message: '请求成功（模拟），白名单请求不会注入权限参数'
    }

    ElMessage.success('白名单请求测试成功')
  } catch (error: any) {
    requestInfo.value = {
      method: 'GET',
      url: '/api/v1/public/news',
      params: {},
      success: false,
      message: error.message
    }
    ElMessage.error('请求失败')
  } finally {
    loading.value = false
  }
}

// 代码示例
const basicUsageCode = `import { createDataPermissionInterceptor } from '@/utils/http/data-permission-interceptor'
import { useAuthStore } from '@/store/auth'

const interceptor = createDataPermissionInterceptor({
  enabled: true,
  getPermissionConfig: () => {
    const auth = useAuthStore()
    if (!auth.userInfo) {
      return null
    }

    return {
      userId: auth.userInfo.id,
      username: auth.userInfo.username,
      deptId: auth.userInfo.deptId,
      roleIds: auth.userInfo.roles?.map(r => r.id) || [],
      isSuperAdmin: auth.userInfo.roles?.some(r => r.code === 'super_admin') || false
    }
  }
})

// 集成到 axios
instance.interceptors.request.use(config => {
  config = interceptor.intercept(config)
  return config
})`

const whitelistCode = `// 配置白名单
const interceptor = createDataPermissionInterceptor({
  whitelist: [
    '/user/login',
    '/user/logout',
    '/public/*'  // 支持通配符
  ]
})

// 动态添加白名单
interceptor.addWhitelist('/api/public/news')

// 移除白名单
interceptor.removeWhitelist('/api/public/news')`

const customFilterCode = `// 自定义过滤器
const interceptor = createDataPermissionInterceptor({
  customFilter: (config, permissionConfig) => {
    // 订单列表：只能查看自己创建的订单
    if (config.url?.includes('/order/list')) {
      config.params = {
        ...config.params,
        createdBy: permissionConfig.userId
      }
    }

    // 报表接口：添加时间范围限制
    if (config.url?.includes('/report/')) {
      const now = new Date()
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      config.params = {
        ...config.params,
        startDate: startDate.toISOString(),
        endDate: now.toISOString()
      }
    }
  }
})`
</script>

<style scoped>
.data-permission-example {
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
</style>
