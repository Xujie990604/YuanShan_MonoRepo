/**
 * @file casl-ability.service.ts
 * @description 权限服务 用户信息 -> 用户角色 -> 用户权限 -> 生成 Ability 对象
 */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AbilityBuilder, createMongoAbility } from '@casl/ability';
import { UserService } from '../user/user.service';
import { Menus } from '../menus/menu.entity';

@Injectable()
export class CaslAbilityService {
  constructor(private userService: UserService) {}

  async forRoot(username: string) {
    const { can, build } = new AbilityBuilder(createMongoAbility);

    const user = await this.userService.findOne(username);

    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    const obj = {} as Record<string, unknown>;
    user.roles.forEach((o) => {
      o.menus.forEach((menu) => {
        // 通过 Id 去重
        obj[menu.id] = menu;
      });
    });
    const menus = Object.values(obj) as Menus[];
    menus.forEach((menu) => {
      if (!menu.permission) {
        return;
      }

      const permissions = menu.permission
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean);

      for (const perm of permissions) {
        // 授权：基于字符串权限码
        can('access', perm);
      }
    });

    const ability = build({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      detectSubjectType: (object) => object.constructor as any,
    });

    return ability;
  }
}
