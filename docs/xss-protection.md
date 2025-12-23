# XSS 防护系统

## 概述

XSS（Cross-Site Scripting，跨站脚本攻击）防护系统用于清理用户输入，防止恶意脚本注入。系统提供了多种清理方式和灵活的配置选项。

## 功能特性

### 1. XSSSanitizer 类

核心清理器类，提供完整的 XSS 防护功能。

**主要功能：**
- HTML 清理（白名单机制）
- HTML 实体转义/反转义
- 标签移除
- URL 清理
- CSS 清理
- 自定义配置

### 2. v-sanitize 指令

Vue 指令，自动清理元素内容。

**特性：**
- 自动清理绑定的 HTML 内容
- 支持自定义配置
- 响应式更新

### 3. useXSS Composable

Composition API 封装，提供便捷的清理方法。

**提供方法：**
- `sanitize()` - 清理 HTML
- `escape()` - 转义 HTML 实体
- `unescape()` - 反转义 HTML 实体
- `strip()` - 移除所有标签
- `sanitizeUrl()` - 清理 URL
- `sanitizeCss()` - 清理 CSS

### 4. 响应式清理

提供响应式的清理 Composables：
- `useSanitizedHtml()` - 响应式 HTML 清理
- `useEscapedHtml()` - 响应式 HTML 转义
- `useStrippedHtml()` - 响应式标签移除
- `useBatchSanitize()` - 批量清理

## 使用方法

### 1. 使用 v-sanitize 指令

```vue
<template>
  <!-- 基础用法 -->
  <div v-sanitize="userInput"></div>

  <!-- 自定义配置 -->
  <div v-sanitize="{ html: userInput, config: { stripAllTags: true } }"></div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const userInput = ref('<script>alert("xss")</script><p>Hello</p>')
</script>
```

### 2. 使用 useXSS Composable

```typescript
import { useXSS } from '@/composables'

const { sanitize, escape, strip, sanitizeUrl } = useXSS()

// 清理 HTML
const clean = sanitize('<script>alert("xss")</script><p>Hello</p>')
// 结果: <p>Hello</p>

// 转义 HTML
const escaped = escape('<div>Hello</div>')
// 结果: &lt;div&gt;Hello&lt;/div&gt;

// 移除标签
const text = strip('<div>Hello <strong>World</strong></div>')
// 结果: Hello World

// 清理 URL
const url = sanitizeUrl('javascript:alert("xss")')
// 结果: '' (危险 URL 被移除)
```

### 3. 使用工具函数

```typescript
import { sanitizeHtml, escapeHtml, stripTags } from '@/utils/xss-sanitizer'

// 清理 HTML
const clean = sanitizeHtml(userInput)

// 转义 HTML
const escaped = escapeHtml(userInput)

// 移除标签
const text = stripTags(userInput)
```

### 4. 响应式清理

```typescript
import { ref } from 'vue'
import { useSanitizedHtml, useEscapedHtml, useStrippedHtml } from '@/composables'

const userInput = ref('<script>alert("xss")</script><p>Hello</p>')

// 响应式清理
const sanitized = useSanitizedHtml(userInput)
console.log(sanitized.value) // <p>Hello</p>

// 响应式转义
const escaped = useEscapedHtml(userInput)
console.log(escaped.value) // &lt;script&gt;...

// 响应式移除标签
const text = useStrippedHtml(userInput)
console.log(text.value) // Hello
```

### 5. 自定义配置

```typescript
import { XSSSanitizer } from '@/utils/xss-sanitizer'

const sanitizer = new XSSSanitizer({
  // 允许的标签（白名单）
  allowedTags: ['p', 'br', 'strong', 'em'],
  
  // 允许的属性（白名单）
  allowedAttrs: ['class', 'id'],
  
  // 是否允许 data 属性
  allowDataAttrs: true,
  
  // 是否允许 aria 属性
  allowAriaAttrs: true,
  
  // 是否移除所有标签
  stripAllTags: false,
  
  // 是否转义 HTML
  escapeHtml: false
})

const clean = sanitizer.sanitize(userInput)
```

## 配置选项

### XSSSanitizerConfig

```typescript
interface XSSSanitizerConfig {
  /**
   * 允许的标签（白名单）
   * @default ALLOWED_TAGS
   */
  allowedTags?: string[]

  /**
   * 允许的属性（白名单）
   * @default ALLOWED_ATTRS
   */
  allowedAttrs?: string[]

  /**
   * 是否允许 data 属性
   * @default false
   */
  allowDataAttrs?: boolean

  /**
   * 是否允许 aria 属性
   * @default true
   */
  allowAriaAttrs?: boolean

  /**
   * 是否移除所有标签（只保留文本）
   * @default false
   */
  stripAllTags?: boolean

  /**
   * 是否转义 HTML 实体
   * @default true
   */
  escapeHtml?: boolean
}
```

## 默认白名单

### 允许的标签

```typescript
const ALLOWED_TAGS = [
  'p', 'br', 'span', 'div', 'strong', 'em', 'u', 'i', 'b',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li',
  'a', 'img',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'blockquote', 'code', 'pre'
]
```

### 允许的属性

```typescript
const ALLOWED_ATTRS = [
  'href', 'src', 'alt', 'title', 'class', 'id', 'style', 'target', 'rel'
]
```

### 危险的标签（黑名单）

```typescript
const DANGEROUS_TAGS = [
  'script', 'iframe', 'object', 'embed', 'link', 'style',
  'meta', 'base', 'form', 'input', 'button', 'textarea', 'select'
]
```

### 危险的属性（黑名单）

```typescript
const DANGEROUS_ATTRS = [
  'onclick', 'ondblclick', 'onmousedown', 'onmouseup',
  'onmouseover', 'onmousemove', 'onmouseout',
  'onload', 'onerror', 'onabort',
  'onblur', 'onchange', 'onfocus',
  'onreset', 'onsubmit',
  'onkeydown', 'onkeypress', 'onkeyup',
  'javascript:', 'vbscript:', 'data:text/html'
]
```

## 常见 XSS 攻击示例

### 1. Script 标签注入

```html
<!-- 攻击 -->
<script>alert('XSS')</script>

<!-- 清理后 -->
<!-- 标签被移除 -->
```

### 2. 事件处理器注入

```html
<!-- 攻击 -->
<img src="x" onerror="alert('XSS')">

<!-- 清理后 -->
<img src="x">
```

### 3. JavaScript 协议

```html
<!-- 攻击 -->
<a href="javascript:alert('XSS')">Click</a>

<!-- 清理后 -->
<a href="">Click</a>
```

### 4. Iframe 注入

```html
<!-- 攻击 -->
<iframe src="http://evil.com"></iframe>

<!-- 清理后 -->
<!-- 标签被移除 -->
```

### 5. Style 注入

```html
<!-- 攻击 -->
<div style="background: url('javascript:alert(1)')">Content</div>

<!-- 清理后 -->
<div style="background: url('')">Content</div>
```

## 最佳实践

### 1. 输入验证

在服务器端和客户端都进行输入验证：

```typescript
// 客户端验证
function validateInput(input: string): boolean {
  // 检查长度
  if (input.length > 10000) {
    return false
  }
  
  // 检查危险模式
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /onerror=/i
  ]
  
  return !dangerousPatterns.some(pattern => pattern.test(input))
}

// 清理输入
const clean = sanitizeHtml(input)
```

### 2. 输出编码

根据上下文选择合适的编码方式：

```typescript
// HTML 上下文
const htmlSafe = sanitizeHtml(userInput)

// 属性上下文
const attrSafe = escapeHtml(userInput)

// URL 上下文
const urlSafe = sanitizeUrl(userInput)

// CSS 上下文
const cssSafe = sanitizeCss(userInput)
```

### 3. 内容安全策略（CSP）

配合 CSP 头部使用：

```html
<!-- 在 index.html 中添加 -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'">
```

### 4. 富文本编辑器

对于富文本编辑器，使用自定义配置：

```typescript
const richTextConfig: XSSSanitizerConfig = {
  allowedTags: [
    'p', 'br', 'span', 'div', 'strong', 'em', 'u', 'i', 'b',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'a', 'img',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'blockquote', 'code', 'pre'
  ],
  allowedAttrs: ['href', 'src', 'alt', 'title', 'class', 'style'],
  allowDataAttrs: false,
  allowAriaAttrs: true,
  stripAllTags: false,
  escapeHtml: false
}

const clean = sanitizeHtml(richTextContent, richTextConfig)
```

### 5. 用户评论

对于用户评论，使用严格配置：

```typescript
const commentConfig: XSSSanitizerConfig = {
  allowedTags: ['p', 'br', 'strong', 'em', 'a'],
  allowedAttrs: ['href'],
  allowDataAttrs: false,
  allowAriaAttrs: false,
  stripAllTags: false,
  escapeHtml: false
}

const clean = sanitizeHtml(comment, commentConfig)
```

## 性能考虑

### 1. 缓存清理结果

对于静态内容，缓存清理结果：

```typescript
const cache = new Map<string, string>()

function sanitizeWithCache(html: string): string {
  if (cache.has(html)) {
    return cache.get(html)!
  }
  
  const clean = sanitizeHtml(html)
  cache.set(html, clean)
  return clean
}
```

### 2. 批量处理

使用批量清理方法：

```typescript
import { useBatchSanitize } from '@/composables'

const inputs = ref(['<script>1</script>', '<img src=x onerror=alert(2)>'])
const sanitized = useBatchSanitize(inputs)
```

### 3. 服务器端清理

对于大量内容，在服务器端进行清理：

```typescript
// 服务器端
app.post('/api/content', (req, res) => {
  const clean = sanitizeHtml(req.body.content)
  // 保存清理后的内容
  saveContent(clean)
})
```

## 注意事项

1. **不要完全依赖客户端清理**：客户端清理可以被绕过，服务器端验证是必须的
2. **定期更新白名单和黑名单**：随着新的攻击方式出现，需要更新规则
3. **测试清理效果**：使用已知的 XSS 攻击向量测试清理效果
4. **记录可疑输入**：记录被清理的内容，用于安全分析
5. **用户教育**：告知用户不要输入恶意内容

## 相关资源

- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [Content Security Policy (CSP)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [HTML Sanitization](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Sanitizer_API)
