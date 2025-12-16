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
   // 性别过滤：0 女 1 男
  gender?: 0 | 1
}

// 用户列表搜索表单使用的字段（不包含 page/limit）
export type IUserListFilterForm = Pick<IGetUserListReq, 'username' | 'address' | 'role' | 'gender'>

/**
 * 用户信息接口
 */
export interface IUserInfo {
  id: number
  username: string
  roles: IRoleInfo[]
  profile: IProfileInfo
}

export interface IRoleInfo {
  id: number
  name: string
}

export interface IProfileInfo {
  gender?: 0 | 1 
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


/**
 * 新增用户请求参数接口（与后端 CreateUserDto 对齐）
 */
export interface ICreateUserReq {
  username: string
  password: string
  gender?: number
  photo?: string
  address?: string
  roles?: number[]
}

export interface ICreateUserRes {
  id: number
}


/**
 * 新增用户请求
 * @param data 新增用户请求参数
 * @param requestConfig 请求配置
 * @returns 新增用户返回参数
 */
export function createUserRequest(data: ICreateUserReq, requestConfig?: IRequestConfig) {
  return new Promise<ICreateUserRes>((resolve, reject) => {
    YSNetwork
      .post<ICreateUserRes, IResponseType<ICreateUserRes>>(
        {
          url: '/user',
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

// 更新用户请求体：所有字段都可选
export type IUpdateUserReq = Partial<ICreateUserReq>

/**
 * 更新用户请求
 * @param id 用户 id（路径参数）
 * @param data 更新用户请求体（全部字段可选）
 */
export function updateUserRequest(id: number, data: IUpdateUserReq, requestConfig?: IRequestConfig) {
  return new Promise<IUserInfo>((resolve, reject) => {
    YSNetwork
      .patch<IUserInfo, IResponseType<IUserInfo>>(
        {
          url: `/user/${id}`,
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

export interface IDeleteUserRes {
  username: string
}


/**
 * 删除用户请求
 * @param id 用户 id（路径参数）
 */
export function deleteUserRequest(id: number, requestConfig?: IRequestConfig) {
  return new Promise<IDeleteUserRes>((resolve, reject) => {
    YSNetwork
      .delete<IDeleteUserRes, IResponseType<IDeleteUserRes>>(
        {
          url: `/user/${id}`, // DELETE /user/:id
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

