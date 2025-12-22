import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Logs } from './logs.entity';
import { QueryLogsDto } from './dto/query-logs.dto';

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
    userId?: number;
  }): Promise<Logs> {
    const log = this.logsRepository.create(logData);
    return await this.logsRepository.save(log);
  }

  /**
   * 查询所有日志（分页）
   * @param query 查询条件
   * @returns 日志列表和总数
   */
  async findAll(query: QueryLogsDto) {
    const { page = 1, limit = 20 } = query;

    const [logs, total] = await this.logsRepository.findAndCount({
      order: {
        id: 'DESC', // 按 ID 倒序，最新的在前面
      },
      take: limit,
      skip: (page - 1) * limit,
    });

    return { logs, total };
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
