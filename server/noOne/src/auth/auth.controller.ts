/**
 * @file auth.controller.ts
 * @description 认证控制器
 */

import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SigninUserDto } from './dto/signin-user.dto';
import { SignupUserDto } from './dto/signup-user.dto';
import { Public } from 'src/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signin')
  @Public()
  async signin(@Body() body: SigninUserDto) {
    const { username, password } = body;
    const token = await this.authService.signin(username, password);
    return {
      access_token: token,
    };
  }

  @Post('/signup')
  @Public()
  async signup(@Body() body: SignupUserDto) {
    const { username, password } = body;
    return await this.authService.signup(username, password);
  }
}
