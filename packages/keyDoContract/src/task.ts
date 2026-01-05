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
  quadrant: QuadrantType;
  completed: boolean;
  order: string; // lexorank 排序值（字符串）
  createdAt: string; // ISO 8601 格式
  updatedAt: string; // ISO 8601 格式
}

/**
 * 创建任务请求参数 Schema
 */
export const createTaskSchema = z.object({
  title: z.string().min(1, '任务标题不能为空'),
  quadrant: z.enum(['Q1', 'Q2', 'Q3', 'Q4'], {
    errorMap: () => ({ message: '象限类型必须是 Q1、Q2、Q3 或 Q4' }),
  }),
  order: z.string().optional(), // 可选，不提供则由服务端计算 lexorank
});

/**
 * 创建任务请求参数类型
 */
export type CreateTaskInput = z.infer<typeof createTaskSchema>;

/**
 * 更新任务请求参数 Schema
 */
export const updateTaskSchema = z.object({
  title: z.string().min(1, '任务标题不能为空').optional(),
  quadrant: z.enum(['Q1', 'Q2', 'Q3', 'Q4'], {
    errorMap: () => ({ message: '象限类型必须是 Q1、Q2、Q3 或 Q4' }),
  }).optional(),
  completed: z.boolean().optional(),
  order: z.string().optional(), // 用于象限内排序
});

/**
 * 更新任务请求参数类型
 */
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
