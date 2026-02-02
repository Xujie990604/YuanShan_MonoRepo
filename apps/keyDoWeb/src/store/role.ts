import { create } from 'zustand'

/**
 * 角色聚焦状态管理
 * 
 * 功能：
 * - 管理当前聚焦的角色 ID
 * - null 表示"全部任务"视图
 * - 不持久化，每次刷新页面都回到"全部任务"视图
 */
interface RoleState {
  // 当前聚焦的角色 ID (null 表示"全部任务"视图)
  focusedRoleId: string | null
  
  // 设置聚焦角色
  setFocusedRole: (roleId: string | null) => void
  
  // 清除聚焦（回到全部任务）
  clearFocus: () => void
}

export const useRoleStore = create<RoleState>((set) => ({
  focusedRoleId: null,
  setFocusedRole: (roleId) => set({ focusedRoleId: roleId }),
  clearFocus: () => set({ focusedRoleId: null }),
}))
