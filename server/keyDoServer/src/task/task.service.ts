import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskInput, UpdateTaskInput, Task } from '@yuan-shan/keydo-contract';
import { getRankBetween, getInitialRank } from '@yuan-shan/tools';

@Injectable()
export class TaskService {
  constructor(private prisma: PrismaService) {}

  /**
   * 获取用户的所有任务
   * 
   * 排序规则：
   * 1. 按象限排序（Q1 → Q2 → Q3 → Q4）
   * 2. 同一象限内按 order 排序（LexoRank 字符串比较）
   */
  async findAll(userId: number): Promise<Task[]> {
    const tasks = await this.prisma.task.findMany({
      where: { userId },
      orderBy: [
        { quadrant: 'asc' },
        { order: 'asc' },  // 按 LexoRank order 排序
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
   * 
   * 新任务放在目标象限的底部（未完成任务列表末尾）
   * 使用 LexoRank 计算 order 值
   */
  async create(userId: number, createTaskInput: CreateTaskInput): Promise<Task> {
    const { title, description, quadrant, roleId } = createTaskInput;

    // 获取目标象限最后一个未完成任务的 order
    // 按 order 降序排列，取第一个即为最后一个任务
    const lastTask = await this.prisma.task.findFirst({
      where: { userId, quadrant, completed: false },
      orderBy: { order: 'desc' },
    });

    // 计算新任务的 order（追加到末尾）
    // 如果象限内没有未完成任务，使用初始值
    // 如果有任务，在最后一个任务之后生成新值
    const newOrder = lastTask 
      ? getRankBetween(lastTask.order, null)  // 比最后一个大
      : getInitialRank();                      // 第一个任务

    const task = await this.prisma.task.create({
      data: {
        userId,
        title,
        description, // 新增：保存任务详情
        quadrant,
        order: newOrder,
        roleId, // 新增：关联角色 ID
        completed: false,
      },
    });

    return this.mapToTask(task);
  }

  /**
   * 更新任务
   * 
   * 支持更新的字段：
   * - title: 任务标题
   * - description: 任务详情
   * - quadrant: 所属象限（跨象限拖拽）
   * - completed: 完成状态
   * - order: 排序值（象限内排序或跨象限后的位置）
   */
  async update(id: string, userId: number, updateTaskInput: UpdateTaskInput): Promise<Task> {
    // 检查任务是否存在且属于当前用户
    const existingTask = await this.prisma.task.findFirst({
      where: { id, userId },
    });

    if (!existingTask) {
      throw new NotFoundException('任务不存在');
    }

    const { title, description, quadrant, completed, order, roleId } = updateTaskInput;

    // 构建更新数据，只包含传入的字段
    // 注意：description 和 roleId 的处理
    // - undefined: 不更新该字段
    // - 空字符串 '' 或 null: 清空该字段（转为 null）
    // - 有值: 更新为该值
    const task = await this.prisma.task.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { 
          description: description === '' ? null : description // 空字符串转为 null 清空字段
        }),
        ...(quadrant !== undefined && { quadrant }),
        ...(completed !== undefined && { completed }),
        ...(order !== undefined && { order }),  // 支持 order 更新
        ...(roleId !== undefined && { roleId }),  // 新增：支持 roleId 更新（可为 null）
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
      description: task.description ?? undefined, // 新增：返回 description（null 转为 undefined）
      quadrant: task.quadrant as any,
      completed: task.completed,
      order: task.order,
      roleId: task.roleId ?? undefined, // 新增：返回 roleId（null 转为 undefined）
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    };
  }
}
