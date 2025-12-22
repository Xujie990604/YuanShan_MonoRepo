import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private jwtService: JwtService,
  ) {}

  /**
   * 登录
   * @param username 用户名
   * @param password 密码
   * @returns 令牌与用户 id
   */
  async signin(username: string, password: string) {
    const user = await this.userService.findOne(username);
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    const isPasswordValid = await argon2.verify(user.password, password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    const payload = { username: user.username, sub: user.id };
    const token = await this.jwtService.signAsync(payload);
    return { token, userId: user.id };
  }

  /**
   * 注册
   * @param username 用户名
   * @param password 密码
   * @returns 创建结果
   */
  async signup(username: string, password: string) {
    const user = await this.userService.findOne(username);
    if (user) {
      throw new UnauthorizedException('用户已存在');
    }

    return await this.userService.create({
      username,
      password,
    });
  }
}
