import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { QueryMenusDto } from './dto/query-menus.dto';
import { Menus } from './menu.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MenusService {
  constructor(
    @InjectRepository(Menus) private menuRepository: Repository<Menus>,
  ) {}

  async create(createMenuDto: CreateMenuDto) {
    const menu = this.menuRepository.create(createMenuDto);
    return this.menuRepository.save(menu);
  }

  /**
   * 查询所有菜单（分页）
   * @param query 查询条件
   * @returns 菜单列表和总数
   */
  async findAll(query: QueryMenusDto) {
    const { page = 1, limit = 20 } = query;

    const [menus, total] = await this.menuRepository.findAndCount({
      order: {
        order: 'ASC', // 按菜单排序字段升序排列
      },
      take: limit,
      skip: (page - 1) * limit,
    });

    return { menus, total };
  }

  findOne(id: number) {
    return this.menuRepository.findOne({
      where: {
        id,
      },
    });
  }

  async update(id: number, updateMenuDto: UpdateMenuDto) {
    const menu = await this.findOne(id);
    if (!menu) {
      throw new HttpException('菜单不存在', HttpStatus.BAD_REQUEST);
    }
    if (!updateMenuDto) {
      throw new HttpException('菜单不存在', HttpStatus.BAD_REQUEST);
    }
    const newMenu = this.menuRepository.merge(menu, updateMenuDto);
    return this.menuRepository.save(newMenu);
  }

  remove(id: number) {
    return this.menuRepository.delete(id);
  }
}
