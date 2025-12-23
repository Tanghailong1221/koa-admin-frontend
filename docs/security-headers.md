# 安全头配置系统

## 概述

安全头（Security Headers）配置系统通过设置 HTTP 响应头来提升应用的安全性，防止 XSS、点击劫持、MIME 类型嗅探等常见的 Web 安全威胁。

## 功能特性

### 1. SecurityHeaders 类

核心安全头管理器，提供完整的安全头配置功能。

**主要功能：**
- CSP（内容安全策略）配置和生成
- X-Frame-Options 配置
- X-Content-Type-Options 配置
- X-XSS-Protection 配置
- Referrer-Policy 配置
- Permissions-Policy 配置
- Strict-Transport-Security (HSTS) 配置
- 应用安全头到 meta 标签
- 动态添加/移除 CSP 源

### 2. useSecurityHeaders Composable

Composition API 封装，提供便捷的安全头配置方法。

**提供方法：**
- `getHeaders()` - 获取所有安全头
- `applyHeaders()` - 应用安全头到 meta 标签
- `getCSP()` - 生成 CSP 字符串
- `getPermissionsPolicy()` - 生成 Permissions-Policy 字符串
- `updateConfig()` - 更新配置
- `enable()` / `disable()` - 启用/禁用安全头
- `addCSPSource()` / `removeCSPSource()` - 管理 CSP 源
- `reset()` - 重置为默认配置

### 3. 支持的安全头

- **Content-Security-Policy (CSP)**：防止 XSS 攻击
- **X-Frame-Options**：防止点击劫持
- **X-Content-Type-Options**：防止 MIME 类型嗅探
- **X-XSS-Protection**：启用浏览器的 XSS 过滤器
- **Referrer-Policy**：控制 Referer 头的发送
- **Permissions-Policy**：控制浏览器功能的使用
- **Strict-Transport-Security (HSTS)**：强制使用 HTTPS

## 使用方法

### 1. 使用 useSecurityHeaders Composable

```typescript
import { useSecurityHeaders } from '@/composables'

const {
  config,
  enabled,
  applyHeaders,
  addCSPSource,
  removeCSPSource
} = useSecurityHeaders()

// 应用安全头到 meta 标签
applyHeaders()

// 添加 CSP 源
addCSPSource('scriptSrc', 'https://cdn.example.com')

// 移除 CSP 源
removeCSPSource('scriptSrc', 'https://cdn.example.com')
```

### 2. 自定义配置

```typescript
import { SecurityHeaders } from '@/utils/security-headers'

const headers = new SecurityHeaders({
  csp: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", 'https://cdn.example.com'],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", 'data:', 'https:']
  },
  xFrameOptions: 'DENY',
  referrerPolicy: 'strict-origin-when-cross-origin'
})

// 应用到 meta 标签
headers.applyToMetaTags()

// 获取所有安全头
const allHeaders = headers.getHeaders()
```

### 3. 在 main.ts 中初始化

```typescript
import { applySecurityHeaders } from '@/utils/security-headers'

// 应用默认安全头
applySecurityHeaders()
```

## 配置选项

### SecurityHeadersConfig

```typescript
interface SecurityHeadersConfig {
  /**
   * 内容安全策略（CSP）
   */
  csp?: CSPConfig

  /**
   * X-Frame-Options
   * @default 'DENY'
   */
  xFrameOptions?: 'DENY' | 'SAMEORIGIN' | string

  /**
   * X-Content-Type-Options
   * @default 'nosniff'
   */
  xContentTypeOptions?: 'nosniff'

  /**
   * X-XSS-Protection
   * @default '1; mode=block'
   */
  xXSSProtection?: string

  /**
   * Referrer-Policy
   * @default 'strict-origin-when-cross-origin'
   */
  referrerPolicy?:
    | 'no-referrer'
    | 'no-referrer-when-downgrade'
    | 'origin'
    | 'origin-when-cross-origin'
    | 'same-origin'
    | 'strict-origin'
    | 'strict-origin-when-cross-origin'
    | 'unsafe-url'

  /**
   * Permissions-Policy
   */
  permissionsPolicy?: Record<string, string[]>

  /**
   * Strict-Transport-Security (HSTS)
   * @default 'max-age=31536000; includeSubDomains'
   */
  strictTransportSecurity?: string

  /**
   * 是否启用安全头
   * @default true
   */
  enabled?: boolean
}
```

### CSPConfig

```typescript
interface CSPConfig {
  defaultSrc?: string[]        // default-src 指令
  scriptSrc?: string[]         // script-src 指令
  styleSrc?: string[]          // style-src 指令
  imgSrc?: string[]            // img-src 指令
  fontSrc?: string[]           // font-src 指令
  connectSrc?: string[]        // connect-src 指令
  frameSrc?: string[]          // frame-src 指令
  objectSrc?: string[]         // object-src 指令
  baseUri?: string[]           // base-uri 指令
  formAction?: string[]        // form-action 指令
  frameAncestors?: string[]    // frame-ancestors 指令
  upgradeInsecureRequests?: boolean  // upgrade-insecure-requests
  blockAllMixedContent?: boolean     // block-all-mixed-content
}
```

## CSP 指令说明

### 常用指令

- **default-src**：默认策略，其他指令的回退
- **script-src**：允许加载脚本的源
- **style-src**：允许加载样式的源
- **img-src**：允许加载图片的源
- **font-src**：允许加载字体的源
- **connect-src**：允许连接的源（AJAX、WebSocket）
- **frame-src**：允许嵌入的 iframe 源
- **object-src**：允许加载插件的源
- **base-uri**：限制 `<base>` 标签的 URL
- **form-action**：限制表单提交的目标
- **frame-ancestors**：限制可以嵌入当前页面的父页面

### 常用值

- `'self'`：同源
- `'none'`：不允许
- `'unsafe-inline'`：允许内联脚本/样式（不推荐）
- `'unsafe-eval'`：允许 eval()（不推荐）
- `https:`：允许所有 HTTPS 源
- `data:`：允许 data: URI
- `blob:`：允许 blob: URI
- `https://example.com`：允许特定域名

### 示例

```typescript
const csp: CSPConfig = {
  // 默认只允许同源
  defaultSrc: ["'self'"],
  
  // 脚本：同源 + CDN
  scriptSrc: ["'self'", 'https://cdn.example.com'],
  
  // 样式：同源 + 内联样式
  styleSrc: ["'self'", "'unsafe-inline'"],
  
  // 图片：同源 + data URI + HTTPS
  imgSrc: ["'self'", 'data:', 'https:'],
  
  // 字体：同源 + data URI
  fontSrc: ["'self'", 'data:'],
  
  // AJAX：同源 + API 服务器
  connectSrc: ["'self'", 'https://api.example.com'],
  
  // 不允许 iframe
  frameSrc: ["'none'"],
  
  // 不允许插件
  objectSrc: ["'none'"],
  
  // 升级不安全请求
  upgradeInsecureRequests: true
}
```

## 服务器端配置（推荐）

虽然可以通过 meta 标签设置安全头，但推荐在服务器端配置 HTTP 响应头，这样更安全可靠。

### Nginx 配置

```nginx
# CSP
add_header Content-Security-Policy "default-src 'self'; script-src 'self' https://cdn.example.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:";

# 防止点击劫持
add_header X-Frame-Options "DENY";

# 防止 MIME 类型嗅探
add_header X-Content-Type-Options "nosniff";

# XSS 过滤器
add_header X-XSS-Protection "1; mode=block";

# Referer 策略
add_header Referrer-Policy "strict-origin-when-cross-origin";

# HSTS（仅 HTTPS）
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

# Permissions-Policy
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()";
```

### Apache 配置

```apache
# CSP
Header set Content-Security-Policy "default-src 'self'; script-src 'self' https://cdn.example.com"

# 防止点击劫持
Header always set X-Frame-Options "DENY"

# 防止 MIME 类型嗅探
Header set X-Content-Type-Options "nosniff"

# XSS 过滤器
Header set X-XSS-Protection "1; mode=block"

# Referer 策略
Header set Referrer-Policy "strict-origin-when-cross-origin"

# HSTS（仅 HTTPS）
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
```

## 安全最佳实践

### 1. CSP 配置

- ✅ 使用 `'self'` 作为默认源
- ✅ 避免使用 `'unsafe-inline'` 和 `'unsafe-eval'`
- ✅ 使用 nonce 或 hash 代替 `'unsafe-inline'`
- ✅ 限制 CDN 域名，不要使用通配符
- ✅ 使用 `upgrade-insecure-requests` 升级不安全请求
- ❌ 不要使用 `*` 通配符
- ❌ 不要使用 `data:` 作为 script-src

### 2. X-Frame-Options

- ✅ 使用 `DENY` 完全禁止嵌入
- ✅ 使用 `SAMEORIGIN` 只允许同源嵌入
- ❌ 避免使用 `ALLOW-FROM`（已废弃）

### 3. Referrer-Policy

- ✅ 使用 `strict-origin-when-cross-origin`（推荐）
- ✅ 使用 `no-referrer` 完全不发送 Referer
- ❌ 避免使用 `unsafe-url`（会泄露完整 URL）

### 4. HSTS

- ✅ 设置足够长的 `max-age`（至少 1 年）
- ✅ 包含 `includeSubDomains`
- ✅ 考虑使用 `preload`（需要提交到 HSTS Preload List）
- ❌ 不要在开发环境使用 HSTS

## 测试和验证

### 1. 使用浏览器开发者工具

打开浏览器开发者工具，查看 Network 标签中的响应头：

```
Content-Security-Policy: default-src 'self'; script-src 'self' https://cdn.example.com
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
```

### 2. 使用在线工具

- [Security Headers](https://securityheaders.com/)：检查安全头配置
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/)：评估 CSP 配置
- [Mozilla Observatory](https://observatory.mozilla.org/)：综合安全评估

### 3. CSP 违规报告

CSP 违规会在浏览器控制台显示：

```
Refused to load the script 'https://evil.com/malicious.js' because it violates the following Content Security Policy directive: "script-src 'self' https://cdn.example.com"
```

可以配置 `report-uri` 或 `report-to` 指令来收集违规报告：

```typescript
const csp: CSPConfig = {
  defaultSrc: ["'self'"],
  // ... 其他指令
  reportUri: 'https://your-domain.com/csp-report'
}
```

## 常见问题

### 1. CSP 阻止了内联脚本

**问题：** 使用 `'self'` 后，内联脚本被阻止。

**解决：**
- 方案 1：将内联脚本移到外部文件
- 方案 2：使用 nonce（推荐）
- 方案 3：使用 hash
- 方案 4：使用 `'unsafe-inline'`（不推荐）

### 2. CSP 阻止了第三方资源

**问题：** 第三方 CDN 资源被阻止。

**解决：** 将 CDN 域名添加到相应的指令：

```typescript
scriptSrc: ["'self'", 'https://cdn.jsdelivr.net'],
styleSrc: ["'self'", 'https://cdn.jsdelivr.net']
```

### 3. HSTS 导致无法访问

**问题：** 设置 HSTS 后，HTTP 无法访问。

**解决：**
- 确保网站完全支持 HTTPS
- 在开发环境禁用 HSTS
- 使用较短的 `max-age` 进行测试

## 相关资源

- [MDN - Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [MDN - X-Frame-Options](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options)
- [OWASP Secure Headers Project](https://owasp.org/www-project-secure-headers/)
- [CSP Quick Reference](https://content-security-policy.com/)
