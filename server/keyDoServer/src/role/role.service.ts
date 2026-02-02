import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { Role, CreateRoleInput, UpdateRoleInput } from '@yuan-shan/keydo-contract';

@Injectable()
export class RoleService {
  constructor(private prisma: PrismaService) {}

  /**
   * 获取用户的所有角色
   * @param userId 用户 ID
   * @returns 角色列表，按创建时间排序
   */
  async findAll(userId: number): Promise<Role[]> {
    const roles = await this.prisma.role.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' }, // 按创建时间排序
    });
    return roles.map(this.mapToRole);
  }

  /**
   * 创建新角色
   * @param userId 用户 ID
   * @param input 创建角色的输入数据
   * @returns 新创建的角色
   */
  async create(userId: number, input: CreateRoleInput): Promise<Role> {
    // 检查角色数量限制（最多 5 个）
    const existingCount = await this.prisma.role.count({ where: { userId } });
    if (existingCount >= 5) {
      throw new BadRequestException('最多只能创建 5 个人生角色');
    }

    // 检查名称是否与已有角色重复（同用户下名称唯一）
    const nameTrim = input.name.trim();
    const duplicate = await this.prisma.role.findFirst({
      where: { userId, name: nameTrim },
    });
    if (duplicate) {
      throw new BadRequestException('已存在同名角色，请使用其他名称');
    }

    // 创建角色（名称存 trim 后，与唯一校验一致）
    const role = await this.prisma.role.create({
      data: {
        ...input,
        name: nameTrim,
        userId,
      },
    });

    return this.mapToRole(role);
  }

  /**
   * 更新角色
   * @param id 角色 ID
   * @param userId 用户 ID
   * @param input 更新角色的输入数据
   * @returns 更新后的角色
   */
  async update(id: string, userId: number, input: UpdateRoleInput): Promise<Role> {
    // 验证角色是否存在且属于当前用户
    const existing = await this.prisma.role.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      throw new NotFoundException('角色不存在');
    }

    // 若修改了名称，检查是否与其它角色重复（同用户下名称唯一，排除当前角色）
    const updateData = { ...input };
    if (input.name !== undefined) {
      const nameTrim = input.name.trim();
      const duplicate = await this.prisma.role.findFirst({
        where: { userId, name: nameTrim, id: { not: id } },
      });
      if (duplicate) {
        throw new BadRequestException('已存在同名角色，请使用其他名称');
      }
      updateData.name = nameTrim;
    }

    // 更新角色
    const role = await this.prisma.role.update({
      where: { id },
      data: updateData,
    });

    return this.mapToRole(role);
  }

  /**
   * 删除角色
   * @param id 角色 ID
   * @param userId 用户 ID
   */
  async remove(id: string, userId: number): Promise<void> {
    // 验证角色是否存在且属于当前用户
    const existing = await this.prisma.role.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      throw new NotFoundException('角色不存在');
    }

    // 删除角色（关联任务的 roleId 会自动设为 NULL，由 Prisma 的 onDelete: SetNull 处理）
    await this.prisma.role.delete({
      where: { id },
    });
  }

  /**
   * 将 Prisma 模型转换为 API 响应类型
   */
  private mapToRole(role: any): Role {
    return {
      id: role.id,
      name: role.name,
      icon: role.icon,
      color: role.color,
      manifesto: role.manifesto,
      createdAt: role.createdAt.toISOString(),
      updatedAt: role.updatedAt.toISOString(),
    };
  }
}
