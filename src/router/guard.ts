import type { Router } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { useMenuStore } from '@/store/menu'
import { addDynamicRoutes } from './dynamic'
import { useTabsStore } from '@/store/tabs'

export default function setupRouterGuard(router: Router) {
  const tabsStore = useTabsStore()

  router.beforeEach(async (to, _from, next) => {
    if (to.meta?.title) {
      document.title = String(to.meta.title)
    }

    const auth = useAuthStore()
    const menuStore = useMenuStore()

    if (to.meta?.public) {
      next()
      return
    }

    if (!auth.token) {
      next({ name: 'Login', query: { redirect: to.fullPath } })
      return
    }

    try {
      if (!auth.userInfo) {
        try {
          await auth.fetchProfile()
        } catch (err) {
          console.warn('fetchProfile failed', err)
        }
      }
      if (!menuStore.loaded) {
        try {
          await menuStore.fetchMenus()
        } catch (err) {
          console.warn('fetchMenus failed', err)
        }
      }
      if (!menuStore.routesAdded && menuStore.menus.length) {
        addDynamicRoutes(router, menuStore.menus)
        menuStore.routesAdded = true
        // 刷新 tab 标题（从菜单中获取正确的标题）
        tabsStore.refreshTitles()
        // 重新导航到目标路由，让新添加的动态路由生效
        return next({ path: to.fullPath, replace: true })
      }
      next()
    } catch (error) {
      console.error('router guard error', error)
      if (error instanceof Error && error.message.includes('401')) {
        auth.logout()
        next({ name: 'Login', query: { redirect: to.fullPath } })
      } else {
        next()
      }
    }
  })

  router.afterEach(to => {
    // 不要为 404 页面添加 tab（除非是真正的 404）
    if (to.name === 'NotFoundInLayout' && to.path !== '/404') {
      return
    }
    tabsStore.initHome(to)
    tabsStore.addTab(to)
  })
}

