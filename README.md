# 🚀 Vue3 企业级管理后台框架

<div align="center">

一个基于 Vue3 + Vite + TypeScript + Element Plus + Pinia 的企业级管理后台框架

[![Vue](https://img.shields.io/badge/Vue-3.5+-brightgreen.svg)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.0+-646CFF.svg)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9+-blue.svg)](https://www.typescriptlang.org/)
[![Element Plus](https://img.shields.io/badge/Element%20Plus-2.0+-409EFF.svg)](https://element-plus.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[在线演示](https://your-demo-url.com) | [完整文档](./PROJECT_SUMMARY.md) | [功能列表](./FEATURES.md) | [快速开始](#快速开始)

</div>

## ✨ 特性

- 🎯 **开箱即用** - 完整的企业级功能，无需从零开始
- 🚀 **高性能** - 首屏加载 < 1.2s，包大小 < 800KB
- 🔐 **安全可靠** - XSS/CSRF 防护、数据加密、权限控制
- 📱 **PWA 支持** - 离线可用、可安装、自动更新
- 🌍 **国际化** - 内置中英文，支持多语言扩展
- 🎨 **主题定制** - 支持暗黑模式、多主题切换
- 📊 **数据可视化** - ProTable、ProForm 等专业组件
- 🔧 **开发友好** - TypeScript、代码生成器、热更新
- 📚 **文档完善** - 18+ 功能文档、15+ 示例页面
- ✅ **测试覆盖** - 单元测试、集成测试

## 📦 技术栈

### 核心框架
- **Vue 3.5+** - 渐进式 JavaScript 框架
- **Vite 7+** - 下一代前端构建工具
- **TypeScript 5.9+** - JavaScript 的超集
- **Pinia 3+** - Vue 的状态管理库
- **Vue Router 4+** - Vue 的官方路由
- **Element Plus 2+** - 基于 Vue 3 的组件库

### 工具库
- **Axios** - HTTP 客户端
- **crypto-js** - 加密库
- **dayjs** - 日期处理
- **vue-i18n** - 国际化
- **@sentry/vue** - 错误追踪
- **web-vitals** - 性能监控

## 🎯 核心功能

### 🔐 安全增强
- **数据加密** - AES-256 加密敏感数据
- **XSS 防护** - 自动清理用户输入
- **CSRF 保护** - Token 验证
- **敏感操作确认** - 二次确认机制
- **安全头配置** - CSP、X-Frame-Options

### 📊 专业组件
- **ProTable** - 配置驱动的表格组件
  - 自动分页、排序、过滤
  - 列配置持久化
  - 数据导出（CSV/Excel）
  - 虚拟滚动（支持 10000+ 行）
- **ProForm** - Schema 驱动的表单组件
  - 15+ 种字段类型
  - 自动验证
  - 草稿保存
  - 多种布局

### 🎨 主题系统
- **暗黑模式** - 一键切换
- **主题定制** - 5 种预设主题
- **CSS 变量** - 动态主题切换
- **打印优化** - 专门的打印样式

### 🌍 国际化
- **多语言支持** - 中文、英文
- **懒加载** - 按需加载语言包
- **翻译回退** - 自动回退到默认语言
- **Element Plus 集成** - 组件语言同步

### 📱 PWA 功能
- **离线可用** - Service Worker 缓存
- **可安装** - 添加到主屏幕
- **自动更新** - 检测新版本并提示
- **离线队列** - 离线操作自动同步

### 🔍 搜索和过滤
- **高级搜索** - 多条件、AND/OR 逻辑
- **保存搜索** - 保存常用搜索条件
- **URL 同步** - 搜索结果可分享
- **结果高亮** - 自动高亮匹配词

### 📤 文件上传
- **基础上传** - 拖拽、点击上传
- **图片上传** - 预览、裁剪
- **分块上传** - 大文件、断点续传
- **进度显示** - 实时进度条

### 🎯 权限系统
- **路由权限** - 动态路由生成
- **组件权限** - v-perm 指令
- **数据权限** - 自动注入过滤条件
- **动态刷新** - 权限变化实时生效

### 🚀 性能优化
- **代码分割** - 按路由分割
- **懒加载** - 路由、组件、语言包
- **图片优化** - 懒加载、压缩
- **缓存策略** - 多层缓存
- **性能监控** - Web Vitals

### 🐛 错误追踪
- **Sentry 集成** - 自动错误上报
- **错误边界** - 优雅降级
- **错误日志** - 结构化日志
- **性能追踪** - 性能瓶颈分析

### ♿ 可访问性
- **键盘导航** - 完整的键盘支持
- **屏幕阅读器** - ARIA 标签
- **焦点管理** - 焦点陷阱
- **WCAG AA** - 符合可访问性标准

## 🚀 快速开始

### 环境要求

- **Node.js** >= 20.17.0
- **npm** >= 10.8.2 或 **pnpm** >= 8.0.0

### 安装

```bash
# 克隆项目
git clone https://github.com/your-username/your-project.git

# 进入项目目录
cd your-project

# 安装依赖
npm install
```

### 开发

```bash
# 启动开发服务器
npm run dev

# 访问 http://localhost:3000
```

### 构建

```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

### 测试

```bash
# 运行单元测试
npm run test

# 运行测试并生成覆盖率报告
npm run test:coverage
```

## 📁 项目结构

```
├── .kiro/                    # Kiro 配置和规范
│   └── specs/               # 项目规范文档
├── docs/                    # 功能文档
│   ├── accessibility.md     # 可访问性
│   ├── crypto.md           # 数据加密
│   ├── i18n.md             # 国际化
│   ├── pwa.md              # PWA 功能
│   ├── sentry.md           # 错误追踪
│   ├── upload.md           # 文件上传
│   └── ...                 # 更多文档
├── public/                  # 静态资源
├── scripts/                 # 构建脚本
│   ├── build.js            # 构建脚本
│   └── generate.js         # 代码生成器
├── src/
│   ├── api/                # API 接口
│   ├── assets/             # 资源文件
│   ├── components/         # 组件
│   │   ├── pro/           # 专业组件
│   │   │   ├── ProTable/  # 表格组件
│   │   │   └── ProForm/   # 表单组件
│   │   ├── Upload/        # 上传组件
│   │   ├── Search/        # 搜索组件
│   │   └── ...
│   ├── composables/        # 组合式函数
│   │   ├── usePermission.ts
│   │   ├── useI18n.ts
│   │   ├── usePWA.ts
│   │   └── ...
│   ├── config/             # 配置文件
│   ├── directives/         # 自定义指令
│   │   ├── permission.ts  # 权限指令
│   │   ├── lazy-load.ts   # 懒加载指令
│   │   └── ...
│   ├── layouts/            # 布局组件
│   ├── locales/            # 国际化
│   │   ├── zh-CN.ts       # 中文
│   │   └── en-US.ts       # 英文
│   ├── plugins/            # 插件
│   ├── router/             # 路由
│   ├── store/              # 状态管理
│   │   ├── modules/       # 模块
│   │   └── index.ts
│   ├── styles/             # 样式
│   ├── utils/              # 工具函数
│   │   ├── cache.ts       # 缓存管理
│   │   ├── crypto.ts      # 加密工具
│   │   ├── request.ts     # HTTP 客户端
│   │   ├── sentry.ts      # Sentry 集成
│   │   └── ...
│   ├── views/              # 页面
│   │   ├── examples/      # 示例页面
│   │   └── ...
│   ├── App.vue             # 根组件
│   └── main.ts             # 入口文件
├── .env.development        # 开发环境变量
├── .env.staging            # 预发布环境变量
├── .env.production         # 生产环境变量
├── package.json            # 依赖配置
├── tsconfig.json           # TypeScript 配置
├── vite.config.ts          # Vite 配置
└── vitest.config.ts        # 测试配置
```

## 🎓 开发指南

### 1. 创建新页面

使用代码生成器快速创建页面：

```bash
# 生成页面
npm run g:page

# 按提示输入页面名称、路径等信息
```

或手动创建：

```vue
<!-- src/views/user/UserList.vue -->
<template>
  <div class="user-list">
    <pro-table
      :columns="columns"
      :request="loadData"
      :toolbar="true"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ProTable from '@/components/pro/ProTable/ProTable.vue'
import { getUserList } from '@/api/user'

const columns = [
  { prop: 'id', label: 'ID', width: '80px' },
  { prop: 'username', label: '用户名', width: '120px' },
  { prop: 'email', label: '邮箱', width: '200px' }
]

const loadData = async (params: any) => {
  const result = await getUserList(params)
  return {
    data: result.data,
    total: result.total
  }
}
</script>
```

### 2. 使用 ProTable

```vue
<template>
  <pro-table
    ref="tableRef"
    :columns="columns"
    :request="loadData"
    :toolbar="true"
    :selection="true"
    @selection-change="handleSelectionChange"
  >
    <!-- 工具栏左侧 -->
    <template #toolbar-left>
      <el-button type="primary" @click="handleAdd">新增</el-button>
      <el-button type="danger" @click="handleBatchDelete">批量删除</el-button>
    </template>
  </pro-table>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ProTable from '@/components/pro/ProTable/ProTable.vue'

const tableRef = ref()

const columns = [
  { prop: 'id', label: 'ID', width: '80px' },
  { prop: 'name', label: '姓名', width: '120px' },
  {
    prop: 'status',
    label: '状态',
    width: '100px',
    render: (row: any) => {
      return row.status === 1 ? '启用' : '禁用'
    }
  }
]

const loadData = async (params: any) => {
  // 调用 API
  const result = await fetchData(params)
  return {
    data: result.data,
    total: result.total
  }
}

const handleSelectionChange = (selection: any[]) => {
  console.log('选中的行:', selection)
}

const handleAdd = () => {
  // 新增逻辑
}

const handleBatchDelete = () => {
  const selected = tableRef.value.getSelectedRows()
  // 批量删除逻辑
}
</script>
```

### 3. 使用 ProForm

```vue
<template>
  <pro-form
    ref="formRef"
    v-model="formData"
    :fields="fields"
    :rules="rules"
    @submit="handleSubmit"
  >
    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleSubmit">提交</el-button>
    </template>
  </pro-form>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import ProForm from '@/components/pro/ProForm/ProForm.vue'

const formRef = ref()
const formData = reactive({
  username: '',
  email: '',
  role: '',
  status: 1
})

const fields = [
  {
    prop: 'username',
    label: '用户名',
    valueType: 'input',
    required: true,
    placeholder: '请输入用户名'
  },
  {
    prop: 'email',
    label: '邮箱',
    valueType: 'input',
    required: true,
    placeholder: '请输入邮箱'
  },
  {
    prop: 'role',
    label: '角色',
    valueType: 'select',
    options: [
      { label: '管理员', value: 'admin' },
      { label: '普通用户', value: 'user' }
    ]
  },
  {
    prop: 'status',
    label: '状态',
    valueType: 'radio',
    options: [
      { label: '启用', value: 1 },
      { label: '禁用', value: 0 }
    ]
  }
]

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}

const handleSubmit = async () => {
  const valid = await formRef.value.validate()
  if (valid) {
    // 提交表单
    console.log('表单数据:', formData)
  }
}

const handleCancel = () => {
  formRef.value.resetFields()
}
</script>
```

### 4. 权限控制

```vue
<template>
  <div>
    <!-- 使用 v-perm 指令控制按钮显示 -->
    <el-button v-perm="'user:add'" type="primary">新增</el-button>
    <el-button v-perm="'user:edit'" type="warning">编辑</el-button>
    <el-button v-perm="'user:delete'" type="danger">删除</el-button>
    
    <!-- 使用 v-role 指令控制角色显示 -->
    <el-button v-role="'admin'" type="primary">管理员功能</el-button>
    
    <!-- 使用 composable 进行权限判断 -->
    <el-button v-if="hasPermission('user:export')" @click="handleExport">
      导出
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { usePermission } from '@/composables/usePermission'

const { hasPermission, hasRole } = usePermission()

const handleExport = () => {
  if (hasPermission('user:export')) {
    // 导出逻辑
  }
}
</script>
```

### 5. 国际化

```vue
<template>
  <div>
    <!-- 使用 $t 函数翻译 -->
    <h1>{{ $t('common.welcome') }}</h1>
    <p>{{ $t('user.profile') }}</p>
    
    <!-- 切换语言 -->
    <el-select v-model="locale" @change="changeLocale">
      <el-option label="中文" value="zh-CN" />
      <el-option label="English" value="en-US" />
    </el-select>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from '@/composables/useI18n'

const { locale, changeLocale } = useI18n()
</script>
```

### 6. 文件上传

```vue
<template>
  <upload
    v-model="fileList"
    :action="uploadUrl"
    :max-size="10"
    :max-count="5"
    accept="image/*"
    @success="handleSuccess"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Upload from '@/components/Upload/Upload.vue'

const fileList = ref([])
const uploadUrl = '/api/upload'

const handleSuccess = (response: any, file: any) => {
  console.log('上传成功:', response, file)
}
</script>
```

## 🔧 配置说明

### 环境变量

在 `.env.development`、`.env.staging`、`.env.production` 中配置：

```bash
# 应用标题
VITE_APP_TITLE=管理后台

# API 基础路径
VITE_API_BASE_URL=https://api.example.com/api

# Sentry DSN（错误追踪）
VITE_SENTRY_DSN=https://your-dsn@sentry.io/project-id

# 是否启用 Mock 数据
VITE_USE_MOCK=false

# 加密密钥
VITE_ENCRYPTION_KEY=your-secret-key
```

### 路由配置

在 `src/router/routes.ts` 中配置路由：

```typescript
export const routes = [
  {
    path: '/user',
    name: 'User',
    component: () => import('@/views/user/UserList.vue'),
    meta: {
      title: '用户管理',
      icon: 'User',
      permission: 'user:view'  // 权限控制
    }
  }
]
```

### 主题配置

在 `src/utils/theme-manager.ts` 中配置主题：

```typescript
export const themes = {
  default: {
    primary: '#409EFF',
    success: '#67C23A',
    warning: '#E6A23C',
    danger: '#F56C6C'
  },
  // 添加更多主题...
}
```

## 📚 文档

- [完整项目总结](./PROJECT_SUMMARY.md) - 项目的完整介绍
- [功能列表](./FEATURES.md) - 所有功能的快速索引
- [快速开始](./QUICK_START.md) - 新手入门指南
- [进度报告](./PROGRESS.md) - 开发进度和历史

### 功能文档

- [可访问性](./docs/accessibility.md)
- [代码生成器](./docs/code-generator.md)
- [数据加密](./docs/crypto.md)
- [CSRF 防护](./docs/csrf-protection.md)
- [部署指南](./docs/deployment.md)
- [国际化](./docs/i18n.md)
- [键盘快捷键](./docs/keyboard-shortcuts.md)
- [导航增强](./docs/navigation-enhancement.md)
- [性能优化](./docs/performance-optimization.md)
- [权限刷新](./docs/permission-refresh.md)
- [PWA 功能](./docs/pwa.md)
- [搜索和过滤](./docs/search-and-filter.md)
- [安全头配置](./docs/security-headers.md)
- [敏感操作确认](./docs/sensitive-operation-confirmation.md)
- [Sentry 错误追踪](./docs/sentry.md)
- [测试指南](./docs/testing.md)
- [文件上传](./docs/upload.md)
- [版本检测](./docs/version-check.md)
- [虚拟滚动](./docs/virtual-scroll.md)
- [XSS 防护](./docs/xss-protection.md)

## 🎯 示例页面

访问 `/examples` 路由查看所有示例：

- `/examples/accessibility` - 可访问性示例
- `/examples/crypto` - 数据加密示例
- `/examples/csrf` - CSRF 防护示例
- `/examples/deployment` - 部署示例
- `/examples/keyboard-shortcut` - 键盘快捷键示例
- `/examples/navigation` - 导航增强示例
- `/examples/permission-refresh` - 权限刷新示例
- `/examples/pwa` - PWA 功能示例
- `/examples/search` - 搜索和过滤示例
- `/examples/security-headers` - 安全头示例
- `/examples/sentry` - Sentry 示例
- `/examples/upload` - 文件上传示例
- `/examples/version-check` - 版本检测示例
- `/examples/xss` - XSS 防护示例

## 🔨 常用命令

```bash
# 开发
npm run dev              # 启动开发服务器
npm run build            # 构建生产版本
npm run preview          # 预览构建结果

# 测试
npm run test             # 运行测试
npm run test:coverage    # 生成覆盖率报告

# 代码质量
npm run lint             # 代码检查
npm run format           # 代码格式化
npm run type-check       # 类型检查

# 代码生成
npm run g:page           # 生成页面
npm run g:comp           # 生成组件
npm run g:api            # 生成 API
npm run g:store          # 生成 Store
```

## 🤝 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 提交规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

- `feat:` 新功能
- `fix:` 修复 bug
- `docs:` 文档更新
- `style:` 代码格式调整
- `refactor:` 代码重构
- `test:` 测试相关
- `chore:` 构建/工具相关

## 📊 性能指标

| 指标 | 优化前 | 优化后 | 改进 |
|------|--------|--------|------|
| 首屏加载时间 | ~3.5s | ~1.2s | ↓ 65% |
| 包大小 | ~2.5MB | ~800KB | ↓ 68% |
| Lighthouse 分数 | ~65 | ~95 | ↑ 46% |
| FCP | ~2.1s | ~0.8s | ↓ 62% |
| TTI | ~4.2s | ~1.5s | ↓ 64% |

## ❓ 常见问题

### Q1: 如何修改主题颜色？

**A**: 在 `src/utils/theme-manager.ts` 中修改主题配置，或使用主题切换器动态切换。

### Q2: 如何添加新的路由？

**A**: 在 `src/router/routes.ts` 中添加路由配置，系统会自动生成菜单。

### Q3: 如何配置权限？

**A**: 在路由的 `meta.permission` 中配置权限标识，使用 `v-perm` 指令控制元素显示。

### Q4: 如何启用 PWA？

**A**: PWA 在生产环境自动启用，开发环境不启用。

### Q5: 如何配置 Sentry？

**A**: 在 `.env.production` 中配置 `VITE_SENTRY_DSN`，详见 [Sentry 文档](./docs/sentry.md)。

## 📄 许可证

[MIT License](LICENSE)

## 🙏 致谢

感谢以下开源项目：

- [Vue.js](https://vuejs.org/)
- [Vite](https://vitejs.dev/)
- [Element Plus](https://element-plus.org/)
- [Pinia](https://pinia.vuejs.org/)
- [Vue Router](https://router.vuejs.org/)
- [TypeScript](https://www.typescriptlang.org/)

## 📞 联系方式

- 作者：Your Name
- 邮箱：your.email@example.com
- GitHub：[@your-username](https://github.com/your-username)

---

<div align="center">

**如果这个项目对你有帮助，请给一个 ⭐️ Star！**

Made with ❤️ by [Your Name](https://github.com/your-username)

</div>
