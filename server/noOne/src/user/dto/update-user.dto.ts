import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

/**
 * @description 更新用户 DTO，所有字段可选
 */
export class UpdateUserDto extends PartialType(CreateUserDto) {}


