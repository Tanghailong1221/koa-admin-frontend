## Error Handling

### Error Classification

The system implements a three-tier error classification:

1. **User Errors**: Input validation, permission denied, resource not found
   - Display user-friendly messages
   - Provide actionable guidance
   - No logging to external services

2. **Business Errors**: API business logic failures, state conflicts
   - Display sanitized error messages
   - Log to console in development
   - Optional logging to monitoring in production

3. **System Errors**: Network failures, unexpected exceptions, component crashes
   - Display generic error messages to users
   - Log full details to monitoring service
   - Capture context for debugging

### Error Handling Strategy

#### Component-Level Errors

```typescript
// ErrorBoundary wraps route components
<ErrorBoundary @error="handleError">
  <RouterView />
</ErrorBoundary>

// Fallback UI with retry
<template v-if="error">
  <div class="error-fallback">
    <h3>Something went wrong</h3>
    <p>{{ error.message }}</p>
    <el-button @click="retry">Try Again</el-button>
  </div>
</template>
```

#### API Error Handling

```typescript
// Axios interceptor handles all API errors
instance.interceptors.response.use(
  response => response,
  error => {
    const { response, message } = error
    
    // Network errors
    if (!response) {
      if (message.includes('timeout')) {
        ElMessage.error('Request timeout, please try again')
      } else if (message.includes('Network Error')) {
        ElMessage.error('Network error, please check your connection')
      }
      return Promise.reject(error)
    }
    
    // HTTP errors
    const { status, data } = response
    switch (status) {
      case 400:
        ElMessage.error(data.message || 'Invalid request')
        break
      case 401:
        // Handle in separate interceptor
        break
      case 403:
        ElMessage.error('Permission denied')
        router.push('/403')
        break
      case 404:
        ElMessage.error('Resource not found')
        break
      case 500:
      case 502:
      case 503:
        ElMessage.error('Server error, please try again later')
        errorLogger.captureException(error, getErrorContext())
        break
      default:
        ElMessage.error(data.message || 'Unknown error occurred')
    }
    
    return Promise.reject(error)
  }
)
```

#### Global Error Handler

```typescript
// main.ts
app.config.errorHandler = (err, instance, info) => {
  console.error('Global error:', err, info)
  
  // Log to monitoring service
  errorLogger.captureException(err as Error, {
    userId: useAuthStore().userInfo?.id,
    route: router.currentRoute.value.fullPath,
    userAgent: navigator.userAgent,
    timestamp: Date.now(),
    extra: { info, componentName: instance?.$options.name }
  })
  
  // Show user-friendly message
  ElMessage.error('An unexpected error occurred')
}
```

### Error Recovery Strategies

1. **Automatic Retry**: Network errors and timeouts
2. **Fallback UI**: Component errors with retry button
3. **Graceful Degradation**: Disable features when dependencies fail
4. **State Recovery**: Restore from persisted state after errors
5. **User Guidance**: Clear messages with next steps

## Testing Strategy

### Testing Pyramid

```
        /\
       /  \
      / E2E \
     /--------\
    /Integration\
   /--------------\
  /   Unit Tests   \
 /------------------\
```

### Unit Testing

**Scope**: Utilities, composables, stores, pure functions

**Tools**: Vitest + @vue/test-utils

**Coverage Target**: 80% for core utilities and business logic

**Example Test Structure**:

```typescript
// src/utils/__tests__/cache.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { CacheManager } from '../cache'

describe('CacheManager', () => {
  let cache: CacheManager
  
  beforeEach(() => {
    cache = new CacheManager(localStorage, 'test_')
    localStorage.clear()
  })
  
  afterEach(() => {
    localStorage.clear()
  })
  
  it('should store and retrieve data', () => {
    cache.set('key1', { value: 'test' })
    expect(cache.get('key1')).toEqual({ value: 'test' })
  })
  
  it('should respect TTL expiration', async () => {
    cache.set('key2', 'value', 100) // 100ms TTL
    expect(cache.get('key2')).toBe('value')
    
    await new Promise(resolve => setTimeout(resolve, 150))
    expect(cache.get('key2')).toBeNull()
  })
  
  it('should handle version mismatch', () => {
    cache.set('key3', 'v1', undefined, 1)
    // Simulate version upgrade
    cache = new CacheManager(localStorage, 'test_', 2)
    expect(cache.get('key3')).toBeNull()
  })
})
```

### Component Testing

**Scope**: ProComponents, common components, views

**Tools**: Vitest + @vue/test-utils + Element Plus

**Focus**: Rendering, user interactions, props/events, edge cases

**Example Test**:

```typescript
// src/components/pro/__tests__/ProTable.test.ts
import { describe, it, expect, vi } from 'vitest'
import { mountWithProviders } from '@/test/utils'
import ProTable from '../ProTable.vue'

describe('ProTable', () => {
  const mockColumns = [
    { prop: 'name', label: 'Name' },
    { prop: 'age', label: 'Age' }
  ]
  
  const mockData = [
    { id: 1, name: 'John', age: 30 },
    { id: 2, name: 'Jane', age: 25 }
  ]
  
  it('should render table with data', () => {
    const wrapper = mountWithProviders(ProTable, {
      props: {
        columns: mockColumns,
        dataSource: mockData,
        rowKey: 'id'
      }
    })
    
    expect(wrapper.find('.el-table').exists()).toBe(true)
    expect(wrapper.findAll('.el-table__row')).toHaveLength(2)
  })
  
  it('should handle pagination', async () => {
    const mockRequest = vi.fn().mockResolvedValue({
      data: mockData,
      total: 100
    })
    
    const wrapper = mountWithProviders(ProTable, {
      props: {
        columns: mockColumns,
        request: mockRequest,
        pagination: { pageSize: 10 }
      }
    })
    
    await wrapper.vm.$nextTick()
    expect(mockRequest).toHaveBeenCalledWith({ page: 1, pageSize: 10 })
    
    // Simulate page change
    await wrapper.find('.el-pagination__next').trigger('click')
    expect(mockRequest).toHaveBeenCalledWith({ page: 2, pageSize: 10 })
  })
  
  it('should support column visibility toggle', async () => {
    const wrapper = mountWithProviders(ProTable, {
      props: {
        columns: mockColumns,
        dataSource: mockData,
        toolbar: true
      }
    })
    
    // Open column settings
    await wrapper.find('.column-settings-btn').trigger('click')
    
    // Hide first column
    await wrapper.findAll('.column-checkbox')[0].trigger('click')
    
    // Verify column is hidden
    expect(wrapper.findAll('.el-table__header th')).toHaveLength(1)
  })
})
```

### Integration Testing

**Scope**: Authentication flow, permission system, API integration

**Tools**: Vitest + MSW for API mocking

**Focus**: Multi-component interactions, state management, routing

**Example Test**:

```typescript
// src/__tests__/integration/auth-flow.test.ts
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { setupServer } from 'msw/node'
import { handlers } from '@/test/mocks/handlers'
import { createTestingPinia } from '@/test/utils'
import { useAuthStore } from '@/store/auth'

const server = setupServer(...handlers)

describe('Authentication Flow', () => {
  beforeAll(() => server.listen())
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())
  
  it('should complete login flow', async () => {
    const pinia = createTestingPinia()
    const authStore = useAuthStore(pinia)
    
    await authStore.login({
      username: 'admin',
      password: 'admin123'
    })
    
    expect(authStore.isLoggedIn).toBe(true)
    expect(authStore.token).toBeTruthy()
    expect(authStore.userInfo).toMatchObject({
      username: 'admin'
    })
  })
  
  it('should handle token refresh', async () => {
    const pinia = createTestingPinia()
    const authStore = useAuthStore(pinia)
    
    // Set expired token
    authStore.setToken('expired-token', 'refresh-token')
    
    // Trigger refresh
    await authStore.refreshTokenAction()
    
    expect(authStore.token).not.toBe('expired-token')
    expect(authStore.token).toBeTruthy()
  })
  
  it('should clear state on logout', async () => {
    const pinia = createTestingPinia()
    const authStore = useAuthStore(pinia)
    
    await authStore.login({
      username: 'admin',
      password: 'admin123'
    })
    
    await authStore.logout()
    
    expect(authStore.isLoggedIn).toBe(false)
    expect(authStore.token).toBeNull()
    expect(authStore.userInfo).toBeNull()
  })
})
```

### Property-Based Testing

**Library**: fast-check (JavaScript property-based testing)

**Scope**: Critical algorithms, data transformations, validation logic

**Configuration**: Minimum 100 iterations per property

**Example**:

```typescript
// src/utils/__tests__/encryption.property.test.ts
import { describe, it } from 'vitest'
import fc from 'fast-check'
import { encrypt, decrypt } from '../encryption'

describe('Encryption Properties', () => {
  it('Property 1: Encryption round-trip', () => {
    fc.assert(
      fc.property(fc.string(), fc.string(), (data, key) => {
        const encrypted = encrypt(data, key)
        const decrypted = decrypt(encrypted, key)
        return decrypted === data
      }),
      { numRuns: 100 }
    )
  })
  
  it('Property 52: Sensitive data encryption', () => {
    fc.assert(
      fc.property(fc.object(), (sensitiveData) => {
        const key = 'test-key'
        const encrypted = encrypt(JSON.stringify(sensitiveData), key)
        
        // Encrypted data should not contain original values
        const dataString = JSON.stringify(sensitiveData)
        return !encrypted.includes(dataString)
      }),
      { numRuns: 100 }
    )
  })
})
```

### E2E Testing (Optional)

**Tool**: Playwright

**Scope**: Critical user journeys

**Focus**: Login → CRUD operations → Logout

**Example**:

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should login and access dashboard', async ({ page }) => {
    await page.goto('http://localhost:5173/login')
    
    await page.fill('input[name="username"]', 'admin')
    await page.fill('input[name="password"]', 'admin123')
    await page.click('button[type="submit"]')
    
    await expect(page).toHaveURL(/\/dashboard/)
    await expect(page.locator('.user-info')).toContainText('admin')
  })
  
  test('should handle invalid credentials', async ({ page }) => {
    await page.goto('http://localhost:5173/login')
    
    await page.fill('input[name="username"]', 'invalid')
    await page.fill('input[name="password"]', 'wrong')
    await page.click('button[type="submit"]')
    
    await expect(page.locator('.el-message--error')).toBeVisible()
  })
})
```

### Testing Best Practices

1. **Test Behavior, Not Implementation**: Focus on what components do, not how
2. **Use Realistic Data**: Generate data that matches production patterns
3. **Isolate Tests**: Each test should be independent and repeatable
4. **Mock External Dependencies**: Use MSW for API, mock timers for delays
5. **Test Edge Cases**: Empty states, errors, loading states, boundaries
6. **Maintain Test Speed**: Unit tests < 1s, integration tests < 5s
7. **Tag Property Tests**: Use comments to link tests to design properties

### CI/CD Integration

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test:unit -- --coverage
      - run: npm run test:integration
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

### Test Coverage Goals

- **Utilities**: 90%+ coverage
- **Stores**: 85%+ coverage
- **Components**: 75%+ coverage
- **Overall**: 80%+ coverage
- **Critical Paths**: 100% coverage (auth, permissions, data persistence)

