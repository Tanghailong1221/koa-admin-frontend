import { defineStore } from 'pinia'
import type { RouteLocationNormalized } from 'vue-router'
import { useMenuStore } from './menu'

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
    keepAliveNames(): string[] {
      return this.visited.map(item => item.path)
    },
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

      // 优先使用 route.meta.title，如果不存在则从菜单中查找
      let title = route.meta?.title
      if (!title || title === '404') {
        const menuStore = useMenuStore()
        const findMenuTitle = (menus: any[]): string | undefined => {
          for (const menu of menus) {
            if (menu.path === path) {
              return menu.name
            }
            if (menu.children) {
              const childTitle = findMenuTitle(menu.children)
              if (childTitle) return childTitle
            }
          }
          return undefined
        }
        const menuTitle = findMenuTitle(menuStore.menus)
        if (menuTitle) {
          title = menuTitle
        }
      }

      // 如果还是没有标题，使用路径
      if (!title) {
        title = path
      }

      const exists = this.visited.find(item => item.path === path)
      if (!exists) {
        this.visited.push({ title: String(title), path, closable: path !== HOME_PATH })
      } else {
        // 更新已存在的 tab 标题（如果新标题不是 404 或路径）
        if (title !== '404' && title !== path) {
          exists.title = String(title)
        }
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
    // 刷新所有 tab 的标题（从菜单中获取）
    refreshTitles() {
      const menuStore = useMenuStore()
      const findMenuTitle = (menus: any[], path: string): string | undefined => {
        for (const menu of menus) {
          if (menu.path === path) {
            return menu.name
          }
          if (menu.children) {
            const childTitle = findMenuTitle(menu.children, path)
            if (childTitle) return childTitle
          }
        }
        return undefined
      }

      this.visited.forEach(tab => {
        if (tab.title === '404' || tab.title === tab.path) {
          const menuTitle = findMenuTitle(menuStore.menus, tab.path)
          if (menuTitle) {
            tab.title = menuTitle
          }
        }
      })
    },
  },
  persist: {
    key: 'tabs',
    storage: sessionStorage,
    pick: ['visited', 'activePath'],
  },
})

