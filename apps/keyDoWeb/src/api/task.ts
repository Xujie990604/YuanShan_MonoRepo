/**
 * 任务相关 API
 */
import { apiClient } from '@/lib/axios'
import type {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
} from '@yuan-shan/keydo-contract'

/**
 * 获取当前用户的所有任务
 */
export function getTasks(): Promise<Task[]> {
  return apiClient.get('/tasks')
}

/**
 * 创建任务
 */
export function createTask(data: CreateTaskInput): Promise<Task> {
  return apiClient.post('/tasks', data)
}

/**
 * 更新任务
 */
export function updateTask(id: string, data: UpdateTaskInput): Promise<Task> {
  return apiClient.put(`/tasks/${id}`, data)
}

/**
 * 删除任务
 */
export function deleteTask(id: string): Promise<{ success: boolean }> {
  return apiClient.delete(`/tasks/${id}`)
}

/**
 * 设置任务完成状态（支持重复任务自动生成下一实例）
 */
export function completeTask(id: string, data: { completed: boolean }): Promise<Task> {
  return apiClient.post(`/tasks/${id}/complete`, data)
}
