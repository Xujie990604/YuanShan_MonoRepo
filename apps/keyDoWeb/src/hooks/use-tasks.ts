/**
 * 任务相关 Hooks
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as taskApi from '@/api/task'
import { queryKeys } from './query-keys'
import type {  UpdateTaskInput } from '@yuan-shan/keydo-contract'
import { showToast } from '@/lib/simple-toast'

// 便捷方法
const toast = {
  success: (message: string) => showToast(message, { type: 'success' }),
  error: (message: string) => showToast(message, { type: 'error' }),
}

/**
 * 获取任务列表
 */
export function useTasks() {
  return useQuery({
    queryKey: queryKeys.tasks.list(),
    queryFn: taskApi.getTasks,
  })
}

/**
 * 创建任务
 */
export function useCreateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: taskApi.createTask,
    onSuccess: () => {
      // 刷新任务列表
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.list() })
      toast.success('任务创建成功')
    },
    onError: (error: any) => {
      toast.error(error.message || '创建任务失败')
    },
  })
}

/**
 * 更新任务
 */
export function useUpdateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskInput }) =>
      taskApi.updateTask(id, data),
    onSuccess: () => {
      // 刷新任务列表
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.list() })
    },
    onError: (error: any) => {
      toast.error(error.message || '更新任务失败')
    },
  })
}

/**
 * 删除任务
 */
export function useDeleteTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: taskApi.deleteTask,
    onSuccess: () => {
      // 刷新任务列表
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.list() })
      toast.success('任务已删除')
    },
    onError: (error: any) => {
      toast.error(error.message || '删除任务失败')
    },
  })
}
