import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import * as express from 'express';
import * as path from 'path';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ConfigEnum } from './enum/config.enum';
import { ClassSerializerInterceptor, Logger, ValidationPipe } from '@nestjs/common';
import { AllExceptionFilter } from './filters/all-exception.filter';
import { ResponseInterceptor } from './interceptors/response.interceptor';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { LogsService } from './logs/logs.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter());

  // 配置静态资源目录
  const staticPath = path.resolve(__dirname, '..', '..', 'blog');
  app.use('/static', express.static(staticPath));

  // 配置头像静态资源目录：uploads/avatar -> /static/avatar
  const avatarStaticPath = path.resolve(process.cwd(), 'uploads', 'avatar');
  app.use('/static/avatar', express.static(avatarStaticPath));

  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  // 设置全局前缀
  app.setGlobalPrefix('api/v1');

  const logger = new Logger();
  const reflector = app.get(Reflector);
  const logsService = app.get(LogsService); // 获取 LogsService 实例

  // 全局异常过滤器
  app.useGlobalFilters(new AllExceptionFilter(logger));

  // 全局拦截器（执行顺序：序列化 -> 业务日志 -> 统一返回格式）
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(reflector), // 1. 序列化（去除 @Exclude 字段）
    new LoggingInterceptor(reflector, logsService), // 2. 业务日志记录
    new ResponseInterceptor(), // 3. 统一返回格式包装
  );

  // 全局管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // 没有声明的字段从请求体里“剃掉”，避免前端乱传字段
    }),
  );

  // 获取配置服务
  const configService = app.get(ConfigService);

  // 启动应用
  const port = configService.get<number>(ConfigEnum.PORT) || 3000;
  await app.listen(port);
  console.log(`应用已启动，监听端口: ${port}`);
}

bootstrap().catch((err) => {
  console.error('启动失败:', err);
  process.exit(1);
});
