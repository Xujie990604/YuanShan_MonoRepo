import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    const isDevelopment = configService.get<string>('NODE_ENV') === 'development';
    
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: isDevelopment, // 开发环境忽略过期，生产环境严格检查
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  /**
   * 将用户信息添加到 req.user 中
   * @param payload 载荷，即 Token 中的信息
   * @returns 
   */
  async validate(payload: any) {
    return { userId: payload.sub, username: payload.username };
  }
}

