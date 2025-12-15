import { Global, Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Roles } from 'src/roles/roles.entity';

@Global() // 设置为全局模块，所有模块都可以使用 UserService
@Module({
  imports: [TypeOrmModule.forFeature([User, Roles])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
