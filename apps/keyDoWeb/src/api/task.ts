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
