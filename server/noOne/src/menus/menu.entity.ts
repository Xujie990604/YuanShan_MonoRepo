import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Roles } from 'src/roles/roles.entity';

@Entity()
export class Menus {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  path: string;

  @Column()
  order: number;

  @Column()
  permission: string;

  // 一个 role 对应多个 menu 及其权限
  @ManyToMany(() => Roles, (roles) => roles.menus)
  @JoinTable({ name: 'role_menus' })
  role: Roles;
}
