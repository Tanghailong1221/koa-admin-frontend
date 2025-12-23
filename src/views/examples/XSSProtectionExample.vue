<template>
  <div class="xss-protection-example">
    <el-card header="XSS 防护示例">
      <el-alert type="info" :closable="false" style="margin-bottom: 20px">
        <p>XSS（跨站脚本攻击）防护工具，用于清理用户输入，防止恶意脚本注入。</p>
      </el-alert>

      <!-- 基础清理 -->
      <el-divider content-position="left">基础清理</el-divider>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card shadow="never">
            <template #header>
              <span>输入（可能包含 XSS）</span>
            </template>
            <el-input
              v-model="basicInput"
              type="textarea"
              :rows="6"
              placeholder="输入可能包含 XSS 的内容..."
            />
            <div style="margin-top: 10px">
              <el-button type="primary" @click="testBasicSanitize">清理</el-button>
              <el-button @click="loadDangerousExample">加载危险示例</el-button>
            </div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card shadow="never">
            <template #header>
              <span>清理后的输出</span>
            </template>
            <div class="output-box">
              <div v-sanitize="basicOutput" class="sanitized-content"></div>
            </div>
            <div style="margin-top: 10px">
              <el-tag>清理方式：sanitizeHtml</el-tag>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- HTML 转义 -->
      <el-divider content-position="left">HTML 转义</el-divider>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card shadow="never">
            <template #header>
              <span>原始 HTML</span>
            </template>
            <el-input
              v-model="escapeInput"
              type="textarea"
              :rows="4"
              placeholder="输入 HTML 内容..."
            />
            <div style="margin-top: 10px">
              <el-button type="primary" @click="testEscape">转义</el-button>
            </div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card shadow="never">
            <template #header>
              <span>转义后</span>
            </template>
            <div class="output-box">
              <pre>{{ escapedOutput }}</pre>
            </div>
            <div style="margin-top: 10px">
              <el-tag>清理方式：escapeHtml</el-tag>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 移除标签 -->
      <el-divider content-position="left">移除所有标签</el-divider>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card shadow="never">
            <template #header>
              <span>包含标签的内容</span>
            </template>
            <el-input
              v-model="stripInput"
              type="textarea"
              :rows="4"
              placeholder="输入包含 HTML 标签的内容..."
            />
            <div style="margin-top: 10px">
              <el-button type="primary" @click="testStrip">移除标签</el-button>
            </div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card shadow="never">
            <template #header>
              <span>纯文本输出</span>
            </template>
            <div class="output-box">
              <pre>{{ strippedOutput }}</pre>
            </div>
            <div style="margin-top: 10px">
              <el-tag>清理方式：stripTags</el-tag>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- URL 清理 -->
      <el-divider content-position="left">URL 清理</el-divider>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card shadow="never">
            <template #header>
              <span>URL 输入</span>
            </template>
            <el-input v-model="urlInput" placeholder="输入 URL..." />
            <div style="margin-top: 10px">
              <el-button type="primary" @click="testSanitizeUrl">清理 URL</el-button>
              <el-button @click="loadDangerousUrl">加载危险 URL</el-button>
            </div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card shadow="never">
            <template #header>
              <span>清理后的 URL</span>
            </template>
            <div class="output-box">
              <pre>{{ sanitizedUrl }}</pre>
            </div>
            <div style="margin-top: 10px">
              <el-tag v-if="sanitizedUrl" type="success">安全</el-tag>
              <el-tag v-else type="danger">危险（已移除）</el-tag>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 自定义配置 -->
      <el-divider content-position="left">自定义配置</el-divider>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card shadow="never">
            <template #header>
              <span>配置选项</span>
            </template>
            <el-form label-width="140px">
              <el-form-item label="移除所有标签">
                <el-switch v-model="customConfig.stripAllTags" />
              </el-form-item>
              <el-form-item label="转义 HTML">
                <el-switch v-model="customConfig.escapeHtml" />
              </el-form-item>
              <el-form-item label="允许 data 属性">
                <el-switch v-model="customConfig.allowDataAttrs" />
              </el-form-item>
              <el-form-item label="允许 aria 属性">
                <el-switch v-model="customConfig.allowAriaAttrs" />
              </el-form-item>
            </el-form>
            <el-input
              v-model="customInput"
              type="textarea"
              :rows="4"
              placeholder="输入内容..."
            />
            <div style="margin-top: 10px">
              <el-button type="primary" @click="testCustomSanitize">应用配置清理</el-button>
            </div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card shadow="never">
            <template #header>
              <span>清理结果</span>
            </template>
            <div class="output-box">
              <div v-sanitize="{ html: customOutput, config: customConfig }" class="sanitized-content"></div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 使用说明 -->
      <el-divider content-position="left">使用说明</el-divider>
      <el-collapse>
        <el-collapse-item title="1. 使用 v-sanitize 指令" name="1">
          <pre><code>&lt;!-- 基础用法 --&gt;
&lt;div v-sanitize="userInput"&gt;&lt;/div&gt;

&lt;!-- 自定义配置 --&gt;
&lt;div v-sanitize="{ html: userInput, config: { stripAllTags: true } }"&gt;&lt;/div&gt;</code></pre>
        </el-collapse-item>

        <el-collapse-item title="2. 使用 useXSS Composable" name="2">
          <pre><code>import { useXSS } from '@/composables'

const { sanitize, escape, strip } = useXSS()

// 清理 HTML
const clean = sanitize(userInput)

// 转义 HTML
const escaped = escape(userInput)

// 移除标签
const text = strip(userInput)</code></pre>
        </el-collapse-item>

        <el-collapse-item title="3. 使用工具函数" name="3">
          <pre><code>import { sanitizeHtml, escapeHtml, stripTags } from '@/utils/xss-sanitizer'

// 清理 HTML
const clean = sanitizeHtml(userInput)

// 转义 HTML
const escaped = escapeHtml(userInput)

// 移除标签
const text = stripTags(userInput)</code></pre>
        </el-collapse-item>

        <el-collapse-item title="4. 响应式清理" name="4">
          <pre><code>import { ref } from 'vue'
import { useSanitizedHtml } from '@/composables'

const userInput = ref('&lt;script&gt;alert("xss")&lt;/script&gt;')
const sanitized = useSanitizedHtml(userInput)

console.log(sanitized.value) // 清理后的内容</code></pre>
        </el-collapse-item>
      </el-collapse>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useXSS } from '@/composables'
import type { XSSSanitizerConfig } from '@/utils/xss-sanitizer'

const { sanitize, escape, strip, sanitizeUrl: cleanUrl } = useXSS()

// 基础清理
const basicInput = ref('')
const basicOutput = ref('')

// HTML 转义
const escapeInput = ref('<div>Hello <strong>World</strong></div>')
const escapedOutput = ref('')

// 移除标签
const stripInput = ref('<div>Hello <strong>World</strong></div>')
const strippedOutput = ref('')

// URL 清理
const urlInput = ref('https://example.com')
const sanitizedUrl = ref('')

// 自定义配置
const customInput = ref('<div data-id="123" aria-label="test">Content</div>')
const customOutput = ref('')
const customConfig = reactive<XSSSanitizerConfig>({
  stripAllTags: false,
  escapeHtml: false,
  allowDataAttrs: false,
  allowAriaAttrs: true
})

/**
 * 测试基础清理
 */
function testBasicSanitize() {
  basicOutput.value = sanitize(basicInput.value)
}

/**
 * 加载危险示例
 */
function loadDangerousExample() {
  basicInput.value = `<div>
  <script>alert('XSS Attack!')</script>
  <img src="x" onerror="alert('XSS')">
  <a href="javascript:alert('XSS')">Click me</a>
  <iframe src="http://evil.com"></iframe>
  <div onclick="alert('XSS')">Click me</div>
</div>`
}

/**
 * 测试 HTML 转义
 */
function testEscape() {
  escapedOutput.value = escape(escapeInput.value)
}

/**
 * 测试移除标签
 */
function testStrip() {
  strippedOutput.value = strip(stripInput.value)
}

/**
 * 测试 URL 清理
 */
function testSanitizeUrl() {
  sanitizedUrl.value = cleanUrl(urlInput.value)
}

/**
 * 加载危险 URL
 */
function loadDangerousUrl() {
  urlInput.value = 'javascript:alert("XSS")'
}

/**
 * 测试自定义配置清理
 */
function testCustomSanitize() {
  customOutput.value = sanitize(customInput.value, customConfig)
}
</script>

<style scoped lang="scss">
.xss-protection-example {
  padding: 20px;

  .output-box {
    min-height: 100px;
    padding: 10px;
    background-color: #f5f7fa;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    overflow: auto;

    pre {
      margin: 0;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
  }

  .sanitized-content {
    min-height: 80px;
  }

  :deep(.el-collapse-item__content) {
    padding-bottom: 15px;
  }

  pre code {
    display: block;
    padding: 10px;
    background-color: #f5f7fa;
    border-radius: 4px;
    font-size: 13px;
    line-height: 1.6;
  }
}
</style>
