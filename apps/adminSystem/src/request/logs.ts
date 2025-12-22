import type { IRequestConfig, IResponseType } from './type'
import { YSNetwork } from '../network'

/**
 * 获取日志列表请求参数接口
 */
export interface IGetLogsListReq {
  page: number
  limit?: number
}

/**
 * 日志信息接口
 */
export interface ILogInfo {
  id: number
  path: string
  methods: string
  data: string
  result: number
  userId: number | null
}

/**
 * 获取日志列表返回参数接口
 */
export interface IGetLogsListRes {
  logs: ILogInfo[]
  total: number
}

/**
 * 获取日志列表请求
 * @param params 查询参数
 * @param requestConfig 请求配置（loading、toast等）
 * @returns Promise<IGetLogsListRes>
 */
export function getLogsListRequest(
  params: IGetLogsListReq,
  requestConfig?: IRequestConfig
) {
  return new Promise<IGetLogsListRes>((resolve, reject) => {
    YSNetwork.get<IResponseType<IGetLogsListRes>>(
      {
        url: '/logs',
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

