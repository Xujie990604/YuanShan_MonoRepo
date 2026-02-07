import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskInput, UpdateTaskInput, CompleteTaskInput, Task, RecurrenceRule } from '@yuan-shan/keydo-contract';
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
    const { title, description, quadrant, roleId, dueDate, dueTime, recurrence } = createTaskInput;

    // 重复任务：忽略前端 dueDate（其用于推导 recurrence），由后端根据规则和当前日期计算
    let finalDueDate: string | null;
    if (recurrence) {
      finalDueDate = this.calculateNextDueDate(new Date(), recurrence);
    } else {
      finalDueDate = dueDate ?? null;
    }

    // 获取目标象限最后一个未完成任务的 order
    const lastTask = await this.prisma.task.findFirst({
      where: { userId, quadrant, completed: false },
      orderBy: { order: 'desc' },
    });

    const newOrder = lastTask
      ? getRankBetween(lastTask.order, null)
      : getInitialRank();

    const task = await this.prisma.task.create({
      data: {
        userId,
        title,
        description: description ?? null,
        quadrant,
        order: newOrder,
        roleId,
        completed: false,
        dueDate: finalDueDate,
        dueTime: dueTime ?? null,
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
   * - dueDate: 截止日期（YYYY-MM-DD）
   * - dueTime: 时间（HH:mm）
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

    const { title, description, quadrant, completed, order, roleId, dueDate, dueTime, recurrence } = updateTaskInput;

    // 构建更新数据，只包含传入的字段（见 keyDoContract/CONVENTION.md）
    // - undefined/未传: 不更新
    // - null: 清空
    // - ""、0 等: 原样写入，不得当作清空
    const task = await this.prisma.task.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description: description }), // null 清空，"" 原样存储
        ...(quadrant !== undefined && { quadrant }),
        ...(completed !== undefined && { completed }),
        ...(order !== undefined && { order }),
        ...(roleId !== undefined && { roleId }),
        ...(dueDate !== undefined && { dueDate: dueDate }), // null 清空，有效字符串原样存储
        ...(dueTime !== undefined && { dueTime: dueTime }), // null 清空，HH:mm 原样存储
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
   * 设置任务完成状态（支持 completed: true/false）
   * - completed=true：标记完成；若为重复任务则清除 recurrence、创建下一实例
   * - completed=false：取消完成，仅更新 completed 字段
   */
  async complete(id: string, userId: number, input: CompleteTaskInput): Promise<Task> {
    const task = await this.prisma.task.findFirst({
      where: { id, userId },
    });

    if (!task) {
      throw new NotFoundException('任务不存在');
    }

    const { completed } = input;

    if (!completed) {
      const updated = await this.prisma.task.update({
        where: { id },
        data: { completed: false },
      });
      return this.mapToTask(updated);
    }

    // 完成：事务内先更新当前任务，再按需创建下一实例
    const completedTask = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.task.update({
        where: { id },
        data: {
          completed: true,
          recurrence: null, // 已完成任务清除重复字段，保留 dueDate 作为该次完成日
        },
      });

      if (task.recurrence) {
        const recurrence = JSON.parse(task.recurrence) as RecurrenceRule;
        const baseDate = task.dueDate
          ? new Date(task.dueDate + 'T00:00:00+08:00')
          : new Date();
        const nextDueDate = this.calculateNextDueDate(baseDate, recurrence);

        // 新任务插到该象限未完成列表顶部（order 比当前第一个未完成更小）
        const firstIncomplete = await tx.task.findFirst({
          where: { userId, quadrant: task.quadrant, completed: false },
          orderBy: { order: 'asc' },
        });
        const newOrder = firstIncomplete
          ? getRankBetween(null, firstIncomplete.order)
          : getInitialRank();

        await tx.task.create({
          data: {
            userId,
            title: task.title,
            description: task.description,
            quadrant: task.quadrant,
            roleId: task.roleId,
            order: newOrder,
            completed: false,
            dueDate: nextDueDate,
            dueTime: task.dueTime,
            recurrence: task.recurrence,
          },
        });
      }

      return updated;
    });

    return this.mapToTask(completedTask);
  }

  /**
   * 计算下一个截止日期（格式：YYYY-MM-DD）
   *
   * - DAILY: 基准日 + interval 天
   * - WEEKLY: 基准日 + interval 周（固定 +7*interval 天）
   * - MONTHLY: 当月 rule.dayOfMonth 日；若该日已过或为当天，则取下一月的同日
   *   - dayOfMonth 超过当月天数时取当月最后一天（如 2 月 31 → 2 月 28/29）
   */
  private calculateNextDueDate(baseDate: Date, rule: RecurrenceRule): string {
    const result = new Date(baseDate);

    switch (rule.type) {
      case 'DAILY':
        result.setDate(result.getDate() + (rule.interval || 1));
        break;
      case 'WEEKLY':
        result.setDate(result.getDate() + 7 * (rule.interval || 1));
        break;
      case 'MONTHLY': {
        const dayOfMonth = rule.dayOfMonth ?? result.getDate();
        const year = result.getFullYear();
        const month = result.getMonth();
        // 当月最后一天，避免 2 月 31 等非法日期
        const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
        const day = Math.min(dayOfMonth, lastDayOfMonth);
        result.setFullYear(year);
        result.setMonth(month);
        result.setDate(day);
        // 若当月该日已过或为今天，则取下月同日
        if (result.getTime() <= baseDate.getTime()) {
          result.setMonth(result.getMonth() + (rule.interval || 1));
          const nextYear = result.getFullYear();
          const nextMonth = result.getMonth();
          const nextLastDay = new Date(nextYear, nextMonth + 1, 0).getDate();
          result.setDate(Math.min(dayOfMonth, nextLastDay));
        }
        break;
      }
    }

    const year = result.getFullYear();
    const month = String(result.getMonth() + 1).padStart(2, '0');
    const day = String(result.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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
      dueDate: task.dueDate ?? undefined,
      dueTime: task.dueTime ?? undefined,
      recurrence: task.recurrence ? JSON.parse(task.recurrence) : undefined,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    };
  }
}
