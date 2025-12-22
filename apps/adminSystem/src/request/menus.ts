import type { IRequestConfig, IResponseType } from './type'
import { YSNetwork } from '../network'

/**
 * 获取菜单列表请求参数接口
 */
export interface IGetMenusListReq {
  page: number
  limit?: number
}

/**
 * 菜单信息接口
 */
export interface IMenuInfo {
  id: number
  name: string
  path: string
  order: number
  permission: string
}

/**
 * 获取菜单列表返回参数接口
 */
export interface IGetMenusListRes {
  menus: IMenuInfo[]
  total: number
}

/**
 * 获取菜单列表请求
 * @param params 查询参数
 * @param requestConfig 请求配置（loading、toast等）
 * @returns Promise<IGetMenusListRes>
 */
export function getMenusListRequest(
  params: IGetMenusListReq,
  requestConfig?: IRequestConfig
) {
  return new Promise<IGetMenusListRes>((resolve, reject) => {
    YSNetwork.get<IResponseType<IGetMenusListRes>>(
      {
        url: '/menus',
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

