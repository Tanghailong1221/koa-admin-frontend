import { defineStore } from 'pinia'
import type { RouteLocationNormalized } from 'vue-router'

interface TabItem {
  title: string
  path: string
  closable: boolean
}

const HOME_PATH = '/'

export const useTabsStore = defineStore('tabs', {
  state: () => ({
    visited: [] as TabItem[],
    activePath: HOME_PATH,
  }),
  getters: {
    keepAliveNames: state => state.visited.map(item => item.path),
  },
  actions: {
    initHome(route?: RouteLocationNormalized) {
      if (this.visited.find(item => item.path === HOME_PATH)) return
      const title = route?.meta?.title || '首页'
      this.visited.unshift({ title: String(title), path: HOME_PATH, closable: false })
    },
    addTab(route: RouteLocationNormalized) {
      const path = route.fullPath
      if (!path) return
      const title = route.meta?.title || path
      const exists = this.visited.find(item => item.path === path)
      if (!exists) {
        this.visited.push({ title: String(title), path, closable: path !== HOME_PATH })
      }
      this.activePath = path
    },
    removeTab(path: string) {
      const idx = this.visited.findIndex(item => item.path === path)
      if (idx !== -1) {
        this.visited.splice(idx, 1)
      }
      if (this.activePath === path) {
        const next = this.visited[idx - 1] || this.visited[0]
        this.activePath = next?.path || HOME_PATH
        return this.activePath
      }
      return this.activePath
    },
    removeOthers(path: string) {
      this.visited = this.visited.filter(item => !item.closable || item.path === path)
      this.activePath = path
      return path
    },
    removeAll() {
      this.visited = this.visited.filter(item => !item.closable)
      this.activePath = HOME_PATH
      return HOME_PATH
    },
    setActive(path: string) {
      this.activePath = path
    },
    reset() {
      this.visited = []
      this.activePath = HOME_PATH
    },
  },
})

