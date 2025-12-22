import type { RouteRecordRaw, Router } from 'vue-router'
import type { MenuItem } from '@/types/menu'

const viewModules = import.meta.glob('../views/**/*.vue')

const loadComponent = (component?: string) => {
  if (!component) return undefined
  const key = `../views/${component.replace(/^\//, '')}.vue`
  return viewModules[key] as any
}

const buildRoutes = (menus: MenuItem[]): RouteRecordRaw[] => {
  const routes: RouteRecordRaw[] = []

  const travel = (items: MenuItem[]) => {
    items.forEach(item => {
      if (item.children && item.children.length) {
        travel(item.children)
      }
      if (item.path && item.component) {
        const component = loadComponent(item.component)
        routes.push({
          path: item.path,
          name: item.path,
          meta: { title: item.title, permissions: item.permissions },
          redirect: item.redirect,
          component: component ?? (() => import('@/views/error/NotFound.vue')),
        })
      }
    })
  }

  travel(menus)
  return routes
}

export const addDynamicRoutes = (router: Router, menus: MenuItem[]) => {
  const dynamicRoutes = buildRoutes(menus)
  dynamicRoutes.forEach(route => {
    router.addRoute('Root', route)
  })
}

