import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig } from 'axios'
import type { YSNetworkInstanceParam } from './types'
import type { IRequestConfig } from '../request/type'
import { isResponseType } from '../request/type'
import { handleHTTPCode, handleBusinessCode } from './handleCode'
import { getMessageInstance } from '../utils/messageInstance'

class UNVRequest {
  // axios 实例
  instance: AxiosInstance

  // 配置参数
  requestConfig: IRequestConfig = { loading: true, toast: true }

  constructor(config: YSNetworkInstanceParam) {
    // 生成 axios 实例
    this.instance = axios.create(config)

    this.instance.interceptors.request.use(
      config.requestInterceptor,
      config.requestInterceptorCatch
    )
    // 响应拦截器
    this.instance.interceptors.response.use(
      config.responseInterceptor,
      config.responseInterceptorCatch   
    )
  }

  // 发起网络请求
  request<T, D>(config: AxiosRequestConfig, { loading = true, toast = true }: IRequestConfig = {}) {
    // 用于保存 loading 提示的关闭函数
    // Ant Design 的 message.loading() 返回一个函数，调用它可以关闭 loading
    let hideLoading: (() => void) | null = null

    if (loading) {
      // 显示加载中提示
      const message = getMessageInstance()
      if (message) {
        hideLoading = message.loading('加载中...', 0) // 0 表示不自动关闭，需要手动关闭
      }
    }

    return new Promise<T>((resolve, reject) => {
      this.instance
        // 调用实例上的请求方法
        .request<T, D>(config)
        // 请求成功
        .then(res => {
          // 通过类型守卫，把 res 收窄为 IResponseType<T>
          if (isResponseType<T>(res)) {
            if (res.code === 200) {
              resolve(res.data)
            } else {
              reject(res.data)
              handleBusinessCode(res.data, toast)
            }
          }
        })
        // 请求失败
        .catch(err => {
          const status = err?.response?.status ?? err?.status
          handleHTTPCode(status, toast)
          reject(err)
        })
        .finally(() => {
          // 关闭加载中提示
          if (hideLoading) {
            hideLoading() // 调用关闭函数，隐藏 loading
          }
        })
    })
  }

  // get 类型的请求
  get<T = any, D = any>(config: AxiosRequestConfig, requestConfig?: IRequestConfig) {
    return this.request<T, D>({ ...config, method: 'GET' }, requestConfig)
  }

  // post 类型的请求
  post<T = any, D = any>(config: AxiosRequestConfig, requestConfig?: IRequestConfig) {
    return this.request<T, D>({ ...config, method: 'POST' }, requestConfig)
  }

  // delete 类型的请求
  delete<T = any, D = any>(config: AxiosRequestConfig, requestConfig?: IRequestConfig) {
    return this.request<T, D>({ ...config, method: 'DELETE' }, requestConfig)
  }

  // put 类型的请求
  put<T = any, D = any>(config: AxiosRequestConfig, requestConfig?: IRequestConfig) {
    return this.request<T, D>({ ...config, method: 'PUT' }, requestConfig)
  }

  // patch 类型的请求
  patch<T = any, D = any>(config: AxiosRequestConfig, requestConfig?: IRequestConfig) {
    return this.request<T, D>({ ...config, method: 'PATCH' }, requestConfig)
  }
}

export default UNVRequest
