import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
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

  findAll() {
    return this.menuRepository.find();
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
