import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  constructor(private configService: ConfigService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const isDevelopment = this.configService.get<string>('NODE_ENV') === 'development';

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: string | string[] | null = null;

    // 处理 HttpException
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as any;
        errors = responseObj.message || null;
        message = Array.isArray(errors) ? errors.join(', ') : (errors || exception.message);
      } else {
        message = exception.message;
      }
    }

    // 处理 Prisma 错误
    else if (exception && typeof exception === 'object' && 'code' in exception) {
      const prismaError = exception as any;
      status = HttpStatus.BAD_REQUEST;

      // Prisma 常见错误码处理
      switch (prismaError.code) {
        case 'P2002':
          message = '唯一性约束违反，记录已存在';
          break;
        case 'P2025':
          message = '记录不存在';
          break;
        case 'P2003':
          message = '外键约束违反';
          break;
        case 'P2014':
          message = '关联约束违反';
          break;
        default:
          message = isDevelopment
            ? `数据库错误: ${prismaError.message || '未知错误'}`
            : '数据库操作失败';
      }
    }

    // 处理类型错误（TypeError）
    else if (exception instanceof TypeError) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = isDevelopment
        ? `类型错误: ${exception.message}`
        : '服务器内部错误';
    }

    // 处理引用错误（ReferenceError）
    else if (exception instanceof ReferenceError) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = isDevelopment
        ? `引用错误: ${exception.message}`
        : '服务器内部错误';
    }
    
    // 其他未知异常
    else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = isDevelopment
        ? exception instanceof Error
          ? exception.message
          : String(exception)
        : '服务器内部错误';
    }

    // 记录错误日志
    if (status >= 500) {
      const errorLog = {
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
        message: message,
        ...(exception instanceof Error
          ? {
              errorName: exception.constructor.name,
              stack: exception.stack,
            }
          : { error: String(exception) }),
      };
      this.logger.error(`${request.method} ${request.url} - ${status}`, JSON.stringify(errorLog, null, 2));
    } else {
      this.logger.warn(`${request.method} ${request.url} - ${status} - ${message}`);
    }

    // 返回统一格式响应
    response.status(status).json({
      code: status,
      message: message,
      data: null,
    });
  }
}

