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
    order: string;
    createdAt: string;
    updatedAt: string;
}
/**
 * 创建任务请求参数 Schema
 */
export declare const createTaskSchema: z.ZodObject<{
    title: z.ZodString;
    quadrant: z.ZodEnum<["Q1", "Q2", "Q3", "Q4"]>;
    order: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    title: string;
    quadrant: "Q1" | "Q2" | "Q3" | "Q4";
    order?: string | undefined;
}, {
    title: string;
    quadrant: "Q1" | "Q2" | "Q3" | "Q4";
    order?: string | undefined;
}>;
/**
 * 创建任务请求参数类型
 */
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
/**
 * 更新任务请求参数 Schema
 */
export declare const updateTaskSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    quadrant: z.ZodOptional<z.ZodEnum<["Q1", "Q2", "Q3", "Q4"]>>;
    completed: z.ZodOptional<z.ZodBoolean>;
    order: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    title?: string | undefined;
    quadrant?: "Q1" | "Q2" | "Q3" | "Q4" | undefined;
    order?: string | undefined;
    completed?: boolean | undefined;
}, {
    title?: string | undefined;
    quadrant?: "Q1" | "Q2" | "Q3" | "Q4" | undefined;
    order?: string | undefined;
    completed?: boolean | undefined;
}>;
/**
 * 更新任务请求参数类型
 */
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
