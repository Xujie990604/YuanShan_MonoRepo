import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * @description 创建用户 DTO
 */
export class CreateUserDto {
  @IsString({ message: '用户名必须是字符串' })
  @IsNotEmpty({ message: '用户名不能为空' })
  username: string;

  @IsString({ message: '密码必须是字符串' })
  @IsNotEmpty({ message: '密码不能为空' })
  password: string;

  /**
   * 性别（与 Profile.gender 对应）
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'gender 必须是数字' })
  gender?: number;

  /**
   * 头像（与 Profile.photo 对应）
   */
  @IsOptional()
  @IsString({ message: 'photo 必须是字符串' })
  photo?: string;

  /**
   * 地址（与 Profile.address 对应）
   */
  @IsOptional()
  @IsString({ message: 'address 必须是字符串' })
  address?: string;

  /**
   * 角色 ID 列表，前端可以传 [1, 2] 这种数字数组
   */
  @IsOptional()
  @IsArray({ message: 'roles 必须是数组' })
  @Type(() => Number)
  @IsInt({ each: true, message: 'roles 中的每一项都必须是数字' })
  roles?: number[];
}


