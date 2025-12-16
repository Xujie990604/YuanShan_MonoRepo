import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  LoggerService,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { UserQueryDTO } from './dto/get-user.dto';
import { CaslGuard } from 'src/guards/casl.guard';
import { Can } from 'src/decorators/casl.decorator';
import { PermissionEnum } from 'src/enum/permission.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
@UseGuards(CaslGuard)
@Can(PermissionEnum.USERS_READ)
export class UserController {
  constructor(
    private readonly userService: UserService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {
    this.logger.log('UserController init');
  }

  @Get()
  /**
   * 获取所有用户
   * @param query 查询条件
   * @returns 用户列表
   */
  getAllUsers(@Query() query: UserQueryDTO) {
    return this.userService.findAll(query);
  }

  @Get('/:id')
  /**
   * 获取单个用户
   * @param id 用户 id
   * @returns 用户
   */
  getUser(@Param('id') id: number) {
    return this.userService.findOneById(id);
  }

  @Post()
  @Can(PermissionEnum.USERS_CREATE)
  /**
   * 创建用户
   * @param dto 用户信息
   * @returns 创建结果
   */
  async addUser(@Body() dto: CreateUserDto) {
    const { id } = await this.userService.create(dto);
    return { id };
  }

  @Patch('/:id')
  @Can(PermissionEnum.USERS_UPDATE)
  updateUser(
    @Param('id') id: number,
    @Body() dto: UpdateUserDto,
  ) {
    return this.userService.update(id, dto);
  }

  @Delete('/:id')
  @Can(PermissionEnum.USERS_DELETE)
  /**
   * 删除用户
   * @param id 用户 id
   * @returns 删除结果
   */
  removeUser(@Param('id') id: number) {
    return this.userService.remove(id);
  }

  @Get('/profile/:id')
  /**
   * 获取用户个人信息
   * @param id 用户 id
   * @returns 用户个人信息
   */
  getUserProfile(@Param('id') id: number) {
    return this.userService.findProfile(id);
  }
}
