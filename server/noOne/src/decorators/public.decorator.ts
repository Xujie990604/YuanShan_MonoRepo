import { SetMetadata } from '@nestjs/common';
/**
 * @file public.decorator.ts
 * @description 公开接口装饰器，
 */


// 元数据键
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * 标记路由/控制器为“公开接口”
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);


