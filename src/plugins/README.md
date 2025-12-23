# Pinia 持久化插件

这是一个自定义的 Pinia 持久化插件，集成了我们的 CacheManager，提供了强大的状态持久化功能。

## 特性

- ✅ 自动状态持久化到 localStorage
- ✅ 支持选择性路径持久化（只持久化需要的字段）
- ✅ 支持嵌套路径（如 `user.name`）
- ✅ 支持加密存储（使用 AES-256）
- ✅ 支持 TTL（生存时间）
- ✅ 支持版本控制（自动清理旧版本缓存）
- ✅ 提供清除方法（`$clearPersisted()`）

## 使用方法

### 1. 注册插件

插件已在 `src/main.ts` 中注册：

```typescript
import { createPinia } from 'pinia'
import { createPiniaPersistence } from './plugins/pinia-persistence'

const pinia = createPinia()
pinia.use(createPiniaPersistence())
```

### 2. 在 Store 中配置持久化

#### 基础用法 - 持久化整个 store

```typescript
export const useUserStore = defineStore('user', {
  state: () => ({
    name: '',
    email: '',
    preferences: {},
  }),
  persist: {
    key: 'user_store', // 可选，默认为 'pinia_{store.$id}'
  },
})
```

#### 选择性持久化 - 只持久化指定字段

```typescript
export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null,
    refreshToken: null,
    userInfo: null,
    tempData: null, // 这个不会被持久化
  }),
  persist: {
    key: 'auth_store',
    paths: ['token', 'refreshToken', 'userInfo'], // 只持久化这些字段
  },
})
```

#### 嵌套路径持久化

```typescript
export const useSettingsStore = defineStore('settings', {
  state: () => ({
    user: {
      name: '',
      email: '',
      avatar: '',
    },
    app: {
      theme: 'light',
      language: 'zh-CN',
    },
  }),
  persist: {
    key: 'settings_store',
    paths: ['user.name', 'app.theme'], // 只持久化这些嵌套字段
  },
})
```

#### 加密存储 - 用于敏感数据

```typescript
export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null,
    refreshToken: null,
    userInfo: null,
  }),
  persist: {
    key: 'auth_store',
    paths: ['token', 'refreshToken', 'userInfo'],
    encrypted: true, // 启用加密
    ttl: 7 * 24 * 60 * 60 * 1000, // 7 天后过期
  },
})
```

### 3. 清除持久化状态

每个启用持久化的 store 都会获得一个 `$clearPersisted()` 方法：

```typescript
const authStore = useAuthStore()

// 登出时清除持久化状态
async function logout() {
  await logoutApi()
  authStore.$clearPersisted() // 清除持久化的数据
  authStore.$reset() // 重置 store 状态
}
```

## 配置选项

```typescript
interface PersistOptions {
  /** 存储键名，默认为 'pinia_{store.$id}' */
  key?: string
  
  /** 需要持久化的路径（支持点号路径，如 'user.name'） */
  paths?: string[]
  
  /** 是否启用加密，默认 false */
  encrypted?: boolean
  
  /** 缓存过期时间（毫秒），默认 7 天 */
  ttl?: number
}
```

## 工作原理

1. **初始化**：当 store 创建时，插件会从缓存中恢复状态
2. **自动保存**：使用 `store.$subscribe()` 监听状态变化，自动保存到缓存
3. **选择性持久化**：如果配置了 `paths`，只保存和恢复指定的字段
4. **加密支持**：如果启用加密，使用 `getSecureCacheManager()` 进行 AES-256 加密
5. **版本控制**：CacheManager 自动处理版本控制，旧版本缓存会被清理

## 注意事项

1. **加密密钥**：加密使用的密钥在 `src/utils/cache.ts` 中配置，生产环境应该从环境变量读取
2. **存储限制**：localStorage 有大小限制（通常 5-10MB），不要存储大量数据
3. **敏感数据**：对于 token、密码等敏感数据，建议启用加密
4. **性能考虑**：每次状态变化都会触发保存，对于频繁变化的状态，考虑使用防抖或只持久化部分字段
5. **清理策略**：登出时记得调用 `$clearPersisted()` 清除持久化数据

## 示例

查看 `src/store/auth.ts` 了解完整的使用示例。
