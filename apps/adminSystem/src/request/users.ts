import type {
  IRequestConfig,
  IResponseType,
} from './type'
import { YSNetwork } from '../network'

/**
 * 获取用户列表请求参数接口
 */
export interface IGetUserListReq {
  page: number
  limit?: number
  username?: string
  // 邮箱 / 地址
  address?: string
  // 角色过滤：1 管理员 2 普通成员 3 访客
  role?: number
}

/**
 * 用户信息接口
 */
export interface IUserInfo {
  username: string
  roles: IRoleInfo[]
  profile: IProfileInfo
}

export interface IRoleInfo {
  id: number
  name: string
}

export interface IProfileInfo {
  gender: 0 | 1 | undefined
  photo?: string
  address?: string
}

/**
 * 获取用户列表返回参数接口
 */
  export interface IGetUserInfoRes {
    userInfoList: IUserInfo[]
    total: number
  }

/**
 * 获取用户列表请求
 * @param data
 */
export function getUserListRequest(params: IGetUserListReq, requestConfig?: IRequestConfig) {
  return new Promise<IGetUserInfoRes>((resolve, reject) => {
    YSNetwork
      .get<IGetUserInfoRes, IResponseType<IGetUserInfoRes>>(
        {
          url: '/user',
          params,
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


