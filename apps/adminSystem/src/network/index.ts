import network from './network'

/**
 * 调用 nest 接口实例
 * 开发环境下，通过 Vite 代理，将 /api 前缀转发到 http://localhost:3000
 */
export const YSNetwork = new network({
  timeout: 10000,
  baseURL: '/api/v1',
  requestInterceptor(config) {
    // 每次请求自动携带 access_token
    const token = localStorage.getItem('access_token')
    if (token) {
      if (!config.headers) {
        config.headers = config.headers ?? {}
      }
      (config.headers as any).Authorization = `Bearer ${token}`
    }
    return config
  },
  requestInterceptorCatch(err) {
    return Promise.reject(err)
  },
  responseInterceptor(res) {
    return res.data
  },
  responseInterceptorCatch(err) {
    return Promise.reject(err)
  },
})


