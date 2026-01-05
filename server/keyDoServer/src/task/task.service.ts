import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskInput, UpdateTaskInput, Task } from '@yuan-shan/keydo-contract';
import { getRankBetween, getInitialRank } from '@yuan-shan/tools';

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
        { order: 'asc' },
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
    const { title, quadrant, order } = createTaskInput;

    // 如果没有提供 order，计算初始排序值
    let taskOrder = order;
    if (!taskOrder) {
      // 查找同一象限中最后一个任务的 order
      const lastTask = await this.prisma.task.findFirst({
        where: { userId, quadrant },
        orderBy: { order: 'desc' },
      });

      if (lastTask) {
        // 插入到最后
        taskOrder = getRankBetween(lastTask.order, null);
      } else {
        // 第一个任务
        taskOrder = getInitialRank();
      }
    }

    const task = await this.prisma.task.create({
      data: {
        userId,
        title,
        quadrant,
        order: taskOrder,
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

    const { title, quadrant, completed, order } = updateTaskInput;

    // 如果更新了象限，需要重新计算排序
    let taskOrder = order;
    if (quadrant && quadrant !== existingTask.quadrant) {
      // 象限改变，需要在新象限中计算排序
      if (!order) {
        // 如果没有提供 order，插入到新象限的最后
        const lastTask = await this.prisma.task.findFirst({
          where: { userId, quadrant },
          orderBy: { order: 'desc' },
        });

        if (lastTask) {
          taskOrder = getRankBetween(lastTask.order, null);
        } else {
          taskOrder = getInitialRank();
        }
      }
    } else if (order && order !== existingTask.order) {
      // 在同一象限内移动，验证 order 是否有效
      taskOrder = order;
    } else {
      // 保持原有 order
      taskOrder = existingTask.order;
    }

    const task = await this.prisma.task.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(quadrant !== undefined && { quadrant }),
        ...(completed !== undefined && { completed }),
        order: taskOrder,
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
