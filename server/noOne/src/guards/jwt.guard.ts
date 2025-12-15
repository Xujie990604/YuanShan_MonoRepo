/**
 * @file jwt.guard.ts
 * @description JWT 守卫：默认校验所有接口的 Token，对标记了 @Public() 的接口跳过校验
 */
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { AuthStrategyEnum } from 'src/enum/strategy.enum';
import { IS_PUBLIC_KEY } from 'src/decorators/public.decorator';

@Injectable()
export class JwtGuard extends AuthGuard(AuthStrategyEnum.JWT) {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {

    // 读取路由/控制器上是否标记了 @Public()
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      // 公开接口，不做 Token 校验
      return true;
    }

    // 其他接口按默认 JWT 流程校验 Token
    return super.canActivate(context);
  }
}
