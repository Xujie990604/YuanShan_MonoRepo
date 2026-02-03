import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskInput, UpdateTaskInput, Task, RecurrenceRule } from '@yuan-shan/keydo-contract';
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

    return tasks.map(task => this.mapToTask(task));
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
    const { title, description, quadrant, roleId, dueDate, isAllDay, recurrence } = createTaskInput;

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
        dueDate: dueDate ? new Date(dueDate) : null,
        isAllDay: isAllDay ?? true,
        recurrence: recurrence ? JSON.stringify(recurrence) : null,
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
   * - dueDate: 截止日期
   * - isAllDay: 是否全天任务
   * - recurrence: 重复规则
   */
  async update(id: string, userId: number, updateTaskInput: UpdateTaskInput): Promise<Task> {
    // 检查任务是否存在且属于当前用户
    const existingTask = await this.prisma.task.findFirst({
      where: { id, userId },
    });

    if (!existingTask) {
      throw new NotFoundException('任务不存在');
    }

    const { title, description, quadrant, completed, order, roleId, dueDate, isAllDay, recurrence } = updateTaskInput;

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
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(isAllDay !== undefined && { isAllDay }),
        ...(recurrence !== undefined && { recurrence: recurrence ? JSON.stringify(recurrence) : null }),
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
   * 完成任务（支持重复任务自动生成）
   */
  async complete(id: string, userId: number): Promise<Task> {
    const task = await this.prisma.task.findFirst({
      where: { id, userId },
    });

    if (!task) {
      throw new NotFoundException('任务不存在');
    }

    // 标记当前任务为已完成
    const completedTask = await this.prisma.task.update({
      where: { id },
      data: { completed: true },
    });

    // 如果是重复任务，自动生成下一个实例
    if (task.recurrence) {
      const recurrence = JSON.parse(task.recurrence) as RecurrenceRule;
      const nextDueDate = this.calculateNextDueDate(new Date(), recurrence);

      await this.prisma.task.create({
        data: {
          userId,
          title: task.title,
          description: task.description,
          quadrant: task.quadrant,
          roleId: task.roleId,
          order: getRankBetween(null, null), // 插入到列表顶部
          completed: false,
          dueDate: nextDueDate,
          isAllDay: task.isAllDay,
          recurrence: task.recurrence,
        },
      });
    }

    return this.mapToTask(completedTask);
  }

  /**
   * 计算下一个截止日期
   */
  private calculateNextDueDate(baseDate: Date, rule: RecurrenceRule): Date {
    const result = new Date(baseDate);

    switch (rule.type) {
      case 'DAILY':
        result.setDate(result.getDate() + (rule.interval || 1));
        break;
      case 'WEEKLY':
        result.setDate(result.getDate() + 7 * (rule.interval || 1));
        break;
      case 'MONTHLY':
        result.setMonth(result.getMonth() + (rule.interval || 1));
        break;
    }

    return result;
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
      dueDate: task.dueDate ? this.formatDateWithTimezone(task.dueDate) : undefined,
      isAllDay: task.isAllDay ?? undefined,
      recurrence: task.recurrence ? JSON.parse(task.recurrence) : undefined,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    };
  }

  /**
   * 格式化日期为带时区的 ISO 字符串（北京时间 UTC+8）
   */
  private formatDateWithTimezone(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const milliseconds = String(date.getMilliseconds()).padStart(3, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}+08:00`;
  }
}
