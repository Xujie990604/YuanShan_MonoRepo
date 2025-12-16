import { create } from 'zustand'

/**
 * 全局登录状态管理（示例）：
 * - 负责管理 accessToken 和是否已登录
 * - 同时与 localStorage 同步，方便网络层继续从 localStorage 读取 token
 */

interface AuthState {
  // 当前登录的 accessToken，未登录时为 null
  accessToken: string | null
  // 是否已登录
  isAuthenticated: boolean
  // 设置（或清空）token 的方法
  setAccessToken: (token: string | null) => void
}

export const useAuthStore = create<AuthState>(set => ({
  // 初始化时从 localStorage 里读取一次 token
  accessToken: localStorage.getItem('access_token'),
  isAuthenticated: !!localStorage.getItem('access_token'),
  setAccessToken: token => {
    // 同步更新到 localStorage，保证拦截器等仍然能读取到最新 token
    if (token) {
      localStorage.setItem('access_token', token)
    } else {
      localStorage.removeItem('access_token')
    }
    set({
      accessToken: token,
      isAuthenticated: !!token,
    })
  },
}))



