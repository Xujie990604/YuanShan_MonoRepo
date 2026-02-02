/**
 * Query Keys 工厂
 * 统一管理所有的 query key，避免重复和冲突
 */

export const queryKeys = {
  // 认证相关
  auth: {
    currentUser: () => ['auth', 'current-user'] as const,
  },
  // 任务相关
  tasks: {
    all: () => ['tasks'] as const,
    list: () => ['tasks', 'list'] as const,
  },
  // 角色相关
  roles: {
    all: () => ['roles'] as const,
    list: () => ['roles', 'list'] as const,
  },
} as const

