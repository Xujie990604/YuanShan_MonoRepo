import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
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
  findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(+id);
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
