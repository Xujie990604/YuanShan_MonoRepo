/**
 * @file serialize.interceptor.ts
 * @description 序列化拦截器
 * 将返回结果序列化为指定的 DTO 格式, 并且只保留 DTO 上标记暴露的字段
 */

import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class SerializeInterceptor implements NestInterceptor {
  constructor(private dto: any) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        return plainToInstance(this.dto, data, {
          // 设置为 true 之后，所有经过该 interceptor 的 接口都需要设置 Expose 或者 Exclude
          // Expose 需要暴露的字段，Exclude 不需要排除的字段
          excludeExtraneousValues: true,
        });
      }),
    );
  }
}
