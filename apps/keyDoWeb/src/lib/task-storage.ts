import type { Task } from '@/types/task'

/**
 * localStorage 存储的键名
 * - localStorage 是浏览器提供的本地存储 API
 * - 数据会持久保存在浏览器中，即使关闭浏览器也不会丢失
 */
const STORAGE_KEY = 'keydo-tasks'

/**
 * 从 localStorage 加载任务列表
 * 
 * localStorage 说明：
 * - getItem(key): 获取存储的数据（返回字符串或 null）
 * - JSON.parse(): 将 JSON 字符串转换为 JavaScript 对象
 * - as Task[]: TypeScript 类型断言，告诉编译器这是 Task 数组类型
 * 
 * @returns 任务数组，如果加载失败或没有数据则返回空数组
 */
export function loadTasksFromStorage(): Task[] {
  try {
    // 从 localStorage 读取数据（返回 JSON 字符串）
    const data = localStorage.getItem(STORAGE_KEY)
    // 如果没有数据，返回空数组
    if (!data) return []
    // 将 JSON 字符串解析为 JavaScript 对象数组
    return JSON.parse(data) as Task[]
  } catch (error) {
    // 如果解析失败（数据格式错误），捕获异常并返回空数组
    console.error('Failed to load tasks from storage:', error)
    return []
  }
}

/**
 * 保存任务列表到 localStorage
 * 
 * localStorage 说明：
 * - setItem(key, value): 保存数据（value 必须是字符串）
 * - JSON.stringify(): 将 JavaScript 对象转换为 JSON 字符串
 * 
 * @param tasks 要保存的任务数组
 */
export function saveTasksToStorage(tasks: Task[]): void {
  try {
    // 将任务数组转换为 JSON 字符串并保存
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  } catch (error) {
    // 如果保存失败（如存储空间不足），捕获异常并记录错误
    console.error('Failed to save tasks to storage:', error)
  }
}

/**
 * 生成新的任务 ID
 * 
 * ID 生成规则：
 * - Date.now(): 获取当前时间戳（毫秒数）
 * - Math.random(): 生成 0-1 之间的随机数
 * - toString(36): 将数字转换为 36 进制字符串（0-9, a-z）
 * - substr(2, 9): 从第 2 个字符开始，取 9 个字符
 * 
 * 示例 ID: "task-1705123456789-k3j9x2m1p"
 * 
 * @returns 唯一的任务 ID 字符串
 */
export function generateTaskId(): string {
  return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}
