import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import BasicLayout from '@/layouts/BasicLayout.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/Login.vue'),
    meta: { public: true, title: '登录' },
  },
  {
    path: '/',
    name: 'Root',
    component: BasicLayout,
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/Index.vue'),
        meta: { title: '仪表盘' },
      },
      {
        path: ':pathMatch(.*)*',
        name: 'NotFoundInLayout',
        component: () => import('@/views/error/NotFound.vue'),
        meta: { title: '404' },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router

