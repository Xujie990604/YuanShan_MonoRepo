import { create } from 'zustand'

/**
 * 全局登录状态管理（示例）：
 * - 负责管理 accessToken 和是否已登录
 * - 同时与 localStorage 同步，方便网络层继续从 localStorage 读取 token
 */

interface AuthState {
  // 当前登录的 accessToken，未登录时为 null
  accessToken: string | null
  // 当前登录用户 id（登录接口返回），未登录时为 null
  userId: number | null
  // 是否已登录
  isAuthenticated: boolean
  // 设置（或清空）token 的方法
  setAccessToken: (token: string | null) => void
  // 设置（或清空）userId 的方法
  setUserId: (userId: number | null) => void
}

export const useAuthStore = create<AuthState>(set => ({
  // 初始化时从 localStorage 里读取一次 token
  accessToken: localStorage.getItem('access_token'),
  // 初始化时从 localStorage 里读取一次 userId
  userId: localStorage.getItem('user_id') ? Number(localStorage.getItem('user_id')) : null,
  isAuthenticated: !!localStorage.getItem('access_token'),
  setAccessToken: token => {
    // 同步更新到 localStorage，保证拦截器等仍然能读取到最新 token
    if (token) {
      localStorage.setItem('access_token', token)
    } else {
      localStorage.removeItem('access_token')
      // token 清空时也清空 userId
      localStorage.removeItem('user_id')
    }
    set({
      accessToken: token,
      userId: token ? localStorage.getItem('user_id') ? Number(localStorage.getItem('user_id')) : null : null,
      isAuthenticated: !!token,
    })
  },
  setUserId: userId => {
    if (userId === null) {
      localStorage.removeItem('user_id')
    } else {
      localStorage.setItem('user_id', String(userId))
    }
    set({ userId })
  },
}))



