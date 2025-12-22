import axios from 'axios'
import type { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/store/auth'
import { mockApi, isMockEnabled } from '@/mock'

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

let refreshing = false
let refreshPromise: Promise<any> | null = null

instance.interceptors.request.use(config => {
  const auth = useAuthStore()
  const token = auth.token
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

instance.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const payload = response.data
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
    // 原有的错误处理
    const axiosError = error as AxiosError
    const auth = useAuthStore()

    // 如果是刷新 token 自己失败，直接登出
    if (axiosError.config?.url?.includes('/refresh-token')) {
      auth.logout()
      window.location.href = '/login'
      return Promise.reject(axiosError)
    }

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
        const originalRequest = axiosError.config!
        return instance(originalRequest)
      } catch (e) {
        refreshing = false
        refreshPromise = null
        auth.logout()
        window.location.href = '/login'
      }
    }

    if (isUnauthorized) {
      auth.logout()
      window.location.href = '/login'
    }

    const msg =
      (axiosError.response?.data as any)?.message || axiosError.message || '网络异常，请稍后重试'
    ElMessage.error(msg)
    return Promise.reject(axiosError)
  }
)

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
        const payload = { code: 0, data: mockData }
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
  return instance.request<T>(config)
}

// 导出 instance 供其他需要直接使用 axios instance 的地方
export { instance }

// 默认导出包装后的 request 函数
export default request

