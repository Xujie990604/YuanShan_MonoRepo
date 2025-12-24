/**
 * Query Keys 工厂
 * 统一管理所有的 query key，避免重复和冲突
 */

export const queryKeys = {
  // 认证相关
  auth: {
    currentUser: () => ['auth', 'current-user'] as const,
  },
} as const

