import network from './network'
import { TIME_OUT } from './config'

/**
 * 调用 nest 接口实例
 */
export const normalNetwork = new network({
  timeout: TIME_OUT,
  baseURL: 'https://ezcloud.uniview.com',
  requestInterceptor(config) {
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


