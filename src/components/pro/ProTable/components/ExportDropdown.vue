<template>
  <el-dropdown trigger="click" @command="handleCommand">
    <slot>
      <el-button :icon="Download">
        导出
        <el-icon class="el-icon--right"><ArrowDown /></el-icon>
      </el-button>
    </slot>
    <template #dropdown>
      <el-dropdown-menu>
        <template v-if="showExportAll">
          <el-dropdown-item
            v-for="format in formats"
            :key="`all-${format}`"
            :command="`all-${format}`"
          >
            导出全部 ({{ formatLabels[format] }})
          </el-dropdown-item>
        </template>
        <el-dropdown-item v-if="showExportAll && showExportPage" divided />
        <template v-if="showExportPage">
          <el-dropdown-item
            v-for="format in formats"
            :key="`page-${format}`"
            :command="`page-${format}`"
          >
            导出当前页 ({{ formatLabels[format] }})
          </el-dropdown-item>
        </template>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Download, ArrowDown } from '@element-plus/icons-vue'
import type { ExportFormat, ProTableExportConfig } from '../types-plus'

interface Props {
  /** 导出配置 */
  config?: ProTableExportConfig
  /** 是否显示导出全部 */
  showExportAll?: boolean
  /** 是否显示导出当前页 */
  showExportPage?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showExportAll: true,
  showExportPage: true,
})

const emit = defineEmits<{
  (e: 'export-all', format: ExportFormat): void
  (e: 'export-page', format: ExportFormat): void
}>()

// 格式标签
const formatLabels: Record<ExportFormat, string> = {
  csv: 'CSV',
  excel: 'Excel',
  json: 'JSON',
}

// 支持的格式
const formats = computed<ExportFormat[]>(() => {
  return props.config?.formats || ['csv']
})

// 处理命令
const handleCommand = (command: string) => {
  const [type, format] = command.split('-') as ['all' | 'page', ExportFormat]
  if (type === 'all') {
    emit('export-all', format)
  } else {
    emit('export-page', format)
  }
}
</script>
