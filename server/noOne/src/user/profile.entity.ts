import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { User } from './user.entity';

@Entity()
export class Profile {
  @PrimaryGeneratedColumn()
  @Exclude()
  id: number;

  @Column({ nullable: true, comment: '性别' })
  gender: number;

  @Column({ nullable: true, comment: '头像 URL' })
  photo: string;

  @Column({ nullable: true, comment: '地址' })
  address: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  @Exclude()
  user: User;
}
