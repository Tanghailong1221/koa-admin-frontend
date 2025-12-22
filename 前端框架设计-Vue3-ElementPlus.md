# Vue3 + Vite + Element Plus + Pinia 前端框架设计方案

本文面向现有 KOA 后端的配套前端，目标：快速开发、稳定上线、易维护、可扩展。

## 1. 技术栈选型
- 框架：Vue 3（Composition API）
- 构建：Vite（ESBuild 预构建，Rollup 打包）
- 语言：TypeScript
- 路由：Vue Router 4
- 状态：Pinia
- 组件库：Element Plus（按需/自动导入）
- HTTP：Axios（拦截器统一处理 token、错误提示、刷新 token）
- 图标：@element-plus/icons-vue + 自定义 SVG
- 代码规范：ESLint + Prettier + Stylelint + Husky + lint-staged
- 测试：Vitest + Vue Test Utils
- Mock：MSW 或本地 mock 服务（dev 模式可选）
- 其他：unplugin-auto-import / unplugin-vue-components、commitlint（可选）

## 2. 目录结构（示例）
```
project-root/
├─ src/
│  ├─ api/               # 接口封装（按模块：user, role, menu, org, job ...）
│  ├─ assets/            # 资源（svg、静态图）
│  ├─ components/        # 通用组件
│  ├─ composables/       # 复用逻辑（如表格 useTable、表单 useForm）
│  ├─ constants/         # 常量/枚举（路由白名单、缓存 key）
│  ├─ hooks/             # 通用 hooks（如 useRequest 包装）
│  ├─ layouts/           # 布局（BasicLayout，包含侧边栏/顶部导航/多页签）
│  ├─ router/            # 路由定义与守卫
│  ├─ store/             # Pinia 仓库（auth/app/user/dict/cache/menu）
│  ├─ styles/            # 全局样式、主题变量、dark mode
│  ├─ utils/             # 工具（request、auth、crypto、time、download）
│  ├─ views/             # 业务页面（按模块分目录）
│  ├─ plugins/           # 插件注册（Element Plus、指令、国际化）
│  ├─ directives/        # 自定义指令（权限 v-perm、防抖 v-debounce）
│  ├─ locale/            # 国际化（可选）
│  ├─ typings/           # TS 类型定义
│  └─ main.ts
├─ public/               # 静态资源
├─ env.d.ts
├─ .env.development
├─ .env.production
├─ vite.config.ts
├─ tsconfig.json / tsconfig.node.json
└─ package.json
```

## 3. 初始化与基础配置
1) 创建项目  
```bash
npm create vite@latest admin-frontend -- --template vue-ts
cd admin-frontend
npm install
```
2) 安装依赖  
```bash
npm i element-plus @element-plus/icons-vue axios pinia vue-router@4
npm i -D unplugin-auto-import unplugin-vue-components
npm i -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-vue prettier eslint-config-prettier
npm i -D stylelint stylelint-config-standard-scss stylelint-config-recess-order postcss postcss-scss
npm i -D husky lint-staged
npm i -D vitest @vue/test-utils @vitest/ui jsdom
```
3) Vite 配置（关键点）  
- 别名：`@` 指向 `src`。  
- 自动导入：配置 `unplugin-auto-import` 和 `unplugin-vue-components`（ElementPlusResolver）。  
- CSS 预处理：全局 SCSS 变量；开启 CSS modules（可选）。  
- 构建：分包策略（manualChunks 按 `node_modules` 包名拆分）。  
- 兼容性：`build.target` 设为 `es2017` / `es2020`，如需 IE11 不建议用 Vite。

示例（片段）：
```ts
// vite.config.ts (片段)
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import path from 'path';

export default defineConfig({
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  plugins: [
    vue(),
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      resolvers: [ElementPlusResolver()],
      dts: 'src/typings/auto-imports.d.ts'
    }),
    Components({
      resolvers: [ElementPlusResolver()],
      dts: 'src/typings/components.d.ts'
    })
  ],
  build: {
    target: 'es2017',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return id.toString().split('node_modules/')[1].split('/')[0];
          }
        }
      }
    }
  }
});
```

## 4. 认证与权限设计
- Token 存储：优先 `Authorization: Bearer` 请求头；刷新令牌流程由 Axios 拦截器处理（检测 401/自定义 code，调用 `/user/refresh-token`，刷新后重放请求）。
- 状态存储：Pinia `auth` store 持久化（localStorage/sessionStorage，带版本号以防老数据冲突）。
- 路由守卫：  
  - 白名单：如 `/login`。  
  - 进入前校验 token，有则获取用户信息 + 权限菜单。  
  - 基于后端返回的菜单/权限生成动态路由（与后端菜单 tree 对齐）。
- 自定义指令：`v-perm="['menu:create']"` 控制按钮显示。

## 5. 路由与布局
- 路由模式：history（后端已配置健康/接口，不与前端路径冲突；生产可由 nginx fallback）。  
- 布局：侧边导航 + 顶部（含用户信息、语言切换、主题切换）+ 页签栏。  
- 动态路由：后端菜单树 -> 递归生成路由（`path`、`component`、`meta.permissions`）。组件采用按需异步加载（`() => import('@/views/...')`）。
- 错误页：403/404/500。

## 6. 状态管理（Pinia）
建议 store 划分：
- auth：token、userInfo、roles、permissions，提供 login/logout/refresh。
- app：布局、主题（亮/暗）、多标签状态、侧边栏折叠。
- dict：数据字典缓存（调用后端 `/dict`），带 TTL。
- menu：菜单树与动态路由缓存。
- cache：本地缓存工具封装，带版本与过期。

## 7. HTTP 封装（Axios）
- 基础配置：`baseURL` 指向后端 `/api/v1`，超时 15s，携带 credentials 视需要。  
- 请求拦截：注入 access token。  
- 响应拦截：统一处理业务 code；401 时触发刷新逻辑；网络/超时统一弹出消息。  
- 下载：`responseType: 'blob'`，封装 `download(url, params)`。  
- 上传：封装 multipart 方法，支持进度条。

## 8. UI 与主题
- Element Plus 全局主题变量：放在 `src/styles/variables.scss`，通过 CSS 变量/SCSS 定制。  
- 暗黑模式：`class="dark"` 切换，Element Plus 内置支持。  
- 全局样式重置：normalize.css + 自定义 reset。  
- 表格/表单：提取通用组件（如分页表格、搜索表单、弹窗表单）。

## 9. 性能与稳定性
- 代码分割：路由懒加载 + manualChunks。  
- 资源缓存：生产开启 gzip/br（由部署层，如 nginx）。  
- 预加载：合理使用 `router.beforeResolve` 与组件级 skeleton。  
- 防抖节流：指令/工具函数统一封装。  
- 错误上报：可接入 Sentry（可选）。  
- 兼容性：target `es2017`，不支持 IE；如需低版本浏览器，可启用 `@vitejs/plugin-legacy`。

## 10. 表单与校验
- 统一表单封装：组合式 `useForm` + Element Plus Form；校验规则集中管理（与后端 Joi 规则保持一致的常用校验 regex/长度）。  
- 提交状态/禁用按钮，防重复提交。

## 11. 国际化（可选）
- 使用 `vue-i18n`，按需懒加载语言包；UI 组件多语言切换 Element Plus locale。

## 12. 日志与可观测
- 前端 console 抑制：生产关闭 debug 日志。  
- 请求日志：可在 dev 打印，prod 可选发送关键错误到 Sentry。  
- 性能指标：`web-vitals` 或 Performance API 采集（可选）。

## 13. 开发体验与规范
- ESLint + Prettier + Stylelint：提交前自动修复（husky + lint-staged）。  
- Git 提交规范：可选 commitlint。  
- VSCode 推荐配置：`.vscode/extensions.json`、`.vscode/settings.json`（格式化、别名提示）。

## 14. 部署
- 构建：`npm run build`，产物在 `dist/`。  
- 部署方式：Nginx 静态托管，`try_files $uri /index.html;` 处理前端路由；开启 gzip/br；配置缓存策略（HTML 不缓存，静态资源长缓存带 hash）。  
- 环境变量：使用 Vite 的 `.env.*`，以 `VITE_` 前缀注入（如 `VITE_API_BASE`、`VITE_APP_TITLE`）。

## 15. 与后端的对接要点
- Base URL：`/api/v1`；若后端版本迭代，前端可通过 `VITE_API_BASE` 配置。  
- 鉴权：使用后端的 access/refresh 机制；401 时自动刷新，失败则登出。  
- 菜单/权限：使用后端菜单树和权限码构建动态路由与按钮权限。  
- 数据字典：集中获取并缓存，减少重复请求。  
- 文件：上传使用 multipart，下载处理 blob，注意 content-disposition。

## 16. 实施步骤清单
1) 初始化项目与依赖（第 3 节）。
2) 配置 Vite（别名、自动导入、构建分包、legacy 可选）。
3) 接入 ESLint/Prettier/Stylelint/Husky，完成基础规范。
4) 搭建基础目录与别名，编写 `main.ts`，注册 Router、Pinia、Element Plus、全局样式。
5) 实现 HTTP 封装 + 拦截器 + 刷新 token。
6) 编写基础布局（侧边栏、头部、页签），实现动态菜单渲染。
7) 编写路由守卫、权限指令、auth store（含持久化）。
8) 对接后端接口模块化封装（api/），完成用户/角色/菜单/组织/职位/任务/日志等模块页面的 CRUD。
9) 提取通用组件（表格、搜索、表单、上传、字典选择器等）。
10) 完成主题/暗黑模式、全局消息/确认封装。
11) 可选：国际化、Sentry、MSW mock、web-vitals。
12) 构建与部署配置（Nginx），多环境 `.env`。

## 17. 模块页面落地建议
- 用户管理：列表（搜索：用户名、角色、状态、组织）、创建/编辑、重置密码、锁定/解锁、分配角色、查看登录日志。
- 角色管理：列表、创建/编辑、分配菜单权限（树选择）。
- 菜单管理：树 + 表格、创建/编辑、排序、显示/隐藏。
- 组织/职位：树 + 表格、创建/编辑、职位联动。
- 任务调度：列表、创建/编辑 cron、启停、执行日志查看。
- 日志审计：操作日志、登录日志，支持导出/筛选。
- 字典管理：类型/项维护，前端提供下拉/标签渲染。

## 18. 稳定性与回退策略
- 版本号与缓存：静态资源 hash；HTML 不缓存；API 版本跟后端对齐。  
- 功能开关：通过后端下发或 `.env` 控制可选能力（如是否启用 Sentry、mock）。  
- 回退：保留上一个构建包，Nginx upstream 可快速切回。

## 19. 体验与工程化补充（成熟后台场景）

### 19.1 加载状态与反馈
- 路由切换顶部进度条（NProgress），避免白屏。
- 局部 loading：表格首次加载骨架屏/刷新态区分；按钮提交 loading；超时（如 30s）展示“重试”入口。

### 19.2 强化错误处理
- 错误边界：封装 ErrorBoundary 组件（onErrorCaptured），渲染兜底页 + “刷新重试”。
- 错误分类：业务错误（Message/Alert 显示可复制原因）；系统错误/网络中断显示“系统繁忙”，隐藏技术细节。
- 日志分级：dev 打印 debug，prod 仅上报 error，info/warn 可选上报。

### 19.3 数据持久化与安全
- Pinia 持久化：使用 `pinia-plugin-persistedstate`，按需持久化；敏感数据（token、用户信息）用 crypto-js 加密存储。
- 缓存失效：字典、菜单提供“强制刷新”入口；登出清理所有持久化数据。

### 19.4 权限深度
- 数据级权限：根据权限自动注入部门/组织参数（Axios 请求拦截器）；前端对小数据集本地过滤。
- 权限动态刷新：切换角色后重新拉取菜单与权限，重置路由与指令，无需重新登录。

### 19.5 表格与表单增强
- 表格：列显隐/顺序记忆（localStorage）；高级筛选保存方案；跨页选中保留；大数据场景用虚拟滚动（vue-virtual-scroller）。
- 表单：动态表单（JSON schema / formily）；表单草稿自动保存/恢复（beforeunload）；富文本（TinyMCE/CKEditor/Quill）与特殊控件支持。

### 19.6 导航与效率
- 动态面包屑：基于路由 meta 自动生成，可跳转。
- 全局快捷键（mousetrap）：Ctrl+S 保存，Esc 关闭弹窗，F5 刷新当前页数据；提供快捷键说明入口。
- 多标签：右键菜单（关当前/关其他/关全部/刷新）；标签上限（如 10）自动回收最早的非固定标签。

### 19.7 主题与样式
- 自定义主题色：管理员可配置品牌色并持久化；暗色/亮色切换。
- 样式隔离：BEM 或 CSS Modules，避免冲突；打印样式（@media print）优化报表/详情。

### 19.8 工程化与维护
- 组件文档：storybook 或 vitepress，沉淀 ProTable/ProForm 等通用组件示例。
- 依赖治理：定期 `npm audit`，锁定版本，移除冗余依赖。
- 构建优化：vite-plugin-imagemin 压缩；`<link rel="preload">` 预加载首屏关键 JS/CSS。

### 19.9 无障碍（A11y）
- Tab 导航可达，聚焦样式可见；label/alt/aria-live 完整；Esc 关闭弹窗。

### 19.10 版本与环境管理
- 版本提示：检测新版本（接口或 meta），顶部提示“点击刷新”。
- 环境标识：非生产显示环境名与版本，防误操作。
- 环境切换：提供前端可切换 API 环境入口（写入本地配置），无需改 `.env`。

## 20. 按模块的详细实施步骤（端到端）

> 目标：在现有后端 API（用户/角色/菜单/组织/职位/任务/日志等）基础上，逐模块落地前端页面、路由、store、API 封装、组件复用。每个模块遵循“接口封装 → store/状态 → 路由与视图 → 交互与校验 → 权限/缓存/加载反馈 → 测试”流程。

### 20.1 全局基础设施（一次性搭建）
1) 依赖安装：见第 3 节；若需虚拟滚动、富文本、快捷键：`vue-virtual-scroller`、`@tinymce/tinymce-vue`/`@ckeditor/ckeditor5-vue`/`vue3-quill`、`mousetrap`。  
2) 目录搭建：`src/api`、`store`、`router`、`layouts`、`views`、`components/common`、`utils`、`hooks/composables`、`styles`、`directives`、`plugins`、`typings`。  
3) Vite 配置：别名、自动导入、Element Plus Resolver、manualChunks、imagemin（可选）、`@vitejs/plugin-legacy`（若需低端浏览器）。  
4) 规范：ESLint/Prettier/Stylelint/Husky/lint-staged；`npm run lint`、`npm run test`。  
5) 全局样式：重置 + 主题变量 + 暗黑模式；打印样式。  
6) 插件注册：Element Plus、Pinia、Router、i18n（可选）、指令（v-perm、v-debounce/throttle）、图标。  
7) HTTP 封装：Axios 实例、请求/响应拦截、刷新 token、错误提示、超时重试（有限次数）。  
8) Auth store：token（加密持久化）、userInfo、roles/permissions、menus；持久化插件；logout 清理。  
9) 路由守卫：白名单、登录态校验、动态路由注入（基于菜单树）、NProgress。  
10) 通用组件：`ProTable`（分页、列显隐/拖拽、批量操作、虚拟滚动可选）、`SearchForm`、`ModalForm`、`DictTag/DictSelect`、`PageContainer`、`Upload`、`Editor`（可选）。  
11) 工具与 hooks：`useRequest`（loading/错误兜底）、`useTable`、`useForm`、`useDict`、`useCache`（持久化封装）、`useShortcuts`、`useTheme`。  
12) 日志与监控：前端 error 捕获（onErrorCaptured + ErrorBoundary 组件）、Sentry（可选）、web-vitals（可选）。  

### 20.2 用户与认证模块
1) API 封装：`api/user.ts` — login、logout、refreshToken、getProfile、updateProfile、changePassword、list/create/update/delete、status 切换。  
2) Store：`store/auth`、`store/user`。登录后存 token/userInfo/permissions/menus，提供 `fetchProfile()` 刷新。  
3) 路由/页面：`views/auth/Login.vue`；用户管理页 `views/system/user/List.vue` + 详情/编辑弹窗。  
4) 交互：登录表单校验；登录限流友好提示；账号锁定提示；支持“记住我”。  
5) 权限：按钮 `v-perm="['user:create']"`；数据级（注入 org/position）按后端策略。  
6) 加载/错误：登录按钮 loading；列表骨架；超时重试。  
7) 测试：登录流程（含 refresh）、权限路由守卫、表单校验快照。  

### 20.3 角色与权限（菜单）模块
1) API：`api/role.ts`、`api/menu.ts` — 角色 CRUD、分配菜单；菜单树 CRUD、角色菜单获取。  
2) Store：`store/menu` 缓存菜单树，支持“强制刷新”；`store/perm` 存权限码。  
3) 路由/页面：`views/system/role/List.vue`、`views/system/menu/List.vue`（树+表格）。  
4) 交互：菜单树懒加载/拖拽排序（可选）；角色分配权限树（半选状态处理）。  
5) 权限：页面/按钮 perms；动态刷新权限后重建路由。  
6) 缓存：菜单树 GET 加缓存，提供“刷新权限”按钮。  
7) 测试：菜单树渲染、权限指令、路由生成。  

### 20.4 组织与职位模块
1) API：`api/org.ts`、`api/position.ts` — 机构树 CRUD、职位 CRUD、按机构拉取职位。  
2) 页面：`views/system/org/List.vue`（树+表格）；职位列表与联动选择。  
3) 交互：创建用户时选择机构/职位（级联/下拉）。  
4) 缓存：机构树/列表缓存；强制刷新入口。  
5) 测试：机构树渲染、职位联动。  

### 20.5 用户扩展信息与账号安全
1) API：更新头像、邮箱、手机、性别、生日等；修改密码；登录日志查询。  
2) 页面：个人中心（资料、密码、安全设置）、登录日志列表（过滤成功/失败、IP、UA）。  
3) 交互：上传头像裁剪（可选）；密码强度提示；登录失败锁定提示。  
4) 安全：登出清理缓存；加密持久化 token；XSS 过滤富文本输入。  

### 20.6 任务调度模块
1) API：`api/job.ts` — 列表、创建/编辑、启停、立即执行、日志查询。  
2) 页面：`views/ops/job/List.vue`；弹窗表单填写 cron。  
3) 交互：cron 校验与常用模板下拉；任务日志查看；批量启停。  
4) 权限：`job:create/update/delete/run`。  
5) 测试：表单校验、日志分页。  

### 20.7 日志与审计模块
1) API：`api/log.ts` — 操作日志、登录日志查询/导出。  
2) 页面：`views/monitor/oplog/List.vue`、`views/monitor/loginlog/List.vue`。  
3) 交互：筛选（时间范围、用户、状态）、导出、详情抽屉。  
4) 性能：大数据量表格支持虚拟滚动或服务端分页（默认）。  

### 20.8 数据字典模块
1) API：`api/dict.ts` — 字典类型/项 CRUD，批量获取。  
2) Store/Hook：`useDict` 缓存 + TTL + 强制刷新；`store/dict`。  
3) 组件：`DictSelect`、`DictTag`、`DictRadio/Checkbox`。  
4) 页面：`views/system/dict/List.vue`（类型+项双列表）。  

### 20.9 文件与存储模块
1) API：上传（单/多）、下载、删除（如有）、文件元数据获取。  
2) 组件：`Upload`（含拖拽/多选/大小类型校验/进度）、`FileList`。  
3) 页面：素材库（可选），或在各表单中复用上传组件。  
4) 交互：上传前校验、上传中进度/可取消；下载错误友好提示。  

### 20.10 监控与健康
1) API：`/monitor/metrics`、健康检查。  
2) 页面：`views/monitor/health/Dashboard.vue` 展示请求数/状态分布/平均耗时/内存。  
3) 交互：定时轮询；异常时提示。  

### 20.11 表格与表单高级能力落地
1) 表格：列配置持久化；高级筛选保存；跨页选中；虚拟滚动阈值；导出。  
2) 表单：动态表单渲染；草稿保存/恢复；富文本/上传/级联/日期范围等通用控件封装。  
3) 快捷键：mousetrap 统一注册；页面级开关；提供“快捷键说明”。  

### 20.12 主题与外观
1) 主题色配置面板：选择主/成功/警告色，写入 CSS 变量并持久化用户偏好。  
2) 暗黑模式：toggle 持久化；Element Plus 配套样式。  
3) 打印：为报表/详情提供打印样式按钮与预览。  

### 20.13 工程化与质量
1) 组件文档：storybook/vitepress，记录 ProTable/ProForm 等用法。  
2) 依赖治理：`npm audit`、锁版本、移冗余；发布前检查 bundle 体积。  
3) 构建优化：imagemin、preload 首屏、分包策略回顾。  
4) 测试：Vitest + Vue Test Utils 对核心组件/逻辑做单测；关键流程做端到端用例（可选 Cypress/Playwright）。  

### 20.14 无障碍与环境
1) A11y：Tab 导航、focus 样式、label/alt/aria-live、Esc 关闭弹窗。  
2) 版本提示：检测新版本并提示刷新。  
3) 环境标识与切换：右上角显示环境与版本；提供 API 环境快速切换面板（写入本地配置）。  

## 21. 进一步可选/待完善提升点
- 设计体系与 A11y：沉淀设计 tokens（spacing/font/color/shadow），可视化主题生成器；定期无障碍审计（对比度、键盘流、ARIA）。
- 配置化/低代码：为 CRUD 场景提供配置驱动页面（列/搜索/表单 JSON），配套可视化 JSON 校验/编辑器。
- 安全与合规：CSP 预设、SRI、敏感操作二次确认/二次认证；防重复提交/CSRF；脱敏展示（手机号/邮箱）；水印（用户/时间）防泄露。
- 质量门禁：预提交/预推送校验（lint/test/typecheck/commitlint），PR 模板与风险自检清单；度量面板（覆盖率、构建体积、性能基线）。
- 运行时保护：全局兜底错误页 + 自动降级（关闭动画、简版列表）；弱网/离线提示与重试；关键路径超时回退。
- 观测与告警：前端埋点与指标上报（PV/UV、接口耗时、LCP/FID/CLS），错误采样上报（Sentry/自建，含 Source Map）；告警联动（钉钉/飞书/企微）。
- 数据一致性：乐观/悲观更新策略；列表-详情本地一致性维护；任务进度轮询/长连接与节流。
- 资产与依赖治理：依赖白名单与安全审计、版本锁定；bundle 可视化分析；CDN/多机房容灾。
- 部署与灰度：多环境配置、灰度/AB 实验开关；版本公告与一键刷新；静态资源回滚预案。
- 协作与效率：组件/页面脚手架（plop）模板；Storybook/VitePress 作为组件手册；约定式路由或 CLI 工具减少重复劳动。
- 性能补充：Prefetch/Preload 首屏关键路由/接口；图片懒加载与 LQIP；长列表虚拟化兜底；Web Worker 处理重计算（导入/导出/解析）。

---

已完成标记（2025-12-15）：
- [x] 使用 create-vite vue-ts 模板初始化项目（临时目录生成后迁移至根目录，保留本文档）。
- [x] 执行 `npm install` 安装基础依赖（Node v20.17.0 对 vite/@vitejs/plugin-vue 显示 engine 警告，可后续按需升级）。
- [x] 安装运行时依赖：element-plus、@element-plus/icons-vue、axios、pinia、vue-router@4。
- [x] 安装开发依赖：unplugin-auto-import、unplugin-vue-components、eslint 套件、prettier、stylelint 及配置、postcss/postcss-scss、husky、lint-staged、vitest、@vue/test-utils、@vitest/ui、jsdom。
- [x] 配置 Vite：添加 `@` 别名，启用 unplugin-auto-import / unplugin-vue-components，ElementPlusResolver，生成 typings 路径。
- [x] 基础框架搭建：接入 Pinia、Vue Router、Element Plus，全局样式基线；创建基础布局 `BasicLayout`、登录页、仪表盘示例、404 页面。
- [x] 前端规范：新增 ESLint/Prettier/Stylelint 配置，husky + lint-staged 预提交校验脚本。
- [x] 基础能力：添加 axios 请求封装（携带 token、401 自动登出跳转），Pinia auth store（token/userInfo），路由守卫（公共路由豁免、登录拦截、标题设置）。
- [x] 登录与鉴权增强：登录表单校验与跳转、auth store 登录/刷新/登出/拉取用户信息、axios 刷新 token（单次重放）、基础 auth API 封装。
- [x] 权限与菜单：新增 v-perm 指令（基于用户权限数组隐藏 DOM），基础菜单 store（mock 菜单）、侧边栏导航渲染，仪表盘示例按钮演示权限控制。
- [x] 菜单加载与错误提示：菜单 store 支持远程拉取（mock API 占位）、路由守卫自动加载菜单；Axios 响应增加业务 code 判定与全局错误提示。
- [x] 动态路由落地：根据菜单生成动态路由，登录后自动注入至基础布局；新增用户/角色页面占位待对接后端。
- [x] 导航体验：新增面包屑与多标签（Tabs）导航，登录后自动记录访问标签，支持关闭切换；侧边栏/标签/标题统一展示。
- [x] 对接后端接口（文档版）：Auth 登录/刷新/登出/当前用户；菜单树改为后端 `/menu/tree/current`，动态路由使用后端 `component` 字段解析视图；Axios 成功码改为 `code=0`，登录返回/刷新 token 字段与文档对齐。
- [x] 用户/角色列表对接：基于接口文档拉取 `/user/list`、`/role/list`，完成分页查询、搜索表单与权限按钮占位；新增分页类型定义。
- [x] 导航增强（KeepAlive/标签操作）：多标签支持“关闭当前/关闭其他/关闭全部”，并启用 KeepAlive 缓存访问过的页面；面包屑/侧边栏/标签联动展示。
- [x] 布局完善：头部新增用户下拉与退出动作，与路由守卫/axios 逻辑联动登出。
- [x] 头像与退出确认：用户下拉展示头像/昵称（兼容用户名），退出前二次确认并清理 auth/menu/tabs，再跳转登录。