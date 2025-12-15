/**
 * @file casl.decorator.ts
 * @description 自定义 CASL 装饰器，用于添加元数据，在 CaslGuard 中使用
 */

import { SetMetadata } from '@nestjs/common';
import { AnyMongoAbility } from '@casl/ability';
import { PermissionEnum } from 'src/enum/permission.enum';

export enum CHECK_POLICIES_KEY {
  HANDLER = 'CHECK_POLICIES_HANDLER',
  CAN = 'CHECK_POLICIES_CAN',
  CANNOT = 'CHECK_POLICIES_CANNOT',
}

export type PolicyHandlerCallback = (ability: AnyMongoAbility) => boolean;

export type CaslHandlerType = PolicyHandlerCallback | PolicyHandlerCallback[];

/**
 * 自定义授权函数
 */
export const CheckPolices = (...handlers: PolicyHandlerCallback[]) =>
  SetMetadata(CHECK_POLICIES_KEY.HANDLER, handlers);

/**
 * @Can 装饰器函数（基于字符串权限码）
 * @param permissions 权限码枚举或枚举数组
 */
export const Can = (permissions: PermissionEnum | PermissionEnum[]) =>
  SetMetadata(CHECK_POLICIES_KEY.CAN, (ability: AnyMongoAbility) => {
    const perms = Array.isArray(permissions) ? permissions : [permissions];
    return perms.every((perm) => ability.can('access', perm));
  });

/**
 * @Cannot 装饰器函数（基于字符串权限码）
 * @param permissions 权限码枚举或枚举数组
 */
export const Cannot = (permissions: PermissionEnum | PermissionEnum[]) =>
  SetMetadata(CHECK_POLICIES_KEY.CANNOT, (ability: AnyMongoAbility) => {
    const perms = Array.isArray(permissions) ? permissions : [permissions];
    return perms.every((perm) => ability.cannot('access', perm));
  });
