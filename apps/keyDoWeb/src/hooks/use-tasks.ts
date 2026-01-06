/**
 * 任务相关 Hooks
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as taskApi from '@/api/task'
import { queryKeys } from './query-keys'
import type { Task, UpdateTaskInput } from '@yuan-shan/keydo-contract'
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

    // 执行之前先触发乐观更新
    onMutate: async ({ id, data }) => {
      // 1. 取消正在进行的查询，避免覆盖我们的乐观更新
      await queryClient.cancelQueries({ queryKey: queryKeys.tasks.list() })

      // 2. 保存旧数据的快照，用于出错时回滚
      const previousTasks = queryClient.getQueryData<Task[]>(queryKeys.tasks.list())

      // 3. 乐观更新：直接修改内存里的数据
      if (previousTasks) {
        queryClient.setQueryData<Task[]>(queryKeys.tasks.list(), (old = []) => {
          return old.map((task) => {
            if (task.id === id) {
              // 将新数据合并到旧任务中
              return { ...task, ...data }
            }
            return task
          })
        })
      }

      // 返回快照，供 onError 使用
      return { previousTasks }
    },

    // 如果失败了，使用快照恢复数据
    onError: (error: any, _variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(queryKeys.tasks.list(), context.previousTasks)
      }
      toast.error(error.message || '更新任务失败')
    },

    // 不管成功还是失败，都重新拉取一下服务器真实数据，确保同步
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
