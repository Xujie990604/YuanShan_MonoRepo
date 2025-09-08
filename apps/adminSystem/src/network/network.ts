import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig } from 'axios'
import type { UNVRequestInterceptors } from './types'
import type { IRequestConfig } from '../request/type'
import { handleHTTPCode, handleBusinessCode } from './httpResponse'


class UNVRequest {
  // axios 实例
  instance: AxiosInstance

  // 配置参数
  requestConfig: IRequestConfig = { loading: true, toast: true }


  // config 类型切换为 CreateAxiosDefaults 的派生类

  constructor(config: UNVRequestInterceptors) {
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

  // config 的类型切换为 AxiosRequestConfig 的派生类
  // 发起网络请求
  request<T, D>(config: AxiosRequestConfig, { loading = true, toast = true }: IRequestConfig = {}) {
    if (loading) {
      // TODO:显示加载中提示
    }

    return new Promise<T>((resolve, reject) => {
      this.instance
        // 调用实例上的请求方法
        .request<T, D>(config)
        // 请求成功
        .then(res => {
          if (res.code === 200) {
            resolve(res.data)
          } else {
            reject(res.data)
            handleBusinessCode(res.data, toast)
          }
        })
        // 请求失败
        .catch(err => {
          handleHTTPCode(err.status, toast)
          reject(err)
        })
        .finally(() => {
          if (loading) {
            // TODO:隐藏加载中提示
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
}

export default UNVRequest
