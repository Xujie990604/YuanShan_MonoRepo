
/**
 * @file roles.decorator.ts
 * @description 自定义角色装饰器，用于添加元数据，在 RoleGuard 中使用
 */
import { SetMetadata } from '@nestjs/common';
import { RolesEnum } from 'src/enum/roles.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: RolesEnum[]) => SetMetadata(ROLES_KEY, roles);
