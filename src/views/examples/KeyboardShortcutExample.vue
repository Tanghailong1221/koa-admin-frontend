<template>
  <div class="keyboard-shortcut-example">
    <el-card header="键盘快捷键示例 / Keyboard Shortcut Example">
      <el-alert
        title="功能说明 / Description"
        type="info"
        :closable="false"
        style="margin-bottom: 20px"
      >
        <p>本示例展示了键盘快捷键功能。</p>
        <p>This example demonstrates keyboard shortcut features.</p>
        <p style="margin-top: 10px">
          <strong>提示：</strong>按 <kbd>Ctrl+/</kbd> 或 <kbd>Cmd+/</kbd> 查看所有快捷键
        </p>
      </el-alert>

      <!-- 全局快捷键 -->
      <el-card header="全局快捷键 / Global Shortcuts" style="margin-bottom: 20px">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="保存">
            <kbd>Ctrl+S</kbd> / <kbd>Cmd+S</kbd>
          </el-descriptions-item>
          <el-descriptions-item label="关闭">
            <kbd>Esc</kbd>
          </el-descriptions-item>
          <el-descriptions-item label="刷新">
            <kbd>F5</kbd>
          </el-descriptions-item>
          <el-descriptions-item label="帮助">
            <kbd>Ctrl+/</kbd> / <kbd>Cmd+/</kbd>
          </el-descriptions-item>
          <el-descriptions-item label="后退">
            <kbd>Alt+←</kbd>
          </el-descriptions-item>
          <el-descriptions-item label="前进">
            <kbd>Alt+→</kbd>
          </el-descriptions-item>
          <el-descriptions-item label="返回首页">
            <kbd>Ctrl+H</kbd> / <kbd>Cmd+H</kbd>
          </el-descriptions-item>
          <el-descriptions-item label="搜索">
            <kbd>Ctrl+K</kbd> / <kbd>Cmd+K</kbd>
          </el-descriptions-item>
          <el-descriptions-item label="切换侧边栏">
            <kbd>Ctrl+B</kbd> / <kbd>Cmd+B</kbd>
          </el-descriptions-item>
          <el-descriptions-item label="设置">
            <kbd>Ctrl+,</kbd> / <kbd>Cmd+,</kbd>
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 页面级快捷键 -->
      <el-card header="页面级快捷键 / Page Shortcuts" style="margin-bottom: 20px">
        <el-alert
          title="提示"
          type="warning"
          :closable="false"
          style="margin-bottom: 15px"
        >
          以下快捷键仅在当前页面生效
        </el-alert>

        <el-space direction="vertical" style="width: 100%">
          <div>
            <strong>按 <kbd>Ctrl+1</kbd>：</strong>
            <el-button type="primary" size="small" @click="handleAction1">
              执行操作 1
            </el-button>
          </div>

          <div>
            <strong>按 <kbd>Ctrl+2</kbd>：</strong>
            <el-button type="success" size="small" @click="handleAction2">
              执行操作 2
            </el-button>
          </div>

          <div>
            <strong>按 <kbd>Ctrl+3</kbd>：</strong>
            <el-button type="warning" size="small" @click="handleAction3">
              执行操作 3
            </el-button>
          </div>
        </el-space>

        <el-divider />

        <div style="margin-bottom: 10px">
          <strong>操作日志：</strong>
        </div>
        <el-scrollbar max-height="200px">
          <div
            v-for="(log, index) in actionLogs"
            :key="index"
            class="action-log"
          >
            {{ log }}
          </div>
          <div v-if="actionLogs.length === 0" class="action-log empty">
            暂无操作记录
          </div>
        </el-scrollbar>
      </el-card>

      <!-- 快捷键管理 -->
      <el-card header="快捷键管理 / Shortcut Management" style="margin-bottom: 20px">
        <el-space wrap>
          <el-button @click="handleShowHelp">
            显示快捷键帮助
          </el-button>
          <el-button @click="handleEnableShortcut">
            启用快捷键
          </el-button>
          <el-button @click="handleDisableShortcut">
            禁用快捷键
          </el-button>
          <el-button @click="handleClearLogs">
            清空日志
          </el-button>
        </el-space>
      </el-card>

      <!-- 使用说明 -->
      <el-card header="使用说明 / Usage">
        <el-collapse>
          <el-collapse-item title="全局快捷键设置" name="1">
            <pre><code>{{ globalShortcutsCode }}</code></pre>
          </el-collapse-item>
          <el-collapse-item title="页面级快捷键" name="2">
            <pre><code>{{ pageShortcutsCode }}</code></pre>
          </el-collapse-item>
          <el-collapse-item title="使用 Composable" name="3">
            <pre><code>{{ composableCode }}</code></pre>
          </el-collapse-item>
          <el-collapse-item title="快捷键帮助对话框" name="4">
            <pre><code>{{ helpDialogCode }}</code></pre>
          </el-collapse-item>
        </el-collapse>
      </el-card>
    </el-card>

    <!-- 快捷键帮助对话框 -->
    <ShortcutHelp ref="shortcutHelpRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useKeyboardShortcut } from '@/composables'
import { ShortcutHelp } from '@/components/ShortcutHelp'
import { ShortcutCategory } from '@/utils/keyboard-shortcuts'

const shortcutHelpRef = ref<InstanceType<typeof ShortcutHelp>>()
const actionLogs = ref<string[]>([])

// 使用快捷键 composable
const { register, enable, disable } = useKeyboardShortcut()

/**
 * 添加日志
 */
function addLog(message: string) {
  const timestamp = new Date().toLocaleTimeString()
  actionLogs.value.unshift(`[${timestamp}] ${message}`)
  if (actionLogs.value.length > 20) {
    actionLogs.value.pop()
  }
}

/**
 * 操作 1
 */
function handleAction1() {
  ElMessage.success('执行操作 1')
  addLog('执行操作 1')
}

/**
 * 操作 2
 */
function handleAction2() {
  ElMessage.success('执行操作 2')
  addLog('执行操作 2')
}

/**
 * 操作 3
 */
function handleAction3() {
  ElMessage.success('执行操作 3')
  addLog('执行操作 3')
}

/**
 * 显示帮助
 */
function handleShowHelp() {
  shortcutHelpRef.value?.show()
}

/**
 * 启用快捷键
 */
function handleEnableShortcut() {
  enable('page-action-1')
  ElMessage.success('已启用 Ctrl+1 快捷键')
  addLog('启用 Ctrl+1 快捷键')
}

/**
 * 禁用快捷键
 */
function handleDisableShortcut() {
  disable('page-action-1')
  ElMessage.warning('已禁用 Ctrl+1 快捷键')
  addLog('禁用 Ctrl+1 快捷键')
}

/**
 * 清空日志
 */
function handleClearLogs() {
  actionLogs.value = []
}

/**
 * 监听保存事件
 */
function handleSave() {
  ElMessage.success('触发保存快捷键')
  addLog('触发保存快捷键 (Ctrl+S)')
}

/**
 * 监听关闭事件
 */
function handleEscape() {
  addLog('触发关闭快捷键 (Esc)')
}

/**
 * 监听搜索事件
 */
function handleSearch() {
  ElMessage.info('触发搜索快捷键')
  addLog('触发搜索快捷键 (Ctrl+K)')
}

onMounted(() => {
  // 注册页面级快捷键
  register('page-action-1', {
    keys: 'ctrl+1',
    description: '执行操作 1',
    category: ShortcutCategory.OTHER,
    callback: () => {
      handleAction1()
      return false
    }
  })

  register('page-action-2', {
    keys: 'ctrl+2',
    description: '执行操作 2',
    category: ShortcutCategory.OTHER,
    callback: () => {
      handleAction2()
      return false
    }
  })

  register('page-action-3', {
    keys: 'ctrl+3',
    description: '执行操作 3',
    category: ShortcutCategory.OTHER,
    callback: () => {
      handleAction3()
      return false
    }
  })

  // 监听全局快捷键事件
  window.addEventListener('shortcut-save', handleSave)
  window.addEventListener('shortcut-escape', handleEscape)
  window.addEventListener('shortcut-search', handleSearch)
})

onUnmounted(() => {
  window.removeEventListener('shortcut-save', handleSave)
  window.removeEventListener('shortcut-escape', handleEscape)
  window.removeEventListener('shortcut-search', handleSearch)
})

// 代码示例
const globalShortcutsCode = `// main.ts
import { setupGlobalShortcuts } from '@/utils/global-shortcuts'
import router from '@/router'

// 设置全局快捷键
setupGlobalShortcuts(router)

// 全局快捷键会自动注册以下快捷键：
// - Ctrl+S / Cmd+S: 保存
// - Esc: 关闭
// - F5: 刷新
// - Ctrl+/ / Cmd+/: 显示帮助
// - Alt+Left: 后退
// - Alt+Right: 前进
// - Ctrl+H / Cmd+H: 返回首页
// - Ctrl+K / Cmd+K: 搜索
// - Ctrl+B / Cmd+B: 切换侧边栏
// - Ctrl+, / Cmd+,: 设置`

const pageShortcutsCode = `<script setup lang="ts">
import { onMounted } from 'vue'
import { useKeyboardShortcut } from '@/composables'
import { ShortcutCategory } from '@/utils/keyboard-shortcuts'

const { register } = useKeyboardShortcut()

onMounted(() => {
  // 注册页面级快捷键
  register('my-shortcut', {
    keys: 'ctrl+1',
    description: '执行操作',
    category: ShortcutCategory.OTHER,
    callback: () => {
      console.log('执行操作')
      return false  // 阻止默认行为
    }
  })
})

// 组件卸载时会自动注销快捷键
<\/script>`

const composableCode = `<script setup lang="ts">
import { useShortcut } from '@/composables'

// 简化版：直接注册快捷键
useShortcut('ctrl+s', () => {
  console.log('保存')
  return false
}, {
  description: '保存',
  category: 'general'
})

// 多个快捷键
useShortcut(['ctrl+s', 'command+s'], () => {
  console.log('保存')
  return false
})
<\/script>`

const helpDialogCode = `<template>
  <ShortcutHelp ref="shortcutHelpRef" />
  
  <el-button @click="showHelp">
    显示快捷键帮助
  </el-button>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ShortcutHelp } from '@/components/ShortcutHelp'

const shortcutHelpRef = ref()

function showHelp() {
  shortcutHelpRef.value?.show()
}
<\/script>`
</script>

<style scoped lang="scss">
.keyboard-shortcut-example {
  padding: 20px;
}

kbd {
  display: inline-block;
  padding: 2px 6px;
  font-size: 12px;
  font-family: 'Courier New', Courier, monospace;
  color: #303133;
  background-color: #f5f7fa;
  border: 1px solid #dcdfe6;
  border-radius: 3px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
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

.action-log {
  padding: 8px 12px;
  margin-bottom: 4px;
  font-size: 13px;
  font-family: 'Courier New', Courier, monospace;
  color: #606266;
  background-color: #f5f7fa;
  border-radius: 4px;

  &.empty {
    text-align: center;
    color: #909399;
  }
}
</style>
