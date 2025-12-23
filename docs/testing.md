# 测试指南

## 概述

本项目使用 Vitest 作为测试框架，提供完整的单元测试和集成测试支持。

## 技术栈

- **测试框架**：Vitest 4.0+
- **组件测试**：@vue/test-utils
- **测试环境**：jsdom
- **覆盖率工具**：v8

## 快速开始

### 运行测试

```bash
# 运行所有测试
npm run test

# 运行测试并生成覆盖率报告
npm run test:coverage

# 监听模式运行测试
npm run test:watch

# 运行 UI 界面
npm run test:ui
```

### 编写测试

#### 1. 工具函数测试

```typescript
// src/utils/__tests__/example.test.ts
import { describe, it, expect } from 'vitest'
import { myFunction } from '../example'

describe('myFunction', () => {
  it('应该返回正确的结果', () => {
    const result = myFunction('input')
    expect(result).toBe('expected-output')
  })
})
```

#### 2. 组件测试

```typescript
// src/components/__tests__/MyComponent.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MyComponent from '../MyComponent.vue'

describe('MyComponent', () => {
  it('应该正确渲染', () => {
    const wrapper = mount(MyComponent, {
      props: {
        title: 'Test Title'
      }
    })
    
    expect(wrapper.text()).toContain('Test Title')
  })
  
  it('应该响应点击事件', async () => {
    const wrapper = mount(MyComponent)
    await wrapper.find('button').trigger('click')
    
    expect(wrapper.emitted('click')).toBeTruthy()
  })
})
```

#### 3. Composable 测试

```typescript
// src/composables/__tests__/useExample.test.ts
import { describe, it, expect } from 'vitest'
import { useExample } from '../useExample'

describe('useExample', () => {
  it('应该返回正确的状态', () => {
    const { state, action } = useExample()
    
    expect(state.value).toBe('initial')
    
    action()
    expect(state.value).toBe('updated')
  })
})
```

## 测试工具

### 测试工具函数

项目提供了一套测试工具函数（`src/test/utils.ts`），简化测试编写：

```typescript
import {
  createWrapper,
  flushPromises,
  wait,
  mockAxiosResponse,
  mockAxiosError,
  triggerInput,
  triggerClick,
  isVisible,
  getText,
  hasClass,
  mockLocalStorage,
  mockSessionStorage
} from '@/test/utils'

// 创建组件包装器
const wrapper = createWrapper(MyComponent, {
  props: { title: 'Test' }
})

// 等待异步操作
await flushPromises()

// 等待指定时间
await wait(1000)

// Mock Axios 响应
const response = mockAxiosResponse({ data: 'test' })

// Mock Axios 错误
const error = mockAxiosError('Error message', 500)

// 触发输入事件
await triggerInput(wrapper, 'input', 'test value')

// 触发点击事件
await triggerClick(wrapper, 'button')

// 检查元素是否可见
const visible = isVisible(wrapper, '.element')

// 获取元素文本
const text = getText(wrapper, '.element')

// 检查元素是否包含类名
const hasClassName = hasClass(wrapper, '.element', 'active')

// Mock localStorage
const storage = mockLocalStorage()
storage.setItem('key', 'value')
expect(storage.getItem('key')).toBe('value')
```

### Mock 数据

#### Mock localStorage

```typescript
import { vi } from 'vitest'

const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}

global.localStorage = localStorageMock as any
```

#### Mock Axios

```typescript
import { vi } from 'vitest'
import axios from 'axios'

vi.mock('axios')

const mockedAxios = axios as jest.Mocked<typeof axios>

mockedAxios.get.mockResolvedValue({
  data: { message: 'success' }
})
```

#### Mock Vue Router

```typescript
import { vi } from 'vitest'

const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  go: vi.fn(),
  back: vi.fn(),
  forward: vi.fn()
}

const mockRoute = {
  path: '/test',
  params: {},
  query: {}
}
```

## 测试最佳实践

### 1. 测试命名

使用清晰的测试描述：

```typescript
describe('UserService', () => {
  describe('login', () => {
    it('应该在凭据正确时返回用户信息', () => {
      // ...
    })
    
    it('应该在凭据错误时抛出错误', () => {
      // ...
    })
  })
})
```

### 2. 测试隔离

每个测试应该独立，不依赖其他测试：

```typescript
import { beforeEach, afterEach } from 'vitest'

describe('MyTest', () => {
  beforeEach(() => {
    // 每个测试前的设置
    localStorage.clear()
  })
  
  afterEach(() => {
    // 每个测试后的清理
    vi.clearAllMocks()
  })
  
  it('测试 1', () => {
    // ...
  })
  
  it('测试 2', () => {
    // ...
  })
})
```

### 3. 测试覆盖率

保持高测试覆盖率：

- **行覆盖率**：> 80%
- **分支覆盖率**：> 75%
- **函数覆盖率**：> 80%
- **语句覆盖率**：> 80%

### 4. 测试异步代码

正确处理异步操作：

```typescript
it('应该正确处理异步操作', async () => {
  const result = await asyncFunction()
  expect(result).toBe('expected')
})

it('应该正确处理 Promise 拒绝', async () => {
  await expect(asyncFunction()).rejects.toThrow('Error message')
})
```

### 5. 测试边界情况

测试边界情况和错误情况：

```typescript
describe('divide', () => {
  it('应该正确除法', () => {
    expect(divide(10, 2)).toBe(5)
  })
  
  it('应该在除数为 0 时抛出错误', () => {
    expect(() => divide(10, 0)).toThrow('除数不能为 0')
  })
  
  it('应该处理负数', () => {
    expect(divide(-10, 2)).toBe(-5)
  })
  
  it('应该处理小数', () => {
    expect(divide(10, 3)).toBeCloseTo(3.33, 2)
  })
})
```

## 测试配置

### vitest.config.ts

```typescript
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        'src/main.ts'
      ]
    },
    include: ['src/**/*.{test,spec}.{js,ts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache']
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
```

### package.json

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage"
  }
}
```

## CI/CD 集成

### GitHub Actions

```yaml
name: Test

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm run test:coverage
        
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

## 常见问题

### 1. 测试超时

增加测试超时时间：

```typescript
it('长时间运行的测试', async () => {
  // ...
}, 10000) // 10 秒超时
```

### 2. Mock 不生效

确保 Mock 在测试前设置：

```typescript
beforeEach(() => {
  vi.mock('module-name')
})
```

### 3. 组件测试失败

检查是否正确设置了全局配置：

```typescript
const wrapper = mount(Component, {
  global: {
    plugins: [router, pinia],
    stubs: ['router-link', 'router-view']
  }
})
```

## 参考资源

- [Vitest 文档](https://vitest.dev/)
- [Vue Test Utils 文档](https://test-utils.vuejs.org/)
- [Testing Library](https://testing-library.com/)

---

**更新时间**：2025-12-23
**版本**：1.0.0
