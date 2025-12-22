import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { LogsService } from 'src/logs/logs.service';
import { BUSINESS_LOG_KEY } from 'src/decorators/business-log.decorator';
import { Request } from 'express';

/**
 * 业务日志拦截器
 * 用于自动记录标记了 @BusinessLog 装饰器的接口调用日志
 * 
 * 工作原理：
 * 1. 拦截所有带有 @BusinessLog 装饰器的方法
 * 2. 在方法执行前，收集请求信息（路径、方法、参数、用户）
 * 3. 在方法执行后，记录响应结果（成功或失败状态）
 * 4. 将日志信息保存到数据库
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly logsService: LogsService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // 检查该方法是否标记了 @BusinessLog 装饰器
    const businessLog = this.reflector.get(
      BUSINESS_LOG_KEY,
      context.getHandler(),
    );

    // 如果没有标记，直接放行，不记录日志
    if (!businessLog?.enabled) {
      return next.handle();
    }

    // 获取 HTTP 请求上下文
    const request = context.switchToHttp().getRequest<Request>();
    
    // 获取当前登录用户（从 JWT 守卫解析的用户信息）
    const user = (request as any).user;
    const userId = user?.userId || user?.id || null; // 兼容不同的 JWT payload 格式

    // 收集请求信息
    const logData = {
      path: request.url, // 请求路径
      methods: request.method, // 请求方法（GET、POST 等）
      data: JSON.stringify({
        body: request.body, // 请求体
        query: request.query, // 查询参数
        params: request.params, // 路由参数
        description: businessLog.description, // 业务描述
      }),
      result: HttpStatus.OK, // 默认成功状态
      userId: userId, // 直接存储用户 ID
    };

    // 执行方法并记录日志
    return next.handle().pipe(
      // 成功执行：记录成功日志
      tap(async () => {
        try {
          const savedLog = await this.logsService.create({
            ...logData,
            result: HttpStatus.OK, // 200 成功
          });
        } catch (error) {
          // 日志记录失败不应该影响业务逻辑，只打印错误
        }
      }),
      // 发生异常：记录失败日志
      catchError((error) => {
        // 记录失败日志（异步执行，不阻塞异常抛出）
        this.logsService
          .create({
            ...logData,
            result: error.status || HttpStatus.INTERNAL_SERVER_ERROR, // 记录错误状态码
          })
        // 继续抛出原始异常，不影响正常的异常处理流程
        return throwError(() => error);
      }),
    );
  }
}

