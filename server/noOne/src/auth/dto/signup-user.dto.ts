import { IsOptional, IsString, Length } from 'class-validator';
import { SigninUserDto } from './signin-user.dto';

export class SignupUserDto extends SigninUserDto {
  @IsOptional()
  @IsString({ message: '昵称必须是字符串' })
  @Length(1, 20, { message: '昵称长度为1-20位' })
  nickname?: string;
}


