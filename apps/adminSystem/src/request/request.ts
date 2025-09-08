import type {
  IRequestConfig,
  IResponseType,
  IUserLoginRequestData,
  IUserLoginResponseData,
} from './type'
import { normalNetwork, } from '../network'

/**
 * 用户登录接口(云接口调用示例)
 * @param data
 */
export function userLoginRequest(data: IUserLoginRequestData, requestConfig?: IRequestConfig) {
  return new Promise<IUserLoginResponseData>((resolve, reject) => {
    normalNetwork
      .post<IUserLoginResponseData, IResponseType<IUserLoginResponseData>>(
        {
          url: '/api/login',
          data,
        },
        requestConfig
      )
      .then(result => {
        resolve(result)
      })
      .catch(err => {
        reject(err)
      })
  })
}


