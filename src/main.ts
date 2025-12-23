import { createApp } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import App from './App.vue'
import router from './router'
import setupRouterGuard from './router/guard'
import { setupDirectives } from './directives'
import { createPiniaPersistence } from './plugins/pinia-persistence'
import { setupErrorHandler } from './utils/setup-error-handler'
import { setupRoutePrefetch } from './utils/route-prefetch'
import { setupPerformanceMonitor } from './utils/performance-monitor'
import { setupI18n, getLocale } from './locales'
import { getCurrentElementLocale } from './locales/element-plus'
import { pwaManager } from './utils/pwa'
import { initSentry } from './utils/sentry'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './styles/index.css'
import { useThemeStore } from './store/theme'

const app = createApp(App)
const pinia = createPinia()

// 注册持久化插件
pinia.use(createPiniaPersistence())

app.use(pinia)
setActivePinia(pinia)

// 初始化 Sentry（生产环境）
initSentry(app, router, {
    dsn: import.meta.env.VITE_SENTRY_DSN || '',
    environment: import.meta.env.MODE,
    release: import.meta.env.VITE_APP_VERSION,
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    enabled: import.meta.env.PROD && !!import.meta.env.VITE_SENTRY_DSN
})

// 设置全局错误处理器
setupErrorHandler(app)

// 初始化国际化
setupI18n()

// 初始化主题
useThemeStore()

setupRouterGuard(router)
setupDirectives(app)
app.use(router)

// 配置 Element Plus 语言
app.use(ElementPlus, {
    locale: getCurrentElementLocale(getLocale())
})

// 设置路由预取
setupRoutePrefetch(router, {
    enabled: true,
    delay: 1000,
    maxPrefetch: 3
})

// 设置性能监控（可选）
// 注意：需要先安装 web-vitals：npm install web-vitals
setupPerformanceMonitor({
    // reportUrl: '/api/performance',  // 上报 URL（可选）
    sampleRate: 1.0, // 采样率（1.0 = 100%）
    enableConsole: import.meta.env.DEV, // 开发环境启用控制台输出
    enableStorage: true, // 启用本地存储
    enableWebVitals: true, // 启用 Web Vitals（需要安装 web-vitals）
    enableResourceTiming: true, // 启用资源性能监控
    enableNavigationTiming: true // 启用导航性能监控
})

// 初始化 PWA（生产环境）
if (import.meta.env.PROD) {
    pwaManager.init().catch((error) => {
        console.error('PWA initialization failed:', error)
    })
}

app.mount('#app')
