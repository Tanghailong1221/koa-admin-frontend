import axios from 'axios'
import type { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/store/auth'
import { mockApi, isMockEnabled } from '@/mock'
import { createRetryStrategy, RetryStrategy } from './http/retry-strategy'
import { createRequestDeduplication } from './http/request-deduplication'
import { createOfflineQueue } from './http/offline-queue'
import { getErrorLogger, ErrorType } from './error-logger'
import { createDataPermissionInterceptor } from './http/data-permission-interceptor'
import type { DataPermissionConfig } from './http/data-permission-interceptor'
import { csrfProtection } from './csrf-protection'
import { offlineCacheManager } from './offline-cache'

// 启动时检查 mock 状态
if (isMockEnabled()) {
  console.log('%c[Mock] Mock 数据已启用', 'color: #409eff; font-weight: bold')
  console.log('[Mock] 测试账号: admin / admin123')
} else {
  console.log('[Mock] Mock 数据未启用，使用真实 API')
}

export interface ApiResponse<T = any> {
  code?: number
  message?: string
  data: T
}

const SUCCESS_CODES = [0]

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '/api/v1',
  timeout: 15_000,
  withCredentials: false,
})

// 创建重试策略实例
const retryStrategy = createRetryStrategy({
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 30000,
  backoffFactor: 2,
  onRetry: (error, retryCount, delay) => {
    console.log(
      `[Retry] 请求失败，${delay}ms 后进行第 ${retryCount + 1} 次重试`,
      error.config?.url
    )
  },
})

// 创建请求去重管理器实例
const requestDeduplication = createRequestDeduplication({
  enabled: true,
})

// 定期清理超时的请求（防止内存泄漏）
setInterval(() => {
  requestDeduplication.cleanupStaleRequests(60000) // 清理 1 分钟前的请求
}, 30000) // 每 30 秒检查一次

// 创建离线队列实例
const offlineQueue = createOfflineQueue({
  enabled: true,
  maxQueueSize: 50,
  persist: true,
  onOnline: () => {
    ElMessage.success('网络已恢复，正在同步离线数据...')
  },
  onOffline: () => {
    ElMessage.warning('网络已断开，请求将在网络恢复后自动重试')
  },
  onReplaySuccess: (config) => {
    console.log('[OfflineQueue] 离线请求已成功同步:', config.url)
  },
  onReplayError: (config, error) => {
    console.error('[OfflineQueue] 离线请求同步失败:', config.url, error)
  },
})

// 设置离线队列的重放函数
offlineQueue.setReplayFunction((config) => instance.request(config))

// 获取错误日志记录器
const errorLogger = getErrorLogger()

// 创建数据权限拦截器实例
const dataPermissionInterceptor = createDataPermissionInterceptor({
  enabled: true,
  getPermissionConfig: () => {
    const auth = useAuthStore()
    if (!auth.userInfo) {
      return null
    }

    // 从用户信息中提取权限配置
    const config: DataPermissionConfig = {
      userId: auth.userInfo.id,
      username: auth.userInfo.username,
      deptId: auth.userInfo.deptId,
      roleIds: auth.userInfo.roles?.map((r: any) => r.id) || [],
      roleCodes: auth.userInfo.roles?.map((r: any) => r.code) || [],
      isSuperAdmin: auth.userInfo.roles?.some((r: any) => r.code === 'super_admin') || false
    }

    return config
  }
})

let refreshing = false
let refreshPromise: Promise<any> | null = null

instance.interceptors.request.use(config => {
  const auth = useAuthStore()
  const token = auth.token
  if (token) {
    if (!config.headers) {
      config.headers = {} as any
    }
    config.headers.Authorization = `Bearer ${token}`
  }

  // CSRF 保护
  const method = config.method?.toUpperCase() || 'GET'
  const url = config.url || ''
  if (csrfProtection.needsProtection(method, url)) {
    const csrfHeaders = csrfProtection.getTokenHeader()
    config.headers = {
      ...config.headers,
      ...csrfHeaders
    } as any
  }

  // 数据权限拦截
  config = dataPermissionInterceptor.intercept(config) as any

  // 请求去重检查
  const isDuplicate = requestDeduplication.addRequest(config)
  if (isDuplicate) {
    // 如果是重复请求，抛出取消错误
    return Promise.reject(
      new axios.Cancel('检测到重复请求，已自动取消')
    )
  }

  return config
})

instance.interceptors.response.use(
  async (response: AxiosResponse<ApiResponse>) => {
    // 请求成功，从去重队列中移除
    requestDeduplication.removeRequest(response.config)

    const payload = response.data

    // 缓存 GET 请求的响应（用于离线访问）
    const method = response.config.method?.toUpperCase() || 'GET'
    const url = response.config.url || ''
    if (method === 'GET' && url && !url.includes('/refresh-token')) {
      try {
        await offlineCacheManager.cacheResponse(
          url,
          method,
          payload?.data ?? payload
        )
      } catch (error) {
        console.warn('Failed to cache response:', error)
      }
    }

    // 如果响应没有 code 字段，直接返回 data 或整个 payload
    if (payload?.code === undefined) {
      return payload?.data ?? payload
    }
    if (!SUCCESS_CODES.includes(payload.code)) {
      ElMessage.error(payload?.message || '请求失败')
      return Promise.reject(payload)
    }
    return payload?.data ?? payload
  },
  async (error: any) => {
    const axiosError = error as AxiosError
    const auth = useAuthStore()
    const config = axiosError.config!

    // 请求失败，从去重队列中移除
    if (config) {
      requestDeduplication.removeRequest(config)
    }

    // 如果是取消的请求，直接返回
    if (axios.isCancel(error)) {
      console.log('[Request] 请求已取消:', error.message)
      return Promise.reject(error)
    }

    // 检查是否是网络错误且离线
    const isNetworkError = !axiosError.response && axiosError.message === 'Network Error'
    if (isNetworkError && !offlineQueue.isNetworkOnline()) {
      // 尝试从缓存中获取数据（仅 GET 请求）
      const method = config.method?.toUpperCase() || 'GET'
      const url = config.url || ''
      if (method === 'GET' && url) {
        try {
          const cachedData = await offlineCacheManager.getCachedResponse(url, method)
          if (cachedData !== null) {
            console.log('[OfflineCache] 使用缓存数据:', url)
            ElMessage.warning('网络离线，正在使用缓存数据')
            return cachedData
          }
        } catch (error) {
          console.warn('Failed to get cached response:', error)
        }
      }

      // 尝试将请求加入离线队列
      const queued = offlineQueue.enqueue(config)
      if (queued) {
        errorLogger.warning('网络离线，请求已加入队列', axiosError, { url: config.url })
        ElMessage.info('网络离线，请求已加入队列，将在网络恢复后自动重试')
        return Promise.reject(new Error('网络离线，请求已加入离线队列'))
      }
    }

    // 如果是刷新 token 自己失败，直接登出
    if (config?.url?.includes('/refresh-token')) {
      errorLogger.error(ErrorType.HTTP_ERROR, 'Token 刷新失败', axiosError, { url: config.url })
      auth.logout()
      window.location.href = '/login'
      return Promise.reject(axiosError)
    }

    // 处理 401 未授权错误（token 刷新）
    const isUnauthorized = axiosError.response?.status === 401
    if (isUnauthorized && auth.refreshToken) {
      try {
        if (!refreshing) {
          refreshing = true
          refreshPromise = auth.refreshTokenAction()
        }
        await refreshPromise
        refreshing = false
        refreshPromise = null
        // 重放原请求
        return instance(config)
      } catch (e) {
        refreshing = false
        refreshPromise = null
        errorLogger.error(ErrorType.HTTP_ERROR, 'Token 刷新失败，用户已登出', e as Error, {
          url: config.url,
        })
        auth.logout()
        window.location.href = '/login'
        return Promise.reject(axiosError)
      }
    }

    if (isUnauthorized) {
      errorLogger.error(ErrorType.HTTP_ERROR, '未授权访问', axiosError, {
        url: config.url,
        status: 401,
      })
      auth.logout()
      window.location.href = '/login'
      return Promise.reject(axiosError)
    }

    // 处理请求重试
    // 检查是否标记为不可重试
    if (!RetryStrategy.isMarkedAsNoRetry(config)) {
      const retryCount = retryStrategy.getRetryCount(config)

      // 判断是否可以重试
      if (retryStrategy.canRetry(axiosError, retryCount)) {
        // 增加重试计数
        retryStrategy.setRetryCount(config, retryCount + 1)

        // 执行重试（包含延迟）
        await retryStrategy.executeRetry(axiosError, retryCount)

        // 重新发起请求
        return instance(config)
      }
    }

    // 记录错误到日志
    const status = axiosError.response?.status
    const errorMessage = getErrorMessage(axiosError)

    errorLogger.error(ErrorType.HTTP_ERROR, errorMessage, axiosError, {
      url: config.url,
      method: config.method,
      status,
      statusText: axiosError.response?.statusText,
    })

    // 显示错误消息
    ElMessage.error(errorMessage)
    return Promise.reject(axiosError)
  }
)

/**
 * 获取友好的错误消息
 */
function getErrorMessage(error: AxiosError): string {
  const status = error.response?.status
  const data = error.response?.data as any

  // 优先使用服务器返回的错误消息
  if (data?.message) {
    return data.message
  }

  // 根据状态码返回友好消息
  if (status) {
    const statusMessages: Record<number, string> = {
      400: '请求参数错误',
      401: '未授权，请重新登录',
      403: '没有权限访问',
      404: '请求的资源不存在',
      405: '请求方法不允许',
      408: '请求超时',
      409: '数据冲突',
      422: '数据验证失败',
      429: '请求过于频繁，请稍后再试',
      500: '服务器内部错误',
      502: '网关错误',
      503: '服务暂时不可用',
      504: '网关超时',
    }

    return statusMessages[status] || `请求失败 (${status})`
  }

  // 网络错误
  if (error.message === 'Network Error') {
    return '网络连接失败，请检查网络'
  }

  // 超时错误
  if (error.code === 'ECONNABORTED') {
    return '请求超时，请稍后重试'
  }

  // 默认错误消息
  return error.message || '网络异常，请稍后重试'
}

export const request = async <T = any>(config: AxiosRequestConfig): Promise<T> => {
  // Mock 拦截
  if (isMockEnabled()) {
    let url = config.url || ''
    const method = config.method?.toLowerCase() || 'get'
    const baseURL = config.baseURL || instance.defaults.baseURL || '/api/v1'

    // 去掉 baseURL 前缀，获取相对路径
    if (url.startsWith(baseURL)) {
      url = url.substring(baseURL.length)
    }
    // 确保以 / 开头
    if (!url.startsWith('/')) {
      url = '/' + url
    }

    console.log('[Mock] Intercepting:', method.toUpperCase(), url, config.data || config.params)

    try {
      let mockData: any = null

      // 登录
      if (url === '/user/login' && method === 'post') {
        mockData = await mockApi.login(config.data as any)
      }
      // 刷新 token
      else if (url === '/user/refresh-token' && method === 'post') {
        mockData = await mockApi.refreshToken((config.data as any).refreshToken)
      }
      // 登出
      else if (url === '/user/logout' && method === 'post') {
        mockData = await mockApi.logout()
      }
      // 当前用户
      else if (url === '/user/current' && method === 'get') {
        mockData = await mockApi.getCurrentUser()
      }
      // 菜单树
      else if (url === '/menu/tree/current' && method === 'get') {
        mockData = await mockApi.getMenuTree()
      }
      // 用户列表
      else if (url === '/user/list' && method === 'get') {
        mockData = await mockApi.getUserList(config.params as any)
      }
      // 角色列表
      else if (url === '/role/list' && method === 'get') {
        mockData = await mockApi.getRoleList(config.params as any)
      }

      if (mockData !== null) {
        console.log('[Mock] Returning data:', mockData)
        // 模拟响应拦截器的处理逻辑
        const payload: ApiResponse = { code: 0, data: mockData, message: '' }
        if (payload.code !== undefined && !SUCCESS_CODES.includes(payload.code)) {
          ElMessage.error(payload.message || '请求失败')
          return Promise.reject(payload)
        }
        // 返回 data 字段，与响应拦截器逻辑一致
        return Promise.resolve((payload.data ?? payload) as T)
      } else {
        console.log('[Mock] No mock handler for:', method.toUpperCase(), url, '- using real API')
      }
    } catch (error: any) {
      console.error('[Mock] Error:', error)
      ElMessage.error(error.message || 'Mock 错误')
      return Promise.reject({ code: -1, message: error.message || 'Mock 错误' })
    }
  }

  // 非 mock 请求，使用正常的 axios 请求
  const response = await instance.request(config)
  return response as T
}

// 导出 instance 供其他需要直接使用 axios instance 的地方
export { instance }

// 导出数据权限拦截器实例
export { dataPermissionInterceptor }

// 默认导出包装后的 request 函数
export default request

