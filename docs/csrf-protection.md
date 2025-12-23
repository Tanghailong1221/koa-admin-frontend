# CSRF 防护系统

## 概述

CSRF（Cross-Site Request Forgery，跨站请求伪造）防护系统通过在请求中添加 Token 来验证请求的合法性，防止恶意网站冒充用户发起请求。

## 功能特性

### 1. CSRFProtection 类

核心 CSRF 保护管理器，提供完整的 CSRF 防护功能。

**主要功能：**
- Token 生成和管理
- Token 过期检测
- 请求方法检测
- URL 白名单管理
- 多种存储方式（localStorage、sessionStorage、Cookie）
- 自动刷新 Token
- 配置管理

### 2. 自动集成

CSRF 保护已自动集成到 HTTP 客户端中，对于 POST、PUT、DELETE、PATCH 请求会自动添加 CSRF Token。

### 3. useCSRF Composable

Composition API 封装，提供便捷的 CSRF 防护方法。

**提供方法：**
- `getToken()` - 获取 Token
- `refreshToken()` - 刷新 Token
- `clearToken()` - 清除 Token
- `getTokenHeader()` - 获取 Token 请求头
- `getTokenParam()` - 获取 Token 参数
- `validateToken()` - 验证 Token
- `enable()` / `disable()` - 启用/禁用 CSRF 保护
- `addWhitelist()` / `removeWhitelist()` - 管理白名单

### 4. useFormCSRF Composable

自动为表单数据添加 CSRF Token。

## 使用方法

### 1. 自动集成（推荐）

CSRF 保护已自动集成到 HTTP 客户端中，无需手动添加 Token：

```typescript
import request from '@/utils/request'

// 自动添加 CSRF Token
const response = await request({
  url: '/api/user',
  method: 'POST',
  data: { name: 'John' }
})
```

### 2. 使用 useCSRF Composable

```typescript
import { useCSRF } from '@/composables'

const { token, getToken, refreshToken, getTokenHeader } = useCSRF()

// 获取 Token
const csrfToken = getToken()

// 刷新 Token
refreshToken()

// 获取 Token 请求头
const headers = getTokenHeader()
// { 'X-CSRF-Token': 'token-value' }

// 获取 Token 参数（用于表单）
const params = getTokenParam()
// { '_csrf': 'token-value' }
```

### 3. 表单自动添加 Token

```vue
<template>
  <el-form :model="formDataWithCSRF">
    <el-form-item label="用户名">
      <el-input v-model="formData.username" />
    </el-form-item>
    <el-button @click="handleSubmit">提交</el-button>
  </el-form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useFormCSRF } from '@/composables'

const formData = ref({
  username: '',
  email: ''
})

// 自动添加 CSRF Token
const formDataWithCSRF = useFormCSRF(formData)

function handleSubmit() {
  console.log(formDataWithCSRF.value)
  // { username: '', email: '', _csrf: 'token-value' }
}
</script>
```

### 4. 配置白名单

某些 URL 不需要 CSRF 保护（如公开 API），可以添加到白名单：

```typescript
import { useCSRF } from '@/composables'

const { addWhitelist, removeWhitelist } = useCSRF()

// 添加白名单
addWhitelist('/api/public/*')  // 支持通配符
addWhitelist('/api/login')

// 移除白名单
removeWhitelist('/api/login')
```

### 5. 手动添加 Token

如果需要手动添加 Token：

```typescript
import { getCSRFToken, getCSRFTokenHeader } from '@/utils/csrf-protection'

// 方式 1：添加到请求头
const headers = {
  ...otherHeaders,
  ...getCSRFTokenHeader()
}

// 方式 2：添加到请求参数
const data = {
  ...formData,
  _csrf: getCSRFToken()
}
```

## 配置选项

### CSRFProtectionConfig

```typescript
interface CSRFProtectionConfig {
  /**
   * Token 存储位置
   * @default 'sessionStorage'
   */
  storage?: 'localStorage' | 'sessionStorage' | 'cookie'

  /**
   * Token 请求头名称
   * @default 'X-CSRF-Token'
   */
  headerName?: string

  /**
   * Token 参数名称（用于表单提交）
   * @default '_csrf'
   */
  paramName?: string

  /**
   * Token 过期时间（毫秒）
   * @default 3600000 (1 小时)
   */
  expireTime?: number

  /**
   * 是否在每次请求后刷新 Token
   * @default false
   */
  refreshOnRequest?: boolean

  /**
   * 需要 CSRF 保护的请求方法
   * @default ['POST', 'PUT', 'DELETE', 'PATCH']
   */
  protectedMethods?: string[]

  /**
   * 白名单 URL（不需要 CSRF 保护）
   */
  whitelist?: string[]

  /**
   * 是否启用 CSRF 保护
   * @default true
   */
  enabled?: boolean
}
```

### 自定义配置

```typescript
import { CSRFProtection } from '@/utils/csrf-protection'

const csrf = new CSRFProtection({
  storage: 'sessionStorage',
  headerName: 'X-CSRF-Token',
  paramName: '_csrf',
  expireTime: 3600000, // 1 小时
  refreshOnRequest: false,
  protectedMethods: ['POST', 'PUT', 'DELETE', 'PATCH'],
  whitelist: ['/api/public/*', '/api/login'],
  enabled: true
})
```

## 工作原理

### 1. Token 生成

系统使用 UUID v4 生成唯一的 CSRF Token：

```typescript
const token = uuidv4()
```

### 2. Token 存储

Token 可以存储在三个位置：
- **sessionStorage**（默认）：会话级别，关闭浏览器后失效
- **localStorage**：持久化存储，除非手动清除
- **Cookie**：HTTP Cookie，可以设置过期时间

### 3. Token 验证

请求拦截器会自动检查：
1. 请求方法是否需要 CSRF 保护（POST、PUT、DELETE、PATCH）
2. URL 是否在白名单中
3. 如果需要保护，自动添加 Token 到请求头

### 4. Token 过期

Token 有过期时间（默认 1 小时），过期后会自动生成新的 Token。

## 安全最佳实践

### 1. 服务器端验证

客户端 CSRF 保护只是第一道防线，服务器端必须验证 Token：

```javascript
// 服务器端示例（Node.js/Express）
app.post('/api/user', (req, res) => {
  const clientToken = req.headers['x-csrf-token']
  const serverToken = req.session.csrfToken
  
  if (clientToken !== serverToken) {
    return res.status(403).json({ error: 'Invalid CSRF token' })
  }
  
  // 处理请求
})
```

### 2. 使用 SameSite Cookie

配合 SameSite Cookie 属性使用：

```typescript
// Cookie 配置
document.cookie = `csrf_token=${token}; SameSite=Strict; Secure; HttpOnly`
```

### 3. HTTPS

始终使用 HTTPS 传输 Token，防止中间人攻击。

### 4. Token 刷新

对于长时间运行的应用，定期刷新 Token：

```typescript
import { useCSRF } from '@/composables'

const { refreshToken } = useCSRF()

// 每 30 分钟刷新一次
setInterval(() => {
  refreshToken()
}, 30 * 60 * 1000)
```

### 5. 白名单管理

只将真正不需要 CSRF 保护的 URL 添加到白名单：

```typescript
// 公开 API
addWhitelist('/api/public/*')

// 登录接口（通常不需要 CSRF 保护）
addWhitelist('/api/login')

// 不要添加敏感操作到白名单
// ❌ addWhitelist('/api/user/delete')
```

## 常见 CSRF 攻击示例

### 1. 表单提交攻击

攻击者创建恶意网站，诱导用户提交表单：

```html
<!-- 恶意网站 -->
<form action="https://victim.com/api/transfer" method="POST">
  <input type="hidden" name="to" value="attacker" />
  <input type="hidden" name="amount" value="1000" />
  <input type="submit" value="点击领取奖品" />
</form>
```

**防护：** CSRF Token 验证，攻击者无法获取合法的 Token。

### 2. AJAX 请求攻击

攻击者使用 JavaScript 发起 AJAX 请求：

```javascript
// 恶意网站
fetch('https://victim.com/api/transfer', {
  method: 'POST',
  credentials: 'include', // 携带 Cookie
  body: JSON.stringify({ to: 'attacker', amount: 1000 })
})
```

**防护：** 
1. CSRF Token 验证
2. 同源策略（CORS）
3. SameSite Cookie

### 3. 图片标签攻击

攻击者使用图片标签发起 GET 请求：

```html
<!-- 恶意网站 -->
<img src="https://victim.com/api/delete?id=123" />
```

**防护：** 
1. 敏感操作不使用 GET 请求
2. CSRF Token 验证

## 与其他安全措施配合

### 1. 同源策略（CORS）

```typescript
// 服务器端配置
app.use(cors({
  origin: 'https://your-domain.com',
  credentials: true
}))
```

### 2. SameSite Cookie

```typescript
// Cookie 配置
Set-Cookie: sessionid=xxx; SameSite=Strict; Secure; HttpOnly
```

### 3. Referer 检查

```javascript
// 服务器端检查
const referer = req.headers.referer
if (!referer || !referer.startsWith('https://your-domain.com')) {
  return res.status(403).json({ error: 'Invalid referer' })
}
```

### 4. 双重提交 Cookie

```typescript
// 客户端
const token = generateToken()
document.cookie = `csrf_token=${token}`
headers['X-CSRF-Token'] = token

// 服务器端验证
if (req.cookies.csrf_token !== req.headers['x-csrf-token']) {
  return res.status(403).json({ error: 'Invalid CSRF token' })
}
```

## 故障排查

### 1. Token 未添加到请求

**问题：** 请求中没有 CSRF Token。

**解决：**
- 检查 CSRF 保护是否启用
- 检查请求方法是否在保护列表中
- 检查 URL 是否在白名单中

### 2. Token 验证失败

**问题：** 服务器返回 403 错误。

**解决：**
- 检查 Token 是否过期
- 检查客户端和服务器端的 Token 是否一致
- 刷新 Token 后重试

### 3. Token 丢失

**问题：** 刷新页面后 Token 丢失。

**解决：**
- 检查存储位置（sessionStorage 会在关闭标签页后清除）
- 使用 localStorage 或 Cookie 持久化存储

## 性能考虑

### 1. Token 缓存

Token 会被缓存，避免每次请求都生成新的 Token。

### 2. 白名单优化

对于高频请求的公开 API，添加到白名单可以减少 Token 验证开销。

### 3. Token 刷新策略

根据应用特点选择合适的刷新策略：
- **不刷新**：Token 在过期前一直有效
- **定期刷新**：每隔一段时间刷新一次
- **每次请求刷新**：每次请求后刷新（安全性最高，但开销最大）

## 相关资源

- [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [MDN - CSRF](https://developer.mozilla.org/en-US/docs/Glossary/CSRF)
- [SameSite Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite)
