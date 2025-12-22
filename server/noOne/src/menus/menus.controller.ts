import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { MenusService } from './menus.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { QueryMenusDto } from './dto/query-menus.dto';
import { CaslGuard } from 'src/guards/casl.guard';
import { Can } from 'src/decorators/casl.decorator';
import { PermissionEnum } from 'src/enum/permission.enum';

@Controller('menus')
@UseGuards(CaslGuard)
@Can(PermissionEnum.MENUS_READ)
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  @Post()
  @Can(PermissionEnum.MENUS_CREATE)
  create(@Body() createMenuDto: CreateMenuDto) {
    return this.menusService.create(createMenuDto);
  }

  @Get()
  /**
   * 查询所有菜单（分页）
   * @param query 查询条件（page, limit）
   * @returns 菜单列表和总数
   */
  findAll(@Query() query: QueryMenusDto) {
    return this.menusService.findAll(query);
  }

  @Patch(':id')
  @Can(PermissionEnum.MENUS_UPDATE)
  update(@Param('id') id: string, @Body() updateMenuDto: UpdateMenuDto) {
    return this.menusService.update(+id, updateMenuDto);
  }

  @Delete(':id')
  @Can(PermissionEnum.MENUS_DELETE)
  remove(@Param('id') id: string) {
    return this.menusService.remove(+id);
  }
}
