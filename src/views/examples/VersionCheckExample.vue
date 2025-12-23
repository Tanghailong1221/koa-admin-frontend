<template>
  <div class="version-check-example">
    <el-card header="版本检测示例">
      <el-space direction="vertical" :size="20" style="width: 100%">
        <!-- 当前状态 -->
        <el-descriptions title="当前状态" :column="2" border>
          <el-descriptions-item label="当前版本">
            {{ currentVersion }}
          </el-descriptions-item>
          <el-descriptions-item label="最新版本">
            {{ latestVersion || '未检测' }}
          </el-descriptions-item>
          <el-descriptions-item label="是否有新版本">
            <el-tag :type="hasNewVersion ? 'warning' : 'success'">
              {{ hasNewVersion ? '是' : '否' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="检测状态">
            <el-tag :type="checking ? 'info' : 'success'">
              {{ checking ? '检测中...' : '空闲' }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>

        <!-- 操作按钮 -->
        <el-space>
          <el-button type="primary" :loading="checking" @click="handleCheck">
            手动检测
          </el-button>
          <el-button @click="handleRefresh">刷新页面</el-button>
          <el-button @click="handleClearNewVersion">清除新版本标记</el-button>
        </el-space>

        <!-- 说明 -->
        <el-alert
          title="使用说明"
          type="info"
          :closable="false"
          description="版本检测系统会定期检查服务器上的 version.json 文件，如果检测到新版本，会显示通知提示用户刷新页面。"
        />

        <!-- 配置信息 -->
        <el-descriptions title="配置信息" :column="1" border>
          <el-descriptions-item label="检测 URL">
            /version.json
          </el-descriptions-item>
          <el-descriptions-item label="检测间隔">
            60 秒
          </el-descriptions-item>
          <el-descriptions-item label="自动开始">
            是
          </el-descriptions-item>
          <el-descriptions-item label="显示通知">
            是
          </el-descriptions-item>
        </el-descriptions>

        <!-- 代码示例 -->
        <el-divider content-position="left">代码示例</el-divider>

        <el-tabs>
          <el-tab-pane label="基础用法">
            <pre><code>import { useVersionCheck } from '@/composables'

const {
  hasNewVersion,
  latestVersion,
  checking,
  currentVersion,
  check,
  refresh
} = useVersionCheck('1.0.0', {
  autoStart: true,
  showNotification: true
})</code></pre>
          </el-tab-pane>

          <el-tab-pane label="自定义配置">
            <pre><code>const { ... } = useVersionCheck('1.0.0', {
  // 自动开始检测
  autoStart: true,
  
  // 检测间隔（毫秒）
  interval: 60000,
  
  // 显示更新提示
  showNotification: true,
  
  // 提示标题
  notificationTitle: '发现新版本',
  
  // 提示消息
  notificationMessage: '检测到新版本，请刷新页面',
  
  // 显示刷新按钮
  showRefreshButton: true,
  
  // 版本不匹配回调
  onVersionMismatch: (current, latest) => {
    console.log(\`版本更新: \${current} -> \${latest}\`)
  }
})</code></pre>
          </el-tab-pane>

          <el-tab-pane label="version.json">
            <pre><code>{
  "version": "1.0.1",
  "buildTime": "2025-12-23T10:00:00.000Z",
  "commitHash": "abc123"
}</code></pre>
          </el-tab-pane>
        </el-tabs>
      </el-space>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useVersionCheck } from '@/composables'

// 使用版本检测
const {
    hasNewVersion,
    latestVersion,
    checking,
    currentVersion,
    check,
    refresh,
    clearNewVersion
} = useVersionCheck('1.0.0', {
    autoStart: true,
    interval: 60000, // 1 分钟
    showNotification: true,
    notificationTitle: '发现新版本',
    notificationMessage: '检测到新版本，请刷新页面以获取最新功能',
    showRefreshButton: true,
    refreshButtonText: '立即刷新',
    onVersionMismatch: (current, latest) => {
        console.log(`[VersionCheckExample] 版本更新: ${current} -> ${latest}`)
    }
})

/**
 * 手动检测
 */
const handleCheck = async () => {
    const result = await check()
    if (!result) {
        ElMessage.success('当前已是最新版本')
    }
}

/**
 * 刷新页面
 */
const handleRefresh = () => {
    refresh()
}

/**
 * 清除新版本标记
 */
const handleClearNewVersion = () => {
    clearNewVersion()
    ElMessage.success('已清除新版本标记')
}
</script>

<script lang="ts">
import { ElMessage } from 'element-plus'

export default {
    name: 'VersionCheckExample'
}
</script>

<style scoped lang="scss">
.version-check-example {
  padding: 20px;

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
