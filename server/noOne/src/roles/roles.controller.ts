import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { QueryRolesDto } from './dto/query-roles.dto';
import { CaslGuard } from 'src/guards/casl.guard';
import { Can } from 'src/decorators/casl.decorator';
import { PermissionEnum } from 'src/enum/permission.enum';
    
@Controller('roles')
@UseGuards(CaslGuard)
@Can(PermissionEnum.ROLES_READ)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @Can(PermissionEnum.ROLES_CREATE)
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  /**
   * 查询所有角色（分页）
   * @param query 查询条件（page, limit）
   * @returns 角色列表和总数
   */
  findAll(@Query() query: QueryRolesDto) {
    return this.rolesService.findAll(query);
  }

  @Patch(':id')
  @Can(PermissionEnum.ROLES_UPDATE)
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.update(+id, updateRoleDto);
  }

  @Delete(':id')
  @Can(PermissionEnum.ROLES_DELETE)
  remove(@Param('id') id: string) {
    return this.rolesService.remove(+id);
  }
}
