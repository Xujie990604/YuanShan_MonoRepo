import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Logs } from './logs.entity';

@Injectable()
export class LogsService {
  constructor(
    @InjectRepository(Logs)
    private logsRepository: Repository<Logs>,
  ) {}

  /**
   * 创建日志记录
   * @param logData 日志数据
   * @returns 创建的日志记录
   */
  async create(logData: {
    path: string;
    methods: string;
    data: string;
    result: number;
    userId?: number; // 改为直接存储 userId
  }): Promise<Logs> {

    
    try {
      const log = this.logsRepository.create(logData);
      const savedLog = await this.logsRepository.save(log);
      return savedLog;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 查询所有日志
   * @returns 日志列表
   */
  findAll(): Promise<Logs[]> {
    return this.logsRepository.find({
      order: {
        id: 'DESC', // 按 ID 倒序，最新的在前面
      },
    });
  }

  /**
   * 根据用户ID查询日志
   * @param userId 用户ID
   * @returns 日志列表
   */
  findByUser(userId: number): Promise<Logs[]> {
    return this.logsRepository.find({
      where: { userId },
      order: {
        id: 'DESC',
      },
    });
  }
}
