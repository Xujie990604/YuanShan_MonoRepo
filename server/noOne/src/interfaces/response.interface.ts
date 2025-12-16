/**
 * @file response.interface.ts
 * @description 统一接口返回类型定义
 */

export interface IResponseType<T = any> {
  data: T;
  code: number;
  message: string;
}


