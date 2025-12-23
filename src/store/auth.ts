import { defineStore } from 'pinia'
import { getProfileApi, loginApi, logoutApi, refreshTokenApi, type UserInfo } from '@/api/auth'

interface AuthState {
  token: string | null
  refreshToken: string | null
  userInfo: UserInfo | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: null,
    refreshToken: null,
    userInfo: null,
  }),
  getters: {
    isLoggedIn: state => Boolean(state.token),
  },
  actions: {
    setToken(token: string | null, refreshToken?: string | null) {
      this.token = token
      if (refreshToken !== undefined) {
        this.refreshToken = refreshToken
      }
    },
    setUserInfo(user: UserInfo | null) {
      this.userInfo = user
    },
    async login(payload: { username: string; password: string }) {
      const res = await loginApi(payload)
      this.setToken(res.token, res.refreshToken)
      this.setUserInfo(res.userInfo)
      return res
    },
    async fetchProfile() {
      const res = await getProfileApi()
      this.setUserInfo(res as UserInfo)
      return res as UserInfo
    },
    async refreshTokenAction() {
      if (!this.refreshToken) return
      const res = await refreshTokenApi(this.refreshToken)
      this.setToken(res.token, res.refreshToken)
      return res
    },
    async logout() {
      try {
        await logoutApi()
      } catch (err) {
        // ignore logout errors
        console.warn('logout fail', err)
      }
      this.setToken(null, null)
      this.setUserInfo(null)
      // 清除持久化状态
      this.$clearPersisted()
    },
  },
  // 配置持久化
  persist: {
    key: 'auth_store',
    paths: ['token', 'refreshToken', 'userInfo'],
    encrypted: true,
    ttl: 7 * 24 * 60 * 60 * 1000, // 7 天
  },
})

