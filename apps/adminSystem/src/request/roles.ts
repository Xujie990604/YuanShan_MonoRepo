import type { IRequestConfig, IResponseType } from './type'
import { YSNetwork } from '../network'

/**
 * 获取角色列表请求参数接口
 */
export interface IGetRolesListReq {
  page: number
  limit?: number
}

/**
 * 角色信息接口
 */
export interface IRoleInfo {
  id: number
  name: string
}

/**
 * 获取角色列表返回参数接口
 */
export interface IGetRolesListRes {
  roles: IRoleInfo[]
  total: number
}

/**
 * 获取角色列表请求
 * @param params 查询参数
 * @param requestConfig 请求配置（loading、toast等）
 * @returns Promise<IGetRolesListRes>
 */
export function getRolesListRequest(
  params: IGetRolesListReq,
  requestConfig?: IRequestConfig
) {
  return new Promise<IGetRolesListRes>((resolve, reject) => {
    YSNetwork.get<IResponseType<IGetRolesListRes>>(
      {
        url: '/roles',
        params,
      },
      requestConfig
    )
      .then(res => {
        resolve(res)
      })
      .catch(err => {
        reject(err)
      })
  })
}

