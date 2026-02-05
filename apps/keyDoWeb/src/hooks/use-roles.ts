import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from './query-keys'
import * as roleApi from '@/api/role'
import type { CreateRoleInput, UpdateRoleInput } from '@yuan-shan/keydo-contract'

/**
 * 获取角色列表
 */
export function useRoles() {
  return useQuery({
    queryKey: queryKeys.roles.list(),
    queryFn: roleApi.getRoles,
    staleTime: 5 * 60 * 1000, // 5 分钟
  })
}

/**
 * 创建角色
 */
export function useCreateRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateRoleInput) => roleApi.createRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.list() })
    },
  })
}

/**
 * 更新角色
 */
export function useUpdateRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRoleInput }) => roleApi.updateRole({ id, data }),
    onSuccess: () => {
      // 更新成功后，刷新角色列表
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.list() })
      // 更新角色后，刷新任务列表（任务可能显示角色信息）
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.list() })
    },
  })
}

/**
 * 删除角色
 */
export function useDeleteRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => roleApi.deleteRole(id),
    onSuccess: () => {
      // 删除角色后，刷新角色列表
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.list() })
      // 删除角色后，刷新任务列表
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.list() })
    },
  })
}
