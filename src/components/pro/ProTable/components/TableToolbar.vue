<template>
  <div v-if="show" class="pro-table-toolbar">
    <div class="toolbar-left">
      <!-- 左侧插槽 -->
      <slot name="left" />
      
      <!-- 自定义按钮 -->
      <template v-for="btn in visibleButtons" :key="btn.key">
        <el-button
          :type="btn.type || 'default'"
          :icon="btn.icon"
          :disabled="getButtonDisabled(btn)"
          @click="handleButtonClick(btn)"
        >
          {{ btn.label }}
        </el-button>
      </template>
    </div>
    
    <div class="toolbar-right">
      <!-- 右侧插槽 -->
      <slot name="right" />
      
      <!-- 刷新按钮 -->
      <el-tooltip v-if="showRefresh" content="刷新" placement="top">
        <el-button :icon="Refresh" circle @click="handleRefresh" />
      </el-tooltip>
      
      <!-- 列设置按钮 -->
      <el-tooltip v-if="showColumnSetting" content="列设置" placement="top">
        <el-button :icon="Setting" circle @click="handleColumnSetting" />
      </el-tooltip>
      
      <!-- 导出按钮 -->
      <el-dropdown
        v-if="showExportAll || showExportPage"
        trigger="click"
        @command="handleExportCommand"
      >
        <el-button :icon="Download" circle />
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item v-if="showExportAll" command="all">
              导出全部
            </el-dropdown-item>
            <el-dropdown-item v-if="showExportPage" command="page">
              导出当前页
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <!-- 全屏按钮 -->
      <el-tooltip v-if="showFullscreen" :content="isFullscreen ? '退出全屏' : '全屏'" placement="top">
        <el-button :icon="isFullscreen ? Aim : FullScreen" circle @click="handleFullscreen" />
      </el-tooltip>

      <!-- 打印按钮 -->
      <el-tooltip v-if="showPrint" content="打印" placement="top">
        <el-button :icon="Printer" circle @click="handlePrint" />
      </el-tooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Refresh, Setting, Download, FullScreen, Aim, Printer } from '@element-plus/icons-vue'
import type { ToolbarButton, ProTableToolbarConfig } from '../types-plus'

interface Props {
  /** 工具栏配置 */
  config?: ProTableToolbarConfig | boolean
  /** 选中的行 */
  selection?: any[]
  /** 是否全屏 */
  isFullscreen?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  config: true,
  selection: () => [],
  isFullscreen: false,
})

const emit = defineEmits<{
  (e: 'refresh'): void
  (e: 'column-setting'): void
  (e: 'export-all'): void
  (e: 'export-page'): void
  (e: 'button-click', button: ToolbarButton): void
  (e: 'fullscreen'): void
  (e: 'print'): void
}>()

// 是否显示工具栏
const show = computed(() => {
  if (typeof props.config === 'boolean') {
    return props.config
  }
  return props.config?.show !== false
})

// 工具栏配置
const toolbarConfig = computed<ProTableToolbarConfig>(() => {
  if (typeof props.config === 'boolean') {
    return {
      showRefresh: true,
      showColumnSetting: true,
      showExportAll: false,
      showExportPage: false,
      showFullscreen: false,
      buttons: [],
    }
  }
  return {
    showRefresh: true,
    showColumnSetting: true,
    showExportAll: false,
    showExportPage: false,
    showFullscreen: false,
    showPrint: false,
    buttons: [],
    ...props.config,
  }
})

// 是否显示刷新按钮
const showRefresh = computed(() => toolbarConfig.value.showRefresh)

// 是否显示列设置按钮
const showColumnSetting = computed(() => toolbarConfig.value.showColumnSetting)

// 是否显示导出全部按钮
const showExportAll = computed(() => toolbarConfig.value.showExportAll)

// 是否显示导出当前页按钮
const showExportPage = computed(() => toolbarConfig.value.showExportPage)

// 是否显示全屏按钮
const showFullscreen = computed(() => toolbarConfig.value.showFullscreen)

// 是否显示打印按钮
const showPrint = computed(() => toolbarConfig.value.showPrint)

// 可见的自定义按钮
const visibleButtons = computed(() => {
  const buttons = toolbarConfig.value.buttons || []
  return buttons.filter((btn) => {
    if (typeof btn.show === 'function') {
      return btn.show(props.selection)
    }
    return btn.show !== false
  })
})

// 获取按钮禁用状态
const getButtonDisabled = (btn: ToolbarButton): boolean => {
  if (typeof btn.disabled === 'function') {
    return btn.disabled(props.selection)
  }
  return btn.disabled === true
}

// 处理按钮点击
const handleButtonClick = (btn: ToolbarButton) => {
  if (btn.onClick) {
    btn.onClick(props.selection)
  }
  emit('button-click', btn)
}

// 处理刷新
const handleRefresh = () => {
  emit('refresh')
}

// 处理列设置
const handleColumnSetting = () => {
  emit('column-setting')
}

// 处理导出命令
const handleExportCommand = (command: string) => {
  if (command === 'all') {
    emit('export-all')
  } else if (command === 'page') {
    emit('export-page')
  }
}

// 处理全屏
const handleFullscreen = () => {
  emit('fullscreen')
}

// 处理打印
const handlePrint = () => {
  emit('print')
}
</script>

<style scoped lang="scss">
.pro-table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 12px;
  background-color: var(--el-bg-color);
  border-radius: 4px;

  .toolbar-left,
  .toolbar-right {
    display: flex;
    gap: 8px;
    align-items: center;
  }
}
</style>
