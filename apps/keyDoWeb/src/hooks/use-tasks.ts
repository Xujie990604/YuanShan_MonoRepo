/**
 * 任务相关 Hooks
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as taskApi from '@/api/task'
import { queryKeys } from './query-keys'
import type { UpdateTaskInput } from '@yuan-shan/keydo-contract'
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
 * 更新任务（带乐观更新版）
 * 
 * 功能：
 * 1. 在 onMutate 中立即更新本地状态，提供即时 UI 反馈
 * 2. 在 onError 中回滚到之前的状态
 * 3. 在 onSettled 中刷新服务器数据，确保最终一致性
 */
export function useUpdateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskInput }) =>
      taskApi.updateTask(id, data),

    // 执行之前取消查询
    // 注意：乐观更新已经在调用方（如 handleDragEnd）中完成
    // 这里只负责取消查询，不再进行乐观更新和保存快照
    onMutate: async () => {
      // 取消正在进行的查询，避免覆盖调用方的乐观更新
      await queryClient.cancelQueries({ queryKey: queryKeys.tasks.list() })
    },

    // 如果失败了，只显示错误提示
    // 注意：回滚逻辑由调用方处理（调用方知道更新前的状态）
    // 因为乐观更新可能在调用方完成，这里的快照可能是更新后的数据
    onError: (error: any) => {
      toast.error(error.message || '更新任务失败')
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.list() })
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
