/**
 * @file public.decorator.ts
 * @description 使用 @Public() 装饰器标记无需认证的接口
 */


import { SetMetadata } from '@nestjs/common';

// 元数据键
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * 标记路由/控制器为“公开接口”
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

