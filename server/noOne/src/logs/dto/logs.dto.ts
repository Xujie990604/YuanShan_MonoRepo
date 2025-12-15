import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class LogsDto {
  @IsString()
  @IsNotEmpty()
  msg: string;

  @IsString()
  id: string;
}

export class exposeLogsDto {
  @Expose()
  msg: string;
}
