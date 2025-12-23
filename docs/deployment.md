# 部署指南

本文档介绍如何部署前端架构增强项目到不同环境。

## 环境配置

项目支持三种环境：

- **development** - 开发环境
- **staging** - 预发布环境
- **production** - 生产环境

每个环境都有对应的配置文件：

- `.env.development` - 开发环境配置
- `.env.staging` - 预发布环境配置
- `.env.production` - 生产环境配置

## 环境变量

### 应用配置

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| VITE_APP_TITLE | 应用标题 | 前端架构增强项目 |
| VITE_API_BASE_URL | API 基础路径 | /api |

### 功能开关

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| VITE_USE_MOCK | 是否启用 Mock 数据 | true |
| VITE_ENABLE_PERFORMANCE_MONITOR | 是否启用性能监控 | true |
| VITE_ENABLE_VERSION_CHECK | 是否启用版本检测 | false |
| VITE_ENABLE_SENTRY | 是否启用 Sentry | false |
| VITE_ENABLE_CONSOLE | 是否启用控制台日志 | true |
| VITE_ENABLE_ENCRYPTION | 是否启用数据加密 | false |
| VITE_ENABLE_CDN | 是否启用 CDN | false |

### 性能配置

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| VITE_PERFORMANCE_SAMPLE_RATE | 性能监控采样率 (0-1) | 1.0 |
| VITE_VERSION_CHECK_INTERVAL | 版本检测间隔（毫秒） | 60000 |

### 上传配置

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| VITE_UPLOAD_MAX_SIZE | 上传文件大小限制（MB） | 10 |
| VITE_UPLOAD_ALLOWED_TYPES | 上传文件类型限制 | image/*,video/*,.pdf |

### CDN 配置

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| VITE_CDN_URL | CDN 地址 | - |

### 安全配置

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| VITE_ENCRYPTION_KEY | 加密密钥 | - |
| VITE_SENTRY_DSN | Sentry DSN | - |

## 构建命令

### 开发环境

```bash
# 启动开发服务器
npm run dev

# 构建开发环境
npm run build:dev
```

### 预发布环境

```bash
# 构建预发布环境
npm run build:staging
```

### 生产环境

```bash
# 构建生产环境
npm run build
# 或
npm run build:prod
```

## 构建脚本

项目提供了自定义构建脚本 `scripts/build.js`，支持：

- 多环境构建
- 生成构建信息文件
- 显示构建产物大小

使用方法：

```bash
node scripts/build.js [environment]
```

示例：

```bash
# 构建生产环境
node scripts/build.js production

# 构建预发布环境
node scripts/build.js staging

# 构建开发环境
node scripts/build.js development
```

## 部署流程

### 1. 准备工作

确保已安装依赖：

```bash
npm install
```

### 2. 配置环境变量

根据目标环境，修改对应的 `.env.*` 文件：

```bash
# 生产环境
vim .env.production

# 预发布环境
vim .env.staging
```

**重要配置项：**

- `VITE_API_BASE_URL` - API 地址
- `VITE_CDN_URL` - CDN 地址
- `VITE_ENCRYPTION_KEY` - 加密密钥（生产环境必须配置）
- `VITE_SENTRY_DSN` - Sentry DSN（如果启用）

### 3. 构建项目

```bash
# 生产环境
npm run build:prod

# 预发布环境
npm run build:staging
```

### 4. 检查构建产物

构建完成后，检查 `dist` 目录：

```bash
ls -lh dist/
```

构建产物包括：

- `index.html` - 入口 HTML 文件
- `assets/` - 静态资源（JS、CSS、图片等）
- `version.json` - 版本信息文件
- `build-info.json` - 构建信息文件

### 5. 部署到服务器

#### 方式 1：使用 Nginx

```nginx
server {
    listen 80;
    server_name example.com;
    root /var/www/html/dist;
    index index.html;

    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # 缓存策略
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # HTML 文件不缓存
    location ~* \.html$ {
        expires -1;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # version.json 不缓存
    location = /version.json {
        expires -1;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # SPA 路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
```

#### 方式 2：使用 Docker

创建 `Dockerfile`：

```dockerfile
FROM nginx:alpine

# 复制构建产物
COPY dist /usr/share/nginx/html

# 复制 Nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

构建和运行：

```bash
# 构建镜像
docker build -t my-app:latest .

# 运行容器
docker run -d -p 80:80 my-app:latest
```

#### 方式 3：使用 CDN

1. 将 `dist` 目录上传到 CDN
2. 配置 CDN 缓存策略
3. 更新 DNS 解析

### 6. 验证部署

访问应用 URL，检查：

- ✅ 页面正常加载
- ✅ API 请求正常
- ✅ 静态资源加载正常
- ✅ 版本号正确
- ✅ 功能正常

## 回滚策略

### 方式 1：保留历史版本

```bash
# 备份当前版本
cp -r dist dist.backup.$(date +%Y%m%d%H%M%S)

# 回滚到上一个版本
cp -r dist.backup.20231223120000 dist
```

### 方式 2：使用 Git 标签

```bash
# 创建版本标签
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0

# 回滚到指定版本
git checkout v1.0.0
npm run build:prod
```

### 方式 3：使用 Docker 镜像

```bash
# 回滚到上一个镜像
docker pull my-app:v1.0.0
docker stop my-app
docker rm my-app
docker run -d --name my-app -p 80:80 my-app:v1.0.0
```

## 监控和日志

### 性能监控

应用内置了性能监控系统，可以：

- 收集 Web Vitals 指标
- 监控 API 响应时间
- 记录资源加载时间
- 上报到监控服务

配置：

```bash
# 启用性能监控
VITE_ENABLE_PERFORMANCE_MONITOR=true

# 设置采样率（生产环境建议 0.1-0.3）
VITE_PERFORMANCE_SAMPLE_RATE=0.1
```

### 错误监控

如果启用了 Sentry：

```bash
# 启用 Sentry
VITE_ENABLE_SENTRY=true

# 配置 Sentry DSN
VITE_SENTRY_DSN=https://xxx@sentry.io/xxx
```

### 版本检测

应用会定期检测版本更新：

```bash
# 启用版本检测
VITE_ENABLE_VERSION_CHECK=true

# 设置检测间隔（生产环境建议 5-10 分钟）
VITE_VERSION_CHECK_INTERVAL=300000
```

## 最佳实践

### 1. 环境隔离

- 开发环境：使用 Mock 数据，启用所有调试功能
- 预发布环境：使用真实 API，启用部分调试功能
- 生产环境：关闭调试功能，启用监控和优化

### 2. 安全配置

- ✅ 生产环境必须配置加密密钥
- ✅ 不要在代码中硬编码敏感信息
- ✅ 使用环境变量或密钥管理服务
- ✅ 定期更新依赖，修复安全漏洞

### 3. 性能优化

- ✅ 启用 Gzip/Brotli 压缩
- ✅ 配置合理的缓存策略
- ✅ 使用 CDN 加速静态资源
- ✅ 启用 HTTP/2
- ✅ 优化图片大小和格式

### 4. 监控告警

- ✅ 配置性能监控
- ✅ 配置错误监控
- ✅ 配置版本检测
- ✅ 设置告警阈值
- ✅ 定期查看监控数据

### 5. 持续集成

建议使用 CI/CD 工具自动化部署流程：

- GitHub Actions
- GitLab CI
- Jenkins
- Travis CI

## 常见问题

### Q: 如何切换环境？

A: 使用对应的构建命令：

```bash
npm run build:dev      # 开发环境
npm run build:staging  # 预发布环境
npm run build:prod     # 生产环境
```

### Q: 如何自定义环境变量？

A: 在对应的 `.env.*` 文件中添加变量，变量名必须以 `VITE_` 开头。

### Q: 如何在代码中使用环境变量？

A: 使用 `import.meta.env.VITE_*` 或导入 `src/config/env.ts`：

```typescript
import { env } from '@/config'

console.log(env.apiBaseUrl)
```

### Q: 构建产物太大怎么办？

A: 检查以下几点：

1. 是否启用了代码分割
2. 是否启用了 Tree Shaking
3. 是否有未使用的依赖
4. 是否有重复的依赖
5. 图片是否优化

### Q: 如何配置 CDN？

A: 在 `.env.*` 文件中配置：

```bash
VITE_CDN_URL=https://cdn.example.com
VITE_ENABLE_CDN=true
```

然后在 `vite.config.ts` 中配置 `base`：

```typescript
export default defineConfig({
  base: import.meta.env.VITE_ENABLE_CDN === 'true'
    ? import.meta.env.VITE_CDN_URL
    : '/'
})
```

## 相关文档

- [环境配置](../src/config/env.ts)
- [构建脚本](../scripts/build.js)
- [性能优化](./performance-optimization.md)
- [版本检测](./version-check.md)
