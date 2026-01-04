import { Controller, Get, Req } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * 
   * @param req 请求对象
   * @returns 用户个人信息
   */
  @Get('profile')
  async getProfile(@Req() req) {
    return this.userService.findById(req.user.userId);
  }
}

