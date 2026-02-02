import { z } from 'zod';

/**
 * 象限类型
 */
export type QuadrantType = 'Q1' | 'Q2' | 'Q3' | 'Q4';

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
    .optional(), // 任务详情（可选）
  quadrant: z.enum(['Q1', 'Q2', 'Q3', 'Q4'], {
    errorMap: () => ({ message: '象限类型必须是 Q1、Q2、Q3 或 Q4' }),
  }).optional(),
  completed: z.boolean().optional(),
  order: z.string().optional(), // 用于象限内排序
  roleId: z.string().uuid().nullable().optional(), // 关联的角色 ID（可选，支持设为 null）
});

/**
 * 更新任务请求参数类型
 */
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
