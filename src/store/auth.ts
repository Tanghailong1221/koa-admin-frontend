import { defineStore } from 'pinia'
import { getProfileApi, loginApi, logoutApi, refreshTokenApi, type UserInfo } from '@/api/auth'

interface AuthState {
  token: string | null
  refreshToken: string | null
  userInfo: UserInfo | null
}

const TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: localStorage.getItem(TOKEN_KEY),
    refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY),
    userInfo: null,
  }),
  getters: {
    isLoggedIn: state => Boolean(state.token),
  },
  actions: {
    setToken(token: string | null, refreshToken?: string | null) {
      this.token = token
      if (token) {
        localStorage.setItem(TOKEN_KEY, token)
      } else {
        localStorage.removeItem(TOKEN_KEY)
      }

      if (refreshToken !== undefined) {
        this.refreshToken = refreshToken
        if (refreshToken) {
          localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
        } else {
          localStorage.removeItem(REFRESH_TOKEN_KEY)
        }
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
    },
  },
})

