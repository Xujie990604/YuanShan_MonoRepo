/**
 * 接口请求配置参数
 * @interface loading 是否开启 loading
 * @interface toast 是否错误码提示
 */
export interface IRequestConfig {
  loading?: boolean
  toast?: boolean
}

/**
 * 接口返回值类型
 */
export interface IResponseType<T = any> {
  data: T
  code: number
  message: string
}

/**
 * 类型守卫：判断 res 是否为 IResponseType<T>
 */
export function isResponseType<T = any>(res: unknown): res is IResponseType<T> {
  return (
    typeof res === 'object' &&
    res !== null &&
    'code' in res &&
    'data' in res
  )
}
