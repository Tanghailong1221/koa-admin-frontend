<template>
  <div class="csrf-protection-example">
    <el-card header="CSRF 防护示例">
      <el-alert type="info" :closable="false" style="margin-bottom: 20px">
        <p>CSRF（跨站请求伪造）防护通过在请求中添加 Token 来验证请求的合法性。</p>
      </el-alert>

      <!-- Token 信息 -->
      <el-divider content-position="left">Token 信息</el-divider>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="当前 Token">
          <el-tag v-if="token" type="success">{{ token }}</el-tag>
          <el-tag v-else type="info">未生成</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="Token 状态">
          <el-tag v-if="isExpired" type="danger">已过期</el-tag>
          <el-tag v-else type="success">有效</el-tag>
        </el-descriptions-item>
      </el-descriptions>

      <div style="margin-top: 15px">
        <el-button type="primary" @click="handleGetToken">获取 Token</el-button>
        <el-button type="success" @click="handleRefreshToken">刷新 Token</el-button>
        <el-button type="danger" @click="handleClearToken">清除 Token</el-button>
      </div>

      <!-- Token 请求头 -->
      <el-divider content-position="left">Token 请求头</el-divider>
      <el-card shadow="never">
        <pre>{{ JSON.stringify(tokenHeader, null, 2) }}</pre>
      </el-card>

      <!-- Token 参数 -->
      <el-divider content-position="left">Token 参数（用于表单）</el-divider>
      <el-card shadow="never">
        <pre>{{ JSON.stringify(tokenParam, null, 2) }}</pre>
      </el-card>

      <!-- 表单提交示例 -->
      <el-divider content-position="left">表单提交示例</el-divider>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card shadow="never">
            <template #header>
              <span>普通表单</span>
            </template>
            <el-form :model="normalForm" label-width="100px">
              <el-form-item label="用户名">
                <el-input v-model="normalForm.username" />
              </el-form-item>
              <el-form-item label="邮箱">
                <el-input v-model="normalForm.email" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleNormalSubmit">提交（手动添加 Token）</el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card shadow="never">
            <template #header>
              <span>自动添加 CSRF Token</span>
            </template>
            <el-form :model="autoForm" label-width="100px">
              <el-form-item label="用户名">
                <el-input v-model="autoForm.username" />
              </el-form-item>
              <el-form-item label="邮箱">
                <el-input v-model="autoForm.email" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleAutoSubmit">提交（自动添加 Token）</el-button>
              </el-form-item>
            </el-form>
            <el-alert type="success" :closable="false" style="margin-top: 10px">
              <p>使用 useFormCSRF 自动添加 CSRF Token</p>
            </el-alert>
          </el-card>
        </el-col>
      </el-row>

      <!-- 配置管理 -->
      <el-divider content-position="left">配置管理</el-divider>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card shadow="never">
            <template #header>
              <span>CSRF 保护配置</span>
            </template>
            <el-form label-width="140px">
              <el-form-item label="启用 CSRF 保护">
                <el-switch v-model="csrfEnabled" @change="handleToggleCSRF" />
              </el-form-item>
              <el-form-item label="白名单 URL">
                <el-input
                  v-model="whitelistUrl"
                  placeholder="输入 URL..."
                  style="margin-bottom: 10px"
                />
                <el-button type="primary" size="small" @click="handleAddWhitelist">添加</el-button>
              </el-form-item>
              <el-form-item label="当前白名单">
                <el-tag
                  v-for="url in whitelist"
                  :key="url"
                  closable
                  style="margin-right: 10px; margin-bottom: 10px"
                  @close="handleRemoveWhitelist(url)"
                >
                  {{ url }}
                </el-tag>
                <el-tag v-if="whitelist.length === 0" type="info">无</el-tag>
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card shadow="never">
            <template #header>
              <span>测试请求</span>
            </template>
            <el-form label-width="100px">
              <el-form-item label="请求方法">
                <el-select v-model="testMethod">
                  <el-option label="GET" value="GET" />
                  <el-option label="POST" value="POST" />
                  <el-option label="PUT" value="PUT" />
                  <el-option label="DELETE" value="DELETE" />
                </el-select>
              </el-form-item>
              <el-form-item label="请求 URL">
                <el-input v-model="testUrl" placeholder="/api/test" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleTestRequest">发送测试请求</el-button>
              </el-form-item>
            </el-form>
            <el-alert v-if="testResult" :type="testResult.type" :closable="false" style="margin-top: 10px">
              <p>{{ testResult.message }}</p>
            </el-alert>
          </el-card>
        </el-col>
      </el-row>

      <!-- 使用说明 -->
      <el-divider content-position="left">使用说明</el-divider>
      <el-collapse>
        <el-collapse-item title="1. 自动集成（推荐）" name="1">
          <p>CSRF 保护已自动集成到 HTTP 客户端中，对于 POST、PUT、DELETE、PATCH 请求会自动添加 CSRF Token。</p>
          <pre><code>import request from '@/utils/request'

// 自动添加 CSRF Token
const response = await request({
  url: '/api/user',
  method: 'POST',
  data: { name: 'John' }
})</code></pre>
        </el-collapse-item>

        <el-collapse-item title="2. 使用 useCSRF Composable" name="2">
          <pre><code>import { useCSRF } from '@/composables'

const { token, getToken, refreshToken } = useCSRF()

// 获取 Token
const csrfToken = getToken()

// 刷新 Token
refreshToken()

// 获取 Token 请求头
const headers = getTokenHeader()

// 获取 Token 参数
const params = getTokenParam()</code></pre>
        </el-collapse-item>

        <el-collapse-item title="3. 表单自动添加 Token" name="3">
          <pre><code>import { ref } from 'vue'
import { useFormCSRF } from '@/composables'

const formData = ref({ username: '', email: '' })
const formDataWithCSRF = useFormCSRF(formData)

// formDataWithCSRF.value 会自动包含 _csrf 字段
console.log(formDataWithCSRF.value)
// { username: '', email: '', _csrf: 'token-value' }</code></pre>
        </el-collapse-item>

        <el-collapse-item title="4. 配置白名单" name="4">
          <pre><code>import { useCSRF } from '@/composables'

const { addWhitelist, removeWhitelist } = useCSRF()

// 添加白名单（不需要 CSRF 保护的 URL）
addWhitelist('/api/public/*')
addWhitelist('/api/login')

// 移除白名单
removeWhitelist('/api/login')</code></pre>
        </el-collapse-item>

        <el-collapse-item title="5. 自定义配置" name="5">
          <pre><code>import { CSRFProtection } from '@/utils/csrf-protection'

const csrf = new CSRFProtection({
  storage: 'sessionStorage',  // 存储位置
  headerName: 'X-CSRF-Token', // 请求头名称
  paramName: '_csrf',         // 参数名称
  expireTime: 3600000,        // 过期时间（1小时）
  protectedMethods: ['POST', 'PUT', 'DELETE', 'PATCH'],
  whitelist: ['/api/public/*'],
  enabled: true
})</code></pre>
        </el-collapse-item>
      </el-collapse>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCSRF, useFormCSRF } from '@/composables'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

const {
  token,
  isExpired,
  getToken,
  refreshToken,
  clearToken,
  getTokenHeader,
  getTokenParam,
  enable,
  disable,
  addWhitelist,
  removeWhitelist
} = useCSRF()

// Token 请求头
const tokenHeader = computed(() => getTokenHeader())

// Token 参数
const tokenParam = computed(() => getTokenParam())

// 普通表单
const normalForm = ref({
  username: '',
  email: ''
})

// 自动添加 CSRF Token 的表单
const autoForm = ref({
  username: '',
  email: ''
})
const autoFormWithCSRF = useFormCSRF(autoForm)

// CSRF 配置
const csrfEnabled = ref(true)
const whitelistUrl = ref('')
const whitelist = ref<string[]>([])

// 测试请求
const testMethod = ref('POST')
const testUrl = ref('/api/test')
const testResult = ref<{ type: string; message: string } | null>(null)

/**
 * 获取 Token
 */
function handleGetToken() {
  const newToken = getToken()
  ElMessage.success(`Token 已获取: ${newToken}`)
}

/**
 * 刷新 Token
 */
function handleRefreshToken() {
  const newToken = refreshToken()
  ElMessage.success(`Token 已刷新: ${newToken}`)
}

/**
 * 清除 Token
 */
function handleClearToken() {
  clearToken()
  ElMessage.success('Token 已清除')
}

/**
 * 切换 CSRF 保护
 */
function handleToggleCSRF(enabled: boolean) {
  if (enabled) {
    enable()
    ElMessage.success('CSRF 保护已启用')
  } else {
    disable()
    ElMessage.warning('CSRF 保护已禁用')
  }
}

/**
 * 添加白名单
 */
function handleAddWhitelist() {
  if (!whitelistUrl.value) {
    ElMessage.warning('请输入 URL')
    return
  }

  addWhitelist(whitelistUrl.value)
  whitelist.value.push(whitelistUrl.value)
  ElMessage.success(`已添加白名单: ${whitelistUrl.value}`)
  whitelistUrl.value = ''
}

/**
 * 移除白名单
 */
function handleRemoveWhitelist(url: string) {
  removeWhitelist(url)
  whitelist.value = whitelist.value.filter((item) => item !== url)
  ElMessage.success(`已移除白名单: ${url}`)
}

/**
 * 提交普通表单（手动添加 Token）
 */
async function handleNormalSubmit() {
  try {
    const data = {
      ...normalForm.value,
      ...getTokenParam()
    }
    console.log('提交数据（手动添加 Token）:', data)
    ElMessage.success('表单提交成功（手动添加 Token）')
  } catch (error) {
    ElMessage.error('表单提交失败')
  }
}

/**
 * 提交自动添加 Token 的表单
 */
async function handleAutoSubmit() {
  try {
    console.log('提交数据（自动添加 Token）:', autoFormWithCSRF.value)
    ElMessage.success('表单提交成功（自动添加 Token）')
  } catch (error) {
    ElMessage.error('表单提交失败')
  }
}

/**
 * 测试请求
 */
async function handleTestRequest() {
  try {
    testResult.value = null
    
    // 模拟请求
    console.log(`发送 ${testMethod.value} 请求到 ${testUrl.value}`)
    console.log('请求头:', getTokenHeader())
    
    testResult.value = {
      type: 'success',
      message: `${testMethod.value} 请求已发送，CSRF Token 已自动添加到请求头中`
    }
  } catch (error: any) {
    testResult.value = {
      type: 'error',
      message: `请求失败: ${error.message}`
    }
  }
}
</script>

<style scoped lang="scss">
.csrf-protection-example {
  padding: 20px;

  pre {
    margin: 0;
    padding: 10px;
    background-color: #f5f7fa;
    border-radius: 4px;
    overflow: auto;
  }

  :deep(.el-collapse-item__content) {
    padding-bottom: 15px;
  }

  pre code {
    display: block;
    font-size: 13px;
    line-height: 1.6;
  }
}
</style>
