# 数据加密

本文档介绍数据加密功能的使用方法。

## 功能特性

- ✅ **多种加密算法**：支持 AES、DES、TripleDES、RC4
- ✅ **对象加密**：支持加密/解密 JavaScript 对象
- ✅ **哈希算法**：支持 MD5、SHA1、SHA256、SHA512
- ✅ **Base64 编码**：支持 Base64 编码/解码
- ✅ **HMAC 签名**：支持 HMAC 签名和验证
- ✅ **密钥生成**：支持生成随机密钥
- ✅ **类型安全**：完整的 TypeScript 类型定义

## 基础用法

### 1. 加密/解密字符串

```typescript
import { useCrypto } from '@/composables'

const { encrypt, decrypt } = useCrypto()

// 加密
const encrypted = encrypt('敏感数据')
console.log(encrypted) // 'U2FsdGVkX1...'

// 解密
const decrypted = decrypt(encrypted)
console.log(decrypted) // '敏感数据'
```

### 2. 加密/解密对象

```typescript
import { useCrypto } from '@/composables'

const { encryptObject, decryptObject } = useCrypto()

// 加密对象
const user = {
  username: 'admin',
  password: '123456',
  email: 'admin@example.com'
}
const encrypted = encryptObject(user)

// 解密对象
const decrypted = decryptObject<User>(encrypted)
console.log(decrypted) // { username: 'admin', ... }
```

### 3. 哈希

```typescript
import { useCrypto } from '@/composables'

const { hash } = useCrypto()

// 计算哈希
const hashed = hash('password123', 'SHA256')
console.log(hashed) // 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f'

// 不同算法
const md5Hash = hash('password123', 'MD5')
const sha1Hash = hash('password123', 'SHA1')
const sha512Hash = hash('password123', 'SHA512')
```

### 4. Base64 编码/解码

```typescript
import { useCrypto } from '@/composables'

const { base64Encode, base64Decode } = useCrypto()

// 编码
const encoded = base64Encode('Hello, World!')
console.log(encoded) // 'SGVsbG8sIFdvcmxkIQ=='

// 解码
const decoded = base64Decode(encoded)
console.log(decoded) // 'Hello, World!'
```

### 5. HMAC 签名

```typescript
import { useCrypto } from '@/composables'

const { hmac, verifyHmac } = useCrypto()

const data = 'important data'
const secretKey = 'my-secret-key'

// 生成签名
const signature = hmac(data, secretKey, 'SHA256')
console.log(signature) // '8f7e5b...'

// 验证签名
const isValid = verifyHmac(data, signature, secretKey, 'SHA256')
console.log(isValid) // true
```

### 6. 生成随机密钥

```typescript
import { useCrypto } from '@/composables'

const { generateKey } = useCrypto()

// 生成 32 字节密钥
const key = generateKey(32)
console.log(key) // '8f7e5b3c9d2a1e4f...'

// 生成 16 字节密钥
const shortKey = generateKey(16)
```

## 高级用法

### 1. 自定义加密配置

```typescript
import { createCrypto } from '@/utils/crypto'

// 创建自定义加密实例
const customCrypto = createCrypto({
  secretKey: 'my-custom-secret-key',
  algorithm: 'AES',
  encoding: 'Base64'
})

// 使用自定义实例
const encrypted = customCrypto.encrypt('data')
const decrypted = customCrypto.decrypt(encrypted)
```

### 2. 使用环境变量配置密钥

```bash
# .env
VITE_CRYPTO_SECRET_KEY=your-production-secret-key
```

```typescript
// 默认实例会自动使用环境变量中的密钥
import { crypto } from '@/utils/crypto'

const encrypted = crypto.encrypt('data')
```

### 3. 敏感数据存储

```typescript
import { useCrypto } from '@/composables'

const { encryptObject, decryptObject } = useCrypto()

// 存储敏感数据到 localStorage
function saveSecureData(key: string, data: any) {
  const encrypted = encryptObject(data)
  localStorage.setItem(key, encrypted)
}

// 读取敏感数据
function loadSecureData<T>(key: string): T | null {
  const encrypted = localStorage.getItem(key)
  if (!encrypted) return null
  
  try {
    return decryptObject<T>(encrypted)
  } catch (error) {
    console.error('解密失败:', error)
    return null
  }
}

// 使用
saveSecureData('user-token', { token: 'abc123', expiry: Date.now() })
const token = loadSecureData<{ token: string; expiry: number }>('user-token')
```

### 4. API 请求签名

```typescript
import { useCrypto } from '@/composables'

const { hmac } = useCrypto()

// 为 API 请求生成签名
function signRequest(method: string, url: string, body: any, secretKey: string) {
  const timestamp = Date.now()
  const data = `${method}${url}${JSON.stringify(body)}${timestamp}`
  const signature = hmac(data, secretKey, 'SHA256')
  
  return {
    timestamp,
    signature
  }
}

// 使用
const { timestamp, signature } = signRequest('POST', '/api/users', { name: 'John' }, 'secret')

// 发送请求时带上签名
fetch('/api/users', {
  method: 'POST',
  headers: {
    'X-Timestamp': timestamp.toString(),
    'X-Signature': signature
  },
  body: JSON.stringify({ name: 'John' })
})
```

### 5. 密码哈希

```typescript
import { useCrypto } from '@/composables'

const { hash } = useCrypto()

// 哈希密码（加盐）
function hashPassword(password: string, salt?: string): string {
  const actualSalt = salt || generateSalt()
  const hashed = hash(password + actualSalt, 'SHA256')
  return `${actualSalt}:${hashed}`
}

// 验证密码
function verifyPassword(password: string, hashedPassword: string): boolean {
  const [salt, hash] = hashedPassword.split(':')
  const newHash = hashPassword(password, salt)
  return newHash === hashedPassword
}

function generateSalt(): string {
  return Math.random().toString(36).substring(2, 15)
}

// 使用
const hashed = hashPassword('mypassword')
console.log(hashed) // 'abc123:ef92b778...'

const isValid = verifyPassword('mypassword', hashed)
console.log(isValid) // true
```

## API 参考

### CryptoUtil 类

#### 构造函数

```typescript
new CryptoUtil(config: CryptoConfig)
```

#### 实例方法

- `encrypt(data: string): string` - 加密数据
- `decrypt(encryptedData: string): string` - 解密数据
- `encryptObject<T>(obj: T): string` - 加密对象
- `decryptObject<T>(encryptedData: string): T` - 解密对象

#### 静态方法

- `hash(data: string, algorithm?: HashAlgorithm): string` - 哈希数据
- `base64Encode(data: string): string` - Base64 编码
- `base64Decode(base64Data: string): string` - Base64 解码
- `generateKey(length?: number): string` - 生成随机密钥
- `hmac(data: string, secretKey: string, algorithm?: HashAlgorithm): string` - HMAC 签名
- `verifyHmac(data: string, signature: string, secretKey: string, algorithm?: HashAlgorithm): boolean` - 验证 HMAC 签名

### useCrypto Composable

#### 返回值

```typescript
{
  // 状态
  isEncrypting: Ref<boolean>
  isDecrypting: Ref<boolean>
  isProcessing: ComputedRef<boolean>
  error: Ref<Error | null>
  hasError: ComputedRef<boolean>

  // 方法
  encrypt: (data: string) => string
  decrypt: (encryptedData: string) => string
  encryptObject: <T>(obj: T) => string
  decryptObject: <T>(encryptedData: string) => T
  hash: (data: string, algorithm?: HashAlgorithm) => string
  base64Encode: (data: string) => string
  base64Decode: (base64Data: string) => string
  hmac: (data: string, secretKey: string, algorithm?: HashAlgorithm) => string
  verifyHmac: (data: string, signature: string, secretKey: string, algorithm?: HashAlgorithm) => boolean
  generateKey: (length?: number) => string
}
```

## 类型定义

```typescript
// 加密配置
interface CryptoConfig {
  secretKey: string
  algorithm?: 'AES' | 'DES' | 'TripleDES' | 'RC4'
  encoding?: 'Base64' | 'Hex' | 'Latin1' | 'Utf8'
}

// 哈希算法
type HashAlgorithm = 'MD5' | 'SHA1' | 'SHA256' | 'SHA512'
```

## 安全建议

### 1. 密钥管理

- ❌ **不要**在代码中硬编码密钥
- ✅ **使用**环境变量存储密钥
- ✅ **定期**更换密钥
- ✅ **使用**强密钥（至少 32 字节）

```bash
# .env.production
VITE_CRYPTO_SECRET_KEY=your-very-strong-production-secret-key-here
```

### 2. 算法选择

- ✅ **推荐**使用 AES 算法（默认）
- ✅ **推荐**使用 SHA256 或 SHA512 哈希
- ❌ **避免**使用 MD5 和 SHA1（已不安全）

### 3. 数据传输

- ✅ **使用** HTTPS 传输加密数据
- ✅ **添加**时间戳防止重放攻击
- ✅ **使用** HMAC 签名验证数据完整性

### 4. 密码存储

- ❌ **不要**存储明文密码
- ❌ **不要**使用简单哈希存储密码
- ✅ **使用**加盐哈希存储密码
- ✅ **推荐**使用专门的密码哈希算法（如 bcrypt、scrypt）

## 注意事项

1. **前端加密的局限性**：前端加密主要用于防止数据在传输过程中被窃取，但无法防止恶意用户在浏览器中查看源代码。真正的安全应该在后端实现。

2. **密钥安全**：密钥存储在前端代码中是不安全的，应该通过安全的方式（如 HTTPS）从后端获取。

3. **性能考虑**：加密/解密操作会消耗 CPU 资源，对于大量数据或频繁操作，需要考虑性能影响。

4. **浏览器兼容性**：本工具使用 crypto-js 库，兼容所有现代浏览器。

## 示例

完整示例请查看：`src/views/examples/CryptoExample.vue`

## 相关资源

- [crypto-js 文档](https://github.com/brix/crypto-js)
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [OWASP 加密指南](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html)
