import type { DirectiveBinding } from 'vue'
import { useMenuStore } from '@/store/menu'

function checkPermission(binding: DirectiveBinding) {
  const { value } = binding
  if (!Array.isArray(value) || value.length === 0) return true

  const menuStore = useMenuStore()
  // 从菜单中收集所有权限码
  const collectPerms = (menus: typeof menuStore.menus): string[] => {
    const perms: string[] = []
    const travel = (items: typeof menus) => {
      items.forEach(item => {
        if (item.permissions) perms.push(...item.permissions)
        if (item.children) travel(item.children)
      })
    }
    travel(menus)
    return perms
  }
  const allPerms = collectPerms(menuStore.menus)

  return value.some(code => allPerms.includes(code))
}

export default {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    if (!checkPermission(binding)) {
      el.parentNode?.removeChild(el)
    }
  },
  updated(el: HTMLElement, binding: DirectiveBinding) {
    if (!checkPermission(binding)) {
      el.parentNode?.removeChild(el)
    }
  },
}

