import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskInput, UpdateTaskInput, Task } from '@yuan-shan/keydo-contract';
// 注意：getRankBetween 和 getInitialRank 不再使用，但保留导入以备后续需要
// import { getRankBetween, getInitialRank } from '@yuan-shan/tools';

@Injectable()
export class TaskService {
  constructor(private prisma: PrismaService) {}

  /**
   * 获取用户的所有任务
   */
  async findAll(userId: number): Promise<Task[]> {
    const tasks = await this.prisma.task.findMany({
      where: { userId },
      orderBy: [
        { quadrant: 'asc' },
        { createdAt: 'asc' }, // 按创建时间排序
      ],
    });

    return tasks.map(this.mapToTask);
  }

  /**
   * 根据 ID 获取任务
   */
  async findOne(id: string, userId: number): Promise<Task> {
    const task = await this.prisma.task.findFirst({
      where: { id, userId },
    });

    if (!task) {
      throw new NotFoundException('任务不存在');
    }

    return this.mapToTask(task);
  }

  /**
   * 创建任务
   */
  async create(userId: number, createTaskInput: CreateTaskInput): Promise<Task> {
    const { title, quadrant } = createTaskInput;

    // order 字段保留但不更新，创建时默认值为 'a'
    // 排序策略改为按创建时间排序
    const task = await this.prisma.task.create({
      data: {
        userId,
        title,
        quadrant,
        order: 'a', // 固定默认值，不用于排序
        completed: false,
      },
    });

    return this.mapToTask(task);
  }

  /**
   * 更新任务
   */
  async update(id: string, userId: number, updateTaskInput: UpdateTaskInput): Promise<Task> {
    // 检查任务是否存在且属于当前用户
    const existingTask = await this.prisma.task.findFirst({
      where: { id, userId },
    });

    if (!existingTask) {
      throw new NotFoundException('任务不存在');
    }

    const { title, quadrant, completed } = updateTaskInput;

    // order 字段不再更新，保持原有值
    // 排序策略改为按创建时间排序，不再使用 order 字段
    const task = await this.prisma.task.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(quadrant !== undefined && { quadrant }),
        ...(completed !== undefined && { completed }),
        // order 字段不更新，保持原有值
      },
    });

    return this.mapToTask(task);
  }

  /**
   * 删除任务
   */
  async remove(id: string, userId: number): Promise<void> {
    const task = await this.prisma.task.findFirst({
      where: { id, userId },
    });

    if (!task) {
      throw new NotFoundException('任务不存在');
    }

    await this.prisma.task.delete({
      where: { id },
    });
  }

  /**
   * 将 Prisma 模型转换为 Task 类型
   */
  private mapToTask(task: any): Task {
    return {
      id: task.id,
      title: task.title,
      quadrant: task.quadrant as any,
      completed: task.completed,
      order: task.order,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    };
  }
}
