/**
 * 角色相关类型定义
 */

// 角色信息
export interface RoleInfo {
    id: number
    roleName: string
    roleCode: string
    remark?: string
    description?: string
    status?: number
    permissionIds?: number[]
    createdAt?: string
    updatedAt?: string
}

// 角色列表查询参数
export interface RoleListParams {
    page?: number
    size?: number
    keyword?: string
}

// 创建角色参数
export interface CreateRoleParams {
    roleName: string
    roleCode: string
    description?: string
    permissionIds?: number[]
}

// 更新角色参数
export interface UpdateRoleParams {
    roleName?: string
    roleCode?: string
    description?: string
    permissionIds?: number[]
}

// 分配权限参数
export interface AssignPermissionsParams {
    permissionIds: number[]
}
