/**
 * @file all-exception.filter.ts
 * @description 所有异常过滤器
 */

import {
  ExceptionFilter,
  HttpException,
  HttpStatus,
  LoggerService,
  ArgumentsHost,
  Catch,
} from '@nestjs/common';
import { IResponseType } from 'src/interfaces/response.interface';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly logger: LoggerService,
  ) {}
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
      } else if (res && typeof res === 'object') {
        const msgFromResponse = (res as any).message;
        if (Array.isArray(msgFromResponse)) {
          message = msgFromResponse.join('; ');
        } else if (typeof msgFromResponse === 'string') {
          message = msgFromResponse;
        } else {
          message = exception.message;
        }
      } else {
        message = exception.message;
      }
    }

    const responseBody: IResponseType<null> = {
      data: null,
      code: status,
      message,
    };

    // 记录异常日志
    this.logger.error(
      `[${request.method}] ${request.url} ${status} - ${message}`,
      (exception as any)?.stack ?? undefined,
    );

    response
    .status(status)
    .json(responseBody);
  }
}
