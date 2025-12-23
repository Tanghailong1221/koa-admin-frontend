# 可访问性指南

本文档介绍如何提升应用的可访问性(Accessibility, a11y),让应用对所有用户(包括残障人士)都友好。

## 功能特性

- ✅ 焦点管理和焦点捕获
- ✅ ARIA 属性支持
- ✅ 键盘导航优化
- ✅ 屏幕阅读器支持
- ✅ 高对比度模式
- ✅ 减少动画模式
- ✅ 表单可访问性

## 焦点管理

### 焦点捕获

焦点捕获用于模态框等组件,确保焦点不会离开组件。

#### 使用 useFocusTrap

```vue
<template>
  <el-dialog v-model="visible" @opened="handleOpened" @closed="handleClosed">
    <div ref="dialogRef">
      <!-- 对话框内容 -->
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useFocusTrap } from '@/composables/useFocusTrap'

const visible = ref(false)
const dialogRef = ref<HTMLElement>()

const { activate, deactivate } = useFocusTrap(dialogRef, {
  initialFocus: 'input', // 初始焦点元素
  returnFocus: triggerButton // 返回焦点元素
})

function handleOpened() {
  activate() // 激活焦点捕获
}

function handleClosed() {
  deactivate() // 停用焦点捕获
}
</script>
```

#### 使用 FocusTrap 类

```typescript
import { createFocusTrap } from '@/utils/focus-trap'

const element = document.querySelector('.modal')
const focusTrap = createFocusTrap(element, {
  initialFocus: 'input',
  allowOutsideClick: false,
  onOutsideClick: () => {
    console.log('点击外部')
  }
})

// 激活
focusTrap.activate()

// 停用
focusTrap.deactivate()
```

### 焦点可见指令

只在键盘导航时显示焦点样式,鼠标点击不显示。

```vue
<template>
  <button v-focus-visible>按钮</button>
</template>

<script setup lang="ts">
import { vFocusVisible } from '@/directives/focus-visible'
</script>

<style>
.focus-visible {
  outline: 2px solid var(--el-color-primary);
  outline-offset: 2px;
}
</style>
```

## ARIA 属性

### ARIA 工具函数

```typescript
import {
  setAriaLabel,
  setAriaExpanded,
  setAriaHidden,
  setAriaDisabled
} from '@/utils/aria'

const button = document.querySelector('button')

// 设置 ARIA 标签
setAriaLabel(button, '关闭对话框')

// 设置展开状态
setAriaExpanded(button, true)

// 设置隐藏状态
setAriaHidden(element, false)

// 设置禁用状态
setAriaDisabled(button, true)
```

### 常用 ARIA 属性

#### aria-label

为元素提供可访问的名称:

```html
<button aria-label="关闭对话框">
  <i class="icon-close"></i>
</button>
```

#### aria-labelledby

引用其他元素作为标签:

```html
<h2 id="dialog-title">确认删除</h2>
<div role="dialog" aria-labelledby="dialog-title">
  <!-- 对话框内容 -->
</div>
```

#### aria-describedby

引用其他元素作为描述:

```html
<input
  type="email"
  aria-describedby="email-help"
/>
<span id="email-help">请输入有效的邮箱地址</span>
```

#### aria-expanded

指示元素是否展开:

```html
<button
  :aria-expanded="expanded"
  aria-controls="panel"
  @click="expanded = !expanded"
>
  {{ expanded ? '折叠' : '展开' }}
</button>
<div id="panel" :aria-hidden="!expanded">
  <!-- 面板内容 -->
</div>
```

#### aria-invalid

指示表单字段是否有效:

```html
<input
  type="email"
  :aria-invalid="hasError ? 'true' : 'false'"
  aria-describedby="email-error"
/>
<span v-if="hasError" id="email-error" role="alert">
  请输入有效的邮箱地址
</span>
```

#### aria-required

指示表单字段是否必填:

```html
<input
  type="text"
  aria-required="true"
  required
/>
```

## 屏幕阅读器支持

### 宣布消息

```typescript
import { announce, announceError, announceSuccess } from '@/utils/aria'

// 宣布普通消息
announce('操作完成')

// 宣布错误(assertive 级别)
announceError('操作失败,请重试')

// 宣布成功
announceSuccess('保存成功')
```

### 实时区域

```html
<!-- 礼貌级别(polite) -->
<div role="status" aria-live="polite" aria-atomic="true">
  {{ message }}
</div>

<!-- 强制级别(assertive) -->
<div role="alert" aria-live="assertive" aria-atomic="true">
  {{ errorMessage }}
</div>
```

### 屏幕阅读器专用内容

```html
<span class="sr-only">
  这段文字只对屏幕阅读器可见
</span>
```

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

## 键盘导航

### Tab 顺序

确保 Tab 顺序符合逻辑:

```html
<!-- 正确的 Tab 顺序 -->
<input tabindex="0" />
<button tabindex="0">提交</button>
<button tabindex="0">取消</button>

<!-- 避免使用正数 tabindex -->
<input tabindex="1" /> <!-- ❌ 不推荐 -->
```

### 键盘快捷键

```typescript
import { useKeyboardShortcut } from '@/composables'

// 注册快捷键
useKeyboardShortcut('ctrl+s', () => {
  save()
})

useKeyboardShortcut('esc', () => {
  close()
})
```

### 跳过导航链接

```html
<a href="#main-content" class="skip-link">
  跳过导航
</a>

<nav>
  <!-- 导航内容 -->
</nav>

<main id="main-content">
  <!-- 主要内容 -->
</main>
```

```css
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  z-index: 100;
  padding: 8px 16px;
  background-color: var(--el-color-primary);
  color: white;

  &:focus {
    top: 0;
  }
}
```

## 表单可访问性

### 标签关联

```html
<!-- 使用 for 属性 -->
<label for="username">用户名</label>
<input id="username" type="text" />

<!-- 或者包裹 input -->
<label>
  用户名
  <input type="text" />
</label>
```

### 错误提示

```html
<label for="email">邮箱</label>
<input
  id="email"
  type="email"
  :aria-invalid="hasError ? 'true' : 'false'"
  aria-describedby="email-error"
/>
<span v-if="hasError" id="email-error" role="alert">
  请输入有效的邮箱地址
</span>
```

### 必填字段

```html
<label for="name">
  姓名
  <span aria-label="必填">*</span>
</label>
<input
  id="name"
  type="text"
  required
  aria-required="true"
/>
```

### 字段组

```html
<fieldset>
  <legend>联系方式</legend>
  
  <label for="phone">电话</label>
  <input id="phone" type="tel" />
  
  <label for="email">邮箱</label>
  <input id="email" type="email" />
</fieldset>
```

## 颜色和对比度

### 对比度要求

- **正常文本**: 至少 4.5:1
- **大文本**: 至少 3:1
- **图标和图形**: 至少 3:1

### 非颜色指示器

不要仅依赖颜色传达信息:

```html
<!-- ❌ 仅使用颜色 -->
<span style="color: red">错误</span>

<!-- ✅ 使用图标和文本 -->
<span style="color: red">
  <i class="icon-error"></i>
  错误
</span>
```

### 高对比度模式

```css
@media (prefers-contrast: high) {
  * {
    border-color: currentColor !important;
  }

  .el-button {
    border-width: 2px !important;
  }
}
```

## 动画和运动

### 减少动画

尊重用户的动画偏好:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

## 最佳实践

### 1. 语义化 HTML

使用正确的 HTML 元素:

```html
<!-- ✅ 正确 -->
<button>点击</button>
<nav>导航</nav>
<main>主要内容</main>
<article>文章</article>

<!-- ❌ 错误 -->
<div onclick="...">点击</div>
<div class="nav">导航</div>
```

### 2. 图片替代文本

```html
<!-- 内容图片 -->
<img src="chart.png" alt="2023年销售数据图表" />

<!-- 装饰图片 -->
<img src="decoration.png" alt="" />

<!-- 功能图片 -->
<button>
  <img src="close.png" alt="关闭" />
</button>
```

### 3. 标题层级

保持正确的标题层级:

```html
<h1>页面标题</h1>
  <h2>章节标题</h2>
    <h3>小节标题</h3>
    <h3>小节标题</h3>
  <h2>章节标题</h2>
```

### 4. 链接文本

使用描述性的链接文本:

```html
<!-- ❌ 不好 -->
<a href="/article">点击这里</a>

<!-- ✅ 好 -->
<a href="/article">阅读完整文章</a>
```

### 5. 表格可访问性

```html
<table>
  <caption>2023年销售数据</caption>
  <thead>
    <tr>
      <th scope="col">月份</th>
      <th scope="col">销售额</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">1月</th>
      <td>10000</td>
    </tr>
  </tbody>
</table>
```

## 测试工具

### 浏览器扩展

- **axe DevTools**: 自动化可访问性测试
- **WAVE**: 可视化可访问性评估
- **Lighthouse**: Chrome 内置的审计工具

### 屏幕阅读器

- **NVDA**: Windows 免费屏幕阅读器
- **JAWS**: Windows 商业屏幕阅读器
- **VoiceOver**: macOS/iOS 内置屏幕阅读器
- **TalkBack**: Android 内置屏幕阅读器

### 键盘测试

- 使用 Tab 键导航所有交互元素
- 使用 Enter/Space 激活按钮和链接
- 使用 Esc 关闭对话框
- 使用方向键导航菜单和列表

## 相关资源

- [WCAG 2.1 指南](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA 规范](https://www.w3.org/TR/wai-aria/)
- [MDN 可访问性](https://developer.mozilla.org/zh-CN/docs/Web/Accessibility)
- [A11y Project](https://www.a11yproject.com/)

## 相关文档

- [焦点捕获工具](../src/utils/focus-trap.ts)
- [ARIA 工具函数](../src/utils/aria.ts)
- [焦点可见指令](../src/directives/focus-visible.ts)
- [可访问性示例](../src/views/examples/AccessibilityExample.vue)
