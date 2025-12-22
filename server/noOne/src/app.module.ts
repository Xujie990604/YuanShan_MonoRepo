import { Global, Logger, Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { LogsModule } from './logs/logs.module';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesModule } from './roles/roles.module';
import { connectionParams } from '../ormconfig';
import { AuthModule } from './auth/auth.module';
import { MenusModule } from './menus/menus.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtGuard } from './guards/jwt.guard';
import { UploadModule } from './upload/upload.module';

const envFilePath = [
  `.env.${process.env.NODE_ENV || 'development'}`,
  '.env', // 基础配置文件，包含共同配置
];
console.log('Loading env files:', envFilePath);

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath,
      // 验证环境变量
      validationSchema: Joi.object({
        PORT: Joi.number().required(),
        CURRENT_ENV: Joi.string()
          .valid('development', 'production')
          .default('development')
          .required(),
        DATABASE_TYPE: Joi.string()
          .valid('mysql', 'oracle')
          .default('mysql')
          .required(),
        DATABASE_HOST: Joi.alternatives().try(
          Joi.string().ip(),
          Joi.string().hostname(),
        ),
        DATABASE_PORT: Joi.number().required(),
        DATABASE_USER: Joi.string().required(),
        DATABASE_PASSWORD: Joi.string().required(),
        DATABASE_NAME: Joi.string().required(),
        DATABASE_SYNC: Joi.boolean().default(true).required(),
        LOG_ON: Joi.boolean(),
        LOG_LEVEL: Joi.string(),
      }),
    }),
    TypeOrmModule.forRoot(connectionParams),
    UserModule,
    LogsModule,
    RolesModule,
    AuthModule,
    MenusModule,
    UploadModule,
  ],
  controllers: [],
  providers: [
    Logger,
    // 全局 JWT 守卫
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
  ],
  exports: [Logger],
})
export class AppModule {}
