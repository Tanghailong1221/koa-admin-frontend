<template>
  <div class="accessibility-example">
    <el-card header="可访问性示例">
      <el-space direction="vertical" :size="20" style="width: 100%">
        <!-- 焦点管理 -->
        <el-card>
          <template #header>
            <h3>焦点管理</h3>
          </template>

          <el-space direction="vertical" style="width: 100%">
            <p>点击按钮打开模态框,焦点会自动捕获在模态框内</p>

            <el-button type="primary" @click="showModal = true">
              打开模态框
            </el-button>

            <!-- 模态框 -->
            <el-dialog
              v-model="showModal"
              title="焦点捕获示例"
              width="500px"
              @opened="handleModalOpened"
              @closed="handleModalClosed"
            >
              <div ref="modalRef">
                <el-form :model="modalForm" label-width="100px">
                  <el-form-item label="姓名">
                    <el-input
                      v-model="modalForm.name"
                      placeholder="请输入姓名"
                    />
                  </el-form-item>
                  <el-form-item label="邮箱">
                    <el-input
                      v-model="modalForm.email"
                      placeholder="请输入邮箱"
                    />
                  </el-form-item>
                </el-form>
              </div>

              <template #footer>
                <el-button @click="showModal = false">取消</el-button>
                <el-button type="primary" @click="handleModalSubmit">
                  确定
                </el-button>
              </template>
            </el-dialog>
          </el-space>
        </el-card>

        <!-- ARIA 属性 -->
        <el-card>
          <template #header>
            <h3>ARIA 属性</h3>
          </template>

          <el-space direction="vertical" style="width: 100%">
            <div>
              <p>展开/折叠面板(带 ARIA 属性)</p>
              <button
                :aria-expanded="expanded"
                aria-controls="panel-content"
                class="expand-button"
                @click="expanded = !expanded"
              >
                {{ expanded ? '折叠' : '展开' }}面板
              </button>

              <div
                id="panel-content"
                :aria-hidden="!expanded"
                class="panel-content"
                :style="{ display: expanded ? 'block' : 'none' }"
              >
                <p>这是面板内容,可以被屏幕阅读器正确识别</p>
              </div>
            </div>

            <div>
              <p>进度条(带 ARIA 属性)</p>
              <div
                role="progressbar"
                :aria-valuenow="progress"
                aria-valuemin="0"
                aria-valuemax="100"
                :aria-label="`进度 ${progress}%`"
                class="progress-bar"
              >
                <div
                  class="progress-fill"
                  :style="{ width: `${progress}%` }"
                />
              </div>
              <el-button @click="updateProgress">更新进度</el-button>
            </div>
          </el-space>
        </el-card>

        <!-- 键盘导航 -->
        <el-card>
          <template #header>
            <h3>键盘导航</h3>
          </template>

          <el-space direction="vertical" style="width: 100%">
            <p>使用 Tab 键导航,焦点样式只在键盘导航时显示</p>

            <div class="keyboard-nav-demo">
              <button v-focus-visible class="nav-button">按钮 1</button>
              <button v-focus-visible class="nav-button">按钮 2</button>
              <button v-focus-visible class="nav-button">按钮 3</button>
              <button v-focus-visible class="nav-button">按钮 4</button>
            </div>

            <p class="tip">
              提示: 使用 Tab 键可以看到焦点样式,使用鼠标点击则不会显示
            </p>
          </el-space>
        </el-card>

        <!-- 屏幕阅读器 -->
        <el-card>
          <template #header>
            <h3>屏幕阅读器支持</h3>
          </template>

          <el-space direction="vertical" style="width: 100%">
            <p>点击按钮会向屏幕阅读器宣布消息</p>

            <el-space>
              <el-button @click="announceMessage('这是一条普通消息')">
                宣布消息
              </el-button>
              <el-button type="success" @click="announceSuccess('操作成功!')">
                宣布成功
              </el-button>
              <el-button type="danger" @click="announceError('操作失败!')">
                宣布错误
              </el-button>
            </el-space>

            <!-- 实时区域 -->
            <div
              role="status"
              aria-live="polite"
              aria-atomic="true"
              class="sr-only"
            >
              {{ liveMessage }}
            </div>
          </el-space>
        </el-card>

        <!-- 表单可访问性 -->
        <el-card>
          <template #header>
            <h3>表单可访问性</h3>
          </template>

          <el-form :model="form" label-width="100px">
            <el-form-item label="用户名" required>
              <el-input
                v-model="form.username"
                placeholder="请输入用户名"
                aria-required="true"
                aria-describedby="username-help"
              />
              <span id="username-help" class="form-help">
                用户名长度为 3-20 个字符
              </span>
            </el-form-item>

            <el-form-item label="邮箱" required>
              <el-input
                v-model="form.email"
                type="email"
                placeholder="请输入邮箱"
                :aria-invalid="emailError ? 'true' : 'false'"
                aria-required="true"
                aria-describedby="email-error"
              />
              <span
                v-if="emailError"
                id="email-error"
                role="alert"
                class="form-error"
              >
                {{ emailError }}
              </span>
            </el-form-item>

            <el-form-item label="状态">
              <el-radio-group
                v-model="form.status"
                role="radiogroup"
                aria-label="用户状态"
              >
                <el-radio :label="1">启用</el-radio>
                <el-radio :label="0">禁用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 代码示例 -->
        <el-divider content-position="left">代码示例</el-divider>

        <el-tabs>
          <el-tab-pane label="焦点管理">
            <pre><code>import { useFocusTrap } from '@/composables'

const modalRef = ref()
const { activate, deactivate } = useFocusTrap(modalRef, {
  initialFocus: 'input',
  returnFocus: triggerButton
})

// 打开模态框时激活
function handleModalOpened() {
  activate()
}

// 关闭模态框时停用
function handleModalClosed() {
  deactivate()
}</code></pre>
          </el-tab-pane>

          <el-tab-pane label="ARIA 工具">
            <pre><code>import { announce, announceError, announceSuccess } from '@/utils/aria'

// 宣布消息
announce('操作完成')

// 宣布错误
announceError('操作失败')

// 宣布成功
announceSuccess('保存成功')</code></pre>
          </el-tab-pane>

          <el-tab-pane label="焦点可见指令">
            <pre><code>&lt;button v-focus-visible&gt;按钮&lt;/button&gt;

// 只在键盘导航时显示焦点样式
// 鼠标点击不会显示焦点样式</code></pre>
          </el-tab-pane>
        </el-tabs>
      </el-space>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useFocusTrap } from '@/composables/useFocusTrap'
import { announce, announceError, announceSuccess } from '@/utils/aria'
import { vFocusVisible } from '@/directives/focus-visible'

// 模态框
const showModal = ref(false)
const modalRef = ref<HTMLElement>()
const modalForm = ref({
    name: '',
    email: ''
})

const { activate, deactivate } = useFocusTrap(modalRef, {
    initialFocus: 'input'
})

function handleModalOpened() {
    activate()
}

function handleModalClosed() {
    deactivate()
}

function handleModalSubmit() {
    announceSuccess('表单提交成功')
    showModal.value = false
}

// 展开/折叠
const expanded = ref(false)

// 进度条
const progress = ref(0)

function updateProgress() {
    progress.value = Math.min(progress.value + 20, 100)
    announce(`进度更新为 ${progress.value}%`)
}

// 屏幕阅读器
const liveMessage = ref('')

function announceMessage(message: string) {
    liveMessage.value = message
    announce(message)
}

// 表单
const form = ref({
    username: '',
    email: '',
    status: 1
})

const emailError = ref('')

// 监听邮箱变化
watch(
    () => form.value.email,
    (value) => {
        if (value && !value.includes('@')) {
            emailError.value = '请输入有效的邮箱地址'
        } else {
            emailError.value = ''
        }
    }
)
</script>

<script lang="ts">
export default {
    name: 'AccessibilityExample'
}
</script>

<style scoped lang="scss">
.accessibility-example {
  padding: 20px;

  .expand-button {
    padding: 8px 16px;
    background-color: var(--el-color-primary);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;

    &:hover {
      opacity: 0.8;
    }
  }

  .panel-content {
    margin-top: 10px;
    padding: 15px;
    background-color: var(--el-fill-color-light);
    border-radius: 4px;
  }

  .progress-bar {
    width: 100%;
    height: 20px;
    background-color: var(--el-fill-color);
    border-radius: 10px;
    overflow: hidden;
    margin: 10px 0;
  }

  .progress-fill {
    height: 100%;
    background-color: var(--el-color-primary);
    transition: width 0.3s ease;
  }

  .keyboard-nav-demo {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .nav-button {
    padding: 10px 20px;
    background-color: var(--el-color-primary);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;

    &:hover {
      opacity: 0.8;
    }

    &.focus-visible {
      outline: 3px solid var(--el-color-warning);
      outline-offset: 2px;
    }
  }

  .tip {
    color: var(--el-text-color-secondary);
    font-size: 14px;
  }

  .form-help {
    display: block;
    margin-top: 5px;
    color: var(--el-text-color-secondary);
    font-size: 12px;
  }

  .form-error {
    display: block;
    margin-top: 5px;
    color: var(--el-color-danger);
    font-size: 12px;
  }

  pre {
    background-color: #f5f7fa;
    padding: 15px;
    border-radius: 4px;
    overflow-x: auto;

    code {
      font-family: 'Courier New', Courier, monospace;
      font-size: 14px;
      line-height: 1.5;
    }
  }
}
</style>
