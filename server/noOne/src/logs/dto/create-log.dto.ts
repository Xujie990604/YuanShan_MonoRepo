import { IsString, IsNumber, IsOptional, IsNotEmpty } from 'class-validator';

/**
 * 创建日志的 DTO
 */
export class CreateLogDto {
  @IsString()
  @IsNotEmpty()
  path: string;

  @IsString()
  @IsNotEmpty()
  methods: string;

  @IsString()
  @IsNotEmpty()
  data: string;

  @IsNumber()
  @IsNotEmpty()
  result: number;

  @IsNumber()
  @IsOptional()
  userId?: number;
}

