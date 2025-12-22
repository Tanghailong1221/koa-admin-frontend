export interface MenuItem {
  id?: number
  title: string
  path: string
  component?: string
  redirect?: string
  icon?: string
  children?: MenuItem[]
  permissions?: string[]
}

