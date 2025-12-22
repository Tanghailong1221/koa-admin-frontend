import { defineStore } from 'pinia'
import { fetchMenuApi } from '@/api/menu'
import type { MenuItem } from '@/types/menu'

export const useMenuStore = defineStore('menu', {
  state: () => ({
    menus: [] as MenuItem[],
    loaded: false,
    routesAdded: false,
  }),
  actions: {
    setMenus(list: MenuItem[]) {
      this.menus = list
      this.loaded = true
    },
    reset() {
      this.menus = []
      this.loaded = false
      this.routesAdded = false
    },
    async fetchMenus() {
      const res = await fetchMenuApi()
      this.setMenus(res)
      return res
    },
  },
})

