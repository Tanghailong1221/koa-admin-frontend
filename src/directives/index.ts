/**
 * 指令统一导出
 */

import type { App } from 'vue'
import { vPerm, vRole } from './permission'
import { vLazyLoad } from './lazy-load'
import { vSanitize } from './v-sanitize'

export { vPerm, vRole } from './permission'
export { vLazyLoad } from './lazy-load'
export { vSanitize } from './v-sanitize'
export type { PermissionValue, RoleValue } from './permission'
export type { LazyLoadValue, LazyLoadOptions } from './lazy-load'

/**
 * 注册全局指令
 */
export function setupDirectives(app: App): void {
  // 注册权限指令
  app.directive('perm', vPerm)
  app.directive('role', vRole)

  // 注册懒加载指令
  app.directive('lazy-load', vLazyLoad)

  // 注册 XSS 防护指令
  app.directive('sanitize', vSanitize)

  console.log('[Directives] 全局指令已注册')
}

export { default as vFocusVisible } from './focus-visible'
