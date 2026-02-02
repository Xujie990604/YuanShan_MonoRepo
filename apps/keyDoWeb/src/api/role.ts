import { apiClient } from '@/lib/axios'
import type { Role, CreateRoleInput, UpdateRoleInput } from '@yuan-shan/keydo-contract'

/**
 * 获取角色列表
 */
export async function getRoles(): Promise<Role[]> {
  return apiClient.get('/roles')
}

/**
 * 创建角色
 */
export async function createRole(data: CreateRoleInput): Promise<Role> {
  return apiClient.post('/roles', data)
}

/**
 * 更新角色
 */
export async function updateRole({ id, data }: { id: string; data: UpdateRoleInput }): Promise<Role> {
  return apiClient.put(`/roles/${id}`, data)
}

/**
 * 删除角色
 */
export async function deleteRole(id: string): Promise<{ success: boolean }> {
  return apiClient.delete(`/roles/${id}`)
}
