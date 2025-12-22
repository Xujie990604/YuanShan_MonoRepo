/**
 * 全局 message 实例管理
 * 用于在非 React 组件中使用 Ant Design 的 message 组件
 */

import type { MessageInstance } from 'antd/es/message/interface'

// 存储全局 message 实例
let messageInstance: MessageInstance | null = null

/**
 * 设置全局 message 实例
 * 应该在应用初始化时调用（通常在 App 组件中）
 */
export const setMessageInstance = (instance: MessageInstance) => {
  messageInstance = instance
}

/**
 * 获取全局 message 实例
 * 如果实例未初始化，会在控制台输出警告
 */
export const getMessageInstance = (): MessageInstance | null => {
  if (!messageInstance) {
    console.warn('Message instance has not been initialized. Please call setMessageInstance first.')
  }
  return messageInstance
}

