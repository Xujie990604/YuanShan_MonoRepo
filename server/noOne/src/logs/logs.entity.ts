import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity()
export class Logs {
  @PrimaryGeneratedColumn()
  @Exclude()
  id: number;

  @Column()
  path: string;

  @Column()
  methods: string;

  @Column()
  data: string;

  @Column()
  result: number;

  @Column({ nullable: true }) // 用户ID，允许为空（未登录用户）
  @Exclude()
  userId: number;
}
