import { z } from 'zod';

/**
 * 象限类型
 */
export type QuadrantType = 'Q1' | 'Q2' | 'Q3' | 'Q4';

/**
 * 重复规则类型
 */
export type RecurrenceType = 'DAILY' | 'WEEKLY' | 'MONTHLY';

/**
 * 重复规则结构
 */
export interface RecurrenceRule {
  type: RecurrenceType;
  interval: number;          // MVP 固定为 1
  daysOfWeek?: number[];     // 仅 WEEKLY 使用（0-6，0=周日）
  dayOfMonth?: number;       // 仅 MONTHLY 使用（1-31）
}

/**
 * 任务接口
 */
export interface Task {
  id: string;
  title: string;
  description?: string; // 任务详情（可选）
  quadrant: QuadrantType;
  completed: boolean;
  order: string; // lexorank 排序值（字符串）
  roleId?: string; // 关联的角色 ID（可选）

  // 日期相关字段
  dueDate?: string;           // 日期，格式：YYYY-MM-DD（如 "2026-02-06"）
  dueTime?: string;           // 时间，格式：HH:mm（如 "14:30"），不存在表示全天
  recurrence?: RecurrenceRule; // 重复规则

  createdAt: string; // ISO 8601 格式
  updatedAt: string; // ISO 8601 格式
}

/**
 * 创建任务请求参数 Schema
 */
export const createTaskSchema = z.object({
  title: z.string()
    .min(1, '任务标题不能为空')
    .max(64, '任务标题不能超过 64 个字符'),
  description: z.string()
    .max(1000, '任务详情不能超过 1000 个字符')
    .optional(), // 任务详情（可选）
  quadrant: z.enum(['Q1', 'Q2', 'Q3', 'Q4'], {
    errorMap: () => ({ message: '象限类型必须是 Q1、Q2、Q3 或 Q4' }),
  }),
  order: z.string().optional(), // 可选，不提供则由服务端计算 lexorank
  roleId: z.string().uuid().optional(), // 关联的角色 ID（可选）

  // 日期字段验证
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式必须为 YYYY-MM-DD').optional(),
  dueTime: z.string().regex(/^([0-1]\d|2[0-3]):[0-5]\d$/, '时间格式必须为 HH:mm').optional(),
  recurrence: z.object({
    type: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']),
    interval: z.number().int().min(1).default(1),
    daysOfWeek: z.array(z.number().int().min(0).max(6)).optional(),
    dayOfMonth: z.number().int().min(1).max(31).optional(),
  }).optional(),
});

/**
 * 创建任务请求参数类型
 */
export type CreateTaskInput = z.infer<typeof createTaskSchema>;

/**
 * 更新任务请求参数 Schema
 */
export const updateTaskSchema = z.object({
  title: z.string()
    .min(1, '任务标题不能为空')
    .max(64, '任务标题不能超过 64 个字符')
    .optional(),
  description: z.string()
    .max(1000, '任务详情不能超过 1000 个字符')
    .nullable()
    .optional(), // null=清空，undefined=不更新，""=主动设为空字符串（见 CONVENTION.md）
  quadrant: z.enum(['Q1', 'Q2', 'Q3', 'Q4'], {
    errorMap: () => ({ message: '象限类型必须是 Q1、Q2、Q3 或 Q4' }),
  }).optional(),
  completed: z.boolean().optional(),
  order: z.string().optional(), // 用于象限内排序
  roleId: z.string().uuid().nullable().optional(), // null=清空，undefined=不更新

  // 日期字段：null=清空，undefined=不更新；""/0 不用于清空（见 CONVENTION.md）
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式必须为 YYYY-MM-DD').nullable().optional(),
  dueTime: z.string().regex(/^([0-1]\d|2[0-3]):[0-5]\d$/, '时间格式必须为 HH:mm').nullable().optional(),
  recurrence: z.object({
    type: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']),
    interval: z.number().int().min(1).default(1),
    daysOfWeek: z.array(z.number().int().min(0).max(6)).optional(),
    dayOfMonth: z.number().int().min(1).max(31).optional(),
  }).nullable().optional(),  // 支持设为 null 清除重复
});

/**
 * 更新任务请求参数类型
 */
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

/**
 * 完成任务请求参数 Schema（设置完成状态）
 */
export const completeTaskSchema = z.object({
  completed: z.boolean(),
});

/**
 * 完成任务请求参数类型
 */
export type CompleteTaskInput = z.infer<typeof completeTaskSchema>;
