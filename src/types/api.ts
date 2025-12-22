export interface PageQuery {
  pageNum?: number
  pageSize?: number
}

export interface PageResult<T> {
  total: number
  list: T[]
}

