import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Repository } from 'typeorm';
import { User } from './user.entity';
import { Profile } from './profile.entity';
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
    const { page = 1, limit = 20, username, role, gender, address } = query;

    // 组装 where 条件，支持 username / address 模糊匹配
    const where: any = {
      ...(username ? { username: Like(`%${username}%`) } : {}),
      profile: {
        ...(gender !== undefined ? { gender } : {}),
        ...(address ? { address: Like(`%${address}%`) } : {}),
      },
      roles: {
        ...(role !== undefined ? { id: role } : {}),
      },
    };

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
      where,
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
    return this.userRepository.findOne({
      where: { id },
      select: {
        id: true,
        username: true,
        profile: {
          gender: true,
          photo: true,
          address: true,
        },
        roles: {
          id: true,
          name: true,
        },
      },
      relations: {
        profile: true,
        roles: true,
      },
    });
  }

  /**
   * 创建用户
   * @param user 用户信息
   * @returns 创建结果
   */
  async create(dto: CreateUserDto) {
    const { roles, gender, photo, address, ...rest } = dto;
    const user: Partial<User> = { ...rest };

    // 只要传了任意一个 Profile 相关字段，就创建 Profile 记录
    if (
      gender !== undefined ||
      photo !== undefined ||
      address !== undefined
    ) {
      (user as any).profile = {
        gender,
        photo,
        address,
      };
    }

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
    try {
      newUser.password = await argon2.hash(newUser.password);
      const res = await this.userRepository.save(newUser);
      return res;
    } catch (error) {
      throw new HttpException(error.sqlMessage, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * 更新用户
   * @param id 用户 id
   * @param dto 用户信息
   * @returns 更新结果
   */
  async update(id: number, dto: UpdateUserDto) {
    // 查询用户，带上 profile 和 roles 关系，方便一起更新
    const user = await this.userRepository.findOne({
      where: { id },
      relations: {
        profile: true,
        roles: true,
      },
    });
    if (!user) {
      throw new HttpException('用户不存在', HttpStatus.BAD_REQUEST);
    }

    const { roles, gender, photo, address, ...rest } = dto;

    // 合并除角色、Profile 外的字段（如 username、password 等）
    Object.assign(user, rest);

    // 如果本次更新包含角色 ID 列表，则更新用户角色
    if (roles && roles.length > 0) {
      const roleEntities = await this.rolesRepository.find({
        where: { id: In(roles) },
      });
      if (!roleEntities.length) {
        throw new HttpException('用户角色不存在', HttpStatus.BAD_REQUEST);
      }
      user.roles = roleEntities;
    }

    // 如果本次更新包含密码字段，则对新密码进行哈希加密；否则保留原密码
    if (dto.password) {
      user.password = await argon2.hash(dto.password);
    }

    // 处理 Profile 更新：只要传了任意一个 Profile 相关字段，就更新或创建 Profile
    if (
      gender !== undefined ||
      photo !== undefined ||
      address !== undefined
    ) {
      if (!user.profile) {
        // 没有 Profile 时创建一个新的
        const profile = new Profile();
        // 这里直接按类型赋值；数据库层已允许为 NULL
        profile.gender = gender as any;
        profile.photo = photo as any;
        profile.address = address as any;
        user.profile = profile;
      } else {
        // 已有 Profile 时按需覆盖字段
        if (gender !== undefined) {
          user.profile.gender = gender;
        }
        if (photo !== undefined) {
          user.profile.photo = photo;
        }
        if (address !== undefined) {
          user.profile.address = address;
        }
      }
    }

    return this.userRepository.save(user);
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
