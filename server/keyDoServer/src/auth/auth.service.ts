import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcryptjs';
import { SigninInput, SignupInput } from '@yuan-shan/keydo-contract';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * 用户登录
   */
  async signin(signinDto: SigninInput) {
    const { username, password } = signinDto;

    // 查找用户
    const user = await this.userService.findByUsername(username);
    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 生成 JWT Token
    const payload = { username: user.username, sub: user.id };
    const access_token = await this.jwtService.signAsync(payload);

    return {
      access_token,
      userId: user.id,
    };
  }

  /**
   * 用户注册
   */
  async signup(signupDto: SignupInput) {
    const { username } = signupDto;

    // 检查用户是否已存在
    const existingUser = await this.userService.findByUsername(username);
    if (existingUser) {
      throw new UnauthorizedException('用户已存在');
    }

    // 创建用户
    const user = await this.userService.create(signupDto);

    return {
      id: user.id,
      username: user.username,
    };
  }
}

