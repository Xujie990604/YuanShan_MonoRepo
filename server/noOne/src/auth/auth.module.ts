/**
 * @file auth.module.ts
 * @description 认证模块
 */

import { Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigEnum } from 'src/enum/config.enum';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './auth.strategy';
import { CaslAbilityService } from './casl-ability.service';

@Global()
@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.get<string>(ConfigEnum.SECRET),
          signOptions: {
            expiresIn: '999d', // token 过期时间
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, JwtStrategy, CaslAbilityService],
  controllers: [AuthController],
  exports: [CaslAbilityService],
})
export class AuthModule {}
