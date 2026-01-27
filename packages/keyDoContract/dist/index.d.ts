import { z } from 'zod';

/**
 * 登录请求参数 Schema
 */
declare const signinSchema: z.ZodObject<{
    username: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    username: string;
    password: string;
}, {
    username: string;
    password: string;
}>;
/**
 * 登录请求参数类型
 */
type SigninInput = z.infer<typeof signinSchema>;
/**
 * 注册请求参数 Schema
 */
declare const signupSchema: z.ZodObject<{
    username: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    username: string;
    password: string;
}, {
    username: string;
    password: string;
}>;
/**
 * 注册请求参数类型
 */
type SignupInput = z.infer<typeof signupSchema>;
/**
 * 登录响应类型
 */
type SigninResponse = {
    access_token: string;
    userId: number;
};
/**
 * 注册响应类型
 */
type SignupResponse = {
    id: number;
    username: string;
};
/**
 * 用户信息类型
 */
type UserInfo = {
    id: number;
    username: string;
    createdAt: Date;
    updatedAt: Date;
};

/**
 * 象限类型
 */
type QuadrantType = 'Q1' | 'Q2' | 'Q3' | 'Q4';
/**
 * 任务接口
 */
interface Task {
    id: string;
    title: string;
    description?: string;
    quadrant: QuadrantType;
    completed: boolean;
    order: string;
    createdAt: string;
    updatedAt: string;
}
/**
 * 创建任务请求参数 Schema
 */
declare const createTaskSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    quadrant: z.ZodEnum<["Q1", "Q2", "Q3", "Q4"]>;
    order: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    title: string;
    quadrant: "Q1" | "Q2" | "Q3" | "Q4";
    description?: string | undefined;
    order?: string | undefined;
}, {
    title: string;
    quadrant: "Q1" | "Q2" | "Q3" | "Q4";
    description?: string | undefined;
    order?: string | undefined;
}>;
/**
 * 创建任务请求参数类型
 */
type CreateTaskInput = z.infer<typeof createTaskSchema>;
/**
 * 更新任务请求参数 Schema
 */
declare const updateTaskSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    quadrant: z.ZodOptional<z.ZodEnum<["Q1", "Q2", "Q3", "Q4"]>>;
    completed: z.ZodOptional<z.ZodBoolean>;
    order: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    title?: string | undefined;
    description?: string | undefined;
    quadrant?: "Q1" | "Q2" | "Q3" | "Q4" | undefined;
    order?: string | undefined;
    completed?: boolean | undefined;
}, {
    title?: string | undefined;
    description?: string | undefined;
    quadrant?: "Q1" | "Q2" | "Q3" | "Q4" | undefined;
    order?: string | undefined;
    completed?: boolean | undefined;
}>;
/**
 * 更新任务请求参数类型
 */
type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

export { type CreateTaskInput, type QuadrantType, type SigninInput, type SigninResponse, type SignupInput, type SignupResponse, type Task, type UpdateTaskInput, type UserInfo, createTaskSchema, signinSchema, signupSchema, updateTaskSchema };
