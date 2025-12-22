import type {
  IRequestConfig,
  IResponseType,
} from './type'
import { YSNetwork } from '../network'

/**
 * 用户登录请求参数接口
 */
export interface IUserLoginRequestData {
  username: string
  password: string
}

/**
 * 用户登录返回参数接口
 */
export interface IUserLoginResponseData {
  access_token: string
  userId: number
}

/**
 * 用户注册请求参数接口
 */
export interface IUserSignupRequestData {
  username: string
  password: string
  nickname?: string
}

/**
 * 用户登录请求
 * @param data
 */
export function userLoginRequest(data: IUserLoginRequestData, requestConfig?: IRequestConfig) {
  return new Promise<IUserLoginResponseData>((resolve, reject) => {
    YSNetwork
      .post<IUserLoginResponseData, IResponseType<IUserLoginResponseData>>(
        {
          url: '/auth/signin',
          data,
        },
        requestConfig,
      )
      .then(result => {
        resolve(result)
      })
      .catch(err => {
        reject(err)
      })
  })
}

/**
 * 用户注册请求
 * 后端返回 IResponseType<{}>（data 为一个空对象）
 * @param data
 */
export function userSignupRequest(data: IUserSignupRequestData, requestConfig?: IRequestConfig) {
  return new Promise<unknown>((resolve, reject) => {
    YSNetwork
      .post<unknown, IResponseType<unknown>>(
        {
          url: '/auth/signup',
          data,
        },
        requestConfig,
      )
      .then(result => {
        resolve(result)
      })
      .catch(err => {
        reject(err)
      })
  })
}

