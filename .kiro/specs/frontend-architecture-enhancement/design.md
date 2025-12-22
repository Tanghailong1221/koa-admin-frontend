# Frontend Architecture Enhancement - Design Document

## Overview

This design document outlines the architectural enhancements to transform the existing Vue3 + Vite + Element Plus + Pinia admin framework into an enterprise-grade system. The design focuses on robustness, performance, developer experience, and production-readiness while maintaining the existing foundation.

The enhancement strategy follows a layered approach:
1. **Foundation Layer**: Enhanced state management, HTTP client, and error handling
2. **Component Layer**: ProComponent library and reusable UI patterns
3. **Business Layer**: Permission system, data dictionary, and domain logic
4. **Infrastructure Layer**: Build optimization, monitoring, and deployment

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Views      │  │ ProComponents│  │   Layouts    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                      Business Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Composables │  │  Permission  │  │  Dictionary  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                      State Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Pinia Stores │  │ Cache Manager│  │  Persistence │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                    Infrastructure Layer                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ HTTP Client  │  │ Error Handler│  │  Monitoring  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack Enhancements

**Core (Existing):**
- Vue 3.5+ with Composition API
- Vite 7+ with ESBuild
- TypeScript 5.9+
- Pinia 3+ for state management
- Vue Router 4+ for routing
- Element Plus 2+ for UI components
- Axios for HTTP

**New Additions:**
- **pinia-plugin-persistedstate**: State persistence with encryption
- **crypto-js**: AES encryption for sensitive data
- **@vueuse/core**: Utility composables
- **nprogress**: Loading progress bar
- **dayjs**: Date manipulation
- **lodash-es**: Utility functions (tree-shakeable)
- **@sentry/vue**: Error tracking and monitoring
- **web-vitals**: Performance metrics
- **msw**: API mocking for development and testing
- **exceljs**: Excel export functionality
- **vue-virtual-scroller**: Virtual scrolling for large lists
- **vue-i18n**: Internationalization
- **mousetrap**: Keyboard shortcuts
- **vite-plugin-compression**: Build compression
- **vite-plugin-imagemin**: Image optimization
- **unplugin-vue-components**: Auto-import components
- **vitest**: Unit testing
- **@vue/test-utils**: Component testing
- **playwright** (optional): E2E testing

## Components and Interfaces

### 1. Enhanced State Management

#### Store Architecture

```typescript
// src/store/types.ts
export interface StoreOptions {
  persist?: boolean
  encrypt?: boolean
  ttl?: number // Time to live in milliseconds
  version?: number
}

export interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
  version: number
}
```

#### Persistence Plugin

```typescript
// src/plugins/pinia-persistence.ts
import { PiniaPluginContext } from 'pinia'
import CryptoJS from 'crypto-js'

interface PersistOptions {
  key?: string
  storage?: Storage
  paths?: string[]
  encrypt?: boolean
  version?: number
}

export function createPersistedState(options: PersistOptions) {
  return (context: PiniaPluginContext) => {
    // Implementation details
  }
}
```

#### Cache Manager

```typescript
// src/utils/cache.ts
export class CacheManager {
  private storage: Storage
  private prefix: string
  
  constructor(storage: Storage = localStorage, prefix = 'app_cache_')
  
  set<T>(key: string, value: T, ttl?: number): void
  get<T>(key: string): T | null
  has(key: string): boolean
  remove(key: string): void
  clear(): void
  isExpired(key: string): boolean
}
```

### 2. Advanced HTTP Client

#### Request Queue and Deduplication

```typescript
// src/utils/request/queue.ts
export class RequestQueue {
  private queue: Map<string, Promise<any>>
  private pending: Map<string, AbortController>
  
  deduplicate<T>(key: string, request: () => Promise<T>): Promise<T>
  cancel(key: string): void
  cancelAll(): void
}
```

#### Retry Strategy

```typescript
// src/utils/request/retry.ts
export interface RetryConfig {
  maxRetries: number
  retryDelay: number
  retryCondition: (error: any) => boolean
  onRetry?: (retryCount: number, error: any) => void
}

export class RetryStrategy {
  async execute<T>(
    request: () => Promise<T>,
    config: RetryConfig
  ): Promise<T>
}
```

#### Offline Queue

```typescript
// src/utils/request/offline.ts
export interface QueuedRequest {
  id: string
  config: AxiosRequestConfig
  timestamp: number
  priority: 'high' | 'normal' | 'low'
}

export class OfflineQueue {
  private queue: QueuedRequest[]
  private maxSize: number
  
  enqueue(request: QueuedRequest): void
  dequeue(): QueuedRequest | undefined
  replay(): Promise<void>
  clear(): void
}
```

### 3. Error Handling System

#### Error Boundary Component

```typescript
// src/components/common/ErrorBoundary.vue
<script setup lang="ts">
interface Props {
  fallback?: Component
  onError?: (error: Error, instance: ComponentPublicInstance) => void
}

const props = defineProps<Props>()
const error = ref<Error | null>(null)

onErrorCaptured((err, instance, info) => {
  error.value = err
  props.onError?.(err, instance)
  return false // Prevent propagation
})

const retry = () => {
  error.value = null
}
</script>
```

#### Error Logger

```typescript
// src/utils/error-logger.ts
export interface ErrorContext {
  userId?: string
  route?: string
  userAgent: string
  timestamp: number
  extra?: Record<string, any>
}

export class ErrorLogger {
  private sentry?: typeof Sentry
  
  captureException(error: Error, context: ErrorContext): void
  captureMessage(message: string, level: 'info' | 'warning' | 'error'): void
  setUser(user: { id: string; username: string }): void
}
```

### 4. ProComponent Library

#### ProTable Component

```typescript
// src/components/pro/ProTable/types.ts
export interface ProTableColumn<T = any> {
  prop: keyof T
  label: string
  width?: number | string
  minWidth?: number | string
  fixed?: 'left' | 'right'
  sortable?: boolean | 'custom'
  filterable?: boolean
  formatter?: (row: T, column: ProTableColumn<T>, cellValue: any) => any
  render?: (row: T) => VNode
  hideInTable?: boolean
  hideInSearch?: boolean
  valueType?: 'text' | 'number' | 'date' | 'select' | 'dict'
  valueEnum?: Record<string, { text: string; status?: string }>
  dictType?: string
}

export interface ProTableProps<T = any> {
  columns: ProTableColumn<T>[]
  request?: (params: any) => Promise<{ data: T[]; total: number }>
  dataSource?: T[]
  rowKey?: string | ((row: T) => string)
  pagination?: boolean | PaginationProps
  selection?: boolean | 'single' | 'multiple'
  toolbar?: boolean
  search?: boolean | SearchConfig
  virtual?: boolean
  exportable?: boolean
}
```

#### ProForm Component

```typescript
// src/components/pro/ProForm/types.ts
export interface ProFormField {
  name: string
  label: string
  type: 'input' | 'textarea' | 'number' | 'select' | 'date' | 'daterange' | 
        'upload' | 'switch' | 'radio' | 'checkbox' | 'cascader' | 'dict'
  placeholder?: string
  required?: boolean
  rules?: FormItemRule[]
  props?: Record<string, any>
  options?: Array<{ label: string; value: any }>
  dictType?: string
  span?: number
  hidden?: boolean | ((values: any) => boolean)
  disabled?: boolean | ((values: any) => boolean)
  dependencies?: string[]
}

export interface ProFormProps {
  fields: ProFormField[]
  modelValue: Record<string, any>
  layout?: 'horizontal' | 'vertical' | 'inline'
  labelWidth?: string | number
  grid?: boolean
  columns?: number
  readonly?: boolean
  loading?: boolean
}
```

### 5. Permission System

#### Permission Manager

```typescript
// src/utils/permission.ts
export interface Permission {
  code: string
  name: string
  type: 'menu' | 'button' | 'data'
}

export class PermissionManager {
  private permissions: Set<string>
  
  setPermissions(permissions: Permission[]): void
  hasPermission(code: string | string[]): boolean
  hasAnyPermission(codes: string[]): boolean
  hasAllPermissions(codes: string[]): boolean
  filterByPermission<T>(items: T[], getPermission: (item: T) => string): T[]
}
```

#### Permission Directive

```typescript
// src/directives/permission.ts
export const vPermission: Directive = {
  mounted(el, binding) {
    const { value } = binding
    const permissionManager = usePermissionManager()
    
    if (!permissionManager.hasPermission(value)) {
      el.parentNode?.removeChild(el)
    }
  }
}
```

#### Data-Level Permission Interceptor

```typescript
// src/utils/request/permission-interceptor.ts
export function injectDataPermission(config: AxiosRequestConfig): AxiosRequestConfig {
  const authStore = useAuthStore()
  const { orgId, roleId } = authStore.userInfo || {}
  
  // Inject organization and role filters for data-level permissions
  if (config.params && orgId) {
    config.params.orgId = orgId
  }
  
  return config
}
```

### 6. Performance Optimization

#### Code Splitting Strategy

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'element-plus': ['element-plus', '@element-plus/icons-vue'],
          'utils': ['axios', 'dayjs', 'lodash-es'],
          'charts': ['echarts'], // If using charts
        }
      }
    },
    chunkSizeWarningLimit: 500
  }
})
```

#### Route Prefetching

```typescript
// src/router/prefetch.ts
export function setupRoutePrefetch(router: Router) {
  router.beforeResolve((to, from, next) => {
    // Prefetch likely next routes based on current route
    const nextRoutes = predictNextRoutes(to)
    nextRoutes.forEach(route => {
      router.resolve(route).matched.forEach(record => {
        if (record.components?.default) {
          // Trigger component loading
        }
      })
    })
    next()
  })
}
```

#### Image Lazy Loading

```typescript
// src/directives/lazy-load.ts
export const vLazyLoad: Directive = {
  mounted(el: HTMLImageElement, binding) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          el.src = binding.value
          observer.unobserve(el)
        }
      })
    })
    observer.observe(el)
  }
}
```

### 7. Form Management

#### Form Draft Manager

```typescript
// src/composables/useFormDraft.ts
export interface FormDraftOptions {
  key: string
  autoSave?: boolean
  saveInterval?: number
  onRestore?: (draft: any) => void
}

export function useFormDraft<T extends Record<string, any>>(
  formData: Ref<T>,
  options: FormDraftOptions
) {
  const saveDraft = () => {
    localStorage.setItem(options.key, JSON.stringify(formData.value))
  }
  
  const loadDraft = (): T | null => {
    const draft = localStorage.getItem(options.key)
    return draft ? JSON.parse(draft) : null
  }
  
  const clearDraft = () => {
    localStorage.removeItem(options.key)
  }
  
  // Auto-save implementation
  if (options.autoSave) {
    watchDebounced(formData, saveDraft, { 
      debounce: options.saveInterval || 30000 
    })
  }
  
  return { saveDraft, loadDraft, clearDraft }
}
```

#### Form Validation Composable

```typescript
// src/composables/useFormValidation.ts
export function useFormValidation(formRef: Ref<FormInstance | undefined>) {
  const validate = async (): Promise<boolean> => {
    if (!formRef.value) return false
    try {
      await formRef.value.validate()
      return true
    } catch {
      return false
    }
  }
  
  const validateField = async (prop: string): Promise<boolean> => {
    if (!formRef.value) return false
    try {
      await formRef.value.validateField(prop)
      return true
    } catch {
      return false
    }
  }
  
  const clearValidate = (props?: string | string[]) => {
    formRef.value?.clearValidate(props)
  }
  
  const resetFields = () => {
    formRef.value?.resetFields()
  }
  
  return { validate, validateField, clearValidate, resetFields }
}
```

### 8. Theme System

#### Theme Manager

```typescript
// src/utils/theme.ts
export interface ThemeConfig {
  primaryColor: string
  successColor: string
  warningColor: string
  dangerColor: string
  infoColor: string
  darkMode: boolean
}

export class ThemeManager {
  private config: ThemeConfig
  
  setTheme(config: Partial<ThemeConfig>): void {
    this.config = { ...this.config, ...config }
    this.applyTheme()
  }
  
  toggleDarkMode(): void {
    this.config.darkMode = !this.config.darkMode
    this.applyTheme()
  }
  
  private applyTheme(): void {
    const root = document.documentElement
    
    // Apply CSS variables
    root.style.setProperty('--el-color-primary', this.config.primaryColor)
    // ... other colors
    
    // Toggle dark mode class
    if (this.config.darkMode) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }
}
```

### 9. Table Enhancements

#### Column Configuration Manager

```typescript
// src/composables/useTableColumns.ts
export interface ColumnConfig {
  prop: string
  visible: boolean
  width?: number
  order: number
}

export function useTableColumns(tableKey: string, defaultColumns: ProTableColumn[]) {
  const storageKey = `table_columns_${tableKey}`
  
  const loadConfig = (): ColumnConfig[] => {
    const saved = localStorage.getItem(storageKey)
    return saved ? JSON.parse(saved) : defaultColumns.map((col, index) => ({
      prop: col.prop as string,
      visible: true,
      width: col.width,
      order: index
    }))
  }
  
  const saveConfig = (config: ColumnConfig[]) => {
    localStorage.setItem(storageKey, JSON.stringify(config))
  }
  
  const config = ref(loadConfig())
  
  const visibleColumns = computed(() => {
    return config.value
      .filter(c => c.visible)
      .sort((a, b) => a.order - b.order)
      .map(c => defaultColumns.find(col => col.prop === c.prop)!)
      .filter(Boolean)
  })
  
  return { config, visibleColumns, saveConfig }
}
```

#### Export Manager

```typescript
// src/utils/export.ts
import ExcelJS from 'exceljs'

export interface ExportOptions {
  filename: string
  columns: Array<{ header: string; key: string; width?: number }>
  data: any[]
  format: 'xlsx' | 'csv'
}

export class ExportManager {
  async exportToExcel(options: ExportOptions): Promise<void> {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Sheet1')
    
    worksheet.columns = options.columns
    worksheet.addRows(options.data)
    
    const buffer = await workbook.xlsx.writeBuffer()
    this.downloadFile(buffer, options.filename, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  }
  
  async exportToCSV(options: ExportOptions): Promise<void> {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Sheet1')
    
    worksheet.columns = options.columns
    worksheet.addRows(options.data)
    
    const buffer = await workbook.csv.writeBuffer()
    this.downloadFile(buffer, options.filename, 'text/csv')
  }
  
  private downloadFile(buffer: ArrayBuffer, filename: string, mimeType: string): void {
    const blob = new Blob([buffer], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }
}
```

### 10. Testing Infrastructure

#### Test Utilities

```typescript
// src/test/utils.ts
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import ElementPlus from 'element-plus'

export function createTestingPinia(options = {}) {
  return createPinia()
}

export function createTestRouter(routes = []) {
  return createRouter({
    history: createMemoryHistory(),
    routes
  })
}

export function mountWithProviders(component: any, options = {}) {
  const pinia = createTestingPinia()
  const router = createTestRouter()
  
  return mount(component, {
    global: {
      plugins: [pinia, router, ElementPlus],
      ...options.global
    },
    ...options
  })
}
```

#### MSW Setup

```typescript
// src/test/mocks/handlers.ts
import { http, HttpResponse } from 'msw'

export const handlers = [
  http.post('/api/v1/user/login', async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({
      code: 0,
      data: {
        token: 'mock-token',
        refreshToken: 'mock-refresh-token',
        userInfo: { id: '1', username: body.username }
      }
    })
  }),
  
  http.get('/api/v1/user/current', () => {
    return HttpResponse.json({
      code: 0,
      data: { id: '1', username: 'admin', nickname: 'Admin' }
    })
  })
]
```

### 11. Developer Tools

#### CLI Scaffolding

```typescript
// scripts/generate.ts
import { Command } from 'commander'
import fs from 'fs-extra'
import path from 'path'

const program = new Command()

program
  .command('page <name>')
  .description('Generate a CRUD page')
  .action(async (name: string) => {
    const moduleName = name.toLowerCase()
    const ComponentName = name.charAt(0).toUpperCase() + name.slice(1)
    
    // Generate files
    await generateView(moduleName, ComponentName)
    await generateAPI(moduleName)
    await generateTypes(moduleName, ComponentName)
    await generateRoute(moduleName, ComponentName)
    
    console.log(`✅ Generated ${name} module successfully!`)
  })

program.parse()
```

## Data Models

### User Model

```typescript
export interface User {
  id: string
  username: string
  nickname?: string
  avatar?: string
  email?: string
  phone?: string
  gender?: 0 | 1 | 2
  birthday?: string
  status: 0 | 1 // 0: disabled, 1: enabled
  roleId?: number
  roleName?: string
  orgId?: number
  orgName?: string
  positionId?: number
  positionName?: string
  permissions?: string[]
  createdAt: string
  updatedAt: string
}
```

### Menu Model

```typescript
export interface Menu {
  id: string
  parentId: string | null
  name: string
  path: string
  component?: string
  icon?: string
  type: 'menu' | 'button'
  permission?: string
  sort: number
  visible: boolean
  children?: Menu[]
  meta?: {
    title: string
    keepAlive?: boolean
    affix?: boolean
  }
}
```

### Role Model

```typescript
export interface Role {
  id: number
  name: string
  code: string
  description?: string
  status: 0 | 1
  menuIds: string[]
  permissions: string[]
  createdAt: string
  updatedAt: string
}
```

### Dictionary Model

```typescript
export interface DictType {
  id: number
  code: string
  name: string
  description?: string
  status: 0 | 1
  items?: DictItem[]
}

export interface DictItem {
  id: number
  typeCode: string
  label: string
  value: string
  sort: number
  status: 0 | 1
  color?: string
  extra?: Record<string, any>
}
```

### Pagination Model

```typescript
export interface PaginationParams {
  page: number
  pageSize: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginationResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### State Management Properties

**Property 1: State persistence round-trip**
*For any* state data with encryption enabled, encrypting and then decrypting should produce equivalent data
**Validates: Requirements 1.1, 1.2, 1.4**

**Property 2: Cache expiration consistency**
*For any* cached data with TTL, accessing the data after TTL expiration should return null or trigger a refresh
**Validates: Requirements 1.3**

**Property 3: Logout state cleanup**
*For any* application state, performing logout should result in all persisted storage being cleared and stores reset to initial values
**Validates: Requirements 1.5**

### HTTP Layer Properties

**Property 4: Retry with exponential backoff**
*For any* request that fails with retryable error (timeout, 5xx), the system should retry up to 3 times with increasing delays
**Validates: Requirements 2.1**

**Property 5: Request deduplication**
*For any* set of concurrent identical requests, only one actual HTTP call should be made and all callers should receive the same result
**Validates: Requirements 2.2**

**Property 6: Offline queue replay**
*For any* requests made while offline, they should be queued and replayed in order when connection is restored
**Validates: Requirements 2.3**

**Property 7: Queue size limit**
*For any* offline queue, when size exceeds 50 items, the oldest non-critical requests should be dropped
**Validates: Requirements 2.4**

**Property 8: Request cancellation cleanup**
*For any* cancelled request, the underlying HTTP call should be aborted and resources cleaned up
**Validates: Requirements 2.5**

### Error Handling Properties

**Property 9: Business error message sanitization**
*For any* business error, the displayed message should not contain technical details like stack traces or internal paths
**Validates: Requirements 3.2**

**Property 10: Error logging completeness**
*For any* logged error, the log entry should include user context, route, timestamp, and browser information
**Validates: Requirements 3.3, 3.5**

**Property 11: Network error classification**
*For any* network error, the system should correctly classify it as timeout, offline, or server error with appropriate messaging
**Validates: Requirements 3.4**

### ProComponent Properties

**Property 12: ProTable configuration rendering**
*For any* valid ProTable configuration with columns and data, the table should render with all specified features (pagination, sorting, filtering)
**Validates: Requirements 4.1**

**Property 13: Column configuration persistence**
*For any* table column customization (visibility, order, width), the configuration should persist across sessions
**Validates: Requirements 4.2**

**Property 14: ProForm schema validation**
*For any* ProForm with validation rules, submitting invalid data should display field-level errors and prevent submission
**Validates: Requirements 4.3, 4.4**

### Permission Properties

**Property 15: Route permission enforcement**
*For any* route with permission requirements, navigation should only succeed if user has required permissions
**Validates: Requirements 5.1**

**Property 16: Directive permission hiding**
*For any* element with v-perm directive, the element should be removed from DOM if user lacks the specified permission
**Validates: Requirements 5.2**

**Property 17: Data-level permission injection**
*For any* API request, organization and role filters should be automatically injected based on user context
**Validates: Requirements 5.3**

**Property 18: Permission refresh propagation**
*For any* 