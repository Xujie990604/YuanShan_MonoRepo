import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from './user.entity';
import { UserQueryDTO } from './dto/get-user.dto';
import { Roles } from 'src/roles/roles.entity';
import * as argon2 from 'argon2';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Roles)
    private rolesRepository: Repository<Roles>,
  ) {}

  /**
   * 查询所有用户
   * @param query 查询条件
   * @returns 用户列表和总数
   */
  async findAll(query: UserQueryDTO) {
    const { page = 1, limit = 20, username, role, gender } = query;
    const [userInfoList, total] = await this.userRepository.findAndCount({
      select: {
        id: true,
        username: true,
        profile: {
          gender: true,
          photo: true,
          address: true,
        },
      },
      relations: {
        profile: true,
        roles: true,
      },
      take: limit,
      skip: (page - 1) * limit,
      where: {
        username,
        profile: {
          gender,
        },
        roles: {
          id: role,
        },
      },
    });

    return { userInfoList, total };
  }

  /**
   * 查询单个用户
   * @param username 用户名
   * @returns 用户
   */
  findOne(username: string) {
    return this.userRepository.findOne({
      where: { username },
      relations: ['roles', 'roles.menus'],
    });
  }

  /**
   * 查询单个用户
   * @param id 用户 id
   * @returns 用户
   */
  findOneById(id: number) {
    return this.userRepository.findOne({ where: { id } });
  }

  /**
   * 创建用户
   * @param user 用户信息
   * @returns 创建结果
   */
  async create(dto: CreateUserDto) {
    const { roles, ...rest } = dto;
    const user: Partial<User> = { ...rest };

    // 处理角色：如果传了角色 ID 列表，则根据 ID 查询角色；否则赋默认角色（普通用户，id=2）
    if (roles && roles.length > 0) {
      const roleEntities = await this.rolesRepository.find({
        where: { id: In(roles) },
      });
      if (!roleEntities.length) {
        throw new HttpException('用户角色不存在', HttpStatus.BAD_REQUEST);
      }
      (user as any).roles = roleEntities;
    } else {
      const role = await this.rolesRepository.findOne({
        where: { id: 2 },
      });
      if (!role) {
        throw new HttpException('用户角色不存在', HttpStatus.BAD_REQUEST);
      }
      (user as any).roles = [role];
    }

    const newUser = this.userRepository.create(user);
    console.log('newUser', newUser);
    try {
      newUser.password = await argon2.hash(newUser.password);
      const res = await this.userRepository.save(newUser);
      console.log('res 创建用户的结果', res);
      return res;
    } catch (error) {
      console.log('error 创建用户的结果', error);
      if (error?.errno === 1062) {
        throw new HttpException(error.sqlMessage, HttpStatus.BAD_REQUEST);
      }
    }
  }

  /**
   * 更新用户
   * @param id 用户 id
   * @param user 用户信息
   * @returns 更新结果
   */
  async update(id: number, dto: UpdateUserDto) {
    const userInfo = await this.findOneById(id);
    if (!userInfo) {
      throw new HttpException('用户不存在', HttpStatus.BAD_REQUEST);
    }
    const userTemp = await this.findProfile(id);
    if (!userTemp) {
      throw new HttpException('用户不存在', HttpStatus.BAD_REQUEST);
    }
    const newUser = this.userRepository.merge(userTemp, dto as any);

    // 如果本次更新包含角色 ID 列表，则更新用户角色
    if (dto.roles && dto.roles.length > 0) {
      const roleEntities = await this.rolesRepository.find({
        where: { id: In(dto.roles) },
      });
      if (!roleEntities.length) {
        throw new HttpException('用户角色不存在', HttpStatus.BAD_REQUEST);
      }
      (newUser as any).roles = roleEntities;
    }
    // 如果本次更新包含密码字段，则对新密码进行哈希加密；否则保留原密码
    if (dto.password) {
      newUser.password = await argon2.hash(dto.password);
    }
    return this.userRepository.save(newUser);
  }

  /**
   * 删除用户
   * @param id 用户 id
   * @returns 删除结果
   */
  async remove(id: number) {
    const user = await this.findOneById(id);
    if (!user) {
      throw new HttpException('用户不存在', HttpStatus.BAD_REQUEST);
    }
    return this.userRepository.remove(user);
  }

  findProfile(id: number) {
    return this.userRepository.findOne({
      where: { id },
      relations: {
        profile: true,
      },
    });
  }
}
