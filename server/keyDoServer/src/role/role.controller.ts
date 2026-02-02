import { Controller, Get, Post, Put, Delete, Body, Param, Req } from '@nestjs/common';
import { RoleService } from './role.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { createRoleSchema, updateRoleSchema, type CreateRoleInput, type UpdateRoleInput } from '@yuan-shan/keydo-contract';

/**
 * 角色管理控制器
 * 所有接口需要 JWT 认证（由全局 JwtAuthGuard 处理）
 */
@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  /**
   * 获取当前用户的所有角色
   * GET /api/v1/roles
   */
  @Get()
  async findAll(@Req() req) {
    return this.roleService.findAll(req.user.userId);
  }

  /**
   * 创建新角色
   * POST /api/v1/roles
   * 
   * 注意：使用 @Body() 级别的 Pipe，避免对 @Req() 参数也进行验证
   */
  @Post()
  async create(
    @Body(new ZodValidationPipe(createRoleSchema)) createRoleDto: CreateRoleInput,
    @Req() req
  ) {
    return this.roleService.create(req.user.userId, createRoleDto);
  }

  /**
   * 更新角色
   * PUT /api/v1/roles/:id
   * 
   * 注意：使用 @Body() 级别的 Pipe，避免对 @Param('id') 参数也进行验证
   * 这是导致 "Expected object, received string" 错误的根本原因
   */
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateRoleSchema)) updateRoleDto: UpdateRoleInput,
    @Req() req
  ) {
    return this.roleService.update(id, req.user.userId, updateRoleDto);
  }

  /**
   * 删除角色
   * DELETE /api/v1/roles/:id
   */
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req) {
    await this.roleService.remove(id, req.user.userId);
    return { success: true };
  }
}
