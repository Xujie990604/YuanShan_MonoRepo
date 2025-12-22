import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { RolesEnum } from 'src/enum/roles.enum';
import { Roles } from 'src/decorators/roles.decorator';
import { RoleGuard } from 'src/guards/role.guard';
import { LogsService } from './logs.service';
import { QueryLogsDto } from './dto/query-logs.dto';

/**
 * 日志管理控制器
 * 只有管理员才能访问日志接口
 */
@Controller('logs')
@UseGuards(RoleGuard)
@Roles(RolesEnum.ADMIN) // 只有管理员角色才能调用该控制器
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Get()
  /**
   * 查询所有日志（分页）
   * @param query 查询条件（page, limit）
   * @returns 日志列表和总数
   */
  async getAllLogs(@Query() query: QueryLogsDto) {
    return await this.logsService.findAll(query);
  }
}
