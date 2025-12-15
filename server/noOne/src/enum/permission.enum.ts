/**
 * @file permission.enum.ts
 * @description 权限枚举，统一管理字符串权限码，避免到处硬编码
 */
export enum PermissionEnum {
  // 日志模块
  LOGS_READ = 'logs:read',
  LOGS_CREATE = 'logs:create',
  LOGS_UPDATE = 'logs:update',
  LOGS_DELETE = 'logs:delete',

  // 用户模块
  USERS_READ = 'users:read',
  USERS_CREATE = 'users:create',
  USERS_UPDATE = 'users:update',
  USERS_DELETE = 'users:delete',

  // 角色模块
  ROLES_READ = 'roles:read',
  ROLES_CREATE = 'roles:create',
  ROLES_UPDATE = 'roles:update',
  ROLES_DELETE = 'roles:delete',

  // 菜单模块
  MENUS_READ = 'menus:read',
  MENUS_CREATE = 'menus:create',
  MENUS_UPDATE = 'menus:update',
  MENUS_DELETE = 'menus:delete',
}


