/**
 * @file response.interceptor.ts
 * @description 统一响应格式拦截器，将所有成功结果包装成 IResponseType
 */

import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IResponseType } from 'src/interfaces/response.interface';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, IResponseType<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<IResponseType<T>> {
    return next.handle().pipe(
      map((data: any) => {
        // 如果已经是 IResponseType 结构，直接返回，避免重复包装
        if (
          data &&
          typeof data === 'object' &&
          'code' in data &&
          'message' in data &&
          'data' in data
        ) {
          return data as IResponseType<T>;
        }

        return {
          data,
          code: 200,
          message: 'success',
        } as IResponseType<T>;
      }),
    );
  }
}


