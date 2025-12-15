import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { LogsDto, exposeLogsDto } from './dto/logs.dto';
import { Serialize } from 'src/decorators/serialize.decorator';
import { RolesEnum } from 'src/enum/roles.enum';
import { Roles } from 'src/decorators/roles.decorator';
import { RoleGuard } from 'src/guards/role.guard';

@Controller('logs')
@UseGuards(RoleGuard)
@Roles(RolesEnum.ADMIN) // 指定角色才能调用该控制器
export class LogsController {
  @Get()
  getTest() {
    return 'getTest';
  }

  @Post()
  @Serialize(exposeLogsDto)
  /**
   * @description 创建日志, 测试 @Serialize 序列化返回值是否生效
   * @param dto 日志数据
   * @returns 日志数据
   */
  postTest(@Body() dto: LogsDto) {
    console.log('dto', dto);
    return dto;
  }
}
