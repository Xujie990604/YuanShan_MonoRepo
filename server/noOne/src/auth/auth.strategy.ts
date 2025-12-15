/**
 * @file auth.strategy.ts
 * @description 定义 JWT 策略：从请求头中解析并校验 Token，将 payload 映射为 req.user，供 JwtGuard(AuthGuard('jwt')) 使用
 */
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigEnum } from 'src/enum/config.enum';
import { AuthStrategyEnum } from 'src/enum/strategy.enum';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, AuthStrategyEnum.JWT) {
  constructor(protected configService: ConfigService) {
    const secretOrKey = configService.get<string>(ConfigEnum.SECRET);
    if (!secretOrKey) {
      throw new Error('JWT secret not configured');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey,
    });
  }

  validate(payload: any) {
    // 解析 Token 中的 sub 和 username
    // 把用户信息添加到 req.user 中
    return { userId: payload.sub, username: payload.username };
  }
}
