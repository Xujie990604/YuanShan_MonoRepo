/**
 * 认证状态管理
 * 使用 Zustand 管理 token 和用户信息
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserInfo } from '@yuan-shan/keydo-contract'

interface AuthState {
  token: string | null
  user: UserInfo | null
  setToken: (token: string | null) => void
  setUser: (user: UserInfo | null) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setToken: (token) => set({ token }),
      setUser: (user) => set({ user }),
      clearAuth: () => set({ token: null, user: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token }), // 只持久化 token
    }
  )
)
