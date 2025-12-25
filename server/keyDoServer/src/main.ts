import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 获取配置服务
  const configService = app.get(ConfigService);

  // 全局前缀
  app.setGlobalPrefix('api/v1');

  // 使用 Zod 进行验证
  // 对于需要验证的接口，使用 @UsePipes(new ZodValidationPipe(schema)) 装饰器

  // 跨域配置
  const corsOrigin = configService.get<string>('CORS_ORIGIN');
  app.enableCors({
    origin: corsOrigin ? corsOrigin.split(',') : '*',
    credentials: true,
  });

  // 启动服务
  const port = configService.get<number>('PORT') || 6040;
  await app.listen(port);
  
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 KeyDo Server 启动成功！                              ║
║                                                           ║
║   📡 服务地址: http://localhost:${port}                    ║
║   🌍 环境模式: ${configService.get<string>('NODE_ENV')}   ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
}

bootstrap();

