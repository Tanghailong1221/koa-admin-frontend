import request from '@/utils/request'
import type { MenuItem } from '@/types/menu'

export interface BackendMenu {
  id: number
  menuName: string
  menuType: 1 | 2 | 3
  parentId?: number
  path?: string
  component?: string
  icon?: string
  sort?: number
  visible?: 0 | 1
  status?: 0 | 1
  permCode?: string
  redirect?: string
  children?: BackendMenu[]
}

const mapMenu = (node: BackendMenu): MenuItem => ({
  id: node.id,
  title: node.menuName,
  path: node.path || '',
  component: node.component,
  icon: node.icon,
  redirect: node.redirect,
  permissions: node.permCode ? [node.permCode] : [],
  children: node.children?.map(mapMenu),
})

export const fetchMenuApi = () =>
  request<BackendMenu[]>({
    url: '/menu/tree/current',
    method: 'get',
  })
    .then(list => {
      // 确保返回的是数组
      if (!Array.isArray(list)) {
        console.warn('menu api returned non-array', list)
        return []
      }
      return list.map(mapMenu)
    })
    .catch(err => {
      console.error('fetchMenuApi error', err)
      // 返回空数组，避免白屏
      return []
    })

