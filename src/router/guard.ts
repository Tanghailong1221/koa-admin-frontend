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
          // 如果获取用户信息失败，可能是 token 过期，但不强制登出，继续尝试加载菜单
        }
      }
      if (!menuStore.loaded) {
        try {
          await menuStore.fetchMenus()
        } catch (err) {
          console.warn('fetchMenus failed', err)
          // 菜单加载失败不影响访问，使用空菜单
        }
      }
      if (!menuStore.routesAdded && menuStore.menus.length) {
        addDynamicRoutes(router, menuStore.menus)
        menuStore.routesAdded = true
        return next({ ...to, replace: true })
      }
      next()
    } catch (error) {
      console.error('router guard error', error)
      // 只有严重错误才登出
      if (error instanceof Error && error.message.includes('401')) {
        auth.logout()
        next({ name: 'Login', query: { redirect: to.fullPath } })
      } else {
        next()
      }
    }
  })

  router.afterEach(to => {
    tabsStore.initHome(to)
    tabsStore.addTab(to)
  })
}

