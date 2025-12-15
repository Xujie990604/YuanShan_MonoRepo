/**
 * @file role.guard.ts
 * @description 角色守卫，用于保护路由/控制器，只有指定角色才能访问
 */

import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesEnum } from 'src/enum/roles.enum';
import { ROLES_KEY } from 'src/decorators/roles.decorator';
import { UserService } from 'src/user/user.service';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // JWT -> userId -> user - roles
    const requiredRoles = this.reflector.getAllAndOverride<RolesEnum[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // 没配 @Roles() 装饰器，直接放行
    if (!requiredRoles) {
      return true;
    }

    const req = context.switchToHttp().getRequest();
    const user = await this.userService.findOne(req.user.username);
    if (!user) {
      return false;
    }

    const roleIds = user.roles.map((role) => role.id);
    const hasRole = roleIds.some((roleId) => requiredRoles.includes(roleId));
    return hasRole;
  }
}
