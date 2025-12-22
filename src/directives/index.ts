import type { App } from 'vue'
import perm from './perm'

export function setupDirectives(app: App) {
  app.directive('perm', perm)
}

