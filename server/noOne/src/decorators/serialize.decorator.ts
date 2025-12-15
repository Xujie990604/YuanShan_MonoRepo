/**
 * @file serialize.decorator.ts
 * @description 自定义装饰器，是 @UseInterceptors(new SerializeInterceptor(dto)) 的语法糖
 * 
 */

import { UseInterceptors } from '@nestjs/common';
import { SerializeInterceptor } from 'src/interceptors/serialize/serialize.interceptor';

interface ClassConstructor {
  new (...args: any[]): any;
}

export function Serialize(dto: ClassConstructor) {
  return UseInterceptors(new SerializeInterceptor(dto));
}
