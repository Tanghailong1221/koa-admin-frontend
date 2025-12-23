<template>
  <div class="theme-example">
    <el-card header="主题管理示例">
      <!-- 当前主题信息 -->
      <el-descriptions :column="2" border style="margin-bottom: 20px">
        <el-descriptions-item label="当前模式">
          <el-tag :type="isDark ? 'info' : 'success'">
            {{ currentMode === 'dark' ? '暗黑模式' : '明亮模式' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="配置模式">
          <el-tag>
            {{ config.mode === 'auto' ? '自动' : config.mode === 'dark' ? '暗黑' : '明亮' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="主色调">
          <div style="display: flex; align-items: center; gap: 8px">
            <div
              :style="{
                width: '20px',
                height: '20px',
                backgroundColor: config.primaryColor,
                border: '1px solid #ddd',
                borderRadius: '4px'
              }"
            />
            {{ config.primaryColor }}
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="字体大小">
          {{ config.fontSize }}
        </el-descriptions-item>
      </el-descriptions>

      <!-- 主题模式切换 -->
      <el-card header="主题模式" style="margin-bottom: 20px">
        <el-space wrap>
          <el-button
            :type="config.mode === 'light' ? 'primary' : 'default'"
            @click="setMode('light')"
          >
            明亮模式
          </el-button>
          <el-button
            :type="config.mode === 'dark' ? 'primary' : 'default'"
            @click="setMode('dark')"
          >
            暗黑模式
          </el-button>
          <el-button
            :type="config.mode === 'auto' ? 'primary' : 'default'"
            @click="setMode('auto')"
          >
            自动模式
          </el-button>
          <el-button @click="toggleMode">
            切换模式
          </el-button>
        </el-space>
      </el-card>

      <!-- 主题预设 -->
      <el-card header="主题预设" style="margin-bottom: 20px">
        <el-space wrap>
          <el-button
            v-for="preset in presets"
            :key="preset.name"
            @click="applyPreset(preset.name)"
          >
            {{ preset.label }}
          </el-button>
        </el-space>
      </el-card>

      <!-- 主色调选择 -->
      <el-card header="主色调" style="margin-bottom: 20px">
        <el-space wrap>
          <div
            v-for="color in colorOptions"
            :key="color.value"
            class="color-option"
            :class="{ active: config.primaryColor === color.value }"
            :style="{ backgroundColor: color.value }"
            @click="setPrimaryColor(color.value)"
          >
            <el-icon v-if="config.primaryColor === color.value">
              <Check />
            </el-icon>
          </div>
        </el-space>

        <el-divider />

        <el-color-picker
          v-model="customColor"
          @change="handleColorChange"
        />
        <span style="margin-left: 12px">自定义颜色</span>
      </el-card>

      <!-- 组件预览 -->
      <el-card header="组件预览" style="margin-bottom: 20px">
        <el-space direction="vertical" style="width: 100%">
          <!-- 按钮 -->
          <div>
            <el-space wrap>
              <el-button type="primary">主要按钮</el-button>
              <el-button type="success">成功按钮</el-button>
              <el-button type="warning">警告按钮</el-button>
              <el-button type="danger">危险按钮</el-button>
              <el-button type="info">信息按钮</el-button>
            </el-space>
          </div>

          <!-- 标签 -->
          <div>
            <el-space wrap>
              <el-tag type="primary">主要标签</el-tag>
              <el-tag type="success">成功标签</el-tag>
              <el-tag type="warning">警告标签</el-tag>
              <el-tag type="danger">危险标签</el-tag>
              <el-tag type="info">信息标签</el-tag>
            </el-space>
          </div>

          <!-- 警告框 -->
          <div>
            <el-alert type="success" :closable="false">
              这是一条成功提示
            </el-alert>
          </div>

          <div>
            <el-alert type="warning" :closable="false">
              这是一条警告提示
            </el-alert>
          </div>
        </el-space>
      </el-card>

      <!-- 操作按钮 -->
      <el-space>
        <el-button type="primary" @click="reset">
          重置主题
        </el-button>
        <el-button @click="handlePrint">
          打印预览
        </el-button>
      </el-space>

      <!-- 说明 -->
      <el-divider />
      <el-alert type="info" :closable="false">
        <template #title>功能说明</template>
        <ul style="margin: 0; padding-left: 20px">
          <li>支持明亮、暗黑、自动三种模式</li>
          <li>自动模式会根据系统主题自动切换</li>
          <li>支持自定义主色调</li>
          <li>主题配置会自动持久化到 localStorage</li>
          <li>刷新页面后主题配置会自动恢复</li>
          <li>提供多个主题预设快速切换</li>
        </ul>
      </el-alert>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Check } from '@element-plus/icons-vue'
import { useTheme } from '@/composables'

// 使用主题
const {
    config,
    currentMode,
    isDark,
    presets,
    setMode,
    toggleMode,
    setPrimaryColor,
    applyPreset,
    reset
} = useTheme()

// 颜色选项
const colorOptions = [
    { label: '默认蓝', value: '#409eff' },
    { label: '天空蓝', value: '#1890ff' },
    { label: '极光绿', value: '#52c41a' },
    { label: '拂晓蓝', value: '#1677ff' },
    { label: '薄暮红', value: '#f5222d' },
    { label: '火山橙', value: '#fa541c' },
    { label: '日暮黄', value: '#faad14' },
    { label: '明青', value: '#13c2c2' },
    { label: '极客蓝', value: '#2f54eb' },
    { label: '酱紫', value: '#722ed1' }
]

// 自定义颜色
const customColor = ref(config.value.primaryColor)

/**
 * 事件处理
 */
const handleColorChange = (color: string | null) => {
    if (color) {
        setPrimaryColor(color)
    }
}

const handlePrint = () => {
    window.print()
}
</script>

<style scoped lang="scss">
.theme-example {
    padding: 20px;

    ul {
        li {
            margin: 8px 0;
            line-height: 1.6;
        }
    }

    .color-option {
        width: 40px;
        height: 40px;
        border-radius: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid transparent;
        transition: all 0.3s;

        &:hover {
            transform: scale(1.1);
        }

        &.active {
            border-color: #fff;
            box-shadow: 0 0 0 2px var(--el-color-primary);
        }

        .el-icon {
            color: #fff;
            font-size: 20px;
        }
    }
}
</style>
