import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class UserQueryDTO {
  @Type(() => Number)
  @IsInt({ message: 'page 必须是数字' })
  @IsNotEmpty({ message: 'page 为必填参数' })
  page: number;

  @Type(() => Number)
  @IsOptional()
  @IsInt({ message: 'limit 必须是数字' })
  limit?: number;

  @IsOptional()
  @IsString({ message: 'username 必须是字符串' })
  username?: string;

  @Type(() => Number)
  @IsOptional()
  @IsInt({ message: 'role 必须是数字' })
  role?: number;

  @Type(() => Number)
  @IsOptional()
  @IsInt({ message: 'gender 必须是数字' })
  gender?: number;
}
