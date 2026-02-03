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
 * 重复规则类型
 */
type RecurrenceType = 'DAILY' | 'WEEKLY' | 'MONTHLY';
/**
 * 重复规则结构
 */
interface RecurrenceRule {
    type: RecurrenceType;
    interval: number;
    daysOfWeek?: number[];
    dayOfMonth?: number;
}
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
    roleId?: string;
    dueDate?: string;
    isAllDay?: boolean;
    recurrence?: RecurrenceRule;
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
    roleId: z.ZodOptional<z.ZodString>;
    dueDate: z.ZodOptional<z.ZodString>;
    isAllDay: z.ZodOptional<z.ZodBoolean>;
    recurrence: z.ZodOptional<z.ZodObject<{
        type: z.ZodEnum<["DAILY", "WEEKLY", "MONTHLY"]>;
        interval: z.ZodDefault<z.ZodNumber>;
        daysOfWeek: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
        dayOfMonth: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        type: "DAILY" | "WEEKLY" | "MONTHLY";
        interval: number;
        daysOfWeek?: number[] | undefined;
        dayOfMonth?: number | undefined;
    }, {
        type: "DAILY" | "WEEKLY" | "MONTHLY";
        interval?: number | undefined;
        daysOfWeek?: number[] | undefined;
        dayOfMonth?: number | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    title: string;
    quadrant: "Q1" | "Q2" | "Q3" | "Q4";
    description?: string | undefined;
    order?: string | undefined;
    roleId?: string | undefined;
    dueDate?: string | undefined;
    isAllDay?: boolean | undefined;
    recurrence?: {
        type: "DAILY" | "WEEKLY" | "MONTHLY";
        interval: number;
        daysOfWeek?: number[] | undefined;
        dayOfMonth?: number | undefined;
    } | undefined;
}, {
    title: string;
    quadrant: "Q1" | "Q2" | "Q3" | "Q4";
    description?: string | undefined;
    order?: string | undefined;
    roleId?: string | undefined;
    dueDate?: string | undefined;
    isAllDay?: boolean | undefined;
    recurrence?: {
        type: "DAILY" | "WEEKLY" | "MONTHLY";
        interval?: number | undefined;
        daysOfWeek?: number[] | undefined;
        dayOfMonth?: number | undefined;
    } | undefined;
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
    roleId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    dueDate: z.ZodOptional<z.ZodString>;
    isAllDay: z.ZodOptional<z.ZodBoolean>;
    recurrence: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        type: z.ZodEnum<["DAILY", "WEEKLY", "MONTHLY"]>;
        interval: z.ZodDefault<z.ZodNumber>;
        daysOfWeek: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
        dayOfMonth: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        type: "DAILY" | "WEEKLY" | "MONTHLY";
        interval: number;
        daysOfWeek?: number[] | undefined;
        dayOfMonth?: number | undefined;
    }, {
        type: "DAILY" | "WEEKLY" | "MONTHLY";
        interval?: number | undefined;
        daysOfWeek?: number[] | undefined;
        dayOfMonth?: number | undefined;
    }>>>;
}, "strip", z.ZodTypeAny, {
    title?: string | undefined;
    description?: string | undefined;
    quadrant?: "Q1" | "Q2" | "Q3" | "Q4" | undefined;
    order?: string | undefined;
    roleId?: string | null | undefined;
    dueDate?: string | undefined;
    isAllDay?: boolean | undefined;
    recurrence?: {
        type: "DAILY" | "WEEKLY" | "MONTHLY";
        interval: number;
        daysOfWeek?: number[] | undefined;
        dayOfMonth?: number | undefined;
    } | null | undefined;
    completed?: boolean | undefined;
}, {
    title?: string | undefined;
    description?: string | undefined;
    quadrant?: "Q1" | "Q2" | "Q3" | "Q4" | undefined;
    order?: string | undefined;
    roleId?: string | null | undefined;
    dueDate?: string | undefined;
    isAllDay?: boolean | undefined;
    recurrence?: {
        type: "DAILY" | "WEEKLY" | "MONTHLY";
        interval?: number | undefined;
        daysOfWeek?: number[] | undefined;
        dayOfMonth?: number | undefined;
    } | null | undefined;
    completed?: boolean | undefined;
}>;
/**
 * 更新任务请求参数类型
 */
type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

declare const ROLE_COLORS: readonly ["blue", "green", "orange", "purple", "red", "yellow", "pink", "gray"];
type RoleColor = typeof ROLE_COLORS[number];
interface Role {
    id: string;
    name: string;
    icon: string;
    color: RoleColor;
    manifesto: string;
    createdAt: string;
    updatedAt: string;
}
declare const createRoleSchema: z.ZodObject<{
    name: z.ZodString;
    icon: z.ZodString;
    color: z.ZodEnum<["blue", "green", "orange", "purple", "red", "yellow", "pink", "gray"]>;
    manifesto: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    icon: string;
    color: "blue" | "green" | "orange" | "purple" | "red" | "yellow" | "pink" | "gray";
    manifesto: string;
}, {
    name: string;
    icon: string;
    color: "blue" | "green" | "orange" | "purple" | "red" | "yellow" | "pink" | "gray";
    manifesto: string;
}>;
type CreateRoleInput = z.infer<typeof createRoleSchema>;
declare const updateRoleSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    icon: z.ZodOptional<z.ZodString>;
    color: z.ZodOptional<z.ZodEnum<["blue", "green", "orange", "purple", "red", "yellow", "pink", "gray"]>>;
    manifesto: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    icon?: string | undefined;
    color?: "blue" | "green" | "orange" | "purple" | "red" | "yellow" | "pink" | "gray" | undefined;
    manifesto?: string | undefined;
}, {
    name?: string | undefined;
    icon?: string | undefined;
    color?: "blue" | "green" | "orange" | "purple" | "red" | "yellow" | "pink" | "gray" | undefined;
    manifesto?: string | undefined;
}>;
type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
interface RoleStats {
    roleId: string;
    taskCount: number;
    completedCount: number;
}

export { type CreateRoleInput, type CreateTaskInput, type QuadrantType, ROLE_COLORS, type RecurrenceRule, type RecurrenceType, type Role, type RoleColor, type RoleStats, type SigninInput, type SigninResponse, type SignupInput, type SignupResponse, type Task, type UpdateRoleInput, type UpdateTaskInput, type UserInfo, createRoleSchema, createTaskSchema, signinSchema, signupSchema, updateRoleSchema, updateTaskSchema };
