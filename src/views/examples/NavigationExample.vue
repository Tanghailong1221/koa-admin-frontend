<template>
  <div class="navigation-example">
    <el-card header="导航增强示例 / Navigation Enhancement Example">
      <el-alert
        title="功能说明 / Description"
        type="info"
        :closable="false"
        style="margin-bottom: 20px"
      >
        <p>本示例展示了增强的面包屑和标签页功能。</p>
        <p>This example demonstrates enhanced breadcrumb and tabs features.</p>
      </el-alert>

      <!-- 面包屑示例 -->
      <el-card header="面包屑 / Breadcrumb" style="margin-bottom: 20px">
        <div style="margin-bottom: 20px">
          <h4>默认面包屑 / Default Breadcrumb:</h4>
          <Breadcrumb />
        </div>

        <div style="margin-bottom: 20px">
          <h4>自定义分隔符 / Custom Separator:</h4>
          <Breadcrumb separator=">" />
        </div>

        <div style="margin-bottom: 20px">
          <h4>不显示首页 / Hide Home:</h4>
          <Breadcrumb :show-home="false" />
        </div>

        <el-divider />

        <h4>功能特性 / Features:</h4>
        <ul>
          <li>✅ 基于路由自动生成</li>
          <li>✅ 支持点击导航</li>
          <li>✅ 显示层级关系</li>
          <li>✅ 支持图标显示</li>
          <li>✅ 支持国际化</li>
          <li>✅ 平滑过渡动画</li>
        </ul>
      </el-card>

      <!-- 标签页示例 -->
      <el-card header="标签页 / Tabs View" style="margin-bottom: 20px">
        <div style="margin-bottom: 20px">
          <TabsView ref="tabsViewRef" :max-tabs="10" :fixed-tabs="['/']" />
        </div>

        <el-divider />

        <h4>功能特性 / Features:</h4>
        <ul>
          <li>✅ 自动记录访问的页面</li>
          <li>✅ 点击标签快速切换</li>
          <li>✅ 关闭按钮</li>
          <li>✅ 右键菜单（刷新、关闭、关闭其他、关闭左侧、关闭右侧、关闭全部）</li>
          <li>✅ 固定标签（不会被关闭）</li>
          <li>✅ 标签数量限制</li>
          <li>✅ 滚动支持</li>
          <li>✅ 激活状态高亮</li>
        </ul>

        <el-divider />

        <h4>操作演示 / Operations:</h4>
        <el-space wrap>
          <el-button @click="handleAddTab">添加标签</el-button>
          <el-button @click="handleRemoveTab">移除当前标签</el-button>
          <el-button @click="handleGetTabs">获取所有标签</el-button>
        </el-space>

        <div v-if="tabsList.length > 0" style="margin-top: 20px">
          <h4>当前标签列表 / Current Tabs:</h4>
          <el-tag
            v-for="tab in tabsList"
            :key="tab.path"
            :type="tab.fixed ? 'success' : 'info'"
            style="margin-right: 10px; margin-bottom: 10px"
          >
            {{ tab.title }} {{ tab.fixed ? '(固定)' : '' }}
          </el-tag>
        </div>
      </el-card>

      <!-- 使用说明 -->
      <el-card header="使用说明 / Usage">
        <el-collapse>
          <el-collapse-item title="面包屑使用 / Breadcrumb Usage" name="1">
            <pre><code>{{ breadcrumbUsageCode }}</code></pre>
          </el-collapse-item>
          <el-collapse-item title="标签页使用 / Tabs View Usage" name="2">
            <pre><code>{{ tabsViewUsageCode }}</code></pre>
          </el-collapse-item>
          <el-collapse-item title="右键菜单 / Context Menu" name="3">
            <pre><code>{{ contextMenuCode }}</code></pre>
          </el-collapse-item>
        </el-collapse>
      </el-card>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Breadcrumb } from '@/components/Breadcrumb'
import { TabsView, type TabItem } from '@/components/TabsView'

const route = useRoute()
const tabsViewRef = ref<InstanceType<typeof TabsView>>()
const tabsList = ref<TabItem[]>([])

/**
 * 添加标签
 */
function handleAddTab() {
  const randomId = Math.floor(Math.random() * 1000)
  tabsViewRef.value?.addTab({
    path: `/example-${randomId}`,
    title: `示例页面 ${randomId}`,
    fixed: false
  })
  ElMessage.success('标签已添加')
}

/**
 * 移除标签
 */
function handleRemoveTab() {
  if (route.path) {
    tabsViewRef.value?.removeTab(route.path)
    ElMessage.success('标签已移除')
  }
}

/**
 * 获取所有标签
 */
function handleGetTabs() {
  if (tabsViewRef.value) {
    tabsList.value = tabsViewRef.value.tabs
    ElMessage.success(`当前共有 ${tabsList.value.length} 个标签`)
  }
}

// 代码示例
const breadcrumbUsageCode = `<template>
  <!-- 默认面包屑 -->
  <Breadcrumb />

  <!-- 自定义分隔符 -->
  <Breadcrumb separator=">" />

  <!-- 不显示首页 -->
  <Breadcrumb :show-home="false" />

  <!-- 自定义首页 -->
  <Breadcrumb
    home-path="/dashboard"
    home-title="控制台"
  />
</template>

<script setup lang="ts">
import { Breadcrumb } from '@/components/Breadcrumb'
<\/script>`

const tabsViewUsageCode = `<template>
  <!-- 标签页 -->
  <TabsView
    ref="tabsViewRef"
    :max-tabs="10"
    :fixed-tabs="['/']"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TabsView } from '@/components/TabsView'

const tabsViewRef = ref<InstanceType<typeof TabsView>>()

// 添加标签
function addTab() {
  tabsViewRef.value?.addTab({
    path: '/example',
    title: '示例页面',
    fixed: false
  })
}

// 移除标签
function removeTab(path: string) {
  tabsViewRef.value?.removeTab(path)
}

// 获取所有标签
const tabs = tabsViewRef.value?.tabs
<\/script>`

const contextMenuCode = `// 右键菜单功能：
// 1. 刷新 - 重新加载当前标签页
// 2. 关闭 - 关闭当前标签（固定标签不可关闭）
// 3. 关闭其他 - 关闭除当前标签外的所有标签
// 4. 关闭左侧 - 关闭当前标签左侧的所有标签
// 5. 关闭右侧 - 关闭当前标签右侧的所有标签
// 6. 关闭全部 - 关闭所有非固定标签
// 7. 固定标签 - 将标签设置为固定（不会被关闭）

// 使用方法：
// 在标签上右键点击即可打开菜单`
</script>

<style scoped lang="scss">
.navigation-example {
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

ul {
  padding-left: 20px;
}

li {
  margin-bottom: 8px;
}
</style>
