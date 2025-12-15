import { IsNotEmpty, IsString, Length } from 'class-validator';

export class SigninUserDto {
  @IsNotEmpty({ message: '用户名不能为空' })
  @IsString({ message: '用户名必须是字符串' })
  @Length(3, 20, {
    // $value 是用户输入的值
    // $property 是用户输入的属性名
    // $target 是当前类
    // $constraint1 是用户输入的约束1
    // $constraint2 是用户输入的约束2
    message: '用户名长度需为$constraint1-$constraint2位,目前传递值为:$value',
  })
  username: string;

  @IsNotEmpty({ message: '密码不能为空' })
  @IsString({ message: '密码必须是字符串' })
  @Length(6, 64, { message: '密码长度需为6-64位' })
  password: string;
}
