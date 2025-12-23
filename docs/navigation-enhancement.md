# 导航增强功能文档

## 概述

导航增强功能包括面包屑（Breadcrumb）和标签页（TabsView）两个核心组件，提供了完整的页面导航和标签管理功能。

## 功能特性

### 1. Breadcrumb 面包屑组件

#### 基础功能
- ✅ 基于路由自动生成面包屑
- ✅ 支持点击导航（最后一项不可点击）
- ✅ 显示层级关系
- ✅ 自定义分隔符
- ✅ 可选显示/隐藏首页
- ✅ 自定义首页路径和标题

#### 高级功能
- ✅ 支持图标显示（从路由 meta.icon）
- ✅ 支持国际化（自动翻译标题）
- ✅ 平滑过渡动画
- ✅ 响应式路由变化

#### 使用示例

```vue
<template>
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
</script>
```

#### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| separator | string | '/' | 分隔符 |
| showHome | boolean | true | 是否显示首页 |
| homePath | string | '/' | 首页路径 |
| homeTitle | string | '首页' | 首页标题 |

### 2. TabsView 标签页组件

#### 基础功能
- ✅ 自动记录访问的页面
- ✅ 点击标签快速切换
- ✅ 关闭按钮（固定标签不显示）
- ✅ 激活状态高亮
- ✅ 滚动支持

#### 右键菜单
- ✅ 刷新 - 重新加载当前标签页
- ✅ 关闭 - 关闭当前标签（固定标签不可关闭）
- ✅ 关闭其他 - 关闭除当前标签外的所有标签
- ✅ 关闭左侧 - 关闭当前标签左侧的所有标签
- ✅ 关闭右侧 - 关闭当前标签右侧的所有标签
- ✅ 关闭全部 - 关闭所有非固定标签
- ✅ 固定标签 - 将标签设置为固定（不会被关闭）

#### 高级功能
- ✅ 固定标签（不会被关闭）
- ✅ 标签数量限制（默认 10 个）
- ✅ 自动移除最早的非固定标签
- ✅ 关闭当前标签时自动跳转到相邻标签
- ✅ 支持图标显示
- ✅ 支持查询参数

#### 使用示例

```vue
<template>
  <TabsView
    ref="tabsViewRef"
    :max-tabs="10"
    :fixed-tabs="['/']"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TabsView } from '@/components/TabsView'
import type { TabItem } from '@/components/TabsView'

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
</script>
```

#### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| maxTabs | number | 10 | 最大标签数量 |
| fixedTabs | string[] | ['/'] | 固定的标签路径 |

#### 实例方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| addTab | tab: TabItem | void | 添加标签 |
| removeTab | path: string | void | 移除标签 |
| tabs | - | TabItem[] | 获取所有标签 |

#### TabItem 类型

```typescript
interface TabItem {
  path: string          // 路径
  title: string         // 标题
  icon?: any           // 图标
  fixed?: boolean      // 是否固定
  query?: Record<string, any>  // 查询参数
}
```

## 技术亮点

1. **自动生成**：面包屑基于路由自动生成，无需手动配置
2. **国际化支持**：自动识别翻译键，支持多语言
3. **右键菜单**：丰富的右键菜单操作，提升用户体验
4. **固定标签**：支持固定重要标签，防止误关闭
5. **智能跳转**：关闭当前标签时自动跳转到相邻标签
6. **类型安全**：完整的 TypeScript 类型定义
7. **平滑动画**：过渡动画流畅，视觉体验好

## 文件结构

```
src/components/
  ├── Breadcrumb/
  │   ├── Breadcrumb.vue            # 面包屑组件
  │   └── index.ts                  # 导出文件
  └── TabsView/
      ├── TabsView.vue              # 标签页组件
      └── index.ts                  # 导出文件

src/views/examples/
  └── NavigationExample.vue         # 导航增强示例页面
```

## 最佳实践

### 1. 路由配置

确保路由配置中包含 `meta.title` 和 `meta.icon`：

```typescript
{
  path: '/users',
  name: 'Users',
  component: () => import('@/views/users/index.vue'),
  meta: {
    title: 'menu.users',  // 支持国际化键
    icon: User            // Element Plus 图标
  }
}
```

### 2. 固定标签

将重要页面设置为固定标签：

```vue
<TabsView :fixed-tabs="['/', '/dashboard', '/profile']" />
```

### 3. 标签数量限制

根据实际需求设置合理的标签数量限制：

```vue
<TabsView :max-tabs="15" />
```

## 注意事项

1. **路由配置**：确保路由配置中包含 `name` 或 `meta.title`，否则面包屑可能无法正确显示
2. **固定标签**：固定标签不会被关闭，也不会被自动移除
3. **标签限制**：当标签数量达到限制时，会自动移除最早的非固定标签
4. **国际化**：如果使用国际化，确保翻译键存在，否则会显示原始键

## 示例页面

完整的示例页面位于 `src/views/examples/NavigationExample.vue`，包含：
- 面包屑的各种配置示例
- 标签页的功能演示
- 右键菜单的使用说明
- 代码示例

## 验证的需求

- ✅ **需求 15.1**：面包屑组件（基于路由生成、点击导航、层级关系）
- ✅ **需求 15.2**：标签页功能（右键菜单）
- ✅ **需求 15.3**：标签页功能（固定标签、标签限制）

---

**更新时间**：2025-12-23
**版本**：1.0.0
