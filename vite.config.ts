import path from 'path'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import viteCompression from 'vite-plugin-compression'
import { VitePWA } from 'vite-plugin-pwa'
import { sentryVitePlugin } from '@sentry/vite-plugin'
import fs from 'fs'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd())

  return {
    // 基础路径
    base: env.VITE_ENABLE_CDN === 'true' ? env.VITE_CDN_URL : '/',

    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    },

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
      }),
      // PWA 配置
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
        manifest: {
          name: 'Koa Admin',
          short_name: 'Admin',
          description: 'Vue3 + Vite + Element Plus 管理后台',
          theme_color: '#409EFF',
          background_color: '#ffffff',
          display: 'standalone',
          scope: '/',
          start_url: '/',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        },
        workbox: {
          // 缓存策略
          runtimeCaching: [
            {
              // 缓存 API 请求
              urlPattern: /^https:\/\/api\..*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 // 24 小时
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              // 缓存静态资源
              urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'image-cache',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 * 30 // 30 天
                }
              }
            },
            {
              // 缓存字体文件
              urlPattern: /\.(?:woff|woff2|ttf|eot)$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'font-cache',
                expiration: {
                  maxEntries: 20,
                  maxAgeSeconds: 60 * 60 * 24 * 365 // 1 年
                }
              }
            },
            {
              // 缓存 CSS 和 JS
              urlPattern: /\.(?:css|js)$/,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'static-resources',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 * 7 // 7 天
                }
              }
            }
          ],
          // 跳过等待，立即激活新的 Service Worker
          skipWaiting: true,
          // 立即接管客户端
          clientsClaim: true,
          // 清理过期缓存
          cleanupOutdatedCaches: true
        },
        devOptions: {
          enabled: false, // 开发环境不启用 PWA
          type: 'module'
        }
      }),
      // Gzip 压缩
      viteCompression({
        verbose: true,
        disable: false,
        threshold: 10240, // 10KB 以上才压缩
        algorithm: 'gzip',
        ext: '.gz'
      }),
      // Brotli 压缩
      viteCompression({
        verbose: true,
        disable: false,
        threshold: 10240,
        algorithm: 'brotliCompress',
        ext: '.br'
      }),
      // 生成 version.json
      {
        name: 'generate-version',
        closeBundle() {
          const version = {
            version: process.env.npm_package_version || '1.0.0',
            buildTime: new Date().toISOString(),
            commitHash: process.env.GIT_COMMIT || '',
            mode
          }

          const distPath = path.resolve(__dirname, 'dist')
          if (fs.existsSync(distPath)) {
            fs.writeFileSync(
              path.join(distPath, 'version.json'),
              JSON.stringify(version, null, 2)
            )
          }
        }
      },
      // Sentry 插件（生产环境且配置了 auth token）
      mode === 'production' && env.VITE_SENTRY_AUTH_TOKEN
        ? sentryVitePlugin({
          org: env.VITE_SENTRY_ORG,
          project: env.VITE_SENTRY_PROJECT,
          authToken: env.VITE_SENTRY_AUTH_TOKEN,
          sourcemaps: {
            assets: './dist/**',
            ignore: ['node_modules']
          },
          telemetry: false
        })
        : undefined
    ].filter(Boolean),

    build: {
      // 代码分割
      rollupOptions: {
        output: {
          manualChunks: {
            // Vue 核心
            'vue-vendor': ['vue', 'vue-router', 'pinia'],
            // Element Plus
            'element-plus': ['element-plus'],
            // 工具库
            utils: ['axios', 'crypto-js', 'dayjs']
          },
          // 分块命名（带哈希）
          chunkFileNames: 'js/[name]-[hash].js',
          entryFileNames: 'js/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            // 根据文件类型分类
            const name = assetInfo.name || 'asset'
            const info = name.split('.')
            let extType = info[info.length - 1]

            if (/\.(png|jpe?g|gif|svg|webp|ico)$/i.test(name)) {
              extType = 'images'
            } else if (/\.(woff2?|eot|ttf|otf)$/i.test(name)) {
              extType = 'fonts'
            } else if (/\.css$/i.test(name)) {
              extType = 'css'
            }

            return `${extType}/[name]-[hash].[ext]`
          }
        }
      },
      // 分块大小警告限制（KB）
      chunkSizeWarningLimit: 1000,
      // 启用 CSS 代码分割
      cssCodeSplit: true,
      // 构建后是否生成 source map
      sourcemap: mode === 'development',
      // 压缩选项
      minify: 'terser',
      terserOptions: mode === 'production'
        ? {
          compress: {
            drop_console: true,
            drop_debugger: true
          }
        }
        : undefined,
      // 静态资源处理
      assetsInlineLimit: 4096, // 4KB 以下内联为 base64
      // 输出目录
      outDir: 'dist',
      // 清空输出目录
      emptyOutDir: true
    },

    // 优化依赖预构建
    optimizeDeps: {
      include: ['vue', 'vue-router', 'pinia', 'element-plus', 'axios']
    },

    // 服务器配置
    server: {
      port: 5173,
      open: true,
      cors: true,
      // 代理配置 - 将 /api 请求代理到后端服务
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL || 'http://localhost:3000/api',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          // 配置代理日志
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq, req) => {
              console.log(`[Proxy] ${req.method} ${req.url} -> ${proxyReq.path}`)
            })
          }
        }
      }
    },

    // 预览服务器配置
    preview: {
      port: 4173,
      open: true
    }
  }
})
