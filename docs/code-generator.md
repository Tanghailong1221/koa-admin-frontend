# 代码生成器

代码生成器用于快速生成页面、组件、API、Store 等代码,提升开发效率。

## 功能特性

- ✅ 生成页面(支持 ProTable 和 ProForm)
- ✅ 生成组件(支持 Props 和 Emits)
- ✅ 生成 API 模块(包含 CRUD 接口)
- ✅ 生成 Pinia Store(支持持久化)
- ✅ 交互式命令行界面
- ✅ 自动创建目录
- ✅ 代码规范统一

## 快速开始

### 安装依赖

代码生成器依赖以下包:

```bash
npm install commander inquirer chalk ora --save-dev
```

### 使用方法

#### 方式 1: 使用 npm scripts

```bash
# 生成页面
npm run g:page

# 生成组件
npm run g:comp

# 生成 API
npm run g:api

# 生成 Store
npm run g:store
```

#### 方式 2: 直接运行脚本

```bash
# 生成页面
node scripts/generate.js page

# 生成组件
node scripts/generate.js component

# 生成 API
node scripts/generate.js api

# 生成 Store
node scripts/generate.js store
```

## 生成页面

### 使用示例

```bash
npm run g:page
```

### 交互式问答

1. **页面名称**: 例如 `UserList` (必须以大写字母开头)
2. **页面路径**: 例如 `system/user` (默认根据页面名称生成)
3. **页面标题**: 例如 `用户列表`
4. **是否使用 ProTable**: 是/否
5. **是否使用 ProForm**: 是/否

### 生成的文件

```
src/views/system/user/UserList.vue
```

### 生成的代码

生成的页面包含:

- ✅ 完整的页面结构
- ✅ ProTable 或基础表格
- ✅ ProForm 或基础表单
- ✅ CRUD 操作方法
- ✅ TypeScript 类型定义
- ✅ 样式文件

### 示例代码

```vue
<template>
  <div class="userlist-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用户列表</span>
          <el-button type="primary" @click="handleAdd">新增</el-button>
        </div>
      </template>

      <ProTable
        ref="tableRef"
        :columns="columns"
        :request="loadData"
        selectable
      >
        <!-- 自定义列 -->
      </ProTable>
    </el-card>

    <!-- 表单对话框 -->
  </div>
</template>

<script setup lang="ts">
// 完整的 TypeScript 代码
</script>
```

## 生成组件

### 使用示例

```bash
npm run g:comp
```

### 交互式问答

1. **组件名称**: 例如 `UserCard` (必须以大写字母开头)
2. **组件路径**: 例如 `user` (默认根据组件名称生成)
3. **是否需要 Props**: 是/否
4. **是否需要 Emits**: 是/否

### 生成的文件

```
src/components/user/UserCard.vue
src/components/user/index.ts
```

### 生成的代码

```vue
<template>
  <div class="usercard">
    <slot />
  </div>
</template>

<script setup lang="ts">
interface Props {
  // Props 定义
}

const props = withDefaults(defineProps<Props>(), {
  // 默认值
})

interface Emits {
  // Emits 定义
}

const emit = defineEmits<Emits>()
</script>

<style scoped lang="scss">
.usercard {
  // 样式
}
</style>
```

### 使用生成的组件

```typescript
import { UserCard } from '@/components/user'
```

## 生成 API

### 使用示例

```bash
npm run g:api
```

### 交互式问答

1. **API 模块名称**: 例如 `user` (必须以小写字母开头)
2. **API 基础路径**: 例如 `/user` (默认根据模块名称生成)

### 生成的文件

```
src/api/user.ts
```

### 生成的代码

```typescript
/**
 * User API
 */

import request from '@/utils/request'

export interface User {
  id: number
  name: string
  status: number
  createTime: string
}

export interface UserQuery {
  page?: number
  pageSize?: number
  name?: string
  status?: number
}

// 获取列表
export function getUserList(params?: UserQuery) {
  return request<{ data: User[]; total: number }>({
    url: '/user/list',
    method: 'get',
    params
  })
}

// 获取详情
export function getUserDetail(id: number) {
  return request<User>({
    url: `/user/${id}`,
    method: 'get'
  })
}

// 创建
export function createUser(data: Partial<User>) {
  return request({
    url: '/user',
    method: 'post',
    data
  })
}

// 更新
export function updateUser(id: number, data: Partial<User>) {
  return request({
    url: `/user/${id}`,
    method: 'put',
    data
  })
}

// 删除
export function deleteUser(id: number) {
  return request({
    url: `/user/${id}`,
    method: 'delete'
  })
}
```

### 使用生成的 API

```typescript
import { getUserList, createUser } from '@/api/user'

// 获取列表
const { data, total } = await getUserList({ page: 1, pageSize: 10 })

// 创建用户
await createUser({ name: '张三', status: 1 })
```

## 生成 Store

### 使用示例

```bash
npm run g:store
```

### 交互式问答

1. **Store 名称**: 例如 `user` (必须以小写字母开头)
2. **是否启用持久化**: 是/否

### 生成的文件

```
src/store/user.ts
```

### 生成的代码

```typescript
/**
 * User Store
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface UserState {
  // 状态定义
}

export const useUserStore = defineStore('user', () => {
  // 状态
  const state = ref<UserState>({})

  // Getters
  // const someGetter = computed(() => state.value.xxx)

  // Actions
  function someAction() {
    // Action 实现
  }

  return {
    state,
    someAction
  }
}, {
  persist: {
    enabled: true,
    strategies: [
      {
        key: 'user',
        storage: localStorage
      }
    ]
  }
})
```

### 使用生成的 Store

```typescript
import { useUserStore } from '@/store/user'

const userStore = useUserStore()

// 访问状态
console.log(userStore.state)

// 调用 Action
userStore.someAction()
```

## 命名规范

### 页面命名

- **格式**: PascalCase (大写字母开头)
- **示例**: `UserList`, `UserDetail`, `UserEdit`
- **路径**: kebab-case (小写字母,连字符分隔)
- **示例**: `user-list`, `user-detail`, `user-edit`

### 组件命名

- **格式**: PascalCase (大写字母开头)
- **示例**: `UserCard`, `UserTable`, `UserForm`
- **路径**: kebab-case (小写字母,连字符分隔)
- **示例**: `user-card`, `user-table`, `user-form`

### API 命名

- **格式**: camelCase (小写字母开头)
- **示例**: `user`, `userRole`, `userPermission`
- **路径**: kebab-case (小写字母,连字符分隔)
- **示例**: `/user`, `/user-role`, `/user-permission`

### Store 命名

- **格式**: camelCase (小写字母开头)
- **示例**: `user`, `userRole`, `userPermission`

## 最佳实践

### 1. 页面生成

- ✅ 使用 ProTable 和 ProForm 提升开发效率
- ✅ 根据业务需求调整生成的代码
- ✅ 及时添加路由配置
- ✅ 实现 API 接口

### 2. 组件生成

- ✅ 明确组件的职责和功能
- ✅ 合理定义 Props 和 Emits
- ✅ 添加必要的注释和文档
- ✅ 编写组件测试

### 3. API 生成

- ✅ 根据后端接口文档调整 API
- ✅ 完善类型定义
- ✅ 添加错误处理
- ✅ 统一接口规范

### 4. Store 生成

- ✅ 合理划分 Store 的粒度
- ✅ 根据需要启用持久化
- ✅ 使用 Composition API 风格
- ✅ 添加必要的 Getters 和 Actions

## 自定义模板

如果需要自定义生成的代码模板,可以修改 `scripts/generate.js` 中的模板函数:

- `generatePageTemplate()` - 页面模板
- `generateComponentTemplate()` - 组件模板
- `generateApiTemplate()` - API 模板
- `generateStoreTemplate()` - Store 模板

## 常见问题

### Q: 如何修改生成的代码?

A: 生成的代码只是一个起点,可以根据实际需求自由修改。

### Q: 生成的文件已存在怎么办?

A: 代码生成器会覆盖已存在的文件,请谨慎操作。建议先备份或使用版本控制。

### Q: 如何添加自定义字段?

A: 修改生成的代码,添加需要的字段和逻辑。

### Q: 支持哪些模板?

A: 目前支持页面、组件、API、Store 四种模板,可以根据需要扩展。

## 相关文档

- [ProTable 组件](../src/components/pro/ProTable/README.md)
- [ProForm 组件](../src/components/pro/ProForm/README.md)
- [Pinia Store](https://pinia.vuejs.org/)
- [TypeScript](https://www.typescriptlang.org/)
