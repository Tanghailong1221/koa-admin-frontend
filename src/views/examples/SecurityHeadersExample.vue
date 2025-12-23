<template>
  <div class="security-headers-example">
    <el-card header="安全头配置示例">
      <el-alert type="info" :closable="false" style="margin-bottom: 20px">
        <p>安全头（Security Headers）通过配置 HTTP 响应头来提升应用的安全性，防止 XSS、点击劫持等攻击。</p>
      </el-alert>

      <!-- 启用状态 -->
      <el-divider content-position="left">启用状态</el-divider>
      <el-switch
        v-model="enabled"
        active-text="已启用"
        inactive-text="已禁用"
        style="margin-bottom: 20px"
      />

      <!-- CSP 配置 -->
      <el-divider content-position="left">内容安全策略（CSP）</el-divider>
      <el-card shadow="never" style="margin-bottom: 20px">
        <template #header>
          <span>CSP 指令配置</span>
        </template>
        
        <el-form label-width="150px">
          <el-form-item label="default-src">
            <el-tag
              v-for="(source, index) in config.csp.defaultSrc"
              :key="index"
              closable
              style="margin-right: 10px"
              @close="removeCSPSource('defaultSrc', source)"
            >
              {{ source }}
            </el-tag>
            <el-input
              v-model="newSource.defaultSrc"
              placeholder="添加源..."
              style="width: 200px; margin-right: 10px"
              @keyup.enter="addSource('defaultSrc')"
            />
            <el-button size="small" @click="addSource('defaultSrc')">添加</el-button>
          </el-form-item>

          <el-form-item label="script-src">
            <el-tag
              v-for="(source, index) in config.csp.scriptSrc"
              :key="index"
              closable
              style="margin-right: 10px"
              @close="removeCSPSource('scriptSrc', source)"
            >
              {{ source }}
            </el-tag>
            <el-input
              v-model="newSource.scriptSrc"
              placeholder="添加源..."
              style="width: 200px; margin-right: 10px"
              @keyup.enter="addSource('scriptSrc')"
            />
            <el-button size="small" @click="addSource('scriptSrc')">添加</el-button>
          </el-form-item>

          <el-form-item label="style-src">
            <el-tag
              v-for="(source, index) in config.csp.styleSrc"
              :key="index"
              closable
              style="margin-right: 10px"
              @close="removeCSPSource('styleSrc', source)"
            >
              {{ source }}
            </el-tag>
            <el-input
              v-model="newSource.styleSrc"
              placeholder="添加源..."
              style="width: 200px; margin-right: 10px"
              @keyup.enter="addSource('styleSrc')"
            />
            <el-button size="small" @click="addSource('styleSrc')">添加</el-button>
          </el-form-item>

          <el-form-item label="img-src">
            <el-tag
              v-for="(source, index) in config.csp.imgSrc"
              :key="index"
              closable
              style="margin-right: 10px"
              @close="removeCSPSource('imgSrc', source)"
            >
              {{ source }}
            </el-tag>
            <el-input
              v-model="newSource.imgSrc"
              placeholder="添加源..."
              style="width: 200px; margin-right: 10px"
              @keyup.enter="addSource('imgSrc')"
            />
            <el-button size="small" @click="addSource('imgSrc')">添加</el-button>
          </el-form-item>
        </el-form>

        <el-divider />

        <el-form label-width="200px">
          <el-form-item label="upgrade-insecure-requests">
            <el-switch v-model="config.csp.upgradeInsecureRequests" />
          </el-form-item>
          <el-form-item label="block-all-mixed-content">
            <el-switch v-model="config.csp.blockAllMixedContent" />
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 其他安全头 -->
      <el-divider content-position="left">其他安全头</el-divider>
      <el-card shadow="never" style="margin-bottom: 20px">
        <el-form label-width="200px">
          <el-form-item label="X-Frame-Options">
            <el-select v-model="config.xFrameOptions">
              <el-option label="DENY" value="DENY" />
              <el-option label="SAMEORIGIN" value="SAMEORIGIN" />
            </el-select>
          </el-form-item>

          <el-form-item label="X-Content-Type-Options">
            <el-input v-model="config.xContentTypeOptions" disabled />
          </el-form-item>

          <el-form-item label="X-XSS-Protection">
            <el-input v-model="config.xXSSProtection" />
          </el-form-item>

          <el-form-item label="Referrer-Policy">
            <el-select v-model="config.referrerPolicy">
              <el-option label="no-referrer" value="no-referrer" />
              <el-option label="no-referrer-when-downgrade" value="no-referrer-when-downgrade" />
              <el-option label="origin" value="origin" />
              <el-option label="origin-when-cross-origin" value="origin-when-cross-origin" />
              <el-option label="same-origin" value="same-origin" />
              <el-option label="strict-origin" value="strict-origin" />
              <el-option label="strict-origin-when-cross-origin" value="strict-origin-when-cross-origin" />
              <el-option label="unsafe-url" value="unsafe-url" />
            </el-select>
          </el-form-item>

          <el-form-item label="Strict-Transport-Security">
            <el-input v-model="config.strictTransportSecurity" />
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 生成的安全头 -->
      <el-divider content-position="left">生成的安全头</el-divider>
      <el-card shadow="never" style="margin-bottom: 20px">
        <template #header>
          <div style="display: flex; justify-content: space-between; align-items: center">
            <span>HTTP 响应头</span>
            <el-button type="primary" size="small" @click="applyHeaders">应用到 Meta 标签</el-button>
          </div>
        </template>
        <pre>{{ JSON.stringify(headers, null, 2) }}</pre>
      </el-card>

      <!-- CSP 字符串 -->
      <el-divider content-position="left">CSP 字符串</el-divider>
      <el-card shadow="never" style="margin-bottom: 20px">
        <pre style="white-space: pre-wrap; word-break: break-all">{{ cspString }}</pre>
      </el-card>

      <!-- Permissions-Policy 字符串 -->
      <el-divider content-position="left">Permissions-Policy 字符串</el-divider>
      <el-card shadow="never" style="margin-bottom: 20px">
        <pre style="white-space: pre-wrap; word-break: break-all">{{ permissionsPolicyString }}</pre>
      </el-card>

      <!-- 操作按钮 -->
      <el-divider content-position="left">操作</el-divider>
      <el-space>
        <el-button type="primary" @click="applyHeaders">应用安全头</el-button>
        <el-button @click="reset">重置为默认</el-button>
        <el-button @click="testCSP">测试 CSP</el-button>
      </el-space>

      <!-- 使用说明 -->
      <el-divider content-position="left">使用说明</el-divider>
      <el-collapse>
        <el-collapse-item title="1. 什么是安全头？" name="1">
          <p>安全头（Security Headers）是 HTTP 响应头，用于指示浏览器如何处理网页内容，从而提升应用的安全性。</p>
          <p>常见的安全头包括：</p>
          <ul>
            <li><strong>Content-Security-Policy (CSP)</strong>：防止 XSS 攻击</li>
            <li><strong>X-Frame-Options</strong>：防止点击劫持</li>
            <li><strong>X-Content-Type-Options</strong>：防止 MIME 类型嗅探</li>
            <li><strong>X-XSS-Protection</strong>：启用浏览器的 XSS 过滤器</li>
            <li><strong>Referrer-Policy</strong>：控制 Referer 头的发送</li>
            <li><strong>Strict-Transport-Security (HSTS)</strong>：强制使用 HTTPS</li>
          </ul>
        </el-collapse-item>

        <el-collapse-item title="2. 使用 useSecurityHeaders Composable" name="2">
          <pre><code>import { useSecurityHeaders } from '@/composables'

const {
  config,
  enabled,
  applyHeaders,
  addCSPSource,
  removeCSPSource
} = useSecurityHeaders()

// 应用安全头到 meta 标签
applyHeaders()

// 添加 CSP 源
addCSPSource('scriptSrc', 'https://cdn.example.com')

// 移除 CSP 源
removeCSPSource('scriptSrc', 'https://cdn.example.com')</code></pre>
        </el-collapse-item>

        <el-collapse-item title="3. 自定义配置" name="3">
          <pre><code>import { SecurityHeaders } from '@/utils/security-headers'

const headers = new SecurityHeaders({
  csp: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", 'https://cdn.example.com'],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", 'data:', 'https:']
  },
  xFrameOptions: 'DENY',
  referrerPolicy: 'strict-origin-when-cross-origin'
})

// 应用到 meta 标签
headers.applyToMetaTags()</code></pre>
        </el-collapse-item>

        <el-collapse-item title="4. 服务器端配置（推荐）" name="4">
          <p>虽然可以通过 meta 标签设置安全头，但推荐在服务器端配置 HTTP 响应头，这样更安全可靠。</p>
          <pre><code>// Nginx 配置示例
add_header Content-Security-Policy "default-src 'self'; script-src 'self' https://cdn.example.com";
add_header X-Frame-Options "DENY";
add_header X-Content-Type-Options "nosniff";
add_header X-XSS-Protection "1; mode=block";
add_header Referrer-Policy "strict-origin-when-cross-origin";
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";</code></pre>
        </el-collapse-item>

        <el-collapse-item title="5. CSP 常用指令" name="5">
          <ul>
            <li><strong>default-src</strong>：默认策略，其他指令的回退</li>
            <li><strong>script-src</strong>：允许加载脚本的源</li>
            <li><strong>style-src</strong>：允许加载样式的源</li>
            <li><strong>img-src</strong>：允许加载图片的源</li>
            <li><strong>font-src</strong>：允许加载字体的源</li>
            <li><strong>connect-src</strong>：允许连接的源（AJAX、WebSocket）</li>
            <li><strong>frame-src</strong>：允许嵌入的 iframe 源</li>
            <li><strong>object-src</strong>：允许加载插件的源</li>
          </ul>
          <p>常用值：</p>
          <ul>
            <li><code>'self'</code>：同源</li>
            <li><code>'none'</code>：不允许</li>
            <li><code>'unsafe-inline'</code>：允许内联脚本/样式（不推荐）</li>
            <li><code>'unsafe-eval'</code>：允许 eval()（不推荐）</li>
            <li><code>https:</code>：允许所有 HTTPS 源</li>
            <li><code>data:</code>：允许 data: URI</li>
          </ul>
        </el-collapse-item>
      </el-collapse>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useSecurityHeaders } from '@/composables'
import { ElMessage } from 'element-plus'
import type { CSPConfig } from '@/utils/security-headers'

const {
  config,
  enabled,
  getHeaders,
  applyHeaders: applyHeadersOriginal,
  getCSP,
  getPermissionsPolicy,
  addCSPSource,
  removeCSPSource,
  reset: resetOriginal
} = useSecurityHeaders()

// 生成的安全头
const headers = computed(() => getHeaders())

// CSP 字符串
const cspString = computed(() => getCSP())

// Permissions-Policy 字符串
const permissionsPolicyString = computed(() => getPermissionsPolicy())

// 新增源的输入
const newSource = ref<Record<string, string>>({
  defaultSrc: '',
  scriptSrc: '',
  styleSrc: '',
  imgSrc: ''
})

/**
 * 添加 CSP 源
 */
function addSource(directive: keyof CSPConfig) {
  const source = newSource.value[directive]
  if (!source) {
    ElMessage.warning('请输入源地址')
    return
  }

  addCSPSource(directive, source)
  newSource.value[directive] = ''
  ElMessage.success(`已添加 ${directive} 源: ${source}`)
}

/**
 * 应用安全头
 */
function applyHeaders() {
  applyHeadersOriginal()
  ElMessage.success('安全头已应用到 meta 标签')
}

/**
 * 重置为默认配置
 */
function reset() {
  resetOriginal()
  ElMessage.success('已重置为默认配置')
}

/**
 * 测试 CSP
 */
function testCSP() {
  ElMessage.info('请打开浏览器控制台查看 CSP 违规报告')
  
  // 尝试加载一个不在白名单中的脚本（会被 CSP 阻止）
  const script = document.createElement('script')
  script.src = 'https://evil.com/malicious.js'
  document.head.appendChild(script)
}

// 监听配置变化，自动更新
watch(
  () => config.value,
  () => {
    // 配置变化时可以自动应用
  },
  { deep: true }
)
</script>

<style scoped lang="scss">
.security-headers-example {
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

  ul {
    margin: 10px 0;
    padding-left: 20px;
  }

  li {
    margin: 5px 0;
  }
}
</style>
