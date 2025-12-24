/**
 * Axios 客户端配置
 * 提供基础的 HTTP 请求能力
 */
import axios, { type AxiosError } from 'axios'

/**
 * 创建 axios 实例
 */
export const apiClient = axios.create({
  baseURL: '/api/v1',
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
    const token = localStorage.getItem('access_token')
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
    // HTTP 错误
    return Promise.reject(error)
  }
)

