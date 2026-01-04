/**
 * Axios 客户端配置
 * 提供基础的 HTTP 请求能力
 */
import axios, { type AxiosError } from 'axios'
import { useAuthStore } from '@/store/auth'

/**
 * 创建 axios 实例
 */
export const apiClient = axios.create({
  baseURL: 'http://localhost:6040/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * 请求拦截器 - 自动添加 token
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

/**
 * 响应拦截器 - 统一处理响应格式
 */
apiClient.interceptors.response.use(
  (response) => {
    // 后端返回格式：{ code: 200, data: {...}, message: 'success' }
    const { code, data, message } = response.data
    
    // 业务成功
    if (code === 200) {
      return data
    }
    
    // 业务失败
    return Promise.reject({
      code,
      message,
      data,
    })
  },
  (error: AxiosError) => {
    // 401 未授权，清除 token 并跳转登录页
    if (error.response?.status === 401) {
      useAuthStore.getState().clearAuth()
      // 避免在非浏览器环境报错
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login'
      }
    }
    return Promise.reject(error)
  }
)

