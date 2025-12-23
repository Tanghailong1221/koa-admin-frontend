/**
 * 环境配置
 * 从环境变量中读取配置
 */

/**
 * 环境配置接口
 */
export interface EnvConfig {
    /** 应用标题 */
    appTitle: string
    /** API 基础路径 */
    apiBaseUrl: string
    /** 是否启用 Mock 数据 */
    useMock: boolean
    /** 是否启用性能监控 */
    enablePerformanceMonitor: boolean
    /** 性能监控采样率 */
    performanceSampleRate: number
    /** 是否启用版本检测 */
    enableVersionCheck: boolean
    /** 版本检测间隔（毫秒） */
    versionCheckInterval: number
    /** 是否启用 Sentry */
    enableSentry: boolean
    /** Sentry DSN */
    sentryDsn: string
    /** 是否启用控制台日志 */
    enableConsole: boolean
    /** 是否启用数据加密 */
    enableEncryption: boolean
    /** 加密密钥 */
    encryptionKey: string
    /** 上传文件大小限制（MB） */
    uploadMaxSize: number
    /** 上传文件类型限制 */
    uploadAllowedTypes: string
    /** CDN 地址 */
    cdnUrl: string
    /** 是否启用 CDN */
    enableCdn: boolean
}

/**
 * 获取环境变量
 */
function getEnv(key: string, defaultValue: string = ''): string {
    return import.meta.env[key] || defaultValue
}

/**
 * 获取布尔类型环境变量
 */
function getBooleanEnv(key: string, defaultValue: boolean = false): boolean {
    const value = getEnv(key)
    if (value === '') return defaultValue
    return value === 'true' || value === '1'
}

/**
 * 获取数字类型环境变量
 */
function getNumberEnv(key: string, defaultValue: number = 0): number {
    const value = getEnv(key)
    if (value === '') return defaultValue
    const num = Number(value)
    return isNaN(num) ? defaultValue : num
}

/**
 * 环境配置
 */
export const env: EnvConfig = {
    appTitle: getEnv('VITE_APP_TITLE', '前端架构增强项目'),
    apiBaseUrl: getEnv('VITE_API_BASE_URL', '/api'),
    useMock: getBooleanEnv('VITE_USE_MOCK', true),
    enablePerformanceMonitor: getBooleanEnv('VITE_ENABLE_PERFORMANCE_MONITOR', true),
    performanceSampleRate: getNumberEnv('VITE_PERFORMANCE_SAMPLE_RATE', 1.0),
    enableVersionCheck: getBooleanEnv('VITE_ENABLE_VERSION_CHECK', false),
    versionCheckInterval: getNumberEnv('VITE_VERSION_CHECK_INTERVAL', 60000),
    enableSentry: getBooleanEnv('VITE_ENABLE_SENTRY', false),
    sentryDsn: getEnv('VITE_SENTRY_DSN'),
    enableConsole: getBooleanEnv('VITE_ENABLE_CONSOLE', true),
    enableEncryption: getBooleanEnv('VITE_ENABLE_ENCRYPTION', false),
    encryptionKey: getEnv('VITE_ENCRYPTION_KEY'),
    uploadMaxSize: getNumberEnv('VITE_UPLOAD_MAX_SIZE', 10),
    uploadAllowedTypes: getEnv('VITE_UPLOAD_ALLOWED_TYPES', 'image/*,video/*,.pdf'),
    cdnUrl: getEnv('VITE_CDN_URL'),
    enableCdn: getBooleanEnv('VITE_ENABLE_CDN', false)
}

/**
 * 是否为开发环境
 */
export const isDev = import.meta.env.DEV

/**
 * 是否为生产环境
 */
export const isProd = import.meta.env.PROD

/**
 * 当前环境模式
 */
export const mode = import.meta.env.MODE

/**
 * 打印环境配置（仅开发环境）
 */
if (isDev && env.enableConsole) {
    console.log('[环境配置]', {
        mode,
        isDev,
        isProd,
        config: env
    })
}

/**
 * 导出默认配置
 */
export default env
