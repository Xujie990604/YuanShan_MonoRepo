import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { QueryRolesDto } from './dto/query-roles.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Roles } from './roles.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Roles)
    private rolesRepository: Repository<Roles>,
  ) {}

  async create(createRoleDto: CreateRoleDto) {
    const role = this.rolesRepository.create(createRoleDto);
    return await this.rolesRepository.save(role);
  }

  /**
   * 查询所有角色（分页）
   * @param query 查询条件
   * @returns 角色列表和总数
   */
  async findAll(query: QueryRolesDto) {
    const { page = 1, limit = 20 } = query;

    const [roles, total] = await this.rolesRepository.findAndCount({
      order: {
        id: 'ASC', // 按ID升序排列
      },
      take: limit,
      skip: (page - 1) * limit,
    });

    return { roles, total };
  }

  findOne(id: number) {
    return this.rolesRepository.findOne({
      where: {
        id,
      },
    });
  }

  async update(id: number, updateRoleDto: UpdateRoleDto) {
    const role = await this.findOne(id);
    if (!role) {
      throw new HttpException('角色不存在', HttpStatus.BAD_REQUEST);
    }
    const newRole = this.rolesRepository.merge(role, updateRoleDto);
    return this.rolesRepository.save(newRole);
  }

  async remove(id: number) {
    const role = await this.findOne(id);
    if (!role) {
      throw new HttpException('角色不存在', HttpStatus.BAD_REQUEST);
    }
    return this.rolesRepository.delete(id);
  }
}
